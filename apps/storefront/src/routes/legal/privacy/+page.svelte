<svelte:head><title>Privacy Policy · Starhold Software</title></svelte:head>

<section class="page-section" style="font-size:14px; line-height:1.7;">
	<div class="label">Effective 13 June 2026</div>
	<h1>Privacy Policy</h1>

	<p>This Privacy Policy explains what information Starhold Software collects, why, how long we keep it, and the limited circumstances in which anyone else ever sees it. It is the single, umbrella policy for everything we operate.</p>

	<h2>1. Who we are</h2>
	<p>Starhold Software is the trade name of <strong>Copper Jerky LLC</strong>, an Arizona limited liability company ("Starhold", "we", "us"). You can reach us at <a href="mailto:hello@starhold.dev">hello@starhold.dev</a> for any privacy question, data-access request, or deletion request.</p>

	<h2>2. What this policy covers</h2>
	<p>This policy applies to all Starhold products and services, including: the <strong>JoJo bot</strong> and other Custom Discord Bots we build and operate; the <strong>QuadstroNot</strong> storefront bot; <strong>Shushgame / Shushbot</strong>; and the <strong>starhold.dev</strong> storefront. Some products connect to Discord and Stripe; where they do, those companies' own privacy policies also apply to the parts they handle (see section 4).</p>

	<h2>3. Our core principle: collect the minimum</h2>
	<p>We collect only what is required to make a feature function, and we keep it only as long as that function requires. We do not sell your data. We do not run advertising or third-party tracking. We do not build advertising or behavioral profiles. We do not analyze, mine, or train models on your content. Our products run on hardware we own and operate, not rented third-party infrastructure.</p>

	<h2>4. The only outside services we rely on</h2>
	<p>Two third parties are unavoidable because our products are built on them. We share with them only what their function strictly requires:</p>
	<ul>
		<li><strong>Discord</strong> — our bots and games run on the Discord platform. Your use of Discord itself is governed by <a href="https://discord.com/privacy" target="_blank" rel="noopener">Discord's Privacy Policy</a> and <a href="https://discord.com/terms" target="_blank" rel="noopener">Terms of Service</a>. Messages, accounts, and servers live on Discord's infrastructure under Discord's control.</li>
		<li><strong>Stripe</strong> — all payments are processed by Stripe. Card details are entered on Stripe's systems and are governed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripe's Privacy Policy</a>. We never see, receive, or store full card numbers.</li>
	</ul>
	<p>We use no other advertising, analytics, or data-broker vendors.</p>

	<h2>5. What each product collects, and why</h2>

	<p><strong>JoJo bot / Custom Discord Bots (audit &amp; moderation).</strong> To do its job — telling a server's moderators what was deleted or edited — the bot uses Discord's Message Content access and caches messages from the channels a server chooses to watch. In full transparency, the cache can include: message text, the author's Discord ID and display name, the channel ID and name, timestamps, before/after edit history, image attachments, and a content hash used to detect duplicates. It is used only to generate deletion and edit reports, power the server-admin search and activity digests, and run opt-in features like the starboard and reaction-roles. <strong>This cache is never scanned, analyzed, sold, shared, or used to train anything.</strong> Retention is, by default, <strong>30 days</strong>, after which a nightly automated purge (04:00 UTC) deletes both the database rows and the stored image files. A server's administrators can shorten or lengthen that window per channel (1–365 days), purge on demand, exclude channels or users from caching entirely, and enable PII redaction that masks card, email, and phone patterns before anything is written.</p>

	<p><strong>QuadstroNot (storefront bot).</strong> Processes the Discord interactions you initiate, and relays the information you choose to submit through contact, quote, and order forms to our private Discord channels so we can respond. It also keeps the minimal operational records needed to run the server (for example, which self-service role panels exist and an audit log of administrator actions). Submitted form content lives in Discord and is governed by Discord's policy.</p>

	<p><strong>Shushgame / Shushbot.</strong> The game runs inside Discord, so the platform layer is governed by Discord's policy. Purchases are handled by Stripe, so payment data is governed by Stripe's policy. From a purchase, we retain only the transaction record (that a purchase occurred) and the entitlement fact (that a purchased role was applied to your account in the server). We do not store payment-card data.</p>

	<p><strong>starhold.dev storefront.</strong> Checkout uses Stripe; card data goes only to Stripe and never to us. Contact, quote, and intake forms relay what you submit to our private Discord channels so we can reply. The site uses no advertising or cross-site tracking; the only cookies/data used are those strictly necessary to operate checkout and prevent abuse (e.g., rate-limiting).</p>

	<h2>6. How long we keep things</h2>
	<ul>
		<li><strong>JoJo bot audit cache</strong> — 30 days by default (server-admin adjustable 1–365 days), then automatically deleted.</li>
		<li><strong>Order / purchase records</strong> — kept while your subscription or entitlement is active and as long afterward as the law requires (e.g., tax and accounting records).</li>
		<li><strong>Contact / quote / intake submissions</strong> — kept in our private Discord channels for as long as needed to handle your request and our ongoing relationship.</li>
		<li><strong>Everything else</strong> — only as long as the relevant feature needs it.</li>
	</ul>

	<h2>7. When anyone else sees your data</h2>
	<p>We share data only: (a) with Discord and Stripe, strictly to deliver the service, as described above; or (b) when we are legally required to (a valid legal process), or must do so to protect our rights, users, or the public. We never sell or rent data, and we do not share it for advertising.</p>

	<h2>8. Your choices and rights</h2>
	<p>You may request access to, correction of, or deletion of the personal data we hold about you by emailing <a href="mailto:hello@starhold.dev">hello@starhold.dev</a>. Two notes on how the bots work: for data the JoJo bot caches inside a community, the server's administrators are the controllers of that content — they can purge it, shorten retention, or exclude you at any time, and we will assist on request. Some records (such as payment and tax records held via Stripe) may need to be retained to meet legal obligations even after a deletion request.</p>

	<h2>9. Children</h2>
	<p>You must be at least <strong>13</strong> years old to use our services (matching Discord's minimum age). To make a purchase you must be <strong>18</strong> or older, or otherwise old enough to make a valid purchase under the laws where you live — some places permit minors to make certain purchases (for example, with their own debit card), and where your local law allows it, that is acceptable. We do not knowingly collect data from children under 13; if you believe a child under 13 has provided us data, contact us and we will delete it.</p>

	<h2>10. Security</h2>
	<p>Our services run on infrastructure we own and operate, behind access controls, with data encrypted in transit (HTTPS). Payments are isolated to Stripe, a PCI-DSS-certified processor. No system is perfectly secure, but we apply reasonable, layered safeguards and practice data minimization so there is little to expose.</p>

	<h2>11. Where we operate</h2>
	<p>We are based in Arizona, United States, and process data there. By using our services you understand your information is handled in the United States.</p>

	<h2>12. Changes to this policy</h2>
	<p>We may update this policy as our products evolve. We will revise the effective date above and, for material changes, give reasonable notice. Continued use after a change means you accept the updated policy.</p>

	<h2>13. Contact</h2>
	<p>Copper Jerky LLC, doing business as Starhold Software — <a href="mailto:hello@starhold.dev">hello@starhold.dev</a>.</p>

	<p class="label">Last updated 13 June 2026.</p>
</section>
