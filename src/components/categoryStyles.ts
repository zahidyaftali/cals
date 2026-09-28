import type { CategorySlug } from '../data/calculators.ts';

// Tint for each category's icon chip. Full class strings so Tailwind finds them.
export const categoryTint: Record<CategorySlug, string> = {
  'time-date': 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  'home-diy': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  money: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  school: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  islamic: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  christian: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  cultural: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};
