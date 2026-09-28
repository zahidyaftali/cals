// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { lastUpdatedFor } from './src/data/calculators.ts';

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
      serialize(item) {
        const updated = lastUpdatedFor(new URL(item.url).pathname);
        return updated ? { ...item, lastmod: updated } : item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
