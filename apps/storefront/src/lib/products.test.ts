import { describe, it, expect } from 'vitest';
import { parseCatalog } from './products';
import catalog from '../../static/products.json';

const good = { products: [{ id: 'x', name: 'X', tagline: '', status: 'live', url: 'https://x', pricing_url: null, pricing: { model: 'quote' }, order: 2 }, { id: 'y', name: 'Y', tagline: '', status: 'coming-soon', url: 'https://y', pricing_url: null, pricing: { model: 'tbd' }, order: 1 }] };

describe('parseCatalog', () => {
	it('returns products sorted by order', () => {
		expect(parseCatalog(good).map((p) => p.id)).toEqual(['y', 'x']);
	});
	it('rejects missing required fields', () => {
		expect(() => parseCatalog({ products: [{ id: 'bad' }] })).toThrow(/missing/i);
	});
	it('rejects invalid status', () => {
		const bad = structuredClone(good); bad.products[0].status = 'dead';
		expect(() => parseCatalog(bad)).toThrow(/status/i);
	});
	it('rejects invalid pricing model', () => {
		const bad = structuredClone(good); (bad.products[0].pricing as { model: string }).model = 'freebie';
		expect(() => parseCatalog(bad)).toThrow(/pricing/i);
	});
	it('accepts the real shipped catalog', () => {
		expect(parseCatalog(catalog).length).toBeGreaterThanOrEqual(4);
	});
});
