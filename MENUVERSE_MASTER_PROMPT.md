# MENUVERSE: MASTER REBUILD PROMPT

Version 1.0 (19 Nov 2026). Two files work together:

- **MENUVERSE_MASTER_PROMPT.md** (this file): how to build it, section by section.
- **MENUVERSE_CONTENT_PACK.md**: every word of existing copy (Greek + English), the 6 articles, the legal pages, links, prices.

---

## HOW TO USE THIS (for Nikolas, not part of the prompt)

1. Create a **new** Base44 app (for example "Menuverse 2"). Keep the current app live as a backup and reference until the new one is approved, then move menuverse.eu to it.
2. Upload your assets to the new app before Phase 1: logo (SVG and PNG), favicon, the Athens Anima Bistro photo. Optional: a GLB file of a real dish for the 3D section.
3. Open **AI Controls** in the new app and paste the **GLOBAL RULES** block below. Base44 applies them to every prompt.
4. Send the phases in the **PHASE PACK** (bottom of this file) one message at a time, in order. Each phase says which parts of this file and the content pack to paste with it. Review the preview after each phase before sending the next.
5. Anything marked **[CONFIRM]** is behaviour I could not see from the public site (it happens behind login or in code). Edit those lines if your old app did it differently.
6. Using Claude Code instead of Base44: put both .md files in the repo root and say: *"Build the site specified in MENUVERSE_MASTER_PROMPT.md with all copy from MENUVERSE_CONTENT_PACK.md. Work through the PHASE PACK in order and stop for review after each phase."* Replace Base44 entities and functions with your own backend.

---

## GLOBAL RULES (paste into Base44 AI Controls)

```
MENUVERSE REBUILD: GLOBAL RULES (apply to every change)

1. We are rebuilding the Menuverse marketing site from scratch as an ultra-premium, dark-first, black and purple gradient experience with 3D, GSAP and Lenis. Every section, feature and string of the old site must exist in the new one. Copy comes from the Content Pack verbatim. Never invent stats, logos, reviews, client names or claims.
2. All UI strings live in the i18n dictionaries (el, en, de, fr, es, it, pt, nl). Greek is the default. Any new microcopy (aria-labels, cursor labels, decorative text) must be added to all 8 languages.
3. Fonts must support Greek: Commissioner Variable (display), Noto Serif Display Italic (accent), Inter Variable (body/UI), JetBrains Mono Variable (labels). Never use Plus Jakarta Sans, Space Grotesk, Sora, Geist, Unbounded, Instrument Serif, Playfair Display, Fraunces or Bricolage Grotesque: they have no Greek glyphs.
4. Animation stack: GSAP 3.15+ (ScrollTrigger, SplitText, Flip, DrawSVG, MorphSVG, ScrambleText, CustomEase, Draggable, Inertia, MotionPath) through @gsap/react useGSAP; Lenis (lenis/react) driven by gsap.ticker; three + @react-three/fiber + drei + postprocessing matched to the project's React major (React 18: fiber 8, drei 9, postprocessing 2. React 19: fiber 9, drei 10, postprocessing 3); Motion (framer-motion) only for component-level state and hover transitions.
5. GSAP owns scroll and timelines. Motion owns hover and state. Never animate the same property of the same element with both. Every GSAP call lives inside useGSAP with a scope ref so it cleans up.
6. prefers-reduced-motion: no Lenis, no pinning, no WebGL render loops, no parallax. Use short opacity fades. Every effect needs this fallback.
7. WebGL budget: at most 3 live WebGL contexts at any scroll position on desktop, 1 on mobile. Canvases mount only near the viewport and unmount when far away.
8. Recreate third-party components (React Bits, Aceternity UI, Magic UI, Motion Primitives) as JavaScript + Tailwind files in src/components/fx/, re-themed to our tokens. Never leave their default colors.
9. Dark theme "Nocturne" is the default. Light theme "Porcelain" must keep working through the navbar toggle.
10. Mobile is a first-class design, not a shrunk desktop. Touch devices get lighter versions of every heavy effect (specified per section).
11. Work one phase at a time. At the end of each phase, list what you built, what is still a placeholder, and anything you could not do.
```

---

## THE MASTER PROMPT

### 0. Role and mission

You are a senior creative developer and art director who ships Awwwards Site of the Day work. Build the Menuverse marketing website **from scratch** as a premium, dark, black and purple gradient experience: real-time 3D (three.js / React Three Fiber), cinematic GSAP scroll choreography, Lenis smooth scrolling, and a curated set of niche components from React Bits, Aceternity UI, Magic UI and Motion Primitives.

Quality bar: the precision of linear.app and vercel.com, the 3D craft of igloo.inc and lusion.co, the calm editorial confidence of a Michelin guide. It must feel expensive, intentional and fast. Every animation must explain the product (scan, menu appears, updates in real time, works in every language), not decorate it.

Platform: Base44 (React + Vite + Tailwind + shadcn/ui, Base44 entities, auth and backend functions). Read package.json first to confirm the React and Tailwind major versions and adapt every snippet in this file to them.

### 1. Product context

- **Menuverse** is a QR-code digital menu SaaS for restaurants, cafes and bars in Greece, expanding globally. A Melta Labs studio product. Live domain: https://menuverse.eu
- The team also builds each restaurant's menu site for them (step 2 of "How it works").
- Audience: restaurant owners and managers. Often on a phone, often busy, often not technical. The site must feel premium yet be instantly obvious.
- Primary conversion: start free (first month €0). Secondary: talk to the team in the live chat.
- Upcoming products teased on the site: the Menuverse Guide (a curated, Michelin-style network of restaurants worth travelling for, with an emblem) and 3D dish viewing before ordering.

### 2. Non-negotiables

1. Every section listed in section 7 exists, in that order, with its copy from the Content Pack.
2. Every feature in section 3 works end to end (forms save, chat works, prices convert, languages switch).
3. Black and purple gradient, dark-first, premium. Light theme is secondary but complete.
4. Greek typography renders with real Greek glyphs in every weight (no fallback fonts).
5. Performance and accessibility budgets in sections 10 and 11 are met.
6. No fake social proof. The site has one real testimonial and one real showcase client: present them beautifully and let the data structures accept more later.

---

### 3. Functional spec (rebuild all of this)

#### 3.1 Routes and anchors

| Route | Purpose |
|---|---|
| `/` | Homepage (all sections in section 7) |
| `/login` | Sign in / sign up (section 8.1) |
| `/privacypolicy` | Privacy Policy (Content Pack, section L1) |
| `/termsofservice` | Terms of Service (Content Pack, section L2) |
| `/referrals` | Signed-in referral dashboard, opened by the "Πίνακας / Dashboard" button (section 8.3) |
| `/admin` | Admin-only: chat inbox, feedback, newsletter, referrals (section 8.4) |
| `*` | Styled 404 |

Homepage anchors: `#features`, `#how-it-works`, `#demo-section`, `#pricing`, `#testimonials`, `#guide`. Nav links scroll smoothly to them through Lenis with an offset for the floating navbar.

#### 3.2 Internationalization

- 8 languages, in this menu order: 🇬🇧 English, 🇬🇷 Ελληνικά, 🇩🇪 Deutsch, 🇫🇷 Français, 🇪🇸 Español, 🇮🇹 Italiano, 🇵🇹 Português, 🇳🇱 Nederlands. Codes: en, el, de, fr, es, it, pt, nl.
- Dictionaries: `src/i18n/{code}.json`, one key tree shared by all languages. Greek and English come verbatim from the Content Pack. Translate de, fr, es, it, pt (European Portuguese), nl from English using Greek as the meaning reference. Keep brand and product terms untranslated (Menuverse, QR, White Label, White Labelling, Starter, Professional, Devoted, Enterprise).
- Language choice persists in localStorage `menuverse-lang`. First visit: stored value, else a match on `navigator.language`, else `el`.
- On change, set `<html lang>` to the active code (the old site stayed on `el-GR` in every language, which breaks Greek uppercase and screen readers). Also update `document.title` and the meta description.
- First visit only: a small glass popover points at the 🌐 language switcher ("Change Language" / "Select your language from the 🌐 dropdown here." / "OK"), translated into all 8 languages. Dismissal stored in localStorage `menuverse-lang-tip`.
- Greek uppercase: use CSS `text-transform: uppercase` only on elements inside the correct `lang`, so browsers drop the tonos correctly (ΜΕΝΟΥ, not ΜΕΝΟΎ).
- Numbers and money: `Intl.NumberFormat` with the active locale (el-GR, en-GB, de-DE, fr-FR, es-ES, it-IT, pt-PT, nl-NL).
- The 6 articles exist in EL and EN in the Content Pack; translate them for the other 6 languages. Legal pages are English-only today: render the English text for every language.

#### 3.3 Theme

