import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';

// $env/dynamic/private is a SvelteKit virtual module — each test mocks it
// and re-imports the module so the lazy client cache starts fresh.
beforeEach(() => {
	vi.resetModules();
});

describe('getStripe', () => {
	it('throws a clear error when STRIPE_SECRET_KEY is unset', async () => {
		vi.doMock('$env/dynamic/private', () => ({ env: {} }));
		const { getStripe } = await import('./stripe');
		expect(() => getStripe()).toThrow(/STRIPE_SECRET_KEY/);
	});

	it('returns a Stripe instance when the key is set', async () => {
		vi.doMock('$env/dynamic/private', () => ({ env: { STRIPE_SECRET_KEY: 'sk_test_abc' } }));
		const { getStripe } = await import('./stripe');
		expect(getStripe()).toBeInstanceOf(Stripe);
	});

	it('caches and returns the same instance on repeated calls', async () => {
		vi.doMock('$env/dynamic/private', () => ({ env: { STRIPE_SECRET_KEY: 'sk_test_abc' } }));
		const { getStripe } = await import('./stripe');
		expect(getStripe()).toBe(getStripe());
	});
});
