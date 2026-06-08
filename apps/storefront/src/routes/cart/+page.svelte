<script lang="ts">
	import { cart } from '$lib/cart.svelte';
	import { BOT_FEATURES } from '$lib/bot-features';

	let { data } = $props();

	const featureName = new Map(BOT_FEATURES.map((f) => [f.id, f.name]));
	let busy = $state(false);
	let errorMsg = $state('');
	const total = $derived(cart.count * data.monthlyUsd);

	async function checkout() {
		busy = true;
		errorMsg = '';
		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ bots: cart.items })
			});
			const body = await res.json().catch(() => null);
			if (!res.ok || !body?.url) throw new Error(body?.message ?? 'checkout failed — try again');
			window.location.href = body.url; // hand off to Stripe Checkout
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'checkout failed — try again';
			busy = false;
		}
	}
</script>

<svelte:head><title>Cart · Starhold Software</title></svelte:head>

<section class="page-section">
	<div class="label">Pre-flight</div>
	<h1>Cart</h1>
	{#if cart.count === 0}
		<p>No bots on the manifest yet. <a href="/products/custom-bots">Configure one →</a></p>
	{:else}
		{#each cart.items as bot, i (i)}
			<div class="panel item">
				<strong>Bot {i + 1}{bot.server ? ` — ${bot.server}` : ''}</strong>
				<p>{bot.features.map((f) => featureName.get(f) ?? f).join(', ')}</p>
				<button class="remove" disabled={busy} onclick={() => cart.remove(i)}>Remove</button>
			</div>
		{/each}
		<p class="total">
			<strong>${total}/month</strong> — billed monthly via Stripe. Cancel anytime;
			see <a href="/legal/refunds">refunds &amp; cancellation</a> and <a href="/legal/terms">terms</a>.
		</p>
		<button class="btn" disabled={busy} onclick={checkout}>
			{busy ? 'Preparing launch…' : 'Launch checkout'}
		</button>
		{#if errorMsg}<p class="err">{errorMsg} — <a href="/contact">contact us</a> if it persists.</p>{/if}
	{/if}
</section>

<style>
	.item { margin: 12px 0; display: grid; gap: 6px; max-width: 560px; }
	.item p { margin: 0; color: var(--muted); }
	.remove {
		justify-self: start; background: none; border: 1px solid var(--border);
		color: var(--muted); padding: 3px 10px; border-radius: 3px; cursor: pointer;
		font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
	}
	.remove:hover { color: var(--amber); border-color: var(--amber); }
	.remove:disabled { opacity: 0.45; cursor: not-allowed; }
	.total { margin-top: 18px; }
	.btn { border: 0; cursor: pointer; font-size: 13px; }
	.btn:disabled { opacity: 0.45; }
	.err { color: var(--amber); }
</style>
