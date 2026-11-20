# Menuverse 2

The Menuverse marketing site, rebuilt from scratch: dark "Nocturne" black and violet, GSAP + Lenis, React Three Fiber.
Built as a Base44 code project so it imports into Base44, which runs the backend (auth, data, functions, hosting).

- Spec: `MENUVERSE_MASTER_PROMPT.md` · Copy: `MENUVERSE_CONTENT_PACK.md` · Decisions: `docs/DECISIONS.md`

## Run locally

```bash
npm install
npm run dev        # front end only; forms/chat/auth need a linked Base44 app
npm run build
npm run lint
```

## Connect to Base44 (one time)

Requires Node 20.19+ and a Base44 account.

```bash
npx base44 login                  # device-code login
npx base44 link                   # choose "create new" (e.g. "Menuverse 2"); writes base44/.app.jsonc
npx base44 auth social-login      # enable Google and Microsoft
npx base44 auth password-login    # enable email + password
npx base44 deploy --build         # builds with the app id, pushes entities, functions, auth and the site
```

Day to day: `npx base44 dev` runs the app with a throwaway local backend; `npx base44 dev --remote` uses the real one.
Keep the current menuverse.eu app live until the new one is approved, then move the domain.

## Where things are

| What | Where |
|---|---|
| Routes | `src/App.jsx` |
| Homepage sections, in order | `src/pages/Home.jsx`, `src/sections/` |
| Global layer (background, grain, cursor, progress, layout) | `src/components/layout/` |
| Re-themed third-party effects | `src/components/fx/` |
| 3D scenes | `src/components/three/` |
| Copy, 8 languages | `src/i18n/*.json` (Greek is the default) |
| Design tokens (both themes) | `src/index.css`, mapped in `tailwind.config.js` |
| GSAP setup and eases | `src/lib/gsap.js`, `src/lib/gsap-extra.js` |
| Data model and access rules | `base44/entities/*.jsonc` |
| Backend functions | `base44/functions/<name>/entry.ts` |
