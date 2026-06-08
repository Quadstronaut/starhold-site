<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	let { children } = $props();
</script>

<Header />
{@render children()}
<footer style="padding:24px; text-align:center; color:var(--muted2); font-size:12px; letter-spacing:1px;">
	STARHOLD SOFTWARE · EST. 2026 · <a href="/legal/terms">Terms</a> · <a href="/legal/privacy">Privacy</a> · <a href="/legal/refunds">Refunds</a>
</footer>
