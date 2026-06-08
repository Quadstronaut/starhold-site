import { describe, it, expect } from 'vitest';
import { encodeBuildSheet, decodeBuildSheet, MAX_BOTS, type BotOrder } from './build-sheet';

const bot = (server: string, features: string[]): BotOrder => ({ server, features });

describe('encodeBuildSheet', () => {
	it('encodes one metadata key per bot plus bot_count', () => {
		const meta = encodeBuildSheet([bot('Alpha Base', ['moderation', 'logging']), bot('Beta', ['leveling'])]);
		expect(meta.bot_count).toBe('2');
		expect(meta.bot_1).toBe('server=Alpha Base;features=moderation,logging');
		expect(meta.bot_2).toBe('server=Beta;features=leveling');
	});

	it('rejects an empty cart', () => {
		expect(() => encodeBuildSheet([])).toThrow(/empty/i);
	});

	it('rejects more than MAX_BOTS bots (Stripe 50-metadata-key cap)', () => {
		const bots = Array.from({ length: MAX_BOTS + 1 }, (_, i) => bot(`s${i}`, ['moderation']));
		expect(() => encodeBuildSheet(bots)).toThrow(/max/i);
	});

	it('rejects a bot with no features', () => {
		expect(() => encodeBuildSheet([bot('Alpha', [])])).toThrow(/feature/i);
	});

	it('rejects unknown feature ids (client must send catalog ids only)', () => {
		expect(() => encodeBuildSheet([bot('Alpha', ['cryptominer'])])).toThrow(/unknown feature/i);
	});

	it('sanitizes delimiter chars out of server names and caps length', () => {
		const meta = encodeBuildSheet([bot('Evil;name=x'.padEnd(200, 'A'), ['moderation'])]);
		expect(meta.bot_1).not.toMatch(/Evil;name/);
		expect(meta.bot_1.length).toBeLessThanOrEqual(500); // Stripe metadata value cap
	});
});

describe('decodeBuildSheet', () => {
	it('round-trips what encode produced', () => {
		const bots = [bot('Alpha Base', ['moderation', 'logging']), bot('', ['giveaways'])];
		expect(decodeBuildSheet(encodeBuildSheet(bots))).toEqual([
			{ server: 'Alpha Base', features: ['moderation', 'logging'] },
			{ server: '', features: ['giveaways'] }
		]);
	});

	it('tolerates missing keys instead of crashing the webhook', () => {
		expect(decodeBuildSheet({ bot_count: '3', bot_2: 'server=Only;features=leveling' })).toEqual([
			{ server: 'Only', features: ['leveling'] }
		]);
	});

	it('skips malformed segments without =', () => {
		expect(decodeBuildSheet({ bot_count: '1', bot_1: 'garbage;server=Ok;features=moderation' })).toEqual([
			{ server: 'Ok', features: ['moderation'] }
		]);
	});

	it('caps bot_count so absurd values cannot spin the decoder', () => {
		expect(decodeBuildSheet({ bot_count: 'Infinity', bot_1: 'server=A;features=moderation' })).toEqual([
			{ server: 'A', features: ['moderation'] }
		]);
	});
});