- Dark "Nocturne" is the default for everyone. Light "Porcelain" via the navbar toggle.
- Persist in localStorage `menuverse-theme` (`dark` | `light`). Apply the `dark` class on `<html>` (shadcn convention) before first paint (inline script in index.html) to avoid a flash.
- WebGL scenes read the theme and swap their color uniforms, never re-mount.

#### 3.4 Auth

- Base44 built-in auth with Google, Microsoft and email/password, presented through the custom `/login` page (section 8.1). If the platform only allows its hosted login screen, keep `/login` as a styled hand-off page that sends people into the platform login and returns them to `redirect`.
- Support `?redirect=` (for example `?redirect=chat` reopens the chat after sign-in) and the pricing parameters in 3.5.

#### 3.5 Pricing and currency logic

- Base prices in EUR per month: Starter 12, Professional 18, Devoted 30. Enterprise is custom ("Προσφορά κατόπιν συνεννόησης").
- First month free on the three paid tiers: show **€0** large, the regular price struck through next to it, and the line "Για τον πρώτο μήνα, μετά €12/μήνα" (price inserted per plan and currency).
- Billing toggle: Μηνιαία / Ετήσια. Yearly badge: "Εξοικονόμηση 20% + δωρεάν domain". **[CONFIRM]** Yearly shows the monthly equivalent at 20% off (12 → 9.60, 18 → 14.40, 30 → 24.00) inside the same "then X/month" line, plus a small muted line with the yearly total.
- Currency selector with flags, 12 currencies: 🇪🇺 EUR €, 🇺🇸 USD $, 🇬🇧 GBP £, 🇨🇭 CHF Fr, 🇨🇦 CAD C$, 🇦🇺 AUD A$, 🇯🇵 JPY ¥, 🇩🇰 DKK kr, 🇸🇪 SEK kr, 🇳🇴 NOK kr, 🇵🇱 PLN zł, 🇧🇷 BRL R$. Persist in localStorage `menuverse-currency`, default EUR.
- Exchange rates: backend function `getExchangeRates` fetches `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP,CHF,CAD,AUD,JPY,DKK,SEK,NOK,PLN,BRL` (free ECB rates, no key), caches the result for 12 hours in the `ExchangeRateCache` entity, and falls back to a hardcoded table if the call fails. Round to 2 decimals (JPY to 0). Format with Intl currency formatting in the active locale.
- **[CONFIRM]** Plan CTAs ("Ξεκινήστε"): signed out goes to `/login?plan={starter|professional|devoted}&billing={monthly|yearly}&currency={code}`; signed in opens the support chat with a prefilled first message naming the plan, billing period and currency. Enterprise "Επικοινωνήστε" opens the chat prefilled with "Enterprise", with `mailto:menuverse.gr@gmail.com` as the fallback.

#### 3.6 Live support chat

- Opened by the section button "Ξεκινήστε μια Συνομιλία" and by the floating chat widget (bottom right on every public page).
- Panel: right-side sheet on desktop (420px), full-screen sheet on mobile.
- Signed out: the panel shows the line "* Απαιτείται σύνδεση για να ξεκινήσετε" and a sign-in button to `/login?redirect=chat`.
- Signed in: one `SupportConversation` per user, `SupportMessage` records, realtime updates through Base44 subscriptions (5-second polling fallback). Unread badge on the widget. Admin replies from `/admin`.
- Widget greeting bubble ("👋 Γεια! Χρειάζεστε βοήθεια με ψηφιακό μενού ή QR; Είμαι εδώ!") appears 4 seconds after load, once per session, dismissible.
- Footer, Privacy and Terms "Open Message System" links open the same panel.

#### 3.7 Feedback form

Fields, all required: Name (text), Rating (1 to 5 stars), "Have you purchased a menu?" (Yes/No), "What would you change?" (textarea), "What feature would you love to see?" (textarea). Inline validation in the active language, honeypot field, one submission per session. Saves a `Feedback` record with the language. Success state described in 7.12.

#### 3.8 Newsletter

Email field with validation, honeypot, saves a `NewsletterSubscriber` (unique email, language, source "homepage", consent timestamp). Duplicate email shows a friendly "already subscribed" message. Privacy line under the field.

#### 3.9 Articles

- Data file `src/content/articles.js`: 6 articles, each with `slug`, `category`, `title`, `excerpt`, `readTime`, and `body` as structured blocks (intro paragraph, then `h3` + paragraph pairs), per language.
- Clicking "Διάβασε άρθρο" opens the article reader (section 7.13). The URL hash becomes `#article-{slug}` so articles are shareable; loading a URL with that hash opens it.
- Each article ends with "Ξεκίνα δωρεάν στη Menuverse", which closes the reader and scrolls to `#pricing`.

#### 3.10 Referral program

- **Μάθετε Περισσότερα / Learn More**: modal with the 4 steps and the rule (refer 3 friends, they get 50% off, you get a free menu).
- **Ξεκινήστε / Start**: signed out goes to `/login?redirect=referrals`. Signed in creates (or loads) the user's `Referral` with a unique 8-character code and shows the link `https://menuverse.eu/?ref={code}` with copy and share buttons (WhatsApp, Messenger, native share sheet).
- **Πίνακας / Dashboard**: `/referrals` (section 8.3).
- Visiting with `?ref=` stores the code in localStorage and attaches it to the user's first sign-in.
- **[CONFIRM]** The 50% discount and the free menu are applied by the team, so the admin Referrals tab flags rewards as pending, earned or redeemed.

#### 3.11 Showcase, testimonials, demo

- Showcase: data array (today 1 item: Athens Anima Bistro, `https://animabistro.base44.app`, uploaded photo). Carousel arrows and dots render only when there is more than one item.
- Testimonials: data array (today 1 item from Athens Anima Bistro, "Εστιατόριο, Αθήνα"). Dots render only when there is more than one item.
- Demo video: YouTube ID `XoTqAIHZuts`, loaded through a click-to-play facade on `youtube-nocookie.com` (privacy and speed).

#### 3.12 SEO

- One `<h1>` (the hero). Section titles are `<h2>`, cards `<h3>`.
- Per-language title and description (Content Pack, section G). Canonical `https://menuverse.eu/`. Open Graph and Twitter image (1200x630, a still of the hero on black).
- JSON-LD in index.html: Organization, SoftwareApplication and FAQPage (Content Pack, section G).
- sitemap.xml and robots.txt if the platform allows custom static files.
- Every canvas is `aria-hidden="true"` and every piece of meaning it carries also exists as real text.

#### 3.13 Data model (Base44 entities)

| Entity | Fields |
|---|---|
| `Feedback` | name, rating (1-5), purchased_menu (bool), change_request (text), feature_request (text), language |
| `NewsletterSubscriber` | email (unique), language, source, consent_at |
| `SupportConversation` | user_email, user_name, status (open/closed), last_message_at, unread_by_admin (bool), unread_by_user (bool) |
| `SupportMessage` | conversation_id, sender_role (user/admin), body, created_date |
| `Referral` | referrer_email, code (unique), clicks, signups (list of emails), reward_status (pending/earned/redeemed) |
| `ExchangeRateCache` | base, rates (object), fetched_at |
| `Showcase` (optional, or a static array) | name, url, image, order |
| `Testimonial` (optional, or a static array) | quote (per language), author, role (per language), initial, order |

Permissions: public create for Feedback and NewsletterSubscriber, owner-only read/write for the user's own conversation, messages and referral, admin-only for everything else.

---

### 4. Creative direction: "Nocturne"

#### 4.1 Concept

A Michelin-starred dining room after the last seating. Lights low, a violet neon glow on black stone, polished glass, one perfect plate under a spotlight. Menuverse is the light that makes the menu appear. Three recurring motifs carry the whole site:

1. **The QR module** (the small square): preloader, hero monolith, dividers, step markers.
2. **The scan** (a thin violet laser line sweeping across something): reveals, transitions, hover states.
3. **The glow** (violet light bleeding from behind objects): depth, hierarchy, focus.

Restraint is the luxury. Black dominates (about 80% of every screen), violet is light (never flat fills on big areas), white is type.

#### 4.2 Color tokens

Dark "Nocturne" (default):

| Token | Hex | Use |
|---|---|---|
| `--mv-void` | `#050507` | page background |
| `--mv-ink` | `#0A0A10` | alternating section background |
| `--mv-surface` | `#101018` | cards |
| `--mv-surface-2` | `#16161F` | raised cards, inputs |
| `--mv-line` | `rgba(255,255,255,0.08)` | hairlines and borders |
| `--mv-line-strong` | `rgba(255,255,255,0.14)` | hover borders |
| `--mv-text` | `#F5F3FF` | primary text |
| `--mv-muted` | `#A1A1B5` | secondary text (8:1 contrast on void) |
| `--mv-violet-200` | `#DDD6FE` | highlights |
| `--mv-violet-300` | `#C4B5FD` | gradient top, links |
| `--mv-violet-400` | `#A78BFA` | icons, small accents |
| `--mv-violet-500` | `#8B5CF6` | primary brand |
| `--mv-violet-600` | `#7C3AED` | buttons, beams |
| `--mv-plum-800` | `#2E1065` | deep gradient stops |
| `--mv-orchid` | `#E879F9` | rare spark accent (confetti, one gradient stop) |
| `--mv-champagne` | `#E9D8A6` | Guide emblem only |
| `--mv-success` | `#34D399` | form success |
| `--mv-danger` | `#F87171` | errors |

