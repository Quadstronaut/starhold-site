// Codec between cart bot orders and Stripe Checkout metadata.
// Stripe metadata limits: 50 keys / 40-char key / 500-char value, hence
// one compact `bot_N` key per bot and MAX_BOTS = 25 (headroom for other keys).
import { BOT_FEATURES } from './bot-features';

export type BotOrder = { server: string; features: string[] };

export const MAX_BOTS = 25;
const MAX_SERVER_CHARS = 80;
const VALID_FEATURES = new Set(BOT_FEATURES.map((f) => f.id));

export function encodeBuildSheet(bots: BotOrder[]): Record<string, string> {
	if (!Array.isArray(bots) || bots.length === 0) throw new Error('cart is empty');
	if (bots.length > MAX_BOTS) throw new Error(`max ${MAX_BOTS} bots per order`);
	const meta: Record<string, string> = { bot_count: String(bots.length) };
	bots.forEach((b, i) => {
		if (!Array.isArray(b.features) || b.features.length === 0)
			throw new Error(`bot ${i + 1}: pick at least one feature`);
		for (const f of b.features)
			if (!VALID_FEATURES.has(f)) throw new Error(`bot ${i + 1}: unknown feature ${f}`);
		// strip our delimiters from free text, then cap — keeps decode unambiguous.
		// Empty server is allowed by design: the configurator marks it optional,
		// and the Discord embed falls back to "Bot N" with no server suffix.
		const server = String(b.server ?? '').replace(/[;=]/g, ' ').trim().slice(0, MAX_SERVER_CHARS);
		const value = `server=${server};features=${b.features.join(',')}`;
		if (value.length > 500) throw new Error(`bot ${i + 1}: build sheet too long`);
		meta[`bot_${i + 1}`] = value;
	});
	return meta;
}

export function decodeBuildSheet(meta: Record<string, string | undefined>): BotOrder[] {
	// cap defends against absurd bot_count values (e.g. 'Infinity') in
	// hand-edited metadata — decode must never spin or OOM a webhook
	const count = Math.min(Number(meta.bot_count ?? 0) || 0, MAX_BOTS);
	const bots: BotOrder[] = [];
	for (let i = 1; i <= count; i++) {
		const raw = meta[`bot_${i}`];
		if (!raw) continue; // tolerate gaps — a mangled order must still reach Discord
		const fields = new Map(
			raw.split(';').flatMap((part) => {
				const eq = part.indexOf('=');
				if (eq === -1) return []; // malformed segment — skip, never crash a webhook
				return [[part.slice(0, eq), part.slice(eq + 1)] as const];
			})
		);
		bots.push({
			server: fields.get('server') ?? '',
			features: (fields.get('features') ?? '').split(',').filter(Boolean)
		});
	}
	return bots;
}
