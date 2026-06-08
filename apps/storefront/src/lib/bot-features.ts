// The sellable feature set for Custom Discord Bots. Mirrors the marketing
// copy on /products/custom-bots and the docs bot feature manual.
export type BotFeature = { id: string; name: string; blurb: string };

export const BOT_FEATURES: BotFeature[] = [
	{ id: 'moderation', name: 'Moderation', blurb: 'Kick/ban/timeout, word filters, anti-spam.' },
	{ id: 'welcome', name: 'Welcome & Roles', blurb: 'Greetings, autorole, reaction roles.' },
	{ id: 'logging', name: 'Logging', blurb: 'Message, member, and audit logs to channels you pick.' },
	{ id: 'leveling', name: 'Leveling', blurb: 'XP, ranks, level-up announcements.' },
	{ id: 'giveaways', name: 'Giveaways', blurb: 'Timed giveaways with entries and rerolls.' },
	{ id: 'commands', name: 'Custom Commands', blurb: 'Your own slash commands and canned replies.' }
];
