// @ts-check
import { defineConfig } from 'astro/config';
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
