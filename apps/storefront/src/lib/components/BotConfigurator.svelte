<script lang="ts">
	import { BOT_FEATURES } from '$lib/bot-features';
	import { cart } from '$lib/cart.svelte';

	let { monthlyUsd }: { monthlyUsd: number } = $props();

	let server = $state('');
	let selected = $state<string[]>([]);
	let justAdded = $state(false);

	function toggle(id: string) {
		selected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
	}

	function add() {
		cart.add({ server: server.trim(), features: [...selected] });
		server = '';
		selected = [];
		justAdded = true;
		setTimeout(() => (justAdded = false), 4000);
	}
</script>

<div class="panel configurator">
	<div class="label">Build sheet</div>
	<label class="field">
		<span>Server name <em>(optional)</em></span>
		<input bind:value={server} maxlength="80" placeholder="e.g. The Lounge" />
	</label>
	<fieldset>
		<legend class="label">Features</legend>
		{#each BOT_FEATURES as f (f.id)}
			<label class="feature">
				<input type="checkbox" checked={selected.includes(f.id)} onchange={() => toggle(f.id)} />
				<span><strong>{f.name}</strong> — {f.blurb}</span>
			</label>
		{/each}
	</fieldset>
	<button class="btn" disabled={selected.length === 0} onclick={add}>
		Add to cart — ${monthlyUsd}/mo
	</button>
	{#if justAdded}
		<p class="label added">Added to manifest. <a href="/cart">Go to cart →</a></p>
	{/if}
</div>

<style>
	.configurator { display: grid; gap: 14px; margin-top: 18px; max-width: 560px; }
	.field { display: grid; gap: 4px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }
	.field em { text-transform: none; letter-spacing: 0; }
	.field input {
		background: var(--bg); border: 1px solid var(--border); color: var(--text);
		padding: 8px; border-radius: 3px; font-family: inherit;
	}
	fieldset { border: 1px solid var(--border); border-radius: 3px; display: grid; gap: 8px; padding: 12px; }
	.feature { display: flex; gap: 10px; align-items: baseline; font-size: 14px; cursor: pointer; }
	.feature span { color: var(--muted); }
	.feature strong { color: var(--text); }
	.btn { border: 0; cursor: pointer; font-size: 13px; }
	.btn:disabled { opacity: 0.45; cursor: not-allowed; }
	.added a { color: var(--amber); }
</style>
