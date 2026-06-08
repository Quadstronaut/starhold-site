import { describe, it, expect } from 'vitest';
import { addBot, removeBot, serializeCart, deserializeCart } from './cart';
import type { BotOrder } from './build-sheet';

const a: BotOrder = { server: 'Alpha', features: ['moderation'] };
const b: BotOrder = { server: 'Beta', features: ['leveling', 'giveaways'] };

describe('cart logic', () => {
	it('addBot returns a new array with the order appended', () => {
		const items = addBot([a], b);
		expect(items).toEqual([a, b]);
	});

	it('removeBot drops exactly the indexed item', () => {
		expect(removeBot([a, b], 0)).toEqual([b]);
	});

	it('serialize/deserialize round-trips', () => {
		expect(deserializeCart(serializeCart([a, b]))).toEqual([a, b]);
	});

	it('deserializeCart returns [] for null, garbage, or non-arrays', () => {
		expect(deserializeCart(null)).toEqual([]);
		expect(deserializeCart('not json')).toEqual([]);
		expect(deserializeCart('{"hi":1}')).toEqual([]);
	});

	it('deserializeCart drops malformed entries (corrupt localStorage must not poison checkout)', () => {
		const raw = JSON.stringify([a, { server: 5, features: 'nope' }]);
		expect(deserializeCart(raw)).toEqual([a]);
		// empty feature lists would only blow up later at checkout, so cart must drop them on load
		expect(deserializeCart(JSON.stringify([{ server: 'X', features: [] }]))).toEqual([]);
	});
});
