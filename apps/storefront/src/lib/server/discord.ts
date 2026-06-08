// Discord webhook relay + embed builders. Mission Control red for embeds.
import { decodeBuildSheet } from '$lib/build-sheet';

const RED = 0xb22222;

// Discord caps embeds at 25 fields; 2 are used by Customer/Monthly, so
// list at most 23 bots and roll the rest into a summary field.
const MAX_BOT_FIELDS = 23;

export type Embed = {
	title: string;
	color: number;
	fields: { name: string; value: string; inline?: boolean }[];
	footer?: { text: string };
};

export async function postDiscord(webhookUrl: string, embed: Embed): Promise<void> {
	const res = await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ embeds: [embed] })
	});
	if (!res.ok) throw new Error(`discord webhook returned ${res.status}`);
}

// minimal session shape — accepts a real Stripe.Checkout.Session
export function orderEmbed(session: {
	id: string;
	amount_total?: number | null;
	customer_details?: { email?: string | null } | null;
	metadata?: Record<string, string> | null;
}): Embed {
	const bots = decodeBuildSheet(session.metadata ?? {});
	return {
		title: `🛰️ New order — ${bots.length} bot${bots.length === 1 ? '' : 's'}`,
		color: RED,
		fields: [
			{ name: 'Customer', value: session.customer_details?.email ?? 'unknown', inline: true },
			{ name: 'Monthly', value: `$${((session.amount_total ?? 0) / 100).toFixed(2)}`, inline: true },
			...bots.slice(0, MAX_BOT_FIELDS).map((b, i) => ({
				name: `Bot ${i + 1}${b.server ? ` — ${b.server}` : ''}`,
				value: b.features.join(', ') || '(no features decoded)'
			})),
			...(bots.length > MAX_BOT_FIELDS
				? [{ name: `+ ${bots.length - MAX_BOT_FIELDS} more bots`, value: 'full build sheet in Stripe session metadata' }]
				: [])
		],
		footer: { text: `session ${session.id}` }
	};
}

const KIND_LABELS: Record<string, string> = {
	contact: '📡 Contact transmission',
	quote: '🛠️ Quote request',
	qnix: '🛰️ QNix interest'
};

export function intakeEmbed(kind: string, name: string, email: string, message: string): Embed {
	return {
		title: KIND_LABELS[kind] ?? kind,
		color: RED,
		fields: [
			{ name: 'From', value: name || '(no name)', inline: true },
			{ name: 'Email', value: email, inline: true },
			{ name: 'Message', value: message.slice(0, 1000) } // Discord field cap is 1024
		]
	};
}
