import { describe, it, expect, vi } from 'vitest';

// Separate file from server.test.ts: this one mocks the env WITHOUT the
// price id to exercise the deploy-misconfiguration guard.
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/stripe', () => ({ getStripe: () => ({}) }));

import { POST } from './+server';

describe('POST /api/checkout (offline)', () => {
	it('503s when STRIPE_PRICE_CUSTOM_BOT is unset', async () => {
		try {
			await POST({
				request: new Request('http://localhost/api/checkout', { method: 'POST', body: '{}' }),
				url: new URL('http://localhost/api/checkout')
			} as any);
			expect.unreachable('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(503);
		}
	});
});
