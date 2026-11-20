# Menuverse 2 (marketing site rebuild)

Spec: `MENUVERSE_MASTER_PROMPT.md`. Copy: `MENUVERSE_CONTENT_PACK.md` (verbatim, never invent claims).
Decisions that override the spec: `docs/DECISIONS.md` (read it first, append to it when you make a call).

## Workflow
- Work through the PHASE PACK at the bottom of the master prompt, one phase at a time.
  Stop after each phase and report: what was built, what is still a placeholder, what could not be done.
- Verify before reporting: `npm run build`, `npm run lint`, and a real-browser check (headless Chrome QA script or
  Claude in Chrome) at desktop 1440x900, mobile 390x844 with touch, and reduced motion.

## Platform rules (Base44 import target)
- npm, not pnpm (Base44 builds with `npm install`; keep `package-lock.json`).
- React 18 / Tailwind 3 / Vite 6 / plain JS. R3F 8.18 + drei 9.122 + postprocessing 2.19, three 0.171.x. Don't upgrade majors.
- `src/App.jsx` is the router. New page = import near `// Add page imports here` + a `<Route>`. Keep the provider wrappers.
- Entities: `base44/entities/<Name>.jsonc`, complete JSON schema, no comments, with `rls`.
- Backend functions: `base44/functions/<name>/entry.ts` (Deno, `createClientFromRequest` from `npm:@base44/sdk`).
- Code that runs during the first paint must use `getBase44()` (lazy SDK), not import `@/api/base44Client`.
- Heavy GSAP plugins (MorphSVG, Draggable, Inertia, MotionPath) come from `@/lib/gsap-extra`, only inside lazy sections.

## Code rules (from the spec's Global Rules)
- Every UI string goes through `t()` and exists in all 8 dictionaries (`src/i18n/*.json`, same key tree).
- Fonts: Commissioner (display), Noto Serif Display italic (accent), Inter (body), JetBrains Mono (labels). All have Greek.
- GSAP owns scroll and timelines (inside `useGSAP` with a scope). Motion (framer-motion) only for hover/state.
- Every effect has a reduced-motion path (`useReducedMotion`) and a touch path (`useIsTouch` / `useIsDesktop`).
- WebGL: max 3 live contexts on desktop, 1 on mobile; mount with `useInViewMount`; canvases are `aria-hidden`.
- Colours come from tokens (`mv-*` Tailwind classes / CSS variables in `src/index.css`), both themes.
- Homepage sections use `<Section id bg>` from `src/components/layout/Section.jsx`.
- Third-party effects (React Bits, Aceternity, Magic UI, Motion Primitives) are rebuilt in `src/components/fx/`, re-themed.

## Testing without Base44
- Dev-only mock backend: open `http://localhost:5173/?mock=1` once, then in the console `__mvMock.signIn()` /
  `signIn("admin")`, `__mvMock.adminReply("text")`, `__mvMock.referralFriends(n)`, `__mvMock.referralStatus("earned")`,
  `__mvMock.reset()`, `__mvMock.signOut()`. Backend functions (`base44/functions/*`) have mock twins in `src/api/mockBase44.js`.

## Commands
- `npm run dev` · `npm run build` · `npm run lint`
