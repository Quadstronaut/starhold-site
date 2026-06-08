<script lang="ts">
	import BotConfigurator from '$lib/components/BotConfigurator.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Custom Discord Bots · Starhold Software</title></svelte:head>

<section class="page-section">
	<div class="label">${data.monthlyUsd}/month · flat</div>
	<h1>Custom Discord Bots</h1>
	<p>The big-bot feature set — moderation, welcome &amp; roles, logging, leveling, giveaways, custom commands — at the floor price, under <strong>your server's own name and avatar</strong>, personally operated.</p>
	<p>Feature requests join the shared public roadmap: built once, every bot in the fleet gets them. Your request becomes everyone's feature.</p>
	<BotConfigurator monthlyUsd={data.monthlyUsd} />
</section>