Light "Porcelain": void `#FAFAF9`, ink `#F4F3F8`, surface `#FFFFFF`, surface-2 `#F1EEFA`, line `rgba(11,11,18,0.08)`, text `#0B0B12`, muted `#55556A`, primary `#7C3AED`. Gradients become pale lilac light on porcelain.

Map these to the shadcn HSL variables so every shadcn component inherits them:

```css
:root { /* Porcelain */
  --background: 60 9% 98%; --foreground: 240 24% 6%;
  --card: 0 0% 100%; --card-foreground: 240 24% 6%;
  --primary: 262 83% 58%; --primary-foreground: 0 0% 100%;
  --muted: 252 30% 95%; --muted-foreground: 240 10% 37%;
  --border: 240 20% 90%; --ring: 262 83% 58%; --radius: 1.25rem;
}
.dark { /* Nocturne */
  --background: 240 17% 2%; --foreground: 250 100% 98%;
  --card: 240 20% 8%; --card-foreground: 250 100% 98%;
  --primary: 258 90% 66%; --primary-foreground: 0 0% 100%;
  --muted: 240 17% 10%; --muted-foreground: 240 12% 67%;
  --border: 240 9% 11%; --ring: 258 90% 66%;
}
```

#### 4.3 Gradients and light

- **Text gradient** (key words only): `linear-gradient(180deg, #F5F3FF 0%, #C4B5FD 55%, #8B5CF6 100%)` with `background-clip: text`.
- **Aurora** (behind section titles): `radial-gradient(60% 50% at 50% 0%, rgba(124,58,237,0.35), transparent 70%)`.
- **Edge glow** (cards on hover): 1px border lit by a conic gradient that follows the cursor (Aceternity Glowing Effect).
- **Button**: background `linear-gradient(180deg, #8B5CF6, #6D28D9)`, inset top highlight `inset 0 1px 0 rgba(255,255,255,0.25)`, outer glow `0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px -8px rgba(139,92,246,0.6)`.
- Never put large flat purple rectangles on the page. Purple is always light: glows, beams, gradients, edges.

#### 4.4 Typography

All four families are verified to include Greek glyphs (checked against the Fontsource packages):

| Role | Family | Package | Settings |
|---|---|---|---|
| Display (H1, H2, numerals) | Commissioner Variable | `@fontsource-variable/commissioner` | 600 to 800, tracking -0.035em to -0.045em, line-height 0.95 to 1.05 |
| Editorial accent (1 to 3 words per headline) | Noto Serif Display Italic | `@fontsource/noto-serif-display` (400-italic, 500-italic) | italic 500, tracking -0.02em |
| Body and UI | Inter Variable | `@fontsource-variable/inter` | 400 to 600, 16 to 18px body, line-height 1.6 |
| Labels, eyebrows, prices meta, step numbers | JetBrains Mono Variable | `@fontsource-variable/jetbrains-mono` | 500, 11 to 13px, uppercase, tracking 0.12em |

The old site used Plus Jakarta Sans for headings, which has no Greek, so Greek headlines silently fell back to another font. Fix that everywhere.

Fluid scale (Greek words are long, so keep max sizes in check and use `text-wrap: balance` on headings):

- H1: `clamp(2.6rem, 6.6vw, 6.75rem)`
- H2: `clamp(2.1rem, 4.6vw, 4.25rem)`
- H3: `clamp(1.25rem, 1.6vw, 1.5rem)`
- Lead: `clamp(1.05rem, 1.3vw, 1.25rem)`, max width 58ch
- Body: 16px mobile, 17px desktop, max width 68ch for reading

Headline pattern: Commissioner for the sentence, Noto Serif Display Italic with the text gradient for the emotional words (for example "Μοντέρνα Ψηφιακή Εμπειρία", "Είμαστε Εδώ!", "ΔΩΡΕΑΝ!").

Tailwind (v3 `tailwind.config.js`; if the project is on v4, put the same values in `@theme`):

```js
fontFamily: {
  display: ['"Commissioner Variable"', 'system-ui', 'sans-serif'],
  serif: ['"Noto Serif Display"', 'Georgia', 'serif'],
  sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
},
```

Preload the Commissioner Greek and Latin woff2 files used above the fold.

#### 4.5 Layout, spacing, radius

- 12-column grid, max content width 1280px, page gutters `clamp(20px, 4vw, 48px)`.
- Section vertical rhythm: `clamp(96px, 14vh, 180px)` top and bottom. One idea per screen.
- Radius: cards 28px, inner elements 16px, inputs 14px, pills fully rounded, phone frames 44px.
- Every section header follows the same structure: mono eyebrow pill, H2, lead paragraph, centered or left-aligned (alternate between sections for rhythm).

#### 4.6 Materials

- **Obsidian glass** (nav, popovers, chat, modals): background `rgba(16,16,24,0.6)`, `backdrop-filter: blur(20px) saturate(140%)`, 1px border `--mv-line`, top inner highlight `inset 0 1px 0 rgba(255,255,255,0.06)`. Limit backdrop blur to these surfaces (it is expensive on mobile).
- **Stone cards**: solid `--mv-surface`, hairline border, no blur, inner radial glow at the top edge on hover.
- **Grain**: one fixed full-screen noise overlay at 5% opacity (React Bits Noise, or an SVG feTurbulence data-URI), `pointer-events: none`, above backgrounds and below content.

#### 4.7 Imagery and 3D assets

- No stock photos. Visuals are UI, typography, light and 3D.
- The only photo is the Athens Anima Bistro showcase image (uploaded by the owner).
- 3D is procedural where possible (phone, QR monolith, plate, emblem) so nothing needs licensing. If the owner uploads a dish GLB, use it in 7.11. CC0 fallback source: Kenney Food Kit (kenney-assets.itch.io/food-kit, includes a pizza that comes apart into layers). Compress any GLB with Draco or Meshopt and keep it under 1.5 MB.
- Icons: lucide-react, stroke width 1.5, sized 18 to 22px.

#### 4.8 Motion language

Principles: one hero moment per section, never two competing. Motion explains the product. Entrances are quick and decisive, ambient loops are slow and quiet. Nothing loops faster than 6 seconds. Nothing moves while the user is reading body text.

Easing tokens (registered with CustomEase, section 5.3):

- `mv.out` = cubic-bezier(0.16, 1, 0.3, 1): every entrance
- `mv.inOut` = cubic-bezier(0.76, 0, 0.24, 1): transitions, wipes, camera moves
- `mv.spring` = slight overshoot: chips, badges, toggles

Durations: micro 0.2 to 0.35s, UI 0.5 to 0.7s, reveals 0.9 to 1.2s, hero 1.6 to 2.2s.

**Standard section header choreography** (build once as `<SectionHeader>`, reuse everywhere):

1. Eyebrow pill: ScrambleText from Greek glyphs into the real label (0.9s).
2. H2: SplitText with `mask: "lines"`, lines rise from `yPercent: 110` with a 3deg rotation to rest, stagger 0.09, `mv.out` 1.1s.
3. Lead paragraph: words un-blur (React Bits Blur Text technique), stagger 0.015.
4. Trigger at `top 82%`, play once.

---

### 5. Tech stack and foundation

#### 5.1 Packages (install through the Base44 AI chat and approve each)

```
gsap@^3.15            @gsap/react@^2.1         lenis@^1.3
three                 @react-three/fiber       @react-three/drei
@react-three/postprocessing   postprocessing   maath
ogl                   @number-flow/react       cobe
qrcode                qrcode.react             canvas-confetti
@paper-design/shaders-react   embla-carousel-react
@fontsource-variable/commissioner   @fontsource-variable/inter
@fontsource/noto-serif-display      @fontsource-variable/jetbrains-mono
framer-motion (or motion, whichever the project already has)
```

R3F versions must match React: React 18 uses `@react-three/fiber@8.18`, `@react-three/drei@9.122`, `@react-three/postprocessing@2.19`. React 19 uses fiber 9.x, drei 10.x, postprocessing 3.x. Mixing lines breaks the build.

All GSAP plugins (SplitText, DrawSVG, MorphSVG, ScrambleText, Inertia and the rest) ship free in the public `gsap` package. No tokens, no private registry.

#### 5.2 Folder structure

