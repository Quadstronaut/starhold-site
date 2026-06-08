import { parseCatalog } from '$lib/products';
import catalog from '../../../../static/products.json';

export const load = () => {
	const bots = parseCatalog(catalog).find((p) => p.id === 'custom-bots');
	// catalog is the price SSOT — if this product vanishes, fail the build loudly
	if (!bots?.pricing.monthly_usd) throw new Error('custom-bots missing from catalog');
	return { monthlyUsd: bots.pricing.monthly_usd };
};
