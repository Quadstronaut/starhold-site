// Contact / quote / QNix-interest relay → private Discord intake channel.
// Spam defenses: hidden honeypot field (silently swallowed) + per-IP rate limit.
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { allow } from '$lib/server/rate-limit';
import { postDiscord, intakeEmbed } from '$lib/server/discord';
import type { RequestHandler } from './$types';

const KINDS = ['contact', 'quote', 'qnix'];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'request body must be JSON');
	}

	const { kind, name = '', email = '', message = '', website = '' } = body ?? {};
	// honeypot first — bot hits must not burn rate-limit slots that a real
	// user behind the same NAT would then be denied
	if (website) return json({ ok: true }); // pretend success, relay nothing
	if (!allow(getClientAddress())) throw error(429, 'too many transmissions — try again in a few minutes');
	if (typeof kind !== 'string' || !KINDS.includes(kind)) throw error(400, 'unknown intake kind');
	if (typeof email !== 'string' || !EMAIL_RE.test(email)) throw error(400, 'a valid email is required');
	if (typeof message !== 'string' || message.trim().length < 10 || message.length > 4000)
		throw error(400, 'message must be 10–4000 characters');

	if (!env.DISCORD_WEBHOOK_INTAKE) throw error(503, 'intake offline — email hello@starhold.dev');
	await postDiscord(env.DISCORD_WEBHOOK_INTAKE, intakeEmbed(kind, String(name).slice(0, 100), email, message.trim()));
	return json({ ok: true });
};
