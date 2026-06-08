import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	use: { baseURL: 'http://localhost:4173' },
	webServer: {
		// production build via adapter-node — same artifact the production host runs
		command: 'npm run build && node build',
		port: 4173,
		timeout: 120_000, // cold adapter-node build can exceed the 60s default
		reuseExistingServer: !process.env.CI,
		env: { ...(process.env as Record<string, string>), PORT: '4173', ORIGIN: 'http://localhost:4173' }
	}
});
