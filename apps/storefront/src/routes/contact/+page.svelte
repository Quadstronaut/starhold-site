<script lang="ts">
	import { DISCORD_INVITE, DISCORD_TICKET_URL, CONTACT_EMAIL } from '$lib/site-links';
	import IntakeForm from '$lib/components/IntakeForm.svelte';
</script>

<svelte:head><title>Contact · Starhold Software</title></svelte:head>

<section class="page-section">
	<div class="label">Mission control</div>
	<h1>Contact</h1>
	{#if DISCORD_INVITE}
		<p>Fastest channel — open a ticket in our Discord:</p>
		<a class="btn" href={DISCORD_INVITE}>Join the crew</a>
	{:else}
		<p class="label">Public Discord invite opening soon.</p>
	{/if}
	<p>Already flying with us on Discord? <a href={DISCORD_TICKET_URL}>Open a ticket in #contact</a> — fastest response.</p>
	<p>Email: <a href={'mailto:' + CONTACT_EMAIL}>{CONTACT_EMAIL}</a></p>
	<h2>Direct transmission</h2>
	<IntakeForm kind="contact" />
</section>