```
src/
  lib/gsap.js                 plugin registration + eases
  lib/i18n.js                 provider, useT(), language switching
  lib/currency.js             rates, convert(), format()
  providers/SmoothScroll.jsx  Lenis + ScrollTrigger sync
  providers/ThemeProvider.jsx
  hooks/useInViewMount.js  hooks/useReducedMotion.js  hooks/useIsTouch.js
  components/fx/              re-themed third-party effects
  components/three/           R3F scenes (HeroScene, DishScene)
  components/ui/              shadcn primitives
  components/layout/          Navbar, Footer, ChatWidget, Cursor, Preloader, Background
  sections/                   one file per homepage section
  content/                    articles.js, showcase.js, testimonials.js
  i18n/                       el.json en.json de.json fr.json es.json it.json pt.json nl.json
  pages/                      Home, Login, PrivacyPolicy, TermsOfService, Referrals, Admin, NotFound
```

#### 5.3 GSAP setup (`src/lib/gsap.js`)

```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, MorphSVGPlugin,
  ScrambleTextPlugin, CustomEase, Draggable, InertiaPlugin, MotionPathPlugin, useGSAP);

CustomEase.create("mv.out", "0.16,1,0.3,1");
CustomEase.create("mv.inOut", "0.76,0,0.24,1");
CustomEase.create("mv.spring", "M0,0 C0.25,1.35 0.5,1 1,1");
gsap.defaults({ ease: "mv.out", duration: 0.9 });
ScrollTrigger.config({ ignoreMobileResize: true });

export const GREEK_GLYPHS = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ0123456789";
export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
```

After fonts load (`document.fonts.ready`) and after images in pinned sections load, call `ScrollTrigger.refresh()`.

#### 5.4 Smooth scroll (`src/providers/SmoothScroll.jsx`)

```jsx
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

function ScrollTriggerSync() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduce) return;
    const update = (time) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reduce]);

  if (reduce) return children;
  return (
    <ReactLenis root ref={lenisRef} options={{
      autoRaf: false, lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true,
      anchors: { offset: -96 }, stopInertiaOnNavigate: true,
    }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
```

Rules: touch devices keep native scrolling (no `syncTouch`). When any modal, sheet or the chat opens, call `lenis.stop()` and `lenis.start()` on close. Put `data-lenis-prevent` on every internal scroll area (article reader body, chat messages, currency list, language list, admin tables).

#### 5.5 Hooks

```js
// useInViewMount: mount heavy things (WebGL) only near the viewport
export function useInViewMount(rootMargin = "75% 0px") {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setMounted(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, mounted];
}
```

Also `useReducedMotion()` (matchMedia listener) and `useIsTouch()` (`(hover: none), (pointer: coarse)`). Every heavy effect checks both.

#### 5.6 Third-party component rules

- Recreate each component from its public source (links in section 12) as a `.jsx` file in `src/components/fx/`, JavaScript + Tailwind variant.
- Re-theme: replace their colors with our tokens, their fonts with ours, their easing with `mv.*` where GSAP-driven.
- Adapt Tailwind v4 syntax in copied code to the project's Tailwind version and add any keyframes they need to the Tailwind config.
- Components that open their own WebGL context (React Bits backgrounds using ogl, cobe, Paper shaders) count against the WebGL budget in section 10.

---

### 6. Global experience layer

#### 6.1 Preloader: "Mise en place"

- Full-screen void. Center: a 21x21 grid of tiny squares (QR modules) appearing in random order until they form a QR code, then a violet laser line sweeps across it (the scan), the QR collapses into a single glowing dot, and the dot expands as a circular `clip-path` that reveals the hero.
- Bottom-left: counter `000` to `100` in JetBrains Mono. Bottom-right: "MENUVERSE" in mono.
- Total 1.6s maximum. Runs once per session (sessionStorage `mv-intro-seen`), never on reduced motion. The H1 is already in the DOM underneath so it can be the LCP element. Hand off directly into the hero entrance timeline.

#### 6.2 Living background

- One fixed layer behind the whole site: Paper Shaders `MeshGradient` with colors `["#050507", "#1E0B3D", "#5B21B6", "#0B0B12"]`, `distortion` 0.85, `swirl` 0.35, `grainOverlay` 0.12, `speed` 0.15. Light theme colors `["#FAFAF9", "#EDE9FE", "#C4B5FD", "#FFFFFF"]`.
- A radial vignette div on top keeps the edges near black.
- Intensity per section through a CSS variable driven by ScrollTrigger: bright at hero, pricing and final CTA; dim (opacity 0.35) behind reading sections (articles, feedback, legal pages).
- Mobile and reduced motion: `speed` 0 (static frame), or a CSS radial-gradient fallback if WebGL is unavailable.

#### 6.3 Cursor (desktop with fine pointer only)

- 8px dot plus a 36px ring, following with `gsap.quickTo` (dot 0.12s, ring 0.35s). Native cursor stays visible in inputs and textareas.
- States: links and buttons (ring scales 1.6 and fills violet at 15%), media ("Play" label inside an 84px ring), draggable areas ("Σύρε" with ← → arrows), text inputs (ring hides).
- Primary CTAs are magnetic (React Bits Magnet logic, strength 0.25, spring back) and fire React Bits Click Spark in violet on click.

#### 6.4 Navbar

- Behaviour: Aceternity Resizable Navbar. At the top it is full-width and transparent. After 80px of scroll it contracts into a floating centered obsidian-glass pill (max width 860px, 12px from the top) with a spring.
- Pill material: React Bits Glass Surface (refractive glass) on Chromium, obsidian glass fallback in Safari and Firefox.
- Left: Menuverse logo (uploaded SVG). Center: Χαρακτηριστικά, Πώς Λειτουργεί, Τιμοκατάλογος. Active section gets a sliding pill behind the label (Motion `layoutId`, like React Bits Pill Nav). Hover: label rolls up and is replaced by a duplicate from below (0.35s).
- Right: language switcher (🌐 + code, glass dropdown with flags, items stagger in), theme toggle (Magic UI Animated Theme Toggler: View Transitions circular reveal from the button, sun and moon icons morph with MorphSVG), "Σύνδεση" button (outline with a slow shimmer border, Magic UI Shine Border).
- Mobile: hamburger opens React Bits Staggered Menu, full screen, large Commissioner links, language and theme controls at the bottom, closes on link tap.
- First-visit language popover attaches here (3.2).

#### 6.5 Scroll progress

Magic UI Scroll Progress: a 2px hairline at the very top in the violet gradient, above the navbar.

#### 6.6 Chat widget and panel

- Floating button bottom-right (56px): obsidian glass circle, message icon, a slow orbiting light on its border (Paper Shaders `PulsingBorder` on desktop, CSS conic gradient on mobile), unread badge.
- Greeting bubble slides in from the right with a spring (3.6).
- Panel (sheet): header with the Menuverse avatar and an online pulse dot, messages list (`data-lenis-prevent`), composer with auto-grow textarea and a send button that morphs into a check on send. New messages spring in from below.

#### 6.7 Page transitions

Route changes: a violet-to-void curtain wipes up (0.45s, `mv.inOut`), the new page mounts, the curtain wipes out the top (0.45s). The scroll position resets to top. Reduced motion: a 150ms crossfade.

#### 6.8 Modals and toasts

- All modals (article reader, referral Learn More, chat on mobile) use obsidian glass, scale from 0.96 with fade, Escape and backdrop click to close, focus trapped (shadcn Dialog), Lenis stopped while open.
- Toasts: sonner restyled to obsidian glass, bottom-center on mobile, bottom-right on desktop.

---

### 7. Homepage sections (in this exact order)

Copy for every section is in the Content Pack, sections H1 to H17, matched by section name (for example 7.1 Hero uses Content Pack H2 Hero). After Phase 2 it lives in the i18n dictionaries, so always render strings through `t()`.

#### 7.1 Hero: "The Living Menu"

**Content:** eyebrow, H1 (two lines), subtitle, CTAs "Ξεκινήστε Δωρεάν" (scrolls to `#pricing`) and "Δείτε το Demo" (scrolls to `#demo-section` and pulses its play button), the La Bella Italia phone mockup, and two floating chips ("Scan QR / Instant Access", "Real-time / Live Updates", now translated).

**Layout (desktop):** min-height 100svh. Text block in columns 1 to 6, bottom-left weighted. The 3D stage spans columns 5 to 12 and bleeds off the right edge.

**Type:** H1 line 1 in Commissioner 700. Line 2 ("Μοντέρνα Ψηφιακή Εμπειρία") in Noto Serif Display Italic 500 with the text gradient and a light sheen sweeping across it every 7 seconds (React Bits Shiny Text technique).

**Entrance timeline** (starts as the preloader reveal finishes, about 1.8s total):

1. Eyebrow pill scrambles in from Greek glyphs.
2. H1 characters rise from a line mask with `rotateX(-80deg)` to 0, transform origin at the bottom, stagger 0.018, 1.2s `mv.out`.
3. Subtitle words un-blur.
4. CTAs rise 16px and scale from 0.96, stagger 0.08.
5. 3D stage: QR modules fly in and assemble, the phone rises and rotates into place, the chips pop in with `mv.spring`.

**3D stage** (React Three Fiber, desktop and capable tablets only):

