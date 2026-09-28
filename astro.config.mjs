// @ts-check
import { readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { lastUpdatedFor } from './src/data/calculators.ts';
import { pageUpdated } from './src/data/site.ts';

/**
 * @astrojs/sitemap writes sitemap-index.xml + sitemap-0.xml. The site has far
 * fewer than 45,000 URLs, so there is only ever one chunk: publish it as the
 * standard /sitemap.xml (which robots.txt points to) and drop the index.
 */
const singleSitemap = {
  name: 'single-sitemap',
  hooks: {
    /** @param {{ dir: URL }} options */
    'astro:build:done': async ({ dir }) => {
      const chunk = new URL('sitemap-0.xml', dir);
      if (!existsSync(chunk) || existsSync(new URL('sitemap-1.xml', dir))) return;
      await writeFile(new URL('sitemap.xml', dir), await readFile(chunk, 'utf8'));
      await rm(chunk);
      await rm(new URL('sitemap-index.xml', dir), { force: true });
    },
  },
};

export default defineConfig({
  site: 'https://infinitecalculators.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Astro 7 defaults to JSX whitespace rules, which drop the space between a
  // link and text on the next line. `true` compresses without changing text.
  compressHTML: true,
  // The site's one web font: Onest (variable, Latin subset, SIL OFL), self-hosted
  // from src/assets/fonts. Astro generates a size-matched Arial fallback so the
  // swap to Onest causes no layout shift.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Onest',
      cssVariable: '--font-onest',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/onest-latin-variable.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404/'),
      // Plain <urlset>: no image, news, video or hreflang namespaces.
      namespaces: { news: false, xhtml: false, image: false, video: false },
      serialize(item) {
        const path = new URL(item.url).pathname;
        const updated = lastUpdatedFor(path) ?? pageUpdated(path);
        return updated ? { ...item, lastmod: updated } : item;
      },
    }),
    singleSitemap,
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
