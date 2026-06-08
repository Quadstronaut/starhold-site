import { describe, it, expect, vi } from 'vitest';

// Separate file: env mock omits DISCORD_WEBHOOK_INTAKE to exercise the
// deploy-misconfiguration guard.
vi.mock('$env/dynamic/private', () => ({ env: {} }));

import { POST } from './+server';

describe('POST /api/intake (offline)', () => {
	it('503s a valid submission when DISCORD_WEBHOOK_INTAKE is unset', async () => {
		try {
			await POST({
				request: new Request('http://localhost/api/intake', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ kind: 'contact', email: 'a@b.co', message: 'hello there friend', website: '' })
				}),
				getClientAddress: () => '10.50.50.50'
			} as any);
			expect.unreachable('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(503);
		}
	});
});
