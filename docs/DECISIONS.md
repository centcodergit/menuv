# Menuverse 2: build decisions

Calls made on top of `MENUVERSE_MASTER_PROMPT.md` (the spec) and `MENUVERSE_CONTENT_PACK.md` (the copy).
Anything here overrides the spec where they differ. Newest phase last.

## Phase 0 / 1 (19 Nov 2026)

### Platform
- **Base44 code project** (decided by Nikolas: "we import to Base44, it handles the backend").
  Same shape as the old app's export (`menuverse.zip`): Vite SPA + `base44/` folder (entities, functions),
  linked and deployed with the Base44 CLI. See README for the steps.
- **Stack matches Base44's Vite SPA template** so the import and Base44's AI editor keep working:
  React 18.3, Tailwind 3.4 (`tailwind.config.js`), Vite 6, plain JavaScript (`.jsx`), react-router-dom 6,
  shadcn/ui (new-york, all components), `@base44/sdk` + `@base44/vite-plugin`.
  - 3D therefore uses the React 18 line: `@react-three/fiber` 8.18, `drei` 9.122, `@react-three/postprocessing` 2.19.
    `three` is held at 0.171.x (the release drei 9.122 was built against).
- **npm, not pnpm.** Base44 builds imported projects with `npm install` and its export ships `package-lock.json`.
- Base44 conventions followed: `src/App.jsx` is the router (layout route with `<Outlet>`, no root `src/Layout.jsx`);
  `AuthProvider`, `QueryClientProvider`, `BrowserRouter`, `<Toaster />`, `ProtectedRoute`, `UserNotRegisteredError` kept;
  entity files are plain JSON schemas (no comments); the 404 page adds `<meta name="prerender-status-code" content="404">`.
  The Vite plugin provides the editor's visual-edit agent, navigation and HMR notifiers, so no extra files for those.

### Deliberate differences from the stock Base44 template (performance budget)
- **Public pages never wait for auth.** The stock template shows a spinner until auth resolves, which would delay
  the hero (LCP). Here auth checks run when the browser is idle; only `/referrals` and `/admin` wait.
- **The Base44 SDK is lazy** (`getBase44()` in `src/api/getBase44.js`). SDK + axios + socket.io is about 51 KB gzipped;
  splitting it took initial JS from 249 KB to 173 KB gzipped. Code inside lazy sections may import
  `{ base44 } from "@/api/base44Client"` as usual.
- **GSAP plugins are split**: core set in `src/lib/gsap.js` (ScrollTrigger, SplitText, Flip, DrawSVG, ScrambleText,
  CustomEase). MorphSVG, Draggable, Inertia, MotionPath live in `src/lib/gsap-extra.js`, imported only by lazy sections.

### Experience layer
- **Mobile and touch get a static CSS gradient background, not the WebGL MeshGradient.** The spec allows "speed 0 or a
  CSS fallback"; the CSS version keeps mobile inside its budget of one live WebGL context for the sections that need it.
  The desktop shader mounts on idle and pauses while the tab is hidden.
- Background brightness: sections declare `bg="bright" | "base" | "dim"` (1 / 0.7 / 0.35). Hero, Pricing and Final CTA
  are bright; Feedback, Articles and the legal pages are dim.
- Reduced motion = OS setting **or** the footer toggle (`menuverse-reduce-motion`), mirrored on `html[data-reduce-motion]`.
- The browser's scroll restoration is off. The app owns scroll (Lenis, route curtain, hash deep links).
  Hash deep links wait for lazy sections + fonts + ScrollTrigger refresh, then jump (on load) or glide (in page).
