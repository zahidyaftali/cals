export const site = {
  name: 'Infinite Calculators',
  url: 'https://infinitecalculators.com',
  tagline: 'Answers with the working shown.',
  // TODO(owner): confirm this mailbox exists before launch.
  email: 'hello@infinitecalculators.com',
  defaultOgImage: {
    src: '/og-default.png',
    width: 1200,
    height: 630,
    alt: 'Infinite Calculators — free online calculators',
  },
  logo: { src: '/logo-512.png', width: 512, height: 512 },
  owner: {
    name: 'IdeoXpert',
    url: 'https://ideoxpert.com',
  },
  ads: {
    // Turn on after AdSense approval. While false, <AdSlot> renders nothing
    // and the AdSense script is not loaded.
    enabled: false,
    // TODO(owner): your publisher ID from AdSense → Account → Account information.
    client: 'ca-pub-0000000000000000',
    // TODO(owner): one display ad unit per placement (AdSense → Ads → By ad
    // unit), so each placement's earnings can be compared.
    units: {
      homeTop: '0000000000',
      homeBottom: '0000000000',
      categoryList: '0000000000',
      calculatorTop: '0000000000',
      calculatorBottom: '0000000000',
    },
  },
} as const;

/**
 * Last content update of the site pages (for the sitemap's <lastmod>).
 * Update the date here when you edit one of these pages.
 */
const PAGE_UPDATED: Record<string, string> = {
  '/about/': '2026-09-28',
  '/editorial-policy/': '2026-09-28',
  '/contact/': '2026-09-28',
  '/privacy-policy/': '2026-09-28',
  '/terms/': '2026-09-28',
  '/disclaimer/': '2026-09-28',
};

export function pageUpdated(pathname: string): Date | undefined {
  const iso = PAGE_UPDATED[pathname];
  return iso ? new Date(`${iso}T00:00:00Z`) : undefined;
}

/** Formats an ISO date (YYYY-MM-DD) as e.g. "September 28, 2026". */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
