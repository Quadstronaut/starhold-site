// Cart → one Stripe Checkout Session (subscription mode). The build sheet
// rides in metadata (session AND subscription, so it outlives the session).
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getStripe } from '$lib/server/stripe';
import { encodeBuildSheet, type BotOrder } from '$lib/build-sheet';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
	if (!env.STRIPE_PRICE_CUSTOM_BOT) throw error(503, 'checkout offline — try again shortly');

	let bots: BotOrder[];
	try {
		bots = (await request.json())?.bots;
	} catch {
		throw error(400, 'request body must be JSON');
	}

	let metadata: Record<string, string>;
	try {
		metadata = encodeBuildSheet(bots); // validates shape, features, caps
	} catch (e) {
		throw error(400, e instanceof Error ? e.message : 'invalid cart');
	}

	const session = await getStripe().checkout.sessions.create({
		mode: 'subscription',
		line_items: [{ price: env.STRIPE_PRICE_CUSTOM_BOT, quantity: bots.length }],
		metadata,
		subscription_data: { metadata },
		success_url: `${url.origin}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/cart`
	});

	if (!session.url) throw error(502, 'stripe did not return a checkout url');
	return json({ url: session.url });
};
