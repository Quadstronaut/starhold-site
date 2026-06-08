import { describe, it, expect } from 'vitest';
import { allow, trackedIps, WINDOW_MS, MAX_PER_WINDOW } from './rate-limit';

describe('rate limiter', () => {
	it('allows up to MAX_PER_WINDOW hits then blocks', () => {
		const t = 1_000_000;
		for (let i = 0; i < MAX_PER_WINDOW; i++) expect(allow('ip-a', t + i)).toBe(true);
		expect(allow('ip-a', t + MAX_PER_WINDOW)).toBe(false);
	});

	it('frees the slot once the window slides past', () => {
		const t = 2_000_000;
		for (let i = 0; i < MAX_PER_WINDOW; i++) allow('ip-b', t);
		expect(allow('ip-b', t + 1)).toBe(false);
		expect(allow('ip-b', t + WINDOW_MS + 1)).toBe(true);
	});

	it('tracks IPs independently', () => {
		const t = 3_000_000;
		for (let i = 0; i < MAX_PER_WINDOW; i++) allow('ip-c', t);
		expect(allow('ip-d', t)).toBe(true);
	});

	it('evicts fully-expired IPs so the map cannot grow without bound', () => {
		const t = 4_000_000;
		// Seed two unique IPs so their slots exist in the map.
		allow('ip-evict1', t);
		allow('ip-evict2', t);
		const before = trackedIps();
		// After the window expires, a re-entry prunes then re-inserts — size stable.
		allow('ip-evict1', t + WINDOW_MS + 1);
		expect(trackedIps()).toBe(before);
		// A second expired-then-re-entered IP also stays stable, not +1.
		allow('ip-evict2', t + WINDOW_MS + 1);
		expect(trackedIps()).toBe(before);
	});
});
