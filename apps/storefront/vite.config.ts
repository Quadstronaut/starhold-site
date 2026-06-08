/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// e2e/*.spec.ts belongs to Playwright — keep Vitest scoped to unit tests
	test: { include: ['src/**/*.test.ts'] }
} as Parameters<typeof defineConfig>[0]);
