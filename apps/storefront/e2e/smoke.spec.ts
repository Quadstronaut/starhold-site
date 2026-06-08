import { test, expect } from '@playwright/test';

test('home renders a tagline hero and the fleet grid', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toContainText(/Hold Your Own Star|Reach for the Stars/i);
	await expect(page.locator('#fleet')).toBeVisible();
});

test('products.json is served and custom-bots is $5/mo', async ({ request }) => {
	const res = await request.get('/products.json');
	expect(res.ok()).toBeTruthy();
	const catalog = await res.json();
	const bots = catalog.products.find((p: { id: string }) => p.id === 'custom-bots');
	expect(bots, 'custom-bots missing from catalog').toBeDefined();
	expect(bots.pricing.monthly_usd).toBe(5);
});

test('configurator → cart shows the bot and the monthly total', async ({ page }) => {
	await page.goto('/products/custom-bots');
	// Feature labels: <label class="feature"><input type="checkbox"><span><strong>Moderation</strong>...</span></label>
	// Playwright resolves the label's accessible text (flattened inner text), so /moderation/i matches.
	await page.locator('label.feature', { hasText: /moderation/i }).locator('input[type="checkbox"]').check();
	await page.getByLabel(/server name/i).fill('Smoke Test Server');
	await page.getByRole('button', { name: /add to cart/i }).click();
	await page.goto('/cart');
	// Cart renders: <strong>Bot 1 — Smoke Test Server</strong>
	await expect(page.getByText(/Smoke Test Server/)).toBeVisible();
	// Cart total: <strong>$5/month</strong>
	await expect(page.getByText('$5/month')).toBeVisible();
});

// Needs real Stripe TEST credentials in the environment — skipped otherwise.
// Run locally with: $env:STRIPE_SECRET_KEY="sk_test_..."; $env:STRIPE_PRICE_CUSTOM_BOT="price_..."; npm run test:e2e
test('checkout hands off to Stripe', async ({ page }) => {
	test.skip(
		!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_CUSTOM_BOT,
		'set STRIPE_SECRET_KEY + STRIPE_PRICE_CUSTOM_BOT (test mode) to run'
	);
	await page.goto('/products/custom-bots');
	await page.locator('label.feature', { hasText: /moderation/i }).locator('input[type="checkbox"]').check();
	await page.getByRole('button', { name: /add to cart/i }).click();
	await page.goto('/cart');
	await page.getByRole('button', { name: /launch checkout/i }).click();
	await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
});
