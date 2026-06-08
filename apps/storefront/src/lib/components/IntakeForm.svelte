<script lang="ts">
	let { kind, cta = 'Transmit' }: { kind: 'contact' | 'quote' | 'qnix'; cta?: string } = $props();

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let website = $state(''); // honeypot — visually hidden, humans never fill it
	let status = $state<'idle' | 'busy' | 'sent' | 'error'>('idle');
	let errorMsg = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		status = 'busy';
		errorMsg = '';
		try {
			const res = await fetch('/api/intake', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ kind, name, email, message, website })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(body?.message ?? `transmission failed (${res.status})`);
			}
			status = 'sent';
		} catch (err) {
			status = 'error';
			errorMsg = err instanceof Error ? err.message : 'transmission failed';
		}
	}
</script>

{#if status === 'sent'}
	<p class="panel sent">Transmission received. We'll reply to <strong>{email}</strong>.</p>
{:else}
	<form onsubmit={submit}>
		<label><span>Name</span><input bind:value={name} maxlength="100" autocomplete="name" /></label>
		<label><span>Email</span><input type="email" bind:value={email} required autocomplete="email" /></label>
		<label><span>Message</span><textarea bind:value={message} required minlength="10" maxlength="4000" rows="6"></textarea></label>
		<input class="hp" type="text" bind:value={website} name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
		<button class="btn" disabled={status === 'busy'}>{status === 'busy' ? 'Transmitting…' : cta}</button>
		{#if status === 'error'}<p class="err">{errorMsg}</p>{/if}
	</form>
{/if}

<style>
	form { display: grid; gap: 12px; max-width: 480px; margin-top: 16px; }
	label { display: grid; gap: 4px; }
	label span { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); }
	input, textarea {
		background: var(--panel); border: 1px solid var(--border); color: var(--text);
		padding: 8px; border-radius: 3px; font-family: inherit; font-size: 14px;
	}
	.hp { position: absolute; left: -9999px; }
	.btn { border: 0; cursor: pointer; justify-self: start; font-size: 13px; }
	.btn:disabled { opacity: 0.45; }
	.err { color: var(--amber); }
	.sent { max-width: 480px; }
</style>
