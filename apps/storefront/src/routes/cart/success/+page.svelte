<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/cart.svelte';

	// the order is in Stripe's hands now — empty the local manifest
	onMount(() => cart.clear());
</script>

<svelte:head><title>Order received · Starhold Software</title></svelte:head>

<section class="page-section">
	<div class="label">Liftoff</div>
	<h1>Order received</h1>
	<p>Your build sheet just hit our console. Your bot will be assembled and deployed, and you'll hear from us at your checkout email — usually within 24 hours.</p>
	<a class="btn" href="/">Back to base</a>
</section>
