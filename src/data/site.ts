export const site = {
  name: 'Infinite Calculators',
  url: 'https://infinitecalculators.com',
  tagline: 'Free online calculators for everyday questions',
  // TODO(owner): confirm this mailbox exists before launch.
  email: 'hello@infinitecalculators.com',
  defaultOgImage: {
    src: '/og-default.png',
    width: 1200,
    height: 630,
    alt: 'Infinite Calculators — free online calculators',
  },
  logo: { src: '/logo-512.png', width: 512, height: 512 },
  ads: {
    // Turn on after AdSense approval. While false, <AdSlot> renders nothing
    // in production and a dashed placeholder in development.
    enabled: false,
    client: 'ca-pub-0000000000000000',
  },
} as const;

/** Formats an ISO date (YYYY-MM-DD) as e.g. "September 28, 2026". */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
