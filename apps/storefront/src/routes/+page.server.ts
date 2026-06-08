import { parseCatalog } from '$lib/products';
import { TAGLINES } from '$lib/site-links';
import catalog from '../../static/products.json';

export const load = () => ({
	products: parseCatalog(catalog),
	// rotating hero headline — one of the official taglines per page load
	tagline: TAGLINES[Math.floor(Math.random() * TAGLINES.length)]
});
