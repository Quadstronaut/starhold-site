<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/cart.svelte';

	// badge only after mount: SSR renders bare "Cart" (cart is SSR-empty),
	// so revealing the count pre-hydration would mismatch the server HTML
	let mounted = $state(false);
	onMount(() => (mounted = true));

	// hamburger open/close state; collapses the link drawer on small screens
	let menuOpen = $state(false);
	const toggleMenu = () => (menuOpen = !menuOpen);
	// close drawer when a link is activated (navigating away)
	const closeMenu = () => (menuOpen = false);
</script>

<nav aria-label="Main navigation">
	<a href="/" class="brand">⬡ STARHOLD</a>

	<!-- hamburger button: only visible below the CSS breakpoint -->
	<button
		class="hamburger"
		aria-label={menuOpen ? 'Close menu' : 'Open menu'}
		aria-expanded={menuOpen}
		aria-controls="nav-links"
		onclick={toggleMenu}
	>
		<!-- three horizontal bars drawn with spans; no icon dependency needed -->
		<span></span><span></span><span></span>
	</button>

	<div id="nav-links" class="links" class:open={menuOpen} role="list">
		<a href="/#fleet"                   onclick={closeMenu}>Store</a>
		<a href="https://starhold.fyi"      onclick={closeMenu}>Docs</a>
		<a href="https://status.starhold.fyi" onclick={closeMenu}>Status</a>
		<a href="https://starhold.app"      onclick={closeMenu}>Hangar</a>
		<a href="/about"                    onclick={closeMenu}>About</a>
		<a href="/contact"                  onclick={closeMenu}>Contact</a>
		<a href="/cart"                     onclick={closeMenu}>
			Cart{#if mounted && cart.count > 0}&nbsp;({cart.count}){/if}
		</a>
	</div>
</nav>

<style>
	/* ── base nav bar ─────────────────────────────────────────────────── */
	nav {
		/* allow drawer to stack below the bar row on mobile */
		display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
		padding: 14px 24px; border-bottom: 2px solid var(--red); background: #111118;
		font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
		/* prevent any nav content from punching outside the viewport */
		width: 100%; box-sizing: border-box;
	}
	.brand { font-weight: bold; color: var(--text); flex-shrink: 0; }

	/* ── desktop link row (≥ 640 px) ─────────────────────────────────── */
	.links { display: flex; gap: 18px; }
	.links a { color: var(--muted); }
	.links a:hover { color: var(--amber); }

	/* ── hamburger button (hidden on desktop) ─────────────────────────── */
	.hamburger {
		display: none;           /* hidden on wide screens */
		flex-direction: column; gap: 5px;
		background: none; border: none; cursor: pointer;
		padding: 6px; margin: -6px;
	}
	/* the three bars */
	.hamburger span {
		display: block; width: 22px; height: 2px;
		background: var(--muted); border-radius: 1px;
		transition: background 0.15s;
	}
	.hamburger:hover span { background: var(--amber); }

	/* ── small-screen overrides (< 640 px) ───────────────────────────── */
	@media (max-width: 639px) {
		nav { padding: 12px 16px; }

		/* show the hamburger */
		.hamburger { display: flex; }

		/* collapse the link drawer; hidden until .open is set */
		.links {
			/* take full nav width so it sits below the brand/hamburger row */
			width: 100%;
			flex-direction: column; gap: 0;
			/* animate open/close with max-height trick — no JS height calc needed */
			max-height: 0; overflow: hidden;
			transition: max-height 0.25s ease;
		}
		.links.open {
			/* 400px is safely larger than 7 items × ~44px; transition clamps to content */
			max-height: 400px;
		}
		.links a {
			display: block;
			padding: 10px 0; border-top: 1px solid var(--border);
			/* tighten letter-spacing so items fit even at 320 px */
			letter-spacing: 1px;
		}
	}
</style>