- **Phone:** drei `RoundedBox` (about 1.5 x 3.1 x 0.16, radius 0.2, smoothness 8) in `meshPhysicalMaterial` (color `#14121C`, metalness 0.85, roughness 0.28, clearcoat 1). Thin side buttons and a dynamic-island pill in black.
- **Screen:** a real React component `<PhoneMenu />` rendered through drei `<Html transform>` on the screen face, so it stays crisp and interactive. It shows the La Bella Italia demo: status bar 9:41, 🍕 logo, "Authentic Italian Cuisine", tabs Starters / Pizza / Pasta / Desserts, items with emoji, "Traditional recipe" and prices. Switching tabs animates the list with GSAP Flip and prices with NumberFlow. Starters items come from the Content Pack. **[CONFIRM]** If your old mockup had items for the other tabs, use them; otherwise use: Pizza: Margherita €11.00, Diavola €13.00, Quattro Formaggi €13.50. Pasta: Carbonara €12.50, Cacio e Pepe €11.50, Pesto Genovese €12.00. Desserts: Tiramisù €7.00, Panna Cotta €6.50, Cannoli €6.00. The same `<PhoneMenu />` is reused by the mobile fallback and by section 7.7.
- **QR monolith:** behind and left of the phone, tilted about -15deg on Y. Build it from a real QR code: `QRCode.create("https://menuverse.eu", { errorCorrectionLevel: "M" }).modules` gives `size` and `data` (1 = dark). Render the dark modules as one `InstancedMesh` of small boxes in a dark glossy material with violet emissive edges. On load the instances lerp from random positions on a sphere to their grid positions (progress driven by GSAP, per-instance easing with maath). Near the cursor, modules push forward slightly in z, like a ripple.
- **The scan:** every 6 seconds a thin additive violet plane sweeps across the monolith; right after it passes, the phone screen brightens for 300ms (scan, then the menu lights up).
- **Lighting:** drei `Environment` built from `Lightformer`s (violet rect left, white strip right, lilac ring behind), no HDR download. A soft volumetric spotlight from the top-right inside the scene instead of a separate background effect. `ContactShadows` under the phone.
- **Post-processing:** `EffectComposer` with `Bloom` (mipmapBlur, luminanceThreshold 0.65, intensity 0.7), `Noise` (opacity 0.035), `Vignette`. Desktop only.
- **Pointer:** camera rig eases toward the pointer (max 4 degrees), the phone tilts toward it.
- **Chips:** the two glass chips are `Html` elements floating at different depths, orbiting slowly around the phone.
- **Canvas settings:** `dpr={[1, 1.75]}`, `gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}`, camera fov 32 at z 7, drei `PerformanceMonitor` lowers dpr to 1 when frame rate drops, `AdaptiveDpr`.

**Scroll choreography** (pin the hero, `end: "+=130%"`, `scrub: 0.8`):

- 0 to 0.25: text block drifts up and fades out.
- 0.1 to 0.6: camera dollies toward the phone (z 7 to 3.2), the phone rotates to face the camera, QR modules scatter outward and fade into glowing points.
- 0.6 to 1: the phone screen scales up until it fills the viewport, and its background crossfades into the Features section background: the visitor "dives into the menu". Then the pin releases.
- ScrollTrigger writes progress into a ref; `useFrame` reads it with damping. Never call setState per frame.

**Loading strategy:** the H1 and the DOM phone render first. The canvas mounts after first paint (idle callback), and the DOM phone crossfades to the 3D phone when drei `useProgress` reaches 100. The canvas unmounts once the user is more than one viewport past the hero.

**Mobile, touch and reduced motion fallback:** no canvas, no pin. The DOM `<PhoneMenu />` in a CSS phone frame (44px radius, hairline border, inner violet glow) with a gentle float, and the QR as an inline SVG that draws itself with DrawSVG. Same copy, same CTAs.

#### 7.2 Features (`#features`): "Όλα Όσα Χρειάζεστε"

**Content:** eyebrow "Δυνατότητες", H2, lead, 6 feature cards (titles and descriptions verbatim).

**Component:** React Bits **Magic Bento** (cursor-following edge light, spotlight, particle stars, magnetism, click ripple), re-themed with `glowColor` set to violet (139, 92, 246), spotlight radius about 320, a few particles per card. Six cards in its asymmetric bento layout. Each card has a mono label, the title (H3), the description, and a live micro-demo that runs only while the card is in view:

1. **QR Code Μενού:** a QR (qrcode.react, SVG) draws itself module by module, a scan line sweeps it, then a tiny phone silhouette with menu rows slides up beside it.
2. **Άμεσες Ενημερώσεις:** one menu row whose price changes every 3 seconds (€8.50 to €9.00 and back) with NumberFlow, a pulsing "live" dot, and a ripple that travels to three small phone outlines which update a beat later.
3. **Επαγγελματικά Σχέδια:** React Bits **Card Swap**, a 3D stack of 4 menu-template thumbnails (built in code: different type and color treatments of the same menu) cycling every 3.5 seconds.
4. **Πολύγλωσσο Μενού:** React Bits **Split Flap Text**, an airport departures board flipping one dish name through languages (Μουσακάς, Moussaka, Moussaká, Moussaka, Musaca...). The tourist metaphor is the point.
5. **Στατιστικά & Αναλυτικά:** a small area chart whose line draws with DrawSVG and whose fill rises from the baseline, plus Magic UI **Number Ticker** values counting up.
6. **Φίλτρα Διατροφής:** filter chips (Vegan, Χωρίς γλουτένη, Αλλεργιογόνα) that toggle on their own every few seconds while 5 dish rows reorder and fade with GSAP Flip.

Entrance: cards rise from depth (z -80 to 0, opacity 0 to 1) with stagger 0.08. A Magic UI **Border Beam** runs once around each card as it lands.

Mobile: 1 column, micro-demos simplified (no particles, no magnetism), each demo plays once when the card enters.

#### 7.3 Divider: the multilingual loop

React Bits **Curved Loop**: the word "menu" in all eight site languages running along a gentle arc and draggable:
`ΜΕΝΟΥ ✦ MENU ✦ SPEISEKARTE ✦ CARTE ✦ CARTA ✦ MENÙ ✦ EMENTA ✦ MENUKAART ✦`
Commissioner 800 with the text gradient, about 6rem on desktop. Decorative: `aria-hidden`, identical in every language (it is multilingual by design). Speed reacts to scroll velocity. Mobile: a straight marquee.

#### 7.4 Live support: "Έχετε Ερωτήσεις; Είμαστε Εδώ!"

**Content:** eyebrow "Ζωντανή Υποστήριξη", H2, paragraph, button "Ξεκινήστε μια Συνομιλία", note "* Απαιτείται σύνδεση για να ξεκινήσετε".

**Layout:** split. Left: header, paragraph, button (Magic UI **Interactive Hover Button**: on hover an arrow slides in and the fill sweeps across) and the note. Right: a chat window preview in obsidian glass, Menuverse avatar with an online pulse, and Magic UI **Animated List** bubbles appearing one by one (the greeting from 3.6, then a typing indicator, then a short reply). The preview bubbles are decorative example text and must be translated.

Clicking the button opens the real chat (3.6).

#### 7.5 How it works (`#how-it-works`): "Ξεκινήστε σε Λίγα Λεπτά"

**Content:** eyebrow "Πώς Λειτουργεί", H2, lead, 4 steps (titles and descriptions verbatim).

**Desktop signature:** pinned horizontal journey. The section pins and a horizontal track of 4 panels (each about 72vw) translates left as you scroll (`end: "+=300%"`, scrub 1). A glowing SVG path runs through all four panels and draws itself with DrawSVG in sync with progress, passing through each step marker. Giant outlined numerals 01 to 04 (Commissioner 800, `-webkit-text-stroke: 1px` violet at 40%, transparent fill) fill with the text gradient when their panel is centered. Each panel's illustration is built in code and animates when centered (`containerAnimation`):

1. **Κάντε Εγγραφή:** a glass sign-up card whose fields type themselves (Magic UI Typing Animation), then a check draws.
2. **Παραγγείλτε το Site σας:** a moodboard: a logo blob morphing between three shapes (MorphSVG), color swatches fanning out, image tiles settling.
3. **Φτιάξτε το Μενού:** a menu builder panel where dish rows drop in and reorder (Flip), a price field increments.
4. **Μοιραστείτε το:** three QR table tents fan out on a dark table, each QR draws itself, a phone above them shows the menu.

**Mobile:** Aceternity **Timeline**: vertical, with the scroll-following beam on the left and each step's illustration below its text.

#### 7.6 Demo (`#demo-section`): "Δοκιμάστε το Demo"

**Content:** eyebrow "Δείτε το σε Δράση" (keep the pulsing dot), H2, lead, the YouTube video.

