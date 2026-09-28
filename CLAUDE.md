# Infinite Calculators — Project Brief

This file is the standing brief for this project. Read it at the start of every session and follow it for all work.

## What we are building

**infinitecalculators.com**: a free online calculator website that earns money from Google AdSense. Traffic comes from Google search, so **SEO and page speed come first in every decision.**

- Audience: mainly US, UK and Canada (English), plus Muslim users worldwide for the Islamic calculators
- Every calculator is free, needs no signup, and runs entirely in the browser
- Hosting: Hostinger (static files in `public_html`), deployed automatically from GitHub
- **Owned and operated by IdeoXpert** (software company, https://ideoxpert.com). Don't mention how long the domain has been held, anywhere on the site (owner's request).

## Brand (important)

- The brand name is **Infinite Calculators**. A large competitor exists at infinitycalculator.com, so our brand must be clearly different from it.
- Never use the word "Infinity" anywhere on the site, in copy, titles, schema or alt text.
- Give the site its own distinct logo, color palette and tagline. Do not imitate the competitor's layout, wording or design.

## Tech stack (do not change without asking)

- **Astro** (latest stable), static output only (`output: 'static'`), no SSR
- **Tailwind CSS** for styling
- **Vanilla TypeScript/JavaScript** for calculator logic, with no React, Vue, jQuery or other UI libraries
- `@astrojs/sitemap` for sitemaps
- Node 22, npm

`astro.config.mjs` must include:

```js
site: 'https://infinitecalculators.com',
trailingSlash: 'always',
build: { format: 'directory' },
```

## Deployment

- `.github/workflows/deploy.yml` builds the site on every push to `main` and uploads `dist/` to Hostinger by FTP (using secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`)
- `public/.htaccess` handles the HTTPS/non-www redirect, trailing slashes, caching, compression and the 404 page
- `public/ads.txt` holds a placeholder until AdSense approves the site
- Never commit secrets or `.env` files

## Project structure

```
src/
  data/calculators.ts        # single registry of all calculators (see below)
  layouts/BaseLayout.astro   # <head>, SEO tags, header, footer
  layouts/CalculatorLayout.astro
  components/                # SEO.astro, Breadcrumbs, RelatedCalculators, FAQ, AdSlot, etc.
  scripts/calculators/       # one logic file per calculator (pure functions, testable)
  pages/
    index.astro
    [category]/index.astro   # category hub pages
    <category>/<slug>/index.astro  # one page per calculator
    about/, contact/, privacy-policy/, terms/, disclaimer/, 404.astro
public/
  .htaccess, robots.txt, ads.txt, favicon, og-default image
```

**The calculator registry** (`src/data/calculators.ts`) is the single source of truth. Each entry has: slug, category, name, short description, title tag, meta description, main keyword, related slugs, and date last updated. The homepage, category pages, related links, breadcrumbs and sitemap are all generated from it. Adding a calculator means adding one registry entry plus its page and logic file.

## URL and category plan

| Category | URL |
|---|---|
| Time & Date | `/time-date/` |
| Home & DIY | `/home-diy/` |
| Money | `/money/` |
| School | `/school/` |
| Islamic | `/islamic/` |
| Christian | `/christian/` |
| Other religious & cultural | `/cultural/` |

Calculator URLs look like `/home-diy/concrete-calculator/`: lowercase, hyphens, keyword first, always a trailing slash.

## SEO requirements (strict, for every page)

- Self-referencing canonical URL; no duplicate URLs
- Unique `<title>` (aim for under 60 characters), e.g. `Concrete Calculator – Slabs, Footings & Bags | Infinite Calculators`
- Unique meta description, 140–155 characters, including the main keyword
- Exactly one H1 containing the main keyword; logical H2/H3 order
- Open Graph and Twitter card tags
- JSON-LD schema:
  - Homepage: `Organization` and `WebSite`
  - Calculator pages: `WebApplication`, `FAQPage` and `BreadcrumbList`
  - Category pages: `CollectionPage` and `BreadcrumbList`
- Semantic HTML (`main`, `article`, `nav`, `section`) with labels on every input
- Visible breadcrumbs on every calculator page
- Every calculator page links to 3–4 related calculators, and every category hub links to all of its calculators
- `robots.txt` points to the sitemap; the 404 page is `noindex`

## Performance requirements

- **Lighthouse 95+ on mobile** for Performance, Accessibility, Best Practices and SEO on every page
- System font stack, or at most one self-hosted woff2 font with `font-display: swap`
- No render-blocking scripts; calculator scripts load only on their own page
- Images in WebP/AVIF with width and height set; inline SVG icons
- Ad slots reserve their height up front so ads cause no layout shift (CLS near 0)
- The AdSense script (added later) loads async after the page load event

## Calculator page template

Each page, in this order:

1. Breadcrumbs, H1, and a one-sentence intro
2. **The calculator itself.** On mobile it must sit above the fold. Results appear instantly as the user types (with a Calculate button as well), inputs are validated with clear error messages, and there are Reset and Copy-result buttons. Remember the unit choice (metric/imperial) where relevant.
3. An ad slot
4. Content, 600–1,000 words:
   - How to use this calculator (short steps)
   - The formula / how we calculate, explained in plain language
   - At least one worked example with real numbers
   - A useful table where it fits (e.g. concrete bags per volume, nisab values)
   - 5 FAQs targeting real questions people search for
5. Related calculators
6. "Last updated" date, "Reviewed by" line (when a reviewer is set in the registry), and a short disclaimer where relevant
7. A small "Is this result wrong? Tell us" feedback link or form

Results should show the **step-by-step working** (the formula with the user's numbers filled in), and a simple lightweight chart where it helps understanding (inline SVG, no chart library).

The homepage has a "Popular calculators" section driven by a `popular` flag in the registry.

## Content rules

- Write in plain, clear, specific English for a general audience
- **No AI filler.** Never use phrases like "In today's fast-paced world", "Whether you're a… or a…", "look no further", "delve", "unlock", or "comprehensive guide". Every sentence must give the reader something useful.
- Every number, formula and fact must be correct. When unsure, say so in a code comment and flag it to me instead of guessing.
- No copied content from other calculator sites

## Religious calculators (extra care)

- State the method or school used on the page, and let users switch where it matters
- **Zakat**: 2.5% rate; nisab by gold (87.48 g) or silver (612.36 g), selectable; the user enters the current gold/silver price per gram and their currency (no live price API yet). Include a "consult a qualified scholar" note.
- **Hijri ↔ Gregorian**: use the built-in `Intl.DateTimeFormat` with the `islamic-umalqura` calendar. Note that local moon sighting can shift the date by ±1 day.
- **Easter**: use the Anonymous Gregorian algorithm (Meeus/Jones/Butcher) for Western Easter, plus Orthodox Easter (Julian computus converted to Gregorian).
- **Chinese zodiac**: based on the birth *date*, not just the year. Account for the Chinese New Year boundary (use `Intl` with the `chinese` calendar or a verified lookup table).
- Be respectful and neutral in all religious content.

## Design

- Clean, trustworthy and modern, with a distinct brand look (not a generic template)
- Mobile-first; large tap targets; readable 16px+ body text
- Light mode only (owner's decision, 2026-09-28: no dark mode or theme toggle)
- Header: logo, category navigation, and a site search box that filters calculators from the registry (client-side, lightweight)
- Footer: category links and the About, Editorial Policy, Contact, Privacy Policy, Terms and Disclaimer pages

## Site-wide pages

- **About**: Infinite Calculators is built and run by IdeoXpert, a software company. Describe the team, why we build these tools, and how we check accuracy. Link to https://ideoxpert.com.
- **Editorial Policy**: how calculators are built, tested and reviewed; how religious calculators are reviewed; how users can report errors
- Footer on every page: "© [year] Infinite Calculators · Owned & operated by IdeoXpert" (linking to ideoxpert.com)
- `Organization` schema: name "Infinite Calculators", with `parentOrganization` IdeoXpert (url https://ideoxpert.com)
- **Contact**: an email link or a simple form (no backend needed yet)
- **Privacy Policy**: must mention Google AdSense, cookies, third-party vendors, and how to opt out of personalized ads
- **Terms** and **Disclaimer**: results are for information only and are not financial, legal, medical or religious rulings

## Calculator roadmap

**Phase 1** (launch, 15 calculators):

| # | Calculator | Category |
|---|---|---|
| 1 | Hours calculator (time card) | time-date |
| 2 | Time duration calculator | time-date |
| 3 | Days between dates | time-date |
| 4 | Date calculator (add/subtract days) | time-date |
| 5 | Concrete calculator | home-diy |
| 6 | Square footage calculator | home-diy |
| 7 | Paint calculator | home-diy |
| 8 | Tip calculator (with bill split) | money |
| 9 | Discount calculator | money |
| 10 | Sales tax calculator (US states) | money |
| 11 | Final grade calculator | school |
| 12 | Zakat calculator | islamic |
| 13 | Hijri ↔ Gregorian converter | islamic |
| 14 | Easter date calculator | christian |
| 15 | Chinese zodiac calculator | cultural |

For sales tax, keep the state base rates in a data file with a last-verified date, and say on the page that local rates can add to them.

**Phase 2** (after launch): military time converter, gravel, mulch, tile/flooring, fence, overtime pay, hourly to salary, weighted grade, Islamic inheritance (Faraid, Hanafi default), fidya/kaffarah, Qibla direction, prayer times, Lent/Ash Wednesday date, tithe calculator, Hebrew date converter, Bar/Bat Mitzvah date, Yahrzeit date.

## Commands

- `npm run dev`: local dev server
- `npm test`: registry checks and calculator logic tests (Node's built-in test runner, `src/**/*.test.ts`)
- `npm run build`: static build to `dist/`
- `npm run check`: checks every built page against the SEO rules above (one H1, title/description length, canonical, noindex on 404, valid JSON-LD, no broken internal links, labelled inputs). Run after build.
- CI (`deploy.yml`) runs test → build → check → FTP upload; any failure stops the deploy. The upload step is skipped until the three FTP secrets exist in the GitHub repo.

## Decisions made so far

- **Astro 7** (7.3.x). `compressHTML: true` is set because Astro 7's default (`'jsx'`) drops the space between a link and text on the next line.
- **Tailwind 4** through its official Vite plugin (`@tailwindcss/vite`). Colors are CSS variables in `src/styles/global.css` (`bg-surface`, `text-muted`, `bg-accent`, …).
- **Visual design**: lime `#b0ec6c` is a fill only (buttons, active states, tags), with dark `#182c04` text on it. Text accents and links use `--accent-ink` `#4b7422`, because lime is unreadable as text on white. Deep green `#182c04` for the footer, white pages.
- **Soft borders and shadows** (owner's request, 2026-09-28: heavy ones look machine-made): borders use `--line` `#eef0f0` (`--line-strong` `#e0e4e3` for inputs), and cards use `.soft-card` with the faint `--shadow-soft`. Don't add darker borders or bigger shadows.
- **Logo and tagline**: an ∞ mark in deep green on a lime tile (owner's choice, 2026-09-28, replacing an earlier "=" mark), and the tagline "Answers with the working shown." The symbol is allowed; the word "Infinity" is still never used in any text, title, schema or alt text. The distinct palette, font and layout keep it apart from the competitor.
- **Font**: Onest (variable, Latin subset, SIL OFL), self-hosted from `src/assets/fonts/` through Astro's Fonts API, which also generates a size-matched Arial fallback (CLS stays 0).
- **Layout must look hand-built, not like a template.** Avoid: pill badges above headlines, slogan headlines with a highlighted word, stats rows, mock app windows, rows of marketing feature cards, cards nested in cards, decorative background patterns, everything centred. Prefer: plain keyword headlines, left-aligned content, hairline borders, and plain specific copy.
- **Cards** (owner's request): calculators always appear as whole-card links with name and short description (`CalculatorCard`); categories as cards with icon and calculator count (`CategoryCard`). Homepage: hero → search → categories → ad → "Popular calculators" (registry `popular: true`, 4–8 entries) → ad → all calculators list → short About text.
- **Homepage hero** (`HomeHero.astro`, owner's request, 2026-09-28, following a reference layout): copy and buttons on the left; on the right a lime panel with three real example results (concrete, tip, zakat), each linking to its calculator. It is the one allowed exception to "no mock app windows". Every number in it must match what the calculator returns; the inputs are noted in the component's comment.
- **Header**: one row. Desktop shows Time & Date, Home & DIY, Money and School as links and groups Islamic, Christian and Cultural under a "Faith & Culture" dropdown; search field from 1280px (icon button below that). Phones and tablets: logo, search icon, menu button; the menu lists all categories with counts, About, Editorial policy and Contact. Search is in the header on every page. Not sticky, so anchor ads have room.
- **Mobile first**: most visitors (and ad revenue) are on phones. Check every page at 360–390px wide.
- **Ads**: `<AdSlot unit="…" format="banner|rectangle">`. Fixed sizes reserve space (phones 300×250; from 768px banner 728×90, rectangle 336×280) so CLS stays 0. Unit IDs live in `site.ads.units`, one per placement. While `site.ads.enabled` is false, `<AdSlot>` renders nothing at all, in dev too (no previews, owner's request). The AdSense script loads after the page `load` event, only when ads are enabled. Keep ads at least 2rem from buttons and links (accidental-click policy).
- **Tests** use Node's built-in `node:test` with type stripping: no test framework dependency. Imports in files that tests load must use the `.ts` extension, and TypeScript must stay erasable (no enums or namespaces).
- **Registry** entries have `status: 'live' | 'planned'`, an optional `popular` flag and an optional `reviewer`. Planned entries show as "Coming soon" and are never linked or put in the sitemap/search. The registry test fails if a live entry has no page or a planned one does.
- **Site pages** (About, Editorial Policy, Contact, legal) use `src/layouts/InfoLayout.astro`.
- **Search** fetches `/search-index.json` (built from the registry) on first use only.
- **Sales tax rates** live in `src/data/sales-tax-rates.ts` with a `lastVerified` date and source (Tax Foundation, rates as of July 1, 2026).
- **Calculator pages** (owner's request): each calculator covers the common variants of its topic with mode tabs (e.g. concrete: slab, column, tube, stairs, post holes), and every measurement has its own unit menu. Results go in a full-width card below the form: `<Stat>` tiles (first one lime), then tables, an inline-SVG chart and `<Steps>` (the formula with the visitor's numbers). Building blocks are in `src/components/calc/` (CalcShell, Tabs, UnitSystem, Field, MeasureField, SelectField, Segmented, Checkbox, Presets, Stat, Steps); behaviour is in `src/scripts/ui/calculator.ts` (`setupCalculator`, `Reader`, `out`, `rows`, `table`, `steps`) and charts in `src/scripts/ui/chart.ts`.
- **Calculator behaviour** (owner's request: easy to fill in, edit and read on a phone): an answer line with a "Full results ↓" link sits by the Calculate button (directly after the last field on phones, beside the buttons from 640px). While a field is empty or half-typed, the last result stays on screen, dimmed, with a note (`stale` state) so the page doesn't jump; Copy only works on a current result. Numbers accept "1,250", "$40" and a decimal comma ("12,5"). "Enter …" messages appear only after Calculate is pressed. Where a measurement needs explaining, a small labelled drawing (`Diagram.astro`) sits next to the fields. Give a result an explicit `summary` when the first stat alone would read badly in the answer line.
- **Calculator pages** also have a desktop-only side column (More {category} calculators, Popular calculators) and, for every width, the Related calculators cards from the registry.
- **Sitemap and robots**: `@astrojs/sitemap` output is renamed after the build to a single `/sitemap.xml` (hook in `astro.config.mjs`; it stays a split index if the site ever passes 45,000 URLs). `lastmod` comes from the registry, or `PAGE_UPDATED` in `src/data/site.ts` for other pages. `robots.txt` allows everything except `/search-index.json` and points to `/sitemap.xml`.
- **Page content**: 600+ words per calculator (checked by `npm run check`), exactly 5 FAQs, and every number in the content is verified by running the tested logic, not written from memory.
- **Chinese zodiac** uses the Hong Kong Observatory's Lunar New Year table (`src/data/lunar-new-year.ts`, 1900–2100), not `Intl`: the built-in Chinese calendar gives the wrong New Year for 1954, 2027 and 2030.
- **Hijri** conversion uses `Intl` `islamic-umalqura` (official table data, 1300–1600 AH), checked against published Ramadan and Eid dates in the tests.
- Brand images in `public/` (OG image, icons, `logo-512.png`) were rendered once from SVG; the logo drawing lives in `src/components/Logo.astro` and `public/favicon.svg`.

## Stages

1. ✅ Foundation: config, registry, design tokens, header/footer/search/theme, homepage, category hubs, site pages, 404, `.htaccess`, deploy workflow, tests and SEO checker
2. ✅ Redesign: palette, font, cards, header, mobile layout, ad slots
3. ✅ All 15 Phase 1 calculators: page template, shared calculator UI, logic + tests, content (owner asked for all at once, 2026-09-28)
4. Launch checks: owner content review (About team names, contact email, legal review), AdSense IDs, Hostinger FTP secrets

## How to work

- Work in small stages and stop for my review at the end of each stage
- Put calculator math in pure functions and test each one with a few known answers before building its page
- After each stage: run `npm run build` with no errors or warnings, check pages at mobile width, and commit with a clear message
- Ask me before adding any dependency not listed here
- Keep this file up to date when we make decisions that change the plan
