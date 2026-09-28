import type { APIRoute } from 'astro';
import { categories, liveCalculators, calculatorUrl, categoryUrl, getCategory } from '../data/calculators';

// Small index fetched by the header search box on first use, so its weight
// never lands on a page that doesn't search.
export const GET: APIRoute = () => {
  const index = [
    ...liveCalculators.map((c) => ({
      t: 'calc',
      n: c.name,
      u: calculatorUrl(c),
      c: getCategory(c.category).name,
      k: [c.keyword, c.searchTerms ?? '', c.description].join(' '),
    })),
    ...categories.map((c) => ({
      t: 'cat',
      n: c.h1,
      u: categoryUrl(c.slug),
      c: c.name,
      k: c.intro,
    })),
  ];
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
