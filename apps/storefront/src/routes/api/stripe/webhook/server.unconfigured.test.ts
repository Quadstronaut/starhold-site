import { describe, it, expect, vi } from 'vitest';
import Stripe from 'stripe';

// Separate file: env mock omits DISCORD_WEBHOOK_ORDERS to exercise the
// deploy-misconfiguration guard.
vi.mock('$env/dynamic/private', () => ({
	env: { STRIPE_SECRET_KEY: 'sk_test_dummy', STRIPE_WEBHOOK_SECRET: 'whsec_test_secret' }
}));

import { POST } from './+server';

const stripe = new Stripe('sk_test_dummy');

describe('POST /api/stripe/webhook (unconfigured)', () => {
	it('500s a completed checkout when DISCORD_WEBHOOK_ORDERS is unset', async () => {
		const payload = JSON.stringify({
			id: 'evt_1', object: 'event', type: 'checkout.session.completed',
			data: { object: { id: 'cs_1', object: 'checkout.session', metadata: { bot_count: '1', bot_1: 'server=A;features=moderation' } } }
		});
		const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test_secret' });
		try {
			await POST({
				request: new Request('http://localhost/api/stripe/webhook', {
					method: 'POST', headers: { 'stripe-signature': sig }, body: payload
				})
			} as any);
			expect.unreachable('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});
});
