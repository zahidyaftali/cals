# Infinite Calculators — Project Brief

This file is the standing brief for this project. Read it at the start of every session and follow it for all work.

## What we are building

**infinitecalculators.com**: a free online calculator website that earns money from Google AdSense. Traffic comes from Google search, so **SEO and page speed come first in every decision.**

- Audience: mainly US, UK and Canada (English), plus Muslim users worldwide for the Islamic calculators
- Every calculator is free, needs no signup, and runs entirely in the browser
- Hosting: Hostinger (static files in `public_html`), deployed automatically from GitHub

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
6. "Last updated" date and a short disclaimer where relevant

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
- Light and dark mode (following system preference, with a toggle)
- Header: logo, category navigation, and a site search box that filters calculators from the registry (client-side, lightweight)
- Footer: category links and the About, Contact, Privacy Policy, Terms and Disclaimer pages

## Site-wide pages

- **About**: who runs the site and why (a real, honest description)
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
- CI (`deploy.yml`) runs test → build → check → FTP upload; any failure stops the deploy.

## Decisions made so far

- **Astro 7** (7.3.x). `compressHTML: true` is set because Astro 7's default (`'jsx'`) drops the space between a link and text on the next line.
- **Tailwind 4** through its official Vite plugin (`@tailwindcss/vite`). Colors are CSS variables in `src/styles/global.css` (`bg-surface`, `text-muted`, `bg-accent`, …), so dark mode mostly needs no `dark:` classes.
- **Visual design** (decided 2026-09-28): colors, font and spacing follow a Nexwealth-style reference. Lime `#b0ec6c` is a fill only (buttons, active tab bar, tags), with dark `#182c04` text on it. Text accents and links use `--accent-ink` `#4b7422`, because lime is unreadable as text on white. Deep green `#182c04` for the footer, white pages, hairline `#e8ebeb` borders.
- **Font**: Onest (variable, Latin subset, SIL OFL), self-hosted from `src/assets/fonts/` through Astro's Fonts API, which also generates a size-matched Arial fallback (CLS stays 0).
- **Layout must look hand-built, not like a template.** Avoid: pill badges above headlines, slogan headlines with a highlighted word, stats rows, mock app windows, rows of icon feature cards, cards nested in cards, decorative background patterns, everything centred. Prefer: plain keyword headlines, left-aligned content, dense directory lists, hairline rules, and plain specific copy.
- **Tests** use Node's built-in `node:test` with type stripping: no test framework dependency. Imports in files that tests load must use the `.ts` extension, and TypeScript must stay erasable (no enums or namespaces).
- **Registry** entries have `status: 'live' | 'planned'`. Planned entries show as "Coming soon" and are never linked or put in the sitemap/search. The registry test fails if a live entry has no page or a planned one does.
- **Site pages** (About, Contact, legal) use `src/layouts/InfoLayout.astro`.
- **Search** fetches `/search-index.json` (built from the registry) on first use only.
- **Ads**: `site.ads.enabled` in `src/data/site.ts`. While false, `<AdSlot>` renders nothing in production and a dashed placeholder in dev.
- Brand images in `public/` (OG image, icons, `logo-512.png`) were rendered once from SVG; the logo drawing lives in `src/components/Logo.astro` and `public/favicon.svg`.

## Stages

1. ✅ Foundation: config, registry, design tokens, header/footer/search/theme, homepage, category hubs, site pages, 404, `.htaccess`, deploy workflow, tests and SEO checker
2. Calculator page template (`CalculatorLayout`, shared input/result UI) + the four Time & Date calculators
3. Home & DIY: concrete, square footage, paint
4. Money: tip, discount, sales tax
5. School + Islamic: final grade, zakat, Hijri converter
6. Christian + Cultural: Easter, Chinese zodiac
7. Launch checks: Lighthouse on every page, content review, GitHub + Hostinger setup

## How to work

- Work in small stages and stop for my review at the end of each stage
- Put calculator math in pure functions and test each one with a few known answers before building its page
- After each stage: run `npm run build` with no errors or warnings, check pages at mobile width, and commit with a clear message
- Ask me before adding any dependency not listed here
- Keep this file up to date when we make decisions that change the plan
