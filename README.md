# SpeedpayFX

Mobile-first Next.js app for matching USD ↔ XAF exchange orders. Persistence uses Cloudflare KV (binding `FX_KV`) and runs on Cloudflare Pages + Pages Functions via `@cloudflare/next-on-pages`.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Cloudflare KV for storage
- Cloudflare Pages deployment (Wrangler)

## Environment
- `ADMIN_PASSWORD` (required for POST /api/rates, admin export/import)
- `NALA_RATES_URL` (optional, defaults to `https://partners-api.prod.nala-api.com/v1/fx/rates`)
- `NALA_API_KEY`, `NALA_API_KEY_HEADER`, `NALA_API_KEY_PREFIX` (optional; not needed for the default Nala rates endpoint)
- `NEXT_PUBLIC_SITE_URL` (optional base URL for server-side fetches; falls back to `CF_PAGES_URL`, `VERCEL_URL`, or `http://127.0.0.1:3000`)

## Cloudflare setup
1) KV namespaces:
- `wrangler.toml` already binds `FX_KV` to `07113ec3cadb41ada999033818e90c83` for both prod and preview.
- If you want preview data isolated from prod, create a separate preview namespace and update `preview_id`:
```
npx wrangler kv:namespace create FX_KV --preview
```

2) Set admin password secret for the Pages project:
```
npx wrangler pages secret put ADMIN_PASSWORD --project-name speedpayfx
```
(or set via Cloudflare dashboard → Pages → your project → Settings → Environment variables.)

3) Build the app and generate Pages output:
```
npm install
npm run cf:build
```

4) Run locally with Pages emulator (uses a local KV store and binds ADMIN_PASSWORD):
```
npx wrangler pages dev .vercel/output/static \
  --binding ADMIN_PASSWORD=<your-password> \
  --persist-to .wrangler/state
```

5) Deploy to Cloudflare Pages:
```
# first deployment will prompt to create/choose a Pages project
npm run cf:build
npx wrangler pages deploy .vercel/output/static --project-name speedpayfx
```

## Local + Cloudflare workflow
1) Run local tests/builds.
2) Push to Git (Cloudflare deploys automatically).
3) After every push, rebuild and restart the local server so local stays in sync:
```
npm run cf:build
npx wrangler pages dev .vercel/output/static \
  --binding ADMIN_PASSWORD=<your-password> \
  --persist-to .wrangler/state
```

## API quick reference
- `GET /api/rates` – returns rates (creates defaults if missing)
- `POST /api/rates` – update rates (body: `{ usd_to_xaf, xaf_to_usd, password }`)
- `POST /api/orders` – create order
- `GET /api/orders` – list OPEN orders (newest first)
- `GET /api/orders/:id` – fetch one order
- `POST /api/orders/:id/match` – mark status MATCHED
- `GET /api/admin/export` – admin-only JSON export (header `x-admin-password`)
- `POST /api/admin/import` – admin-only import from the same JSON format
- `GET /api/admin/rates/config` – admin-only rate config (header `x-admin-password`)
- `POST /api/admin/rates/config` – update rate config (header `x-admin-password`)

## Notes
- Rates are pulled from the Nala partners API (USD → XAF, provider `NALA`). If a direct XAF → USD rate is not present, the USD → XAF rate is reused.
- Use `/admin` to adjust the rate update interval and the XAF offset (password required).
- Data is stored as JSON in KV keys: `rates`, `orders:index`, and `order:{id}` per order.
- Design is mobile-first with simple cards and large tap targets.
