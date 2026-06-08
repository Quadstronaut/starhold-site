// Lazy Stripe client. Key comes from $env/dynamic/private (runtime env on
// the production host, never baked into the build) so `vite build` needs no secrets.
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

let client: Stripe | null = null;

export function getStripe(): Stripe {
	if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set — checkout is offline');
	return (client ??= new Stripe(env.STRIPE_SECRET_KEY));
}
