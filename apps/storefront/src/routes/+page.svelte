<script lang="ts">
	let { data } = $props();
	const internal = (url: string) => url.replace('https://starhold.dev', '');
</script>

<svelte:head><title>Starhold Software — Hold Your Own Star</title></svelte:head>

<section class="hero">
	<div class="label">Res Gesta Par Excellentiam</div>
	<h1>{data.tagline.slice(0, -1)}<span style="color:var(--amber)">{data.tagline.slice(-1)}</span></h1>
	<p style="color:var(--muted)">Sovereign software. Built, held, and flown by its maker.</p>
	<a class="btn" href="#fleet">Explore the Fleet</a>
</section>

<section id="fleet" style="padding:32px 24px; max-width:1000px; margin:0 auto;">
	<h2 class="label" style="margin:0;">The Fleet</h2>
	<div class="grid">
		{#each data.products as p}
			<a class="panel" href={p.url.startsWith('https://starhold.dev') ? internal(p.url) : p.url}>
				<h3 style="margin:0 0 6px; font-size:15px;">{p.name}</h3>
				<span class="label">{p.status === 'live' ? (p.pricing.model === 'subscription' ? `$${p.pricing.monthly_usd}/mo` : p.pricing.model === 'quote' ? 'Quoted' : 'Live mission') : 'Coming soon'}</span>
			</a>
		{/each}
	</div>
</section>

<section style="padding:24px; text-align:center; border-top:1px solid var(--border);">
	<p class="label">The operator: a master of automation whose systems already run around the world. Credentials verified. Employer classified.</p>
	<a class="btn" href="/contact" style="margin-top:12px;">Start a Mission</a>
</section>

<style>
	.hero { text-align: center; padding: 80px 24px 60px; background: radial-gradient(ellipse at top, #15151f 0%, var(--bg) 70%); }
	.hero h1 { font-size: 40px; margin: 12px 0 8px; }
	.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-top: 14px; }
</style>
