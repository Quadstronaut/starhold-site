// Stripe webhook receiver. Fulfillment v1: post the decoded build sheet to
// the private Discord orders channel. If the Discord relay fails we throw →
// 500 → Stripe retries (up to 3 days), so orders can't silently vanish.
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getStripe } from '$lib/server/stripe';
import { postDiscord, orderEmbed } from '$lib/server/discord';
import type Stripe from 'stripe';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const signature = request.headers.get('stripe-signature');
	if (!signature || !env.STRIPE_WEBHOOK_SECRET) throw error(400, 'missing signature');

	const payload = await request.text(); // raw body — signature covers exact bytes

	let event: Stripe.Event;
	try {
		event = getStripe().webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
	} catch {
		throw error(400, 'signature verification failed');
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session;
		if (!env.DISCORD_WEBHOOK_ORDERS) throw error(500, 'orders webhook not configured');
		await postDiscord(env.DISCORD_WEBHOOK_ORDERS, orderEmbed(session));
	}

	return json({ received: true });
};