**Component:** Aceternity **Container Scroll Animation**: the video sits in a dark device frame that starts tilted back in 3D (rotateX about 20deg, scale 1.05) and flattens and settles as you scroll into it. Behind it, a soft volumetric glow (React Bits **Light Rays** from the top in violet at low opacity, only while in view).

**Video facade:** show the YouTube thumbnail (`https://i.ytimg.com/vi/XoTqAIHZuts/maxresdefault.jpg`, fallback `hqdefault.jpg`) darkened 30% with a large glass play button (pulsing ring). The custom cursor shows "Play". On click, swap in the iframe `https://www.youtube-nocookie.com/embed/XoTqAIHZuts?autoplay=1&rel=0&modestbranding=1`.

Mobile: no 3D tilt, just a fade-up, same facade.

#### 7.7 Showcase: "Δείτε το Menuverse σε Δράση"

**Content:** eyebrow "Πραγματικά Παραδείγματα", H2, lead, the Athens Anima Bistro card with "Δείτε το Μενού" (opens `https://animabistro.base44.app` in a new tab with `rel="noopener"`).

**Layout:** a large showcase stage. Left: the restaurant photo in a React Bits **Tilted Card** (gentle 3D tilt toward the cursor, glare), with the name overlaid in Commissioner. Right: a Magic UI **iPhone** mockup containing a lazy-loaded live iframe of the bistro's menu (mounted only when in view, `loading="lazy"`, a `title`, sandboxed). If the site refuses framing, show the photo inside the phone instead. "Δείτε το Μενού" is a magnetic button with an arrow that rotates 45deg on hover.

Carousel shell: Embla with a depth effect (inactive slides scale 0.86, dim to 40%, blur 2px), magnetic arrows, dots as pills that stretch when active. Arrows and dots only render with 2 or more items (3.11).

#### 7.8 Pricing (`#pricing`): "Πακέτα για Κάθε Ανάγκη"

**Content:** H2, lead "Δοκιμάστε δωρεάν και αναβαθμιστείτε όταν θέλετε", billing toggle, yearly badge, currency selector, 4 plans with exact features (Content Pack), CTAs. Logic in 3.5.

**Toggle:** a pill switch "Μηνιαία | Ετήσια" with a thumb that slides on a spring (Motion `layoutId`). The yearly badge uses Magic UI **Animated Shiny Text**. Switching to yearly fires a small canvas-confetti burst from the badge (about 40 particles, colors `#C4B5FD`, `#8B5CF6`, `#E879F9`, `disableForReducedMotion: true`).

**Currency selector:** glass dropdown with flags and codes, scrollable list (`data-lenis-prevent`), keyboard navigable.

**Prices:** every number is a `@number-flow/react` NumberFlow, so digits roll like an odometer whenever the period or currency changes. The struck-through regular price has its strike line draw from left to right after the card enters (`scaleX` 0 to 1).

**Cards:** 4 columns at 1280px and up, 2x2 on tablet, a horizontal snap carousel with dots on mobile (Professional centered first).

- All cards: stone material, Aceternity **Glowing Effect** (border lights up around the cursor), feature checkmarks draw in sequence with DrawSVG (stagger 0.05), very subtle tilt on hover (max 3deg, readability first).
- **Professional (Πιο Δημοφιλές):** raised (scale 1.04 on desktop), inner violet glow at the top, Magic UI **Border Beam** travelling continuously around the edge, the badge in a glass pill above the card.
- **Enterprise:** darker card with a faint animated dot grid inside (Aceternity Dotted Glow Background, CSS-only version), price shown as "Προσφορά / κατόπιν συνεννόησης" in serif italic.
- CTAs: "Ξεκινήστε" (gradient button on Professional, outline on others), "Επικοινωνήστε" on Enterprise. All magnetic.

#### 7.9 Referral program: "Πάρτε το μενού σας, ΔΩΡΕΑΝ!"

**Content:** eyebrow "Πρόγραμμα Παραπομπών", H2, paragraph, buttons "Μάθετε Περισσότερα", "Ξεκινήστε", "Πίνακας", and the 4 steps. Logic in 3.10.

**Layout:** left: header, paragraph, the three buttons. Right: a Magic UI **Animated Beam** diagram: a "you" node on the left, three friend nodes in the middle, and a **free menu ticket** on the right. When the section enters, beams fire one after another from you to each friend (each beam carries a small "50%" token that travels along a MotionPath), then all three converge into the ticket.

- The 4 steps sit below as a horizontal stepper. The active step highlights in sync with the beam timeline (GSAP timeline labels): 1 link generated, 2 shared, 3 friends get 50% (the "50%" rolls with React Bits **Counter**), 4 three friends equals a free menu.
- The ticket is a React Bits **Holo Card**: holographic foil that shifts with cursor and device tilt, showing "ΔΩΡΕΑΝ ΜΕΝΟΥ" and the Menuverse mark. When the third beam lands, the ticket flips in and fires a Magic UI **Confetti** burst.
- Mobile: the diagram becomes vertical (you at the top, friends in a row, ticket at the bottom).

#### 7.10 Testimonials (`#testimonials`): "Είπαν για εμάς..."

**Content:** eyebrow "Κριτικές", H2, lead, the Athens Anima Bistro quote, author and role, carousel infrastructure.

**Treatment:** one quote, treated like a magazine pull quote. The quote is set very large in Noto Serif Display Italic (`clamp(1.8rem, 3.6vw, 3.25rem)`, max 24ch) and revealed with React Bits **Scroll Reveal** (words go from blurred and dim to sharp as you scroll). Oversized violet quotation marks draw in. The author block: the "A" initial in a glass circle with React Bits **Circular Text** rotating around it ("ATHENS ANIMA BISTRO ✦ ΕΣΤΙΑΤΟΡΙΟ, ΑΘΗΝΑ ✦"), then name and role.

Carousel: Aceternity **Animated Testimonials** structure (crossfade, stacked author images) so more testimonials can be added. Dots only with 2 or more items.

#### 7.11 Coming soon (`#guide`): "Δύο νέοι τρόποι να ερωτευτείς ένα μενού"

**Content:** badge "Έρχεται σύντομα" (Magic UI Animated Shiny Text with a sparkles icon), H2, lead, two cards, the footnote "Έρχεται πρώτα στα εστιατόρια Menuverse".

