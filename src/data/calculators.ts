/**
 * The single registry of categories and calculators. The homepage, category
 * hubs, header navigation, related links, breadcrumbs, search index and
 * sitemap dates are all generated from this file.
 *
 * To add a calculator: add an entry below, then create
 * src/pages/<category>/<slug>/index.astro and its logic file in
 * src/scripts/calculators/. Set `status: 'live'` once the page exists
 * (the registry test fails if a live entry has no page).
 */

export type CategorySlug =
  | 'time-date'
  | 'home-diy'
  | 'money'
  | 'school'
  | 'islamic'
  | 'christian'
  | 'cultural';

export interface Category {
  slug: CategorySlug;
  /** Short label for navigation and breadcrumbs. */
  name: string;
  h1: string;
  title: string;
  metaDescription: string;
  /** One or two sentences shown under the H1 and on the homepage. */
  intro: string;
}

export interface Calculator {
  slug: string;
  category: CategorySlug;
  /** Display name, also used as the H1. Contains the main keyword. */
  name: string;
  /** One sentence for cards and search results. */
  description: string;
  title: string;
  metaDescription: string;
  keyword: string;
  /** Extra search terms for the site search box. */
  searchTerms?: string;
  /** 3–4 slugs of related calculators. */
  related: string[];
  /** Date the page content was last updated (YYYY-MM-DD). */
  updated: string;
  /** `planned` entries are listed as "coming soon" and never linked. */
  status: 'live' | 'planned';
  /** Shown under "Popular calculators" on the homepage. */
  featured?: boolean;
}

export const categories: Category[] = [
  {
    slug: 'time-date',
    name: 'Time & Date',
    h1: 'Time and Date Calculators',
    title: 'Time and Date Calculators | Infinite Calculators',
    metaDescription:
      'Free time and date calculators: total the hours on a time card, find the time between two times, count the days between dates, and add days to a date.',
    intro:
      'Total the hours on a time card, measure the time between two moments, and count or add days on the calendar.',
  },
  {
    slug: 'home-diy',
    name: 'Home & DIY',
    h1: 'Home and DIY Calculators',
    title: 'Home and DIY Calculators | Infinite Calculators',
    metaDescription:
      'Free home and DIY calculators for concrete, square footage and paint. Enter your measurements in feet or metres and see how much material to buy.',
    intro:
      'Measure a room, a slab or a wall and find out how much concrete, flooring or paint to buy before you head to the store.',
  },
  {
    slug: 'money',
    name: 'Money',
    h1: 'Money Calculators',
    title: 'Money Calculators | Infinite Calculators',
    metaDescription:
      'Free money calculators for everyday spending: work out a tip and split the bill, find a sale price after a discount, and add US state sales tax.',
    intro: 'Quick answers at the checkout and the restaurant table: tips, discounts and sales tax.',
  },
  {
    slug: 'school',
    name: 'School',
    h1: 'School and Grade Calculators',
    title: 'School and Grade Calculators | Infinite Calculators',
    metaDescription:
      'Free school and grade calculators for students. Find the score you need on your final exam to get the course grade you want, with the formula shown.',
    intro: 'Work out the scores you need and see exactly how your grade is put together.',
  },
  {
    slug: 'islamic',
    name: 'Islamic',
    h1: 'Islamic Calculators',
    title: 'Islamic Calculators – Zakat & Hijri | Infinite Calculators',
    metaDescription:
      'Free Islamic calculators: work out the zakat due on your wealth with the gold or silver nisab, and convert dates between Hijri and Gregorian calendars.',
    intro:
      'Calculate zakat and convert Hijri dates, with the method used stated clearly on every page.',
  },
  {
    slug: 'christian',
    name: 'Christian',
    h1: 'Christian Calendar Calculators',
    title: 'Christian Calendar Calculators | Infinite Calculators',
    metaDescription:
      'Free Christian calendar calculators. Find the date of Easter Sunday in any year for both the Western and Orthodox churches, with the method explained.',
    intro: 'Find the dates of Easter and other moveable feasts for Western and Orthodox churches.',
  },
  {
    slug: 'cultural',
    name: 'Cultural',
    h1: 'Religious and Cultural Calendar Calculators',
    title: 'Religious and Cultural Calculators | Infinite Calculators',
    metaDescription:
      'Free calculators for religious and cultural calendars, starting with a Chinese zodiac calculator that uses your full birth date and the Lunar New Year.',
    intro: 'Calendars and traditions from other faiths and cultures, starting with the Chinese zodiac.',
  },
];