- Light theme "Porcelain": the violet scale shifts darker (violet-300 → #6D28D9, etc.) so accents keep AA contrast on white.

### i18n
- Greek ships in the main bundle; the other seven dictionaries load on demand. `main.jsx` loads the visitor's
  language before the first render (no flash of Greek for English visitors).
- First visit: stored choice, else `navigator.language`, else Greek. A browser set to English therefore gets English.
- Translations use the formal register to match the Greek plural-formal voice: de *Sie*, fr *vous*, es *usted*,
  it *voi*, pt (European) *o seu*, nl *u*.

### Data (Base44 entities, `base44/entities/`)
| Entity | Access (RLS) | Why |
|---|---|---|
| Feedback | anyone creates; submitter + admin read; admin edits | public form |
| NewsletterSubscriber | admin only | writes go through a `subscribeNewsletter` function (service role) that enforces one row per email; a public create couldn't check duplicates without exposing the list |
| SupportConversation | owner creates/reads/updates; admin all | one conversation per signed-in user |
| SupportMessage | owner of the conversation reads all its messages and may post only as `user`; admin all | added `conversation_owner_id` so customers can read admin replies (those rows are created by the admin) |
| Referral | referrer reads own; writes admin/service role only | codes must be unique and counts tamper-proof; added `referrer_id` |
| ExchangeRateCache | service role only | used by `getExchangeRates` |
Showcase and Testimonials stay static arrays in `src/content/` (one item each today).

### Old-site facts that answer the spec's [CONFIRM] items (from `menuverse.zip`)
- **Yearly prices:** €100 / €180 / €288 per year, shown as €10 / €15 / €24 per month (not the spec's 20%-off guess).
- **Hero phone tabs:** Pizza: Margherita €12.00, Quattro Formaggi €14.50, Diavola €13.50. Pasta: Carbonara €13.00,
  Amatriciana €12.50, Pesto Genovese €11.50. Desserts: Tiramisu €7.50, Panna Cotta €6.50, Gelato €5.00.
- **Plan CTA:** signed out → login; signed in → the old site opened a full `/messages` page with `?plan=&billing=`.
  New site: opens the chat panel prefilled (spec 3.5).
- **Cookie Policy page existed** in the old app (Content Pack N5 says it didn't). Route `/cookiepolicy` added; text to port in Phase 3.

### Open (needs Nikolas)
- Assets: SVG logo + mark, favicon, Athens Anima Bistro photo, optional dish GLB.
- Content Pack section N: privacy email (privacy@menuverse.com vs menuverse.gr@gmail.com), "thousands of businesses"
  and "leading platform" claims, article typos, "Τάσεις 2025", FAQ JSON-LD without a visible FAQ.
- The old app also had: Register / Forgot / Reset password pages, a full Messages page, AI auto-replies in chat,
  and admin tools (subscriptions, income, Google Calendar, Search Console, maintenance mode, Notion/Sheets sync).
  The spec drops them. Decide before moving menuverse.eu (suggestion: keep the old app running for admin).

## Phase 2 (19 Nov 2026)

### Cursor (changed by Nikolas, overrides master prompt 6.3)
- No dot + ring. A **designed system cursor**: dark glass arrow with a light edge and a faint violet glow; links and
  buttons get a violet arrow. It is a real OS cursor (`cursor: image-set(...)` in `src/index.css`), so it never lags.
  Sources `public/cursors/{arrow,pointer}.svg`, rasterised to 1x/2x PNG for Retina sharpness. Hotspot (5, 3).
- The spec's contextual labels survive as a small glass tag beside the arrow, only over `[data-cursor="media"]`
  ("▶ PLAY") and `[data-cursor="drag"]` ("← ΣΥΡΕ →"). Desktop with a mouse only. GSAP Draggable instances must pass
  `cursor: "inherit"` / `activeCursor: "inherit"` so they don't replace the arrow with the OS grab hand.

### Copy (Content Pack G, H1 to H17 → `src/i18n/*.json`)
- EL and EN are verbatim. A script compares all 344 pack strings with the dictionaries (only intended differences:
  `langTip.title/body` in Greek, which the pack says to translate).
- Pack keys are kept as written, with three structural changes: compound rows are split (`feedback.yes`/`feedback.no`,
  `referral.copy`/`copied`, `showcase.prev`/`next`); plans live under `pricing.plans.<id>` with `tagline` and a
  `features` array (Enterprise price as `priceTop`/`priceBottom`); testimonials live under
  `testimonials.items.<id>` so more can be added (author and initial in `src/content/testimonials.js`).
- The testimonial quote is stored without its surrounding quotation marks: the design draws oversized violet
  quote marks (7.10), so keeping them in the string would double them. Wording unchanged.
- The Pricing section header gets an eyebrow (`pricing.eyebrow` = the nav label "Τιμοκατάλογος"), because every
  section header has one (4.5). No new wording.
- The phone mockup's tagline, "Traditional recipe" and tab names are translated in every language (`phone.*`),
  as the pack allows ("may be translated per language as a multilingual touch"). Dish names stay Italian;
  dishes and prices are data in `src/content/phoneMenu.js`.
- Footer legal links stay in English in every language ("Privacy Policy", "Terms of Service", "Cookie Policy"),
  matching the Greek site and the English-only legal pages.
- **New microcopy added beyond the pack** (needed by later phases, in all 8 languages): `demo.videoTitle`,
  `showcase.newTab`, `showcase.frameTitle`, `pricing.currency`, `pricing.billing`, `pricing.regularPrice`,
  `pricing.chatPrefill`, `pricing.chatPrefillEnterprise`, `referral.friend`, `referral.linkLabel`, `referral.share`,
  `referral.clicks`, `referral.reward`, `referral.status.*`, `feedback.sending`, `feedback.star`,
  `articles.readerCta` (the articles' own closing CTA line), `articles.prev`, `articles.next`,
  `newsletter.emailLabel`, `footer.cookies`, `footer.col.navigate`, `footer.col.legal`, `chat.typing`, `chat.error`,
  `common.prev`, `common.next`, plus Phase 1's `a11y.*`, `common.loading`.
- Register per language follows the Greek, section by section: formal where the Greek is plural/formal
  (de *Sie*, fr *vous*, es *usted*, it *voi*, pt *o seu*, nl *u*); informal where the Greek is singular
  (Articles and Coming soon: *du / tu / tú / tu / tu / je*).
- `/__copy` (development only) shows every key in the active language next to the Greek, for review.
- Translation calls worth knowing (all 8 dictionaries pass the key/placeholder checker):
  - Menu word: de "Speisekarte" (nav keeps "Menü"), es "carta", pt "menu" (articles title pairs it with "ementa"
    for search), fr/it/nl "menu". Plan word: de "Tarif", fr "formule", it "piano", nl "pakket", es/pt "plan(o)".
  - Enterprise price ("Προσφορά / κατόπιν συνεννόησης"): de "Preis / auf Anfrage", fr "Tarif / sur mesure",
    es "Precio / a medida", it "Prezzo / su misura", pt "Preço / sob consulta", nl "Prijs / op aanvraag".
  - Where Greek and English differ, translators followed the Greek meaning without adding claims (e.g. fr/it hero
    keeps "modern"; es/pt final line keeps "businesses that already upgraded").
  - de and fr use a non-breaking space before % ("20 %"); fr also before ! ? : ;.
  - pt `referral.you` is "Eu" (formal "você" avoided in European Portuguese); es uses "Usted".
  - **Check in Phase 7:** de `referral.ticket` "GRATIS-SPEISEKARTE" is twice the length of "FREE MENU".
  - The "thousands" claim (`final.body`) is translated faithfully in all languages, pending Content Pack N7.

## Phase 3 (19 Nov 2026)

### Articles (`src/content/articles.js` + `src/content/articles/{code}.js`)
- EL and EN are generated by a script straight from Content Pack A1 to A6, so they are verbatim (typos in N8
  included, pending Nikolas). The other six languages are translated from English with the Greek as reference,
  in the informal register the Greek articles use. A checker confirms every language has the same 6 articles,
  slugs and block structure (intro, then h3 + paragraph pairs), with no em dashes.
- Split per language (one file each, ~14 to 21 KB) and loaded on demand by `loadArticles(lang)`, instead of one
  `articles.js` holding all eight (~120 KB): only the visitor's language is downloaded. `articles.js` keeps the
  shared data (slug, read time, generated-cover parameters) and the hash helpers (`#article-{slug}`).
- Slugs are Greek transliterations, the same in every language. The trends article's slug has no year
  (`psifiakos-katalogos-taseis`) so it survives a retitle (Content Pack N9).
- Each article's closing line ("Ξεκίνα δωρεάν στη Menuverse") is the same in all six, so it is one dictionary key
  (`articles.readerCta`), not repeated per article.
- The Greece article's example searches are localised per language but keep "QR" (the paragraph's point).

### Legal pages
- Privacy (L1) and Terms (L2) are generated verbatim from the Content Pack into `src/content/legal/`. English
  for every language, marked `lang="en"`, with a short "available in English only" note for other languages.
- The page chrome (back link, "Last Updated", contents, "Open Message System") speaks the visitor's language
  (`legal.*` keys; the Greek wording is the old site's own Cookie Policy chrome). English keeps the verbatim
  "Last Updated: December 18, 2024".
- **Cookie Policy** ported verbatim from the old app (English + Greek, 10 sections). Greek visitors get Greek.
  This resolves Content Pack N5: the Privacy Policy's "Cookie Policy" mention now links to it.
- Emails become mailto links; mentions of the other legal pages link to them. "Label: text" bullets show the
  label in medium weight (presentation only).
- "Open Message System" calls `openChat()` from `src/lib/chatBus.js`; the Phase 4 chat panel listens for it.
- All pages except Home and 404 are code-split. The route transition preloads the next page while the curtain
  covers the screen (`src/lib/routeChunks.js`), so it never lifts on a blank page.

### Flag for Nikolas (not legal advice)
- The ported Cookie Policy describes Google Analytics and marketing/advertising cookies. The new site sets
  neither today (preferences use localStorage; Base44 may add its own analytics script in production) and has
  no cookie consent banner. Have the policy reviewed against what the new site actually does before launch.

## Phase 4 (19 Nov 2026)

### Preloader
- 21x21 QR of "menuverse.eu" (version 1, the only URL form that fits 21x21; the hero monolith uses the full
  "https://menuverse.eu", 25x25). Both matrices are precomputed in `src/content/qr.js`, so the first paint needs no
  QR library. Runs on the first visit to "/" per session only; never with reduced motion or on deep pages.
- The reveal is an expanding hole in a CSS mask over the void. The intro is marked "done" the moment the reveal
  starts (`src/lib/intro.js`), so the hero entrance continues the same motion.
- Lenis runs GSAP with lag smoothing off; a long task while the page boots made the intro jump to its end. The
  preloader turns lag smoothing back on while it plays and starts after the first paint.

### Navbar
- Behaviour as specified (full-width transparent → 860px glass pill at 80px, 12px from the top, spring).
- **Refractive glass** (React Bits Glass Surface) in Chromium, toned down from the library default: the default
  distortion split text behind the pill into strong red/green/blue copies. Now a gentle edge refraction plus a
  soft blur so labels stay readable. Safari/Firefox get obsidian glass.
- **Sliding active pill and the resize spring are GSAP/CSS, not Motion `layoutId`**, and the language/account menus
  are a small in-house accessible menu (`src/components/fx/Menu.jsx`) instead of Radix DropdownMenu. Both keep
  Motion, Radix menus and @floating-ui out of the first load: initial JS went 220 → 188 KB gzipped with the same
  behaviour (keyboard: arrows, Home/End, type-ahead, Escape returns focus).
- Theme toggle: sun → moon with MorphSVG, fetched when the pointer or focus reaches the button.
- Logo: placeholder QR-module mark + typographic wordmark until the SVG logo arrives. (Found `b247a2b9c_transparent.png`,
  a navy/blue "M" mark, 500px, not usable on the dark theme.)
- Signed in: the "Σύνδεση" button becomes the user's initial with a menu (Πίνακας → /referrals, Admin for admins,
  Sign out). New keys `nav.account`, `nav.logout`, `nav.admin`.
- Mobile: React Bits Staggered Menu (GSAP): violet pre-layers, large links, 8 language buttons + theme at the bottom,
  focus trapped, Escape closes, link tap closes and scrolls.

### Chat
- Real logic per 3.6 against the entities from Phase 1: conversation created on the first message, live updates via
  Base44 subscriptions with 5s polling fallback, unread badge = team replies newer than the last time this device
  read the thread (also clears the conversation's `unread_by_user` flag for the admin inbox).
- Opens from the widget, the greeting, `openChat({ message })` (support section, pricing, legal pages) and
  `?chat=open` (where the login page will return `?redirect=chat`). A draft typed while signed out survives sign-in.
- **Orbiting light is a CSS conic gradient, not Paper Shaders PulsingBorder:** a PulsingBorder is one more WebGL
  context on every page, which would break the 3-context desktop budget in Coming soon (background + globe + dish).
- The floating button hides while the panel is open (it covered the send button).
- The old app's AI auto-replies are not part of the spec and were not rebuilt.
- **Development mock backend** (`src/api/mockBase44.js`, dev builds only): `?mock=1` once, then
  `__mvMock.signIn()`, `__mvMock.adminReply("…")`, `__mvMock.reset()` in the console. Lets chat, forms and admin be
  exercised before `base44 link`. Production builds never include it.

### Footer and 404
- Footer curtain reveal with a clip-path wrapper (footer fixed underneath, uncovered by the page). Falls back to a
  normal footer when taller than the viewport.
- Variable fonts draw letters from overlapping contours, so a plain stroke shows stray lines inside E, R, S, 4.
  The footer wordmark fills the letters with the footer colour over the inner half of the stroke
  (`paint-order: stroke`); the 404 (over the moving background) traces its outline from the filled shapes with an
  SVG filter. Both look like clean outlines.
- 404: the line in the visitor's language as the H1, plus all eight on a slow marquee; a QR that keeps trying and
  failing to assemble (9s loop).

## Phase 5 (19 Nov 2026)

### Hero
- **Two modes.** Desktop with a fine pointer, ≥1024px, WebGL and motion allowed: the R3F stage. Everything else
  (phones, tablets, reduced motion, no WebGL): CSS phone with a float, a QR that draws itself, no canvas, no pin.
- **The canvas is full-viewport**, not just columns 5 to 12, so the "dive into the menu" can fill the screen; the
  scene places the phone at 69% of the viewport width instead. The hero is exactly one viewport tall while pinned.
- **H1 size for the hero** is `clamp(2.4rem, min(5.1vw, 8.2svh), 5.25rem)` instead of the global
  `clamp(2.6rem, 6.6vw, 6.75rem)`: at the global size the Greek headline wrapped to six lines and pushed the copy
  past the fold. Follows master prompt 4.4 ("Greek words are long, keep max sizes in check").
- **Phone screen:** `<PhoneMenu>` is a pure component (props in), because drei `<Html>` renders in its own React
  root without the site's contexts. In 3D it is laid out at 2x with CSS `zoom` and mapped onto the screen at half
  size, so the text stays sharp when the camera dives in (the browser upscales the layer during the scroll otherwise).
- **Phone menu** cycles tabs every 6.5s until touched; the active pill moves with GSAP Flip, prices roll with NumberFlow.
- **QR monolith:** the real https://menuverse.eu code (25x25) as one InstancedMesh, smaller and set back behind the
  phone than first drafted so it never competes with the headline; rotated 15° to face the centre.
- **Chips** sit on the phone's edges (top-right, bottom-left), clear of the headline, subtitle and CTAs. drei's
  screen-space `<Html>` ignores group scale, so their pop-in and fall-away are applied to the DOM directly.
- **CSS placeholder phone** holds the 3D phone's spot until the scene's first frame, crossfades, then unmounts
  (otherwise its menu would be a second, invisible set of tabs for keyboard users).
- **Bundling:** removed the `manualChunks` rule: grouping three.js into one chunk also pulled React into it and made
  every page preload 313 KB of 3D code. Now the scene is its own lazy chunk (269 KB gz), downloaded on desktop only,
  after first paint. Initial JS: 199 KB gz.
- "Δείτε το Demo" scrolls to `#demo-section` and dispatches `mv:demo-pulse`; the Demo section (Phase 6) pulses its play
  button on that event.
- Not measurable here: frame rate on a real GPU (the test browser renders WebGL in software at ~5 fps). Check the 60 fps
  target on an M-series Mac; `PerformanceMonitor` drops the pixel ratio to 1 when frames fall.

## Phase 6 (19 Nov 2026)

### Shared
- `SectionHeader` (`src/components/layout/SectionHeader.jsx`) implements the standard header choreography once
  (4.8): eyebrow scrambles from Greek glyphs, H2 lines rise from a mask with 3°, lead words un-blur; "top 82%", once.
  `accentWords={n}` sets the last n words in Noto Serif Display italic with the text gradient (works in every
  language without per-language markup). A header that already played does not replay after a language switch.
- `BorderBeam` (CSS offset-path) and `InteractiveHoverButton` rebuilt from Magic UI, re-themed.

### 7.3 Multilingual loop
- React Bits Curved Loop as an SVG textPath with the text gradient; draggable (drag sets direction, throws with
  momentum), speed boosted by scroll velocity, runs only on screen. Touch/small screens: CSS marquee. Decorative.

### 7.4 Live support
- The button opens the real chat (`openChat()`); the chat window on the right is a decorative preview (greeting →
  typing → reply, once, when it scrolls into view).

### 7.6 Demo
- Light Rays is a small OGL shader (one WebGL context): desktop only, mounted only near the section, paused off
  screen, context released on unmount. At the demo the page has background + rays = 2 contexts (the hero canvas
  is unmounted by then).
- Container Scroll: the frame goes from rotateX 20°, scale 1.05 to flat as it scrolls into view (scrubbed).
- Facade: nothing from YouTube loads until the click (thumbnail from i.ytimg.com, then the youtube-nocookie embed).
  The hero's "Δείτε το Demo" pulse (`mv:demo-pulse`) bounces the play button and focuses it.

### 7.7 Showcase
- animabistro.base44.app sends no X-Frame-Options / frame-ancestors (checked 19 Nov 2026), so the phone shows the
  live menu in a lazy, sandboxed iframe (`allow-scripts allow-same-origin allow-popups allow-forms`), mounted only
  near the viewport. If the client ever blocks framing, set `image` and the phone shows the photo instead.
- **Photo pending:** `src/content/showcase.js` has `image: null` until Nikolas uploads the Athens Anima Bistro photo;
  until then a warm abstract placeholder (no stock imagery) carries the name.
- The role line under the name reuses the testimonial's "Εστιατόριο, Αθήνα" (real, already translated).
- One client today, so no carousel controls; from two clients up the Embla carousel (depth effect, magnetic
  arrows, stretching dots, arrow keys) takes over automatically.

### 7.2 Features (Magic Bento)
- Layout: desktop 6 columns (QR + Live on row 1, Templates tall on the right across two rows, Languages wide,
  then Analytics wide + Dietary); tablet 2 columns; mobile 1 column. Effects live in `src/components/features/`.
- Pointer effects (edge light, 320px spotlight, 6 particles, ≤8px magnetism, click ripple) on fine pointers only,
  listeners attached only near the viewport. Cards enter per row (not all six at once) with a one-lap Border Beam.
- Each demo plays only once its card has landed and is ≥25% visible; touch plays each demo once; reduced motion
  shows end states. The entrance animates opacity (not visibility) so screen readers always read the text.
- Card Swap: the front card fades and is clipped to the demo area instead of dropping 500px over the title.
- Dietary: "Αλλεργιογόνα" reveals allergen icons rather than filtering; the diet data is illustrative and honest
  (only Bruschetta is marked vegan). Analytics numbers are illustrative demo data for "La Bella Italia".

### 7.5 How it works
- Desktop: the stage pins for +=300% (scrub 1); the header is the first slot of the horizontal track, then four
  72vw panels. The path is drawn in vw-based segments so each segment's window is constant; a comet rides the tip
  (MotionPath); numerals fill as their panel nears centre. Mobile / <1024px / reduced motion: vertical timeline.
- No backdrop blur inside the moving track (it would recompute every frame; 4.6 keeps blur to nav/chat/modals).
- Table tents draw each QR as one merged path from `URL_QR` (3 elements instead of ~900 rects in the pin).
- The typing caret does not blink (no loop faster than 6s).

### Cross-section fixes found in Phase 6
- Phones were 466px wide at 390px: header auroras and glows overflowed. `.section` and `html` now use
  `overflow-x: clip` (no scroll container, so pins and sticky still work). Header auroras fade on all sides.
- Trigger order: lazy sections can mount before the How-it-works pin exists, leaving triggers below it 300vh too
  high (pricing did not brighten the background). Background triggers set `refreshPriority: -1`, which makes GSAP
  sort all triggers into page order on refresh, and `src/lib/gsap.js` refreshes when the page height settles.
- Status pulses (online dots, play ring) now run on a 6s cycle: a quick ring, then rest.
- The embedded Anima Bistro menu logs its own console errors ("Failed to invite admin … must be logged in") when
  loaded signed out. That comes from the client app, not this site; QA ignores that origin.

## Phase 7 (19 Nov 2026)

### Pricing data and currency (3.5)
- Prices live in `src/lib/pricing.js`. Yearly uses the old site's published prices (€100/€180/€288 a year, shown as
  €10/€15/€24 a month), not a computed 20% off. **For Nikolas:** two inconsistencies inherited from the old site:
  Starter €100/year is €8.33/month, not €10 (12 × €10 = €120); and the badge "Εξοικονόμηση 20%" (Content Pack,
  verbatim) is only exact for Devoted (Starter saves 31% a year, Professional 17%). Prices and copy kept as published.
- Amounts round to 2 decimals (JPY whole yen); whole amounts drop the decimals (€12, not €12,00). Intl formatting
  in the active locale with `narrowSymbol`.
- `getExchangeRates` (backend function, public): Frankfurter ECB rates, cached 12 h in ExchangeRateCache (service
  role), stale cache if the API fails, then a hardcoded table (same table in `src/lib/pricing.js`). The browser
  keeps the last good rates for 12 h too (`menuverse-rates`) and only fetches once a non-EUR currency is chosen.

### Referral program (3.10)
- All referral writes go through backend functions (the entity is read-own / write-service-role):
  `getMyReferral` (creates the 8-character code on first call; alphabet without 0/O/1/I), `trackReferralClick`
  (public; the site sends it once per code per browser), `claimReferral` (signed in).
- `?ref=CODE` on any page: stored in localStorage `menuverse-ref`, the visit counted, and `ref` removed from the
  address bar (hash kept). It runs when the browser is idle, never during the first paint.
- Claim rules: the code must exist, not be your own, an account counts once across all referrers, and only
  accounts created within the last 7 days count (so existing customers can't be "referred").
- The progress meter counts friends who signed up with the code. Purchases (`has_purchased`) and the reward status
  (pending / earned / redeemed) are set by the team from /admin (Phase 9); nothing is earned automatically.
- The referral link is always `https://menuverse.eu/?ref=CODE` (not the current origin, which would be a
  base44.app preview URL during testing).
- Share: WhatsApp (wa.me) everywhere, Messenger only on touch devices (`fb-messenger://`; its web dialog needs a
  Facebook app id we don't have), and the native share sheet where the browser offers one.
- New strings (all 8 languages): `common.error` (same wording as `feedback.error`), `common.retry`,
  `referral.shareText` ("Αποκτήστε το ψηφιακό σας μενού με 50% έκπτωση στη Menuverse: {link}").

### 7.10 Testimonials
- Scroll Reveal (GSAP SplitText words, scrubbed from dim + 6px blur to sharp, ends when the quote's bottom reaches
  70% of the viewport), violet quotation marks that draw then fill, the initial inside Circular Text (one turn per
  24s, faster on hover). Arrows, dots and stacked author initials appear only from two quotes up; crossfade between
  quotes is a Motion state change.

### 8.3 /referrals
- Link card (copy with check morph, share), a "x / 3 φίλοι" meter drawn as three QR-module slots (dashed when
  empty, a glowing core springs in when filled), visits, reward pill, the 4 steps. Signed out → ProtectedRoute →
  `/login?redirect=referrals`. Page heading reuses the section's title and body; tab title "Πίνακας | Menuverse".
- QA note: `.section` clips horizontal overflow, so a page-width check no longer catches content running off a
  card on phones; tests now check that key elements end inside the 390px screen.

### 7.8 Pricing
- Files: `src/sections/Pricing.jsx`, `src/components/pricing/*`, fx `GlowingEffect`, `AnimatedShinyText`, `DottedGlow`.
- Billing toggle is a radiogroup (arrows / Home / End); yearly is described by the badge. Confetti only when
  switching to yearly, skipped under reduced motion (system or the footer toggle).
- Currency selector reuses `fx/Menu` (menuitemradio items, type-ahead by code, flags decorative).
- Prices follow Intl in the active locale, so Greek shows "0 €" and "17,40 $" (the spec writes "€0" English-style).
  The NumberFlow is spliced into the dictionary sentence at `{price}`/`{total}`, glued to "/μήνα". The billed-yearly
  line is always rendered (hidden while monthly) so toggling never shifts the layout.
- Cards: CTA sits under the price, before the features. `useEqualRows` aligns header and price blocks per row so CTAs
  line up in every language and currency (fixed min-heights failed in de/fr with CHF). Tilt (max 3°) is built into
  `PlanCard` without `TiltedCard`'s glare, which washed over the prices. The raised shadow is md+ only (the phone
  carousel clipped it). CTAs don't wrap ("Kontakt aufnehmen" did at 1280) and carry a decorative arrow.
- Glowing Effect: lit anywhere over the card, 64px proximity (a neighbour's near edge lights too), no blurred
  second layer, pointer listener only while near the viewport. DottedGlow is CSS only (grid + three violet patches
  on 9/11/13s opacity cycles; keyframes in an inline style).
- Signed-out "Ξεκινήστε" is a real link to `/login?plan=…&billing=…&currency=…` (modifier-clicks open normally);
  signed in it is a button that opens the chat prefilled. Enterprise is a mailto link that opens the chat when JS runs.
- Mobile: scroll-snap carousel centred on Professional, four 44px dots labelled with plan names.
- Fallback exchange rates refreshed to the ECB rates of 19 Nov 2026 (checked against Frankfurter, which returned all
  11 currencies). `useCurrency` now also syncs same-tab instances (the in-tab event has no `key`).
- `fx/Menu` type-ahead ignores `aria-hidden` parts, so the language menu (flag first) now matches by name.

### 7.9 Referral program
- Files: `src/sections/Referral.jsx` (`id="referral"`), `src/components/referral/*`, fx `AnimatedBeam`, `HoloCard`,
  `Counter`. The diagram is `aria-hidden`; its meaning is the stepper text.
- Buttons: "Ξεκινήστε" (primary) first, "Μάθετε Περισσότερα" second, "Πίνακας" as a quieter link: the primary action
  leads (the spec lists Learn More first). Signed-out Start waits for the idle auth check instead of guessing.
- Learn More modal: eyebrow, title, the body as the rule, the 4 steps, a Start button (no extra copy exists).
  Share dialog: title `referral.step2`, description step3 · step4, link to the dashboard.
- Choreography plays once (~5.2s): "you" lights, three beams fire with "50%" tokens on MotionPath, friends light,
  then three beams converge and the ticket flips from its back face (dot grid + mark) with confetti. The flip happens
  when the converging beams reach the ticket. Below 640px the diagram is vertical.
- Holo ticket: foil/glare follow the cursor with a small tilt (fine pointer); Android uses device tilt without a
  prompt; iOS gets a slow 10s drift instead of asking for motion permission. Ticket text size is measured per
  language (German "GRATIS-SPEISEKARTE" fills ~89%; Greek capitals are wider than estimates).
- Step 3's "50" rolls with Counter (split around "50" in the translated string, so "50 %" works); digits are CSS
  generated content so copied text reads "50%". No spinner in loading states (no loop faster than 6s).
- Dialogs open without a Radix trigger and return focus to their button themselves.

### Cross-section fix found in Phase 7
- `cn()` (tailwind-merge) read the custom font sizes (`text-h2`, `text-lead`, `text-label`, ...) as colours and
  dropped them next to any `text-mv-*` colour, so every section header's lead and several labels rendered at body
  size since Phase 4. `src/lib/utils.js` now registers them as font sizes.
- `canvas-confetti` added to `optimizeDeps.include` (lazy-only dependency; avoids a dev re-optimisation reload).

## Phase 8 (20 Nov 2026)

### 7.11 Coming soon
- The emblem is an SVG "liquid metal" mark (champagne gradient + moving SVG light), not Paper Shaders LiquidMetal:
  on desktop the background (1) + globe (2) + 3D dish (3) already use the 3-context WebGL budget, and the logo it
  should take its shape from has not been uploaded yet. Same emblem on every device (no separate mobile fallback).
  Real logo: replace `EMBLEM_VIEWBOX` and `<EmblemShape>` in `src/components/fx/MetalEmblem.jsx`.
- Globe: cobe 2 has no `onRender`, so `fx/Globe.jsx` runs its own loop (skips frames off screen / hidden tab);
  each city marker is three stacked dots plus a projected glow. One turn ≈ 84s, drag with inertia, starts on Europe.
- Dish: procedural Margherita (matches the hero's phone menu) on a dark plate; `DISH_GLB_URL` in
  `src/components/three/dish/DishScene.jsx` swaps in a real model; AR via `<model-viewer>` left as a TODO there.
  Exploded view: lift 1.25s, hold 1.1s, settle 1.15s, once per entry.
- Mobile: instead of a static globe image, whichever card is more in view is live and the other shows a snapshot of
  its last frame (or a CSS/SVG stand-in before its first render). Never more than one live context.
- Header is left-aligned (Testimonials before it is centred). `cobe` added to `optimizeDeps.include`.

### 7.12 Feedback
- Files: `src/sections/Feedback.jsx` (`id="feedback"`), `src/components/feedback/*`, fx `StatefulButton`.
- All five fields share one outlined frame with the label sitting in a notch in the border (Rating and Yes/No too,
  so they look alike). Text fields use the designed focus state (violet border, soft ring, scan line) instead of
  the global outline; stars, Yes/No and buttons keep the standard ring. Borders use `mv-muted` at 50% so input
  edges stay visible on glass.
- Stars and Yes/No are radiogroups (roving tabindex, arrows/Home/End), 44px targets. Validation on submit, then on
  blur; errors shake ±6px (not under reduced motion) and live in `aria-live` regions; focus moves to the first
  invalid field. Honeypot `website` field: success shown, nothing saved.
- The loading state lasts at least 700ms so idle → loading → success reads as three steps. Confetti reuses
  `src/components/referral/confetti.js`. One submission per session (`mv-feedback-sent`).
- Touch: the card has no backdrop blur (4.6 limits blur; a tall card scrolling over the background is costly).

### 7.14 Newsletter
- `subscribeNewsletter` backend function (public, service role): one row per lower-cased email, language, source
  "homepage", consent time; a repeat address returns "duplicate" (friendly message, nothing saved). Mock twin in
  `src/api/mockBase44.js`. Honeypot field: bots get the success message and nothing is saved.
- Vanish input: the placeholder changes every 3.5s (the three-address cycle is 10.5s, so nothing loops faster than
  6s) and pauses while the field is focused or filled. On submit the typed text breaks into particles (2D canvas)
  while the request runs; on an error the text comes back. Reduced motion: no particles.
- Dot Grid is a 2D canvas (no WebGL) that only animates while something moves; desktop + fine pointer only.
  Touch: a static CSS dot pattern. Vignette and dots fade out at the section's top and bottom edges.

### 7.15 Final CTA
- Light Pillar: one OGL context (desktop, near the viewport, paused off screen, context released on unmount). At the
  finale the page has background + pillar = 2 contexts. Touch / reduced motion: static radial glow.
- Headline splits by characters, then reverts to plain text when the letters land. The CTA is a real `#pricing`
  link (80px tall, the site's largest button), magnetic, with Click Spark.
- The QR that returns under the button is the site's own code (`SITE_QR_21`, "menuverse.eu"), scrubbed from
  scattered to assembled between the section entering and its top reaching the top of the screen.
- Gotcha: a child's `useGSAP` runs before its parent's ref is attached, so passing a parent ref as a ScrollTrigger
  trigger silently falls back. QrReturn looks up its enclosing section itself.
- `window.__gsap` ({ gsap, ScrollTrigger }) exists in development only, for debugging and QA scripts.
- `final.body` ("…χιλιάδες επιχειρήσεις…") is kept verbatim and still needs confirming (Content Pack N7).

### 7.13 Articles
- Files: `src/sections/Articles.jsx` (`id="articles"`), `src/components/articles/*`, fx `GradualBlur`, `FocusCards`,
  `MorphingDialog` (Radix Dialog underneath for focus trap / scroll lock / aria-hidden; framer-motion `layoutId`
  for the morph; overlay at z-80, above navbar and chat).
- Each card title is a real `#article-{slug}` link stretched over the card (modifier-clicks open the deep link).
  Opening pushes the hash (Back closes the reader); prev/next replace it; closing goes back or strips the hash
  without moving the page. Deep links wait for fonts, refresh ScrollTrigger, bring the card into view, then open.
- Rail: Draggable + Inertia with snap; horizontal trackpad / shift-wheel move it, plain vertical wheel stays with
  Lenis; a drag never opens a card. The track sets `transition-property: none` (the reduced-motion global
  transition rule otherwise delayed rail moves).
- Reader: focus goes to the reading body (arrows/space scroll at once); prev/next don't wrap; after prev/next,
  closing morphs back into the card that opened the reader so the page never jumps on phones.
- Mobile/touch/<1024: stacked cards (1 col, 2 from 640px), full-screen reader.
- WebGL cleanups only call `loseContext()` when the context isn't already lost (avoids a console warning).

### Fixes after Phase 8 review (20 Nov 2026)
- How it works, step 4: the phone is the hero's DomPhone rendered at its natural 320px and scaled to 150px (its
  radii and bezels are in px, so a small render looked pill-shaped). Table tents redesigned: matte card with a
  violet header band and the Menuverse mark, the menuverse.eu code with rounded modules and rounded finder eyes on
  a white tile, table number on a pill; the code is revealed by a scan bar sweeping down (clip wipe) instead of
  tracing row outlines, which looked scratchy mid-animation.
- Showcase: the phone previews https://menuverse-demo.base44.app (`preview` in `src/content/showcase.js`, framing
  allowed, checked 20 Nov 2026); "Δείτε το Μενού" still opens Athens Anima Bistro.
- Feedback: Rating and Yes/No labels sit above their controls (the label notched into the border looked odd next
  to a control with its own outline). Stars get one outlined box matching the text fields; the Yes/No segmented
  control is itself the box (no frame around it).
- Performance (measured on an M4 GPU, full-page scroll): from 38ms/frame cold (p95 167ms) and 21ms warm (p95 50ms)
  to 16.7ms both (p95 16.7ms, a steady 60fps). Nothing visual changed:
  - Background brightness is now the background layer's own opacity with a CSS transition. It used to tween a
    custom property on <html>, which forced a full-page style recalculation on every frame (195 per pass, ~21ms
    each).
  - three.js `checkShaderErrors` is off (hero and dish): it read program logs right after linking and stalled the
    first frames of each scene for ~2s in total. Re-enable in dev with `?glcheck`.
  - Final CTA QR is drawn on one 2D canvas instead of moving 236 SVG rects every frame.
  - The Testimonials circular text pauses its spin off screen.
  - Colour observers (Dot Grid, Light Pillar, QR) react only to dark/light switches, not to Lenis's per-scroll
    classes on <html>.

### First-visit experience chooser (20 Nov 2026, Nikolas's request)
- On the first visit, shortly after the intro, a dialog asks for the Full or Light experience: two cards with a
  preview (a live tilted QR cluster vs. the same motif flat and still), a one-line summary, three points, a
  "device load" meter (4/5 vs 1/5) and a choose button. Copy in all 8 languages (`experience.*`).
- Light = the existing reduced-motion mode (same switch as the footer toggle): no 3D/WebGL loops, no pinning or
  scroll-driven motion, soft fades. The note under the cards points to the footer toggle for changing it later.
- "Recommended" goes to Light on devices with data saver, ≤4 GB memory or ≤4 CPU cores, else to Full; the
  recommended card gets focus. Escape / outside click keeps Full and is not asked again
  (`localStorage.menuverse-experience` = full | light | dismissed).
- Not shown when the OS already asks for reduced motion (that setting wins anyway). Lazy chunk, loaded only when it
  will be shown. The language tip waits until the chooser is closed so two prompts never stack.

### Hero fixes (20 Nov 2026, Nikolas's review)
- Light theme artefacts in the 3D hero: the canvas is transparent over the page, so effects tuned for the dark theme
  showed as dirt on the light one. In light mode the volumetric spotlight cone (dark diagonal bands), the vignette
  (dark corners) and the film grain (specks) are off; bloom stays. The QR monolith is on render layer 1, which the
  contact-shadow camera doesn't see, so only the phone casts the ground shadow (the floating modules cast dash-like
  shadows before).
- QR vs headline: the monolith is now placed in screen space (`monolithBox` in `src/components/hero/layout.js`): in
  the band between the navbar and the top of the headline (the hero measures `#hero-title` with offsetTop and passes
  it through the driver), sized to fit (≤42% of the height) and tucked behind the phone's left edge. The phone sits
  at 72% of the width on ≤1100px wide windows, easing to 69% at ≥1600px (`phoneScreenX`, also used by the DOM
  placeholder). Headline is a touch smaller below 1280px wide (4.6vw instead of 5.1vw). Checked at 1100, 1280,
  1440, 1536×760 and 1920 wide, light and dark.

### Coming soon: beverage partnerships (20 Nov 2026, Nikolas's request)
- A third, wide card under the Guide and 3D-dish cards, labelled "Σε σχεδιασμό" (in planning): partnerships with
  breweries, spirits and soft-drink companies (types only, no names) would make the digital menu free for
  restaurants, in exchange for discreet drink features inside the menu. Worded strictly as a plan ("Σχεδιάζουμε"),
  so it claims no existing partner. Copy in all 8 languages under `guide.c`.
- Kept as its own card rather than a third "way" so the section title ("Δύο νέοι τρόποι…", the two diner features)
  stays accurate. Visual is CSS/SVG only (partner-category tokens linked to a menu with a "Partner feature" drink
  row and a "€0 / Free" seal); the section's WebGL budget is already used by the globe and dish. Ambient loops are
  6–7.2s and stop under reduced motion. The mock menu is always dark, so its accent colours are fixed hex values.

## Phase 9 (20 Nov 2026)

### SEO (3.12, Content Pack G)
- `index.html`: Greek title/description/canonical (static, so crawlers see them), robots, Open Graph + Twitter card
  with `public/og-image.jpg` (1200×630, a still of the dark hero rendered from the site), og:locale + alternates for
  the 8 languages. Title, description, og/twitter title+description and og:locale follow the active language at
  runtime (`src/lib/i18n.jsx`). One URL serves all languages (language is a client setting), so no hreflang.
- JSON-LD: Organization (built from G; logo `public/logo-512.png`, rendered from the placeholder favicon until the
  real logo arrives), SoftwareApplication (verbatim), FAQPage with only the two questions that make no superlative
  claim. "Η κορυφαία ελληνική πλατφόρμα" / "the leading platform" (Content Pack N7) stay out until Nikolas
  confirms them; they are in the Content Pack ready to add. Note: Google only shows FAQ rich results for a few
  authoritative sites and expects the Q&A to be visible on the page.
- `public/robots.txt` (disallows /admin, /referrals, /login) and `public/sitemap.xml` (home + 3 legal pages).
- `useNoIndex()` (`src/hooks/useNoIndex.js`) sets robots to noindex while mounted: 404, /referrals, /login, /admin
  (an SPA answers unknown URLs with 200, so the 404 page must say noindex itself).
- New strings for /login and /admin (8 languages) under `login.*` and `admin.*`. Dev mock supports email login,
  register + OTP (`123456`), "taken@example.com" (409), "wrong-password" (401), password reset and provider login.

### 8.1 /login
- Files: `src/pages/Login.jsx`, `src/components/login/*`. Custom page on the Base44 SDK: email/password, Google,
  Microsoft, register → 6-digit email code, forgot password (always "sent", never reveals whether an account
  exists). Left panel (≥1024) stays dark violet in both themes, like the phone; Google/Microsoft marks in brand
  colours. Fields reuse FieldShell (no asterisks: every field is required). The code field is one real input over six
  drawn boxes (paste, autofill and screen readers see one field).
- Redirects (plan > chat > path > home): `?redirect=chat`, `?redirect=referrals`, same-site relative paths only
  (absolute URLs, `//host`, backslashes, other schemes and /login are rejected), plan params → `/#pricing` + chat
  prefilled. Provider sign-in returns to /login with the same query. Signed-in visitors see "Συνέχεια", no bounce.
- Not done: the pricing billing toggle doesn't switch to yearly after a yearly plan sign-in (the chat message is right).
  A password-reset *landing* page isn't built: Base44's reset email link goes to Base44's own reset screen.

### 8.4 /admin
- Files: `src/pages/Admin.jsx`, `src/components/admin/*`, `src/api/admin.js`. Tabs in the URL hash; Inbox (two panes
  from 768px, realtime with polling fallback, mark-read only while visible), Feedback (sortable, aria-sort), Newsletter
  (search, CSV), Referrals (per-friend purchased checkbox, reward select, optimistic save with rollback).
- CSV: UTF-8 BOM, CRLF, ";" separator (Greek-locale Excel), formula-looking cells prefixed with an apostrophe; exports
  the rows on screen (search applies). Lists load 500 rows per page, up to 5,000 per entity.
- The customer chat widget is hidden on /admin. Not verified on real Base44: whether subscriptions deliver every
  conversation to an admin (polling fallback covers it).