**Card A: Ο Οδηγός Menuverse.** A night globe (Magic UI **Globe**, built on cobe; match the installed cobe major version's API): near-black sphere, violet land dots, glowing markers on food capitals (Athens, Paris, Tokyo, New York, Copenhagen, Lima, San Sebastián, Mexico City), slow auto-rotation, draggable. In front of it floats **the emblem**: the Menuverse mark rendered as liquid metal with Paper Shaders `LiquidMetal` (champagne tint, using the uploaded logo mark as the shape), slowly catching light. Title, description, and a "Σύρε" cursor state on the globe. Mobile: static globe image (rendered once from the same cobe config) and a CSS metallic emblem.

**Card B: Δες το πιάτο σε 3D.** An R3F scene of a single dish on a dark ceramic plate under a soft spotlight, with drei `OrbitControls` (rotate only, damping, no zoom so Lenis is not hijacked, no pan) and a gentle auto-rotate that stops while dragging. If a GLB is uploaded, use it; otherwise build a stylized pizza procedurally (dough disc, torus crust, sauce disc, cheese layer, topping instances). Signature moment: when the card scrolls into the middle of the screen, the dish does an **exploded view**: its layers lift apart vertically, hold for a beat, and settle back. Show "Σύρε για να εξερευνήσεις" with an animated hand icon that fades after the first drag. The same component can later switch to Google `<model-viewer>` with `ar` and `ar-modes="webxr scene-viewer quick-look"` for real AR on phones: leave a TODO comment, do not ship AR now.

Both canvases (globe + dish) are mounted only while this section is near the viewport. On mobile only one of them is live at a time (the one in view), the other shows its static poster.

#### 7.12 Feedback: "Δώστε μας τα Σχόλιά σας"

**Content:** eyebrow "Η Γνώμη σας Μετράει", H2, lead, the 5 required fields, submit "Υποβολή Σχολίων". Logic in 3.7.

**Treatment:** a single obsidian glass form card on a dimmed background (the reading zone). Floating labels that lift into the border on focus. Focus state: a violet scan line runs along the bottom border. Stars: 5 outline stars that fill with a spring and a tiny sparkle burst on select, hover previews the fill. Yes/No: segmented control with a sliding thumb. Textareas auto-grow.

Submit: Aceternity **Stateful Button** (idle, loading spinner, success check). On success, the form content folds away and a thank-you state appears with a drawn checkmark and a small confetti burst. Errors shake the field 6px and show the message in `--mv-danger`.

#### 7.13 Articles: "Ψηφιακό Μενού & Digital Menu: Ό,τι πρέπει να ξέρεις"

**Content:** eyebrow "Οδηγοί & Άρθρα", H2, lead, 6 article cards (category tag, title, excerpt, read time, "Διάβασε άρθρο"), then the CTA strip "Έτοιμος να δημιουργήσεις το ψηφιακό μενού του εστιατορίου σου;" with "Ξεκίνα δωρεάν" (to `#pricing`). Logic in 3.9.

**Desktop layout:** a draggable horizontal rail (GSAP Draggable with Inertia, plus wheel and keyboard arrows) with React Bits **Gradual Blur** on both edges. Cards use Aceternity **Focus Cards** behaviour (hovering one slightly blurs and dims the others). Each card has a generated cover: a large mono category label, a QR-module pattern and a violet gradient that differs per category (no stock images). The cursor shows "Σύρε" over the rail.

**Reader:** Motion Primitives **Morphing Dialog**: the clicked card morphs (shared layout animation) into a full reading modal. Inside: category pill, title in Commissioner 700, read time, then the body in Inter 17px with line-height 1.75 and max width 68ch, `h3` subheads in Commissioner 600, a thin reading progress bar at the top of the modal, the closing CTA. Body scroll uses `data-lenis-prevent`, Lenis is stopped, Escape closes, the hash updates.

**Mobile:** cards stack vertically (no rail), the reader opens full-screen.

#### 7.14 Newsletter: "Εγγραφείτε στο Newsletter μας"

**Content:** eyebrow "Μείνετε Ενημερωμένοι", H2, lead, email field, "Εγγραφή" button, privacy note "🔒 Σεβόμαστε το απόρρητό σας. Διαγραφή οποτεδήποτε." Logic in 3.8.

**Component:** Aceternity **Placeholders And Vanish Input**: the placeholder cycles through example addresses (for example "info@to-estiatorio-sou.gr", "chef@taverna.gr", "hello@cafe.gr"; translate the idea per language), and on submit the typed text vaporizes into particles while the success message fades in. Background: React Bits **Dot Grid** in very low contrast violet that ripples from the cursor (desktop only).

#### 7.15 Final CTA: "Έτοιμοι για το Ψηφιακό σας Μενού;"

**Content:** H2, line, button "Ξεκινήστε Δωρεάν Τώρα" (to `#pricing`).

**Treatment:** a full-viewport finale. Background: React Bits **Light Pillar** (a swirling column of violet light that leans toward the cursor), mounted only in view. The headline is huge (H1 scale) and splits in by characters. The CTA is the largest button on the site, magnetic, with Click Spark. As this section scrolls up, the hero's QR modules return as a flat SVG that assembles under the button: the story ends where it began.

Mobile: a static radial violet glow instead of Light Pillar.

#### 7.16 Footer

**Content:** logo, description line, links (Χαρακτηριστικά, Πώς Λειτουργεί, Τιμοκατάλογος, Privacy Policy, Terms of Service), copyright line, the giant "MENUVERSE" wordmark.

**Treatment:**

- **Curtain reveal:** the footer is fixed or sticky underneath the last section, which scrolls up to uncover it.
- The giant wordmark spans the full width: Aceternity **Text Hover Effect** (outlined letters whose stroke fills with a violet to orchid gradient around the cursor). On first reveal the outline draws itself with stroke-dashoffset.
- Links: hover underline grows from the left, mono labels for column headers.
- Copyright year is dynamic: "© {current year} Menuverse." followed by the rest of the line.
- Mobile: wordmark scales to fit the width, links in two columns.

---

### 8. Other pages

#### 8.1 `/login`

Keep the split-screen layout of the old login page, upgraded. Left half (hidden on mobile): Paper Shaders MeshGradient in a deeper violet, the floating 3D-style phone mock (static image or the DOM `<PhoneMenu />`), the Menuverse logo, a one-line tagline from the hero. Right half: obsidian card with "Πίσω" (back link), "Καλώς ήρθατε πίσω", "Καλωσορίσατε", "Συνέχεια με Google", "Συνέχεια με Microsoft", divider "ή", Email, Κωδικός, "Ξεχάσατε τον κωδικό;", "Σύνδεση", "Δεν έχετε λογαριασμό; Εγγραφή". Fields use the same floating-label style as 7.12. Honors `?redirect=` and the plan parameters (3.4, 3.5).

#### 8.2 Legal pages (`/privacypolicy`, `/termsofservice`)

Reading layout: "Back to Home" link, title, "Last Updated" line, then numbered sections. Left on desktop: a sticky table of contents with the active section highlighted as you scroll. Body Inter 17px, max width 68ch, bullet lists with violet square markers (the QR module motif). The background drops to reading intensity. "Open Message System" opens the chat panel. Text verbatim from Content Pack L1 and L2.

#### 8.3 `/referrals` (signed in)

Header with the user's referral link (copy button with a check morph, share buttons), a progress meter "x / 3 friends" drawn as three QR-module slots that fill, clicks count, reward status pill, and the 4 steps as a reminder. Signed out: redirect to `/login?redirect=referrals`.

#### 8.4 `/admin` (admin role only)

Utility first, still on-brand but with minimal motion. Tabs: Inbox (conversation list with unread dots, thread view, reply box, realtime), Feedback (table, sortable, rating stars), Newsletter (table, CSV export), Referrals (codes, signups, reward status editable). Non-admins see the 404.

#### 8.5 404

Big outlined "404" in Commissioner, a QR made of scattered modules that fails to assemble, a line in all languages, button back home.

---

### 9. Responsive and touch rules

- Breakpoints: 390 (base), 768, 1024, 1280, 1536.
- Touch devices: no custom cursor, no magnetism, no hover-only information (everything hover reveals must be visible or tappable), native scrolling, tap targets at least 44px.
- No horizontal pinning on mobile. Vertical pins at most 100vh and only where specified.
- Heavy effects on mobile: hero R3F becomes the DOM phone (7.1), background static (6.2), one live canvas at a time (10), Light Rays, Light Pillar, Dot Grid and Magic Bento particles are disabled.
- Test at 390x844 (iPhone), 412x915 (Android), 768x1024 (iPad), 1440x900, 1920x1080.

### 10. Performance budget

- Lighthouse mobile: Performance 80 or higher, Accessibility 95 or higher, Best Practices 95 or higher, SEO 100. Desktop Performance 95 or higher.
- LCP under 2.5s on 4G mobile (the H1 is the LCP element), CLS under 0.05, INP under 200ms.
- JavaScript: lazy-load every section below the fold with `React.lazy` + `Suspense`. The three.js chunk loads only on desktop and only for the hero and 7.11. Initial JS under about 250 KB gzipped.
- WebGL contexts: at most 3 alive at once on desktop (for example background + hero canvas, or background + globe + dish), 1 on mobile. Use `useInViewMount` for every canvas.
- 60 fps target on an M-series MacBook, 50 fps or better on a mid-range Android for the mobile versions.
- Fonts: `font-display: swap`, preload the Commissioner files used above the fold, subset where possible.
- Images: AVIF or WebP, explicit width and height, lazy below the fold.

### 11. Accessibility

- Visible focus rings in violet (2px outline plus 2px offset) on every interactive element.
- Full keyboard support: nav, dropdowns, toggle, currency list, carousels (arrow keys), article rail, modals (focus trap, Escape).
- SplitText uses its `aria` option so screen readers read whole words, never letters.
- All decorative canvases and the Curved Loop are `aria-hidden`. Every 3D element's meaning also exists as text.
- Color contrast AA minimum for all text (muted text is `#A1A1B5` on `#050507`, about 8:1).
- prefers-reduced-motion respected everywhere (Global Rule 6). Add a manual "reduce motion" toggle in the footer that sets the same mode.
- Form errors announced with `aria-live="polite"`.

---

### 12. Component source index

| Component | Library | Source | Used in |
|---|---|---|---|
| Magic Bento | React Bits | reactbits.dev/components/magic-bento | 7.2 |
| Card Swap | React Bits | reactbits.dev/components/card-swap | 7.2 |
| Split Flap Text | React Bits | reactbits.dev/text-animations/split-flap-text | 7.2 |
| Curved Loop | React Bits | reactbits.dev/text-animations/curved-loop | 7.3 |
| Blur Text | React Bits | reactbits.dev/text-animations/blur-text | section headers |
| Shiny Text | React Bits | reactbits.dev/text-animations/shiny-text | 7.1 |
| Scroll Reveal | React Bits | reactbits.dev/text-animations/scroll-reveal | 7.10 |
| Circular Text | React Bits | reactbits.dev/text-animations/circular-text | 7.10 |
| Counter | React Bits | reactbits.dev/components/counter | 7.9 |
| Tilted Card | React Bits | reactbits.dev/components/tilted-card | 7.7 |
| Holo Card | React Bits | reactbits.dev/components/holo-card | 7.9 |
| Staggered Menu | React Bits | reactbits.dev/components/staggered-menu | 6.4 mobile |
| Pill Nav | React Bits | reactbits.dev/components/pill-nav | 6.4 indicator |
| Glass Surface | React Bits | reactbits.dev/components/glass-surface | 6.4 |
| Magnet | React Bits | reactbits.dev/animations/magnet | CTAs |
| Click Spark | React Bits | reactbits.dev/animations/click-spark | CTAs |
| Noise | React Bits | reactbits.dev/animations/noise | 4.6 grain |
| Gradual Blur | React Bits | reactbits.dev/animations/gradual-blur | 7.13 |
| Light Rays | React Bits | reactbits.dev/backgrounds/light-rays | 7.6 |
| Light Pillar | React Bits | reactbits.dev/backgrounds/light-pillar | 7.15 |
| Dot Grid | React Bits | reactbits.dev/backgrounds/dot-grid | 7.14 |
| Resizable Navbar | Aceternity UI | ui.aceternity.com/components/resizable-navbar | 6.4 |
| Container Scroll Animation | Aceternity UI | ui.aceternity.com/components/container-scroll-animation | 7.6 |
| Timeline | Aceternity UI | ui.aceternity.com/components/timeline | 7.5 mobile |
| Glowing Effect | Aceternity UI | ui.aceternity.com/components/glowing-effect | 7.8 |
| Dotted Glow Background | Aceternity UI | ui.aceternity.com/components/dotted-glow-background | 7.8 Enterprise |
| Animated Testimonials | Aceternity UI | ui.aceternity.com/components/animated-testimonials | 7.10 |
| Focus Cards | Aceternity UI | ui.aceternity.com/components/focus-cards | 7.13 |
| Stateful Button | Aceternity UI | ui.aceternity.com/components/stateful-button | 7.12 |
| Placeholders And Vanish Input | Aceternity UI | ui.aceternity.com/components/placeholders-and-vanish-input | 7.14 |
| Text Hover Effect | Aceternity UI | ui.aceternity.com/components/text-hover-effect | 7.16 |
| Animated Theme Toggler | Magic UI | magicui.design/docs/components/animated-theme-toggler | 6.4 |
| Scroll Progress | Magic UI | magicui.design/docs/components/scroll-progress | 6.5 |
| Shine Border | Magic UI | magicui.design/docs/components/shine-border | 6.4 |
| Border Beam | Magic UI | magicui.design/docs/components/border-beam | 7.2, 7.8 |
| Number Ticker | Magic UI | magicui.design/docs/components/number-ticker | 7.2 |
| Interactive Hover Button | Magic UI | magicui.design/docs/components/interactive-hover-button | 7.4 |
| Animated List | Magic UI | magicui.design/docs/components/animated-list | 7.4 |
| iPhone | Magic UI | magicui.design/docs/components/iphone | 7.7 |
| Animated Shiny Text | Magic UI | magicui.design/docs/components/animated-shiny-text | 7.8, 7.11 |
| Animated Beam | Magic UI | magicui.design/docs/components/animated-beam | 7.9 |
| Confetti | Magic UI | magicui.design/docs/components/confetti | 7.9, 7.12 |
| Globe | Magic UI (cobe) | magicui.design/docs/components/globe | 7.11 |
| Morphing Dialog | Motion Primitives | 21st.dev/@ibelick/components/morphing-dialog | 7.13 |
| NumberFlow | barvian | number-flow.barvian.me | 7.2, 7.8, 7.1 |
| MeshGradient, LiquidMetal, PulsingBorder | Paper Shaders | shaders.paper.design | 6.2, 7.11, 6.6 |
| RoundedBox, Html, Environment, Lightformer, ContactShadows, OrbitControls, PerformanceMonitor | drei | github.com/pmndrs/drei | 7.1, 7.11 |
| SplitText, ScrambleText, DrawSVG, MorphSVG, Flip, Draggable, Inertia, MotionPath | GSAP | gsap.com/docs/v3/Plugins | everywhere |
| Lenis | darkroom.engineering | github.com/darkroomengineering/lenis | 5.4 |

Reference for cinematic scroll-driven 3D camera work: Codrops, "How to Build Cinematic 3D Scroll Experiences with GSAP" (tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/).

---

### 13. Acceptance checklist (run at the end of every phase that touches it)

**Content and function**
- [ ] Every string in the Content Pack appears on the site in Greek and English; the other 6 languages are complete with no missing keys.
- [ ] `<html lang>`, title and meta description change with the language.
- [ ] All nav anchors land correctly under the floating navbar.
- [ ] Pricing: monthly/yearly and all 12 currencies update every price with the NumberFlow roll; JPY has no decimals; rates fall back when the API fails.
- [ ] Plan CTAs, chat (signed in and out), feedback, newsletter, referral start and dashboard, article reader and hash links, showcase link, video facade all work.
- [ ] Theme toggle works and persists; no flash on reload.

**Feel**
- [ ] Preloader to hero entrance plays as one continuous move, once per session.
- [ ] Hero scroll "dive into the menu" is smooth at 60 fps on desktop.
- [ ] Every section header uses the shared choreography.
- [ ] Nothing loops faster than 6 seconds; no two hero moments compete on one screen.

**Quality**
- [ ] Greek headlines render in Commissioner and Noto Serif Display in every weight (check Ά, Έ, Ή, Ί, Ό, Ύ, Ώ, ΐ, ΰ).
- [ ] Reduced motion mode: no smooth scroll, no pins, no WebGL loops, everything readable.
- [ ] Mobile versions at 390px look designed, not shrunk.
- [ ] Lighthouse targets met; no console errors; no layout shift on load.
- [ ] Safari macOS and iOS tested (drei Html, backdrop-filter, View Transitions fallback).
- [ ] No invented stats, logos, testimonials or claims anywhere.

---

## PHASE PACK (send one message per phase, in order)

Each phase message = the phase text below + the parts of this file and the Content Pack it names. Wait for the preview and review it before the next phase.

**Phase 0: Brief and plan (no code yet)**
> Paste: GLOBAL RULES (already in AI Controls), MASTER PROMPT sections 0 to 4.
> Say: "This is the full brief for rebuilding the Menuverse site from scratch. Do not build yet. Reply with: your understanding in 10 bullet points, the React and Tailwind versions in this project, the packages you will install, and any conflicts or questions."

**Phase 1: Foundation**
> Paste: MASTER PROMPT sections 3.1 to 3.4, 3.13, 4.2, 4.4, 5 (all), 6.2, 6.3, 6.5, 6.7, 6.8.
> Say: "Phase 1: install the packages, set up routes, theme tokens, fonts, GSAP, Lenis, hooks, i18n framework, theme toggle, living background, grain, cursor, scroll progress, page transitions and the entities. Use placeholder sections on the homepage. No section design yet."

**Phase 2: Copy into i18n**
> Paste: CONTENT PACK sections G and H1 to H17.
> Say: "Phase 2: put all of this copy into el.json and en.json exactly as written, then create de, fr, es, it, pt and nl translations of every key. Do not change any Greek or English wording."

**Phase 3: Articles and legal content**
> Paste: CONTENT PACK sections A1 to A6, L1, L2.
> Say: "Phase 3: create src/content/articles.js with these 6 articles in EL and EN plus translations for the other 6 languages, and build /privacypolicy and /termsofservice as described in MASTER PROMPT 8.2 (paste 8.2 too)."

**Phase 4: Global layer**
> Paste: MASTER PROMPT 3.6, 6.1, 6.4, 6.6, 7.16, 8.5.
> Say: "Phase 4: build the preloader, navbar (desktop and mobile), language popover, chat widget and chat panel with the real chat logic, footer and 404."

**Phase 5: Hero**
> Paste: MASTER PROMPT 7.1 and 10.
> Say: "Phase 5: build the hero exactly as specified, including the R3F scene, scroll choreography and the mobile fallback."

**Phase 6: Story sections**
> Paste: MASTER PROMPT 7.2 to 7.7.
> Say: "Phase 6: build Features, the multilingual loop, Live support, How it works, Demo and Showcase."

**Phase 7: Conversion sections**
> Paste: MASTER PROMPT 3.5, 3.10, 7.8, 7.9, 7.10, 8.3.
> Say: "Phase 7: build Pricing with the full currency logic and backend function, Referral program, Testimonials and the /referrals page."

**Phase 8: Future, engagement and finale**
> Paste: MASTER PROMPT 3.7 to 3.9, 7.11 to 7.15.
> Say: "Phase 8: build the Coming soon section with the globe, emblem and 3D dish, Feedback, Articles rail and Morphing Dialog reader, Newsletter and Final CTA."

**Phase 9: Login, admin, SEO**
> Paste: MASTER PROMPT 3.12, 8.1, 8.4, and CONTENT PACK section G.
> Say: "Phase 9: build /login, /admin, all SEO tags and JSON-LD."

**Phase 10: Polish and QA**
> Paste: MASTER PROMPT 9, 10, 11, 13.
> Say: "Phase 10: go through the acceptance checklist item by item, fix everything that fails, and report the results with Lighthouse scores for mobile and desktop."

If the AI drifts or forgets details in later phases, paste the relevant section again with: "Re-read this section and make the current build match it exactly."
