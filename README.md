# starhold-site

Public web properties for **Starhold Software** — the storefront, documentation
site, and app launcher behind the `starhold.dev` / `.fyi` / `.app` domains.

Each app is self-contained; install and build from its own directory.

| Path | Stack | Serves |
|---|---|---|
| `apps/storefront` | SvelteKit (node adapter) | the store — catalog, configurator, cart, Stripe Checkout |
| `apps/docs` | Astro Starlight | the docs/knowledge site |
| `apps/hangar` | static | the hosted-apps launcher |

## Develop

```sh
cd apps/storefront   # or apps/docs
npm install
npm run dev
```

## Build

```sh
cd apps/storefront
npm run build        # SvelteKit → node server in build/
```

```sh
cd apps/docs
npm run build        # Astro static site → dist/
```

## Notes

- Runtime secrets (Stripe keys, Discord webhook URLs) are supplied via environment
  variables at deploy time — never committed. See each app's `.env.example`.
- This repository holds the public site code only.
