import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';

const SECRET = 'whsec_test_secret';

vi.mock('$env/dynamic/private', () => ({
	env: {
		STRIPE_SECRET_KEY: 'sk_test_dummy',
		STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
		DISCORD_WEBHOOK_ORDERS: 'https://discord.test/hook'
	}
}));

const postDiscord = vi.fn(async () => {});
vi.mock('$lib/server/discord', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/discord')>()),
	postDiscord: (...args: unknown[]) => (postDiscord as (...a: unknown[]) => Promise<void>)(...args)
}));

import { POST } from './+server';

const stripe = new Stripe('sk_test_dummy');

function makeEvent(type: string, object: Record<string, unknown>) {
	return JSON.stringify({ id: 'evt_1', object: 'event', type, data: { object } });
}

function call(payload: string, signature: string) {
	return POST({
		request: new Request('http://localhost/api/stripe/webhook', {
			method: 'POST',
			headers: { 'stripe-signature': signature },
			body: payload
		})
	} as any);
}

async function status(p: unknown): Promise<number> {
	try {
		return ((await p) as Response).status;
	} catch (e: any) {
		return e.status;
	}
}

beforeEach(() => postDiscord.mockClear());

describe('POST /api/stripe/webhook', () => {
	const session = {
		id: 'cs_test_1',
		object: 'checkout.session',
		amount_total: 1000,
		customer_details: { email: 'customer@example.com' },
		metadata: { bot_count: '2', bot_1: 'server=Alpha;features=moderation,logging', bot_2: 'server=;features=leveling' }
	};

	it('relays a checkout.session.completed build sheet to Discord', async () => {
		const payload = makeEvent('checkout.session.completed', session);
		const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
		const res = (await call(payload, sig)) as Response;
		expect(res.status).toBe(200);
		expect(postDiscord).toHaveBeenCalledOnce();
		const [url, embed] = postDiscord.mock.calls[0] as any[];
		expect(url).toBe('https://discord.test/hook');
		expect(embed.title).toContain('2 bots');
		expect(JSON.stringify(embed.fields)).toContain('customer@example.com');
	});

	it('400s a bad signature without touching Discord', async () => {
		const payload = makeEvent('checkout.session.completed', session);
		expect(await status(call(payload, 't=1,v1=garbage'))).toBe(400);
		expect(postDiscord).not.toHaveBeenCalled();
	});

	it('400s a missing signature header', async () => {
		const payload = makeEvent('checkout.session.completed', session);
		const p = POST({
			request: new Request('http://localhost/api/stripe/webhook', { method: 'POST', body: payload })
		} as any);
		expect(await status(p)).toBe(400);
		expect(postDiscord).not.toHaveBeenCalled();
	});

	it('acks unhandled event types without posting', async () => {
		const payload = makeEvent('invoice.paid', { id: 'in_1' });
		const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
		expect(((await call(payload, sig)) as Response).status).toBe(200);
		expect(postDiscord).not.toHaveBeenCalled();
	});

	it('500s when the Discord relay fails so Stripe retries', async () => {
		(postDiscord as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('discord 503'));
		const payload = makeEvent('checkout.session.completed', session);
		const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
		await expect(call(payload, sig)).rejects.toThrow(/discord 503/);
	});
});