export const calculators: Calculator[] = [
  // ── Time & Date ─────────────────────────────────────────────
  {
    slug: 'hours-calculator',
    category: 'time-date',
    name: 'Hours Calculator',
    description:
      'Add up the hours worked from start and end times, minus breaks, for a daily or weekly time card.',
    title: 'Hours Calculator – Time Card & Breaks | Infinite Calculators',
    metaDescription:
      'Free hours calculator for time cards. Enter start and end times and unpaid breaks to total the hours worked each day and week, in decimal and h:mm.',
    keyword: 'hours calculator',
    searchTerms: 'time card timesheet work hours payroll shift clock in out',
    related: ['time-duration-calculator', 'days-between-dates', 'date-calculator'],
    updated: '2026-09-28',
    status: 'planned',
    featured: true,
  },
  {
    slug: 'time-duration-calculator',
    category: 'time-date',
    name: 'Time Duration Calculator',
    description:
      'Find the exact time between two clock times or date-times, in hours, minutes and seconds.',
    title: 'Time Duration Calculator | Infinite Calculators',
    metaDescription:
      'Free time duration calculator. Enter a start and end time, with optional dates, to get the exact time between them in hours, minutes and seconds.',
    keyword: 'time duration calculator',
    searchTerms: 'time between times elapsed time difference hours minutes',
    related: ['hours-calculator', 'days-between-dates', 'date-calculator'],
    updated: '2026-09-28',
    status: 'planned',
  },
  {
    slug: 'days-between-dates',
    category: 'time-date',
    name: 'Days Between Dates Calculator',
    description:
      'Count the days, weeks and months between two dates, or count weekdays only.',
    title: 'Days Between Dates Calculator | Infinite Calculators',
    metaDescription:
      'Count the days between dates with this free calculator. Get the total in days, weeks and months, include the end date, or count weekdays only.',
    keyword: 'days between dates',
    searchTerms: 'date difference how many days until countdown business days weekdays',
    related: ['date-calculator', 'time-duration-calculator', 'hours-calculator'],
    updated: '2026-09-28',
    status: 'planned',
    featured: true,
  },
  {
    slug: 'date-calculator',
    category: 'time-date',
    name: 'Date Calculator',
    description:
      'Add or subtract days, weeks, months or years from a date to find the resulting date.',
    title: 'Date Calculator – Add & Subtract Days | Infinite Calculators',
    metaDescription:
      'Free date calculator to add or subtract days, weeks, months or years from any date. See the resulting date and day of the week, with leap years handled.',
    keyword: 'date calculator',
    searchTerms: 'add days to date subtract days from date days from today deadline',
    related: ['days-between-dates', 'time-duration-calculator', 'hours-calculator'],
    updated: '2026-09-28',
    status: 'planned',
    featured: true,
  },

  // ── Home & DIY ──────────────────────────────────────────────
  {
    slug: 'concrete-calculator',
    category: 'home-diy',
    name: 'Concrete Calculator',
    description:
      'Work out the cubic yards or cubic metres of concrete for a slab, footing or column, and the bags to buy.',
    title: 'Concrete Calculator – Slabs, Footings & Bags | Infinite Calculators',
    metaDescription:
      'Free concrete calculator for slabs, footings and columns. Get the volume in cubic yards or cubic metres and the number of 40, 60 or 80 lb bags to buy.',
    keyword: 'concrete calculator',
    searchTerms: 'cement slab footing column post hole cubic yards bags quikrete sakrete',
    related: ['square-footage-calculator', 'paint-calculator', 'sales-tax-calculator'],
    updated: '2026-09-28',
    status: 'planned',
    featured: true,
  },
  {
    slug: 'square-footage-calculator',
    category: 'home-diy',
    name: 'Square Footage Calculator',
    description:
      'Find the area of a room or floor in square feet and square metres, including L-shaped rooms.',
    title: 'Square Footage Calculator | Infinite Calculators',
    metaDescription:
      'Free square footage calculator for rooms and floors. Add rectangles, triangles and circles in feet, inches or metres to get the total area in sq ft and m².',
    keyword: 'square footage calculator',
    searchTerms: 'area sq ft square feet square meters room floor flooring carpet',
    related: ['paint-calculator', 'concrete-calculator', 'sales-tax-calculator'],
    updated: '2026-09-28',
    status: 'planned',
    featured: true,
  },
  {
    slug: 'paint-calculator',
    category: 'home-diy',
    name: 'Paint Calculator',
    description:
      'Estimate how many gallons or litres of paint you need for walls and ceilings, minus doors and windows.',
    title: 'Paint Calculator – Walls & Ceilings | Infinite Calculators',
    metaDescription:
      'Free paint calculator. Enter your wall sizes, doors and windows to see how many gallons or litres of paint you need for one or two coats on a room.',
    keyword: 'paint calculator',
    searchTerms: 'how much paint gallons litres liters wall ceiling room coats',
    related: ['square-footage-calculator', 'concrete-calculator', 'discount-calculator'],
    updated: '2026-09-28',
    status: 'planned',
  },

  // ── Money ───────────────────────────────────────────────────
  {
    slug: 'tip-calculator',
    category: 'money',
    name: 'Tip Calculator',
    description:
      'Work out the tip and total for any bill, then split it evenly between any number of people.',
    title: 'Tip Calculator – Split the Bill | Infinite Calculators',
    metaDescription:
      'Free tip calculator with bill splitting. Choose a tip percentage, see the tip and the total, and split the bill evenly between any number of people.',
    keyword: 'tip calculator',
    searchTerms: 'gratuity restaurant split bill per person 15 18 20 percent',
    related: ['sales-tax-calculator', 'discount-calculator', 'hours-calculator'],
    updated: '2026-09-28',
    status: 'planned',
    featured: true,
  },
  {
    slug: 'discount-calculator',
    category: 'money',
    name: 'Discount Calculator',
    description:
      'Find the sale price and how much you save after a percentage or fixed discount, including double discounts.',
    title: 'Discount Calculator – Sale Price | Infinite Calculators',
    metaDescription:
      'Free discount calculator to find the sale price and your savings. Works with percent-off and fixed-amount discounts, and with stacked double discounts.',
    keyword: 'discount calculator',
    searchTerms: 'percent off sale price savings coupon markdown',
    related: ['sales-tax-calculator', 'tip-calculator', 'paint-calculator'],
    updated: '2026-09-28',
    status: 'planned',
  },
  {
    slug: 'sales-tax-calculator',
    category: 'money',
    name: 'Sales Tax Calculator',
    description:
      'Add sales tax to a price or remove it from a total, using any US state base rate or your own local rate.',
    title: 'Sales Tax Calculator by US State | Infinite Calculators',
    metaDescription:
      'Free sales tax calculator for all 50 US states. Add tax to a price or work back from a total using your state base rate or your full local rate.',
    keyword: 'sales tax calculator',
    searchTerms: 'state tax rate reverse sales tax price before tax usa',
    related: ['discount-calculator', 'tip-calculator', 'concrete-calculator'],
    updated: '2026-09-28',
    status: 'planned',
    featured: true,
  },

  // ── School ──────────────────────────────────────────────────
  {
    slug: 'final-grade-calculator',
    category: 'school',
    name: 'Final Grade Calculator',
    description:
      'Find the score you need on your final exam to reach the course grade you want.',
    title: 'Final Grade Calculator | Infinite Calculators',
    metaDescription:
      'Free final grade calculator. Enter your current grade, your target grade and how much the final is worth to see the score you need on the final exam.',
    keyword: 'final grade calculator',
    searchTerms: 'final exam score needed what do i need grade percentage',
    related: ['days-between-dates', 'date-calculator', 'time-duration-calculator'],
    updated: '2026-09-28',
    status: 'planned',
  },

  // ── Islamic ─────────────────────────────────────────────────
  {
    slug: 'zakat-calculator',
    category: 'islamic',
    name: 'Zakat Calculator',
    description:
      'Calculate the zakat due on your savings, gold, silver and investments at 2.5%, using the gold or silver nisab.',
    title: 'Zakat Calculator – Gold & Silver Nisab | Infinite Calculators',
    metaDescription:
      'Free zakat calculator using the gold or silver nisab. Add your cash, gold, silver, investments and debts to see if zakat is due and how much to pay.',
    keyword: 'zakat calculator',
    searchTerms: 'zakah nisab gold silver 2.5 percent wealth charity',
    related: ['hijri-date-converter', 'days-between-dates', 'date-calculator'],
    updated: '2026-09-28',
    status: 'planned',
    featured: true,
  },
  {
    slug: 'hijri-date-converter',
    category: 'islamic',
    name: 'Hijri Date Converter',
    description:
      'Convert dates between the Gregorian and Islamic Hijri calendars using the Umm al-Qura calendar.',
    title: 'Hijri Date Converter (Umm al-Qura) | Infinite Calculators',
    metaDescription:
      'Free Hijri date converter. Convert Gregorian dates to the Islamic Hijri calendar and back using the Umm al-Qura calendar, with notes on moon sighting.',
    keyword: 'hijri date converter',
    searchTerms: 'islamic calendar gregorian to hijri hijri to gregorian umm al-qura ramadan',
    related: ['zakat-calculator', 'easter-date-calculator', 'chinese-zodiac-calculator', 'days-between-dates'],
    updated: '2026-09-28',
    status: 'planned',
  },

  // ── Christian ───────────────────────────────────────────────
  {
    slug: 'easter-date-calculator',
    category: 'christian',
    name: 'Easter Date Calculator',
    description:
      'Find the date of Western and Orthodox Easter Sunday for any year from 1583 onward.',
    title: 'Easter Date Calculator – Any Year | Infinite Calculators',
    metaDescription:
      'Free Easter date calculator. Find the date of Easter Sunday for any year from 1583, for both Western (Catholic and Protestant) and Orthodox churches.',
    keyword: 'easter date calculator',
    searchTerms: 'when is easter orthodox easter computus good friday',
    related: ['hijri-date-converter', 'chinese-zodiac-calculator', 'date-calculator', 'days-between-dates'],
    updated: '2026-09-28',
    status: 'planned',
  },

  // ── Cultural ────────────────────────────────────────────────
  {
    slug: 'chinese-zodiac-calculator',
    category: 'cultural',
    name: 'Chinese Zodiac Calculator',
    description:
      'Find your Chinese zodiac animal and element from your exact birth date, with the Lunar New Year taken into account.',
    title: 'Chinese Zodiac Calculator by Birth Date | Infinite Calculators',
    metaDescription:
      'Free Chinese zodiac calculator. Enter your birth date to find your zodiac animal and element, with the Lunar New Year boundary taken into account.',
    keyword: 'chinese zodiac calculator',
    searchTerms: 'chinese zodiac sign animal year element lunar new year',
    related: ['hijri-date-converter', 'easter-date-calculator', 'days-between-dates'],
    updated: '2026-09-28',
    status: 'planned',
  },
];

