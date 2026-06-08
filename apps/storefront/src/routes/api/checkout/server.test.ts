import { describe, it, expect, vi, beforeEach } from 'vitest';

const create = vi.fn(async () => ({ url: 'https://checkout.stripe.com/c/test_123' }));
vi.mock('$lib/server/stripe', () => ({
	getStripe: () => ({ checkout: { sessions: { create } } })
}));
vi.mock('$env/dynamic/private', () => ({ env: { STRIPE_PRICE_CUSTOM_BOT: 'price_test_5mo' } }));

import { POST } from './+server';

function call(body: unknown) {
	return POST({
		request: new Request('http://localhost/api/checkout', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		url: new URL('http://localhost/api/checkout')
	} as any);
}

// SvelteKit error() throws an HttpError with .status — unwrap it for asserts.
// Accepts MaybePromise since RequestHandler's return type is not a strict Promise.
async function status(p: unknown): Promise<number> {
	try {
		return ((await p) as Response).status;
	} catch (e: any) {
		return e.status;
	}
}

beforeEach(() => create.mockClear());

describe('POST /api/checkout', () => {
	it('creates a subscription-mode session with quantity = bot count and build-sheet metadata', async () => {
		const res = await call({ bots: [
			{ server: 'Alpha', features: ['moderation', 'logging'] },
			{ server: 'Beta', features: ['leveling'] }
		] });
		expect((await res.json()).url).toMatch(/checkout\.stripe\.com/);
		const params = (create.mock.calls as any)[0][0] as any;
		expect(params.mode).toBe('subscription');
		expect(params.line_items).toEqual([{ price: 'price_test_5mo', quantity: 2 }]);
		expect(params.metadata.bot_count).toBe('2');
		expect(params.subscription_data.metadata.bot_count).toBe('2'); // survives past the session
		expect(params.success_url).toContain('/cart/success');
		expect(params.cancel_url).toContain('/cart');
	});

	it('400s an empty cart without calling Stripe', async () => {
		expect(await status(call({ bots: [] }))).toBe(400);
		expect(create).not.toHaveBeenCalled();
	});

	it('400s unknown feature ids', async () => {
		expect(await status(call({ bots: [{ server: 'x', features: ['cryptominer'] }] }))).toBe(400);
	});

	it('400s non-JSON bodies', async () => {
		const p = POST({
			request: new Request('http://localhost/api/checkout', { method: 'POST', body: 'not json' }),
			url: new URL('http://localhost/api/checkout')
		} as any);
		expect(await status(p)).toBe(400);
	});
});
