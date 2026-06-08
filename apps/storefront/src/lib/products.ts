// Catalog SSOT loader. static/products.json is a published contract
// (Discord bot embeds consume it too) — validate hard, fail loud.
export type Product = {
	id: string; name: string; tagline: string;
	status: 'live' | 'coming-soon';
	url: string; pricing_url: string | null;
	pricing: { model: 'external' | 'subscription' | 'quote' | 'tbd'; monthly_usd?: number };
	order: number;
};

const STATUSES = ['live', 'coming-soon'];
const PRICING_MODELS = ['external', 'subscription', 'quote', 'tbd'];
const REQUIRED = ['id', 'name', 'status', 'url', 'pricing', 'order'];

export function parseCatalog(raw: unknown): Product[] {
	const products = (raw as { products?: unknown[] })?.products;
	if (!Array.isArray(products)) throw new Error('catalog missing products array');
	for (const p of products as Record<string, unknown>[]) {
		for (const k of REQUIRED) if (p[k] === undefined) throw new Error(`product ${p.id ?? '?'} missing ${k}`);
		if (!STATUSES.includes(p.status as string)) throw new Error(`product ${p.id} invalid status ${p.status}`);
		const model = (p.pricing as { model?: string })?.model;
		if (!model || !PRICING_MODELS.includes(model)) throw new Error(`product ${p.id} invalid pricing model ${model}`);
	}
	return [...(products as Product[])].sort((a, b) => a.order - b.order);
}