// ── Helpers ───────────────────────────────────────────────────

export const liveCalculators = calculators.filter((c) => c.status === 'live');

export const featuredCalculators = calculators.filter((c) => c.featured);

export function getCategory(slug: CategorySlug): Category {
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw new Error(`Unknown category: ${slug}`);
  return category;
}

export function getCalculator(slug: string): Calculator {
  const calculator = calculators.find((c) => c.slug === slug);
  if (!calculator) throw new Error(`Unknown calculator: ${slug}`);
  return calculator;
}

export function categoryUrl(slug: CategorySlug): string {
  return `/${slug}/`;
}

export function calculatorUrl(calculator: Pick<Calculator, 'category' | 'slug'>): string {
  return `/${calculator.category}/${calculator.slug}/`;
}

/** All calculators in a category, live ones first, in registry order. */
export function calculatorsIn(slug: CategorySlug): Calculator[] {
  const inCategory = calculators.filter((c) => c.category === slug);
  return [
    ...inCategory.filter((c) => c.status === 'live'),
    ...inCategory.filter((c) => c.status === 'planned'),
  ];
}

/** Live related calculators for a calculator page. */
export function relatedTo(calculator: Calculator): Calculator[] {
  return calculator.related
    .map(getCalculator)
    .filter((c) => c.status === 'live');
}

function latest(dates: string[]): string | undefined {
  return dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : undefined;
}

/**
 * Last-updated date for the sitemap: a calculator's own date, or the newest
 * live calculator date for a category hub and the homepage.
 */
export function lastUpdatedFor(pathname: string): Date | undefined {
  let iso: string | undefined;
  if (pathname === '/') {
    iso = latest(liveCalculators.map((c) => c.updated));
  } else {
    const calculator = liveCalculators.find((c) => calculatorUrl(c) === pathname);
    const category = categories.find((c) => categoryUrl(c.slug) === pathname);
    if (calculator) iso = calculator.updated;
    else if (category) {
      iso = latest(liveCalculators.filter((c) => c.category === category.slug).map((c) => c.updated));
    }
  }
  return iso ? new Date(`${iso}T00:00:00Z`) : undefined;
}
