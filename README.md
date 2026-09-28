# Infinite Calculators

Source for [infinitecalculators.com](https://infinitecalculators.com): free online calculators built with Astro and Tailwind CSS, served as static files.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (Node 22) |
| `npm run dev` | Local dev server at `http://localhost:4321` |
| `npm test` | Registry checks and calculator logic tests |
| `npm run build` | Build the static site into `dist/` |
| `npm run check` | Check every built page against the SEO rules |

## Deployment

Every push to `main` runs the tests, builds the site, checks it, and uploads `dist/` to Hostinger by FTP. The upload runs only once these repository secrets exist (Settings → Secrets and variables → Actions):

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

Project rules and decisions are in [CLAUDE.md](CLAUDE.md).
