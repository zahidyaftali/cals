import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { calculators, categories, getCalculator } from './calculators.ts';

const pagesDir = new URL('../pages/', import.meta.url);
const entries = [...categories, ...calculators];

test('slugs are unique, lowercase and hyphenated', () => {
  const slugs = entries.map((e) => e.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug');
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, slug);
});

test('titles and meta descriptions are unique', () => {
  const titles = entries.map((e) => e.title);
  const descriptions = entries.map((e) => e.metaDescription);
  assert.equal(new Set(titles).size, titles.length, 'duplicate title');
  assert.equal(new Set(descriptions).size, descriptions.length, 'duplicate meta description');
});

test('titles stay within 70 characters and end with the brand', () => {
  for (const { slug, title } of entries) {
    assert.ok(title.length <= 70, `${slug}: title is ${title.length} chars`);
    assert.ok(title.endsWith(' | Infinite Calculators'), `${slug}: title missing brand`);
  }
});

test('meta descriptions are 140–155 characters', () => {
  for (const { slug, metaDescription: d } of entries) {
    assert.ok(d.length >= 140 && d.length <= 155, `${slug}: meta description is ${d.length} chars`);
  }
});

test('calculator name, title and meta description contain the main keyword', () => {
  for (const c of calculators) {
    const keyword = c.keyword.toLowerCase();
    assert.ok(c.name.toLowerCase().includes(keyword), `${c.slug}: name (H1) missing keyword`);
    assert.ok(c.title.toLowerCase().includes(keyword), `${c.slug}: title missing keyword`);
    assert.ok(c.metaDescription.toLowerCase().includes(keyword), `${c.slug}: meta description missing keyword`);
  }
});

test('each calculator lists 3–4 existing related calculators, not itself', () => {
  for (const c of calculators) {
    assert.ok(c.related.length >= 3 && c.related.length <= 4, `${c.slug}: ${c.related.length} related`);
    assert.ok(!c.related.includes(c.slug), `${c.slug}: related to itself`);
    for (const slug of c.related) assert.doesNotThrow(() => getCalculator(slug), `${c.slug}: unknown related ${slug}`);
  }
});

test('calculators use a known category and a valid updated date', () => {
  const categorySlugs = new Set(categories.map((c) => c.slug));
  for (const c of calculators) {
    assert.ok(categorySlugs.has(c.category), `${c.slug}: unknown category ${c.category}`);
    assert.match(c.updated, /^\d{4}-\d{2}-\d{2}$/, `${c.slug}: updated`);
    assert.ok(!Number.isNaN(Date.parse(c.updated)), `${c.slug}: updated is not a real date`);
  }
});

test('every live calculator has a page, and no planned one does', () => {
  for (const c of calculators) {
    const page = new URL(`${c.category}/${c.slug}/index.astro`, pagesDir);
    if (c.status === 'live') assert.ok(existsSync(page), `${c.slug}: live but page is missing`);
    else assert.ok(!existsSync(page), `${c.slug}: page exists but status is planned`);
  }
});

test('4–8 calculators are featured on the homepage', () => {
  const featured = calculators.filter((c) => c.featured).length;
  assert.ok(featured >= 4 && featured <= 8, `${featured} featured`);
});
