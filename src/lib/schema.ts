// JSON-LD builders. Pages pass the results to BaseLayout's `jsonLd` prop,
// which wraps them in a single {"@context", "@graph"} script.
import { site } from '../data/site.ts';

export type JsonLd = Record<string, unknown>;

export interface Crumb {
  name: string;
  /** Root-relative URL. Omit for the current page. */
  href?: string;
}

const abs = (path: string) => new URL(path, site.url).href;

export function organizationSchema(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    url: `${site.url}/`,
    logo: {
      '@type': 'ImageObject',
      url: abs(site.logo.src),
      width: site.logo.width,
      height: site.logo.height,
    },
    email: site.email,
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.name,
    url: `${site.url}/`,
    inLanguage: 'en',
    publisher: { '@id': `${site.url}/#organization` },
  };
}

/** `currentPath` is the URL of the last crumb (the page itself). */
export function breadcrumbSchema(crumbs: Crumb[], currentPath: string): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.href ?? currentPath),
    })),
  };
}

export function collectionPageSchema(opts: {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
}): JsonLd {
  return {
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: abs(opts.path),
    isPartOf: { '@id': `${site.url}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: abs(item.path),
      })),
    },
  };
}
