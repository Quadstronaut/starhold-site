import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: { DISCORD_WEBHOOK_INTAKE: 'https://discord.test/intake' }
}));

const postDiscord = vi.fn(async () => {});
vi.mock('$lib/server/discord', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/discord')>()),
	postDiscord: (...args: unknown[]) => (postDiscord as (...a: unknown[]) => Promise<void>)(...args)
}));

import { POST } from './+server';
import { MAX_PER_WINDOW } from '$lib/server/rate-limit';

let nextIp = 0;
function call(body: unknown, ip?: string) {
	const addr = ip ?? `10.0.0.${++nextIp}`; // unique IP per test by default
	return POST({
		request: new Request('http://localhost/api/intake', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		getClientAddress: () => addr
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

const good = { kind: 'contact', name: 'Kyle', email: 'kyle@example.com', message: 'I would like a bot please.', website: '' };

describe('POST /api/intake', () => {
	it('relays a valid submission to the intake webhook', async () => {
		const res = (await call(good)) as Response;
		expect(res.status).toBe(200);
		expect(postDiscord).toHaveBeenCalledOnce();
		const [url, embed] = postDiscord.mock.calls[0] as any[];
		expect(url).toBe('https://discord.test/intake');
		expect(JSON.stringify(embed)).toContain('kyle@example.com');
	});

	it('silently accepts honeypot submissions without relaying (bots must not learn they were caught)', async () => {
		const res = (await call({ ...good, website: 'http://spam.example' })) as Response;
		expect(res.status).toBe(200);
		expect(postDiscord).not.toHaveBeenCalled();
	});

	it('400s an invalid email', async () => {
		expect(await status(call({ ...good, email: 'not-an-email' }))).toBe(400);
	});

	it('400s a too-short message', async () => {
		expect(await status(call({ ...good, message: 'hi' }))).toBe(400);
	});

	it('400s an unknown kind', async () => {
		expect(await status(call({ ...good, kind: 'sales' }))).toBe(400);
	});

	it('429s when one IP exceeds the window', async () => {
		const ip = '10.99.99.99';
		for (let i = 0; i < MAX_PER_WINDOW; i++) expect(((await call(good, ip)) as Response).status).toBe(200);
		expect(await status(call(good, ip))).toBe(429);
	});
});
