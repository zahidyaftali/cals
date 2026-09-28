// Checks every built page in dist/ against the SEO rules in CLAUDE.md.
// Run after `npm run build`: `npm run check`. Exits 1 on any error.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://infinitecalculators.com';
const dist = path.resolve('dist');
const errors = [];
const notes = [];

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });
}

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const metaContent = (html, key, value) => {
  const tag = html.match(new RegExp(`<meta[^>]*\\s${key}="${value}"[^>]*>`))?.[0];
  return tag ? decode(attr(tag, 'content') ?? '') : undefined;
};

/** Does a root-relative link point at something in dist/? */
function linkResolves(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return true;
  const target = path.join(dist, decodeURIComponent(clean));
  if (clean.endsWith('/')) return existsSync(path.join(target, 'index.html'));
  return existsSync(target) && statSync(target).isFile();
}

const titles = new Map();
const descriptions = new Map();
const wordCounts = [];

const files = htmlFiles(dist);
for (const file of files) {
  const rel = path.relative(dist, file).split(path.sep).join('/');
  const urlPath = rel === '404.html' ? '/404/' : `/${rel.replace(/index\.html$/, '')}`;
  const html = readFileSync(file, 'utf8');
  const fail = (msg) => errors.push(`${urlPath}: ${msg}`);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);

  // Title and description
  const titleTags = html.match(/<title>[\s\S]*?<\/title>/g) ?? [];
  if (titleTags.length !== 1) fail(`${titleTags.length} <title> tags`);
  const title = decode(titleTags[0]?.replace(/<\/?title>/g, '') ?? '');
  if (title.length > 70) fail(`title is ${title.length} chars`);
  else if (title.length > 60) notes.push(`${urlPath}: title is ${title.length} chars (aim for 60)`);
  const description = metaContent(html, 'name', 'description');
  if (!description) fail('missing meta description');
  else if (!noindex && (description.length < 140 || description.length > 155)) {
    fail(`meta description is ${description.length} chars (want 140–155)`);
  }
  if (!noindex) {
    if (titles.has(title)) fail(`title duplicates ${titles.get(title)}`);
    if (descriptions.has(description)) fail(`meta description duplicates ${descriptions.get(description)}`);
    titles.set(title, urlPath);
    descriptions.set(description, urlPath);
  }

  // Indexing
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (rel === '404.html') {
    if (!noindex) fail('404 page must be noindex');
  } else if (noindex) {
    fail('unexpected noindex');
  } else if (canonical !== `${SITE}${urlPath}`) {
    fail(`canonical is ${canonical ?? 'missing'}, expected ${SITE}${urlPath}`);
  }

  // Headings
  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) fail(`${h1s.length} <h1> elements`);

  // Social tags
  for (const [key, value] of [
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:image'],
    ['property', 'og:url'],
    ['name', 'twitter:card'],
  ]) {
    if (!metaContent(html, key, value)) fail(`missing ${value}`);
  }

  // Structured data must parse, and each page type needs its schema types
  const types = new Set();
  let questions = 0;
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(json);
      for (const node of data['@graph'] ?? [data]) {
        types.add(node['@type']);
        if (node['@type'] === 'FAQPage') questions = node.mainEntity?.length ?? 0;
      }
    } catch {
      fail('invalid JSON-LD');
    }
  }
  const depth = urlPath.split('/').filter(Boolean).length;
  const isCalculator = depth === 2 && types.has('WebApplication');
  const required =
    urlPath === '/'
      ? ['Organization', 'WebSite']
      : isCalculator
        ? ['WebApplication', 'FAQPage', 'BreadcrumbList']
        : depth === 1 && types.has('CollectionPage')
          ? ['CollectionPage', 'BreadcrumbList']
          : [];
  for (const type of required) if (!types.has(type)) fail(`missing ${type} schema`);

  // Calculator pages: 5 FAQs and 600–1,000+ words of written content
  if (isCalculator) {
    if (questions !== 5) fail(`${questions} FAQs in schema (want 5)`);
    const start = html.indexOf('<div class="prose');
    const end = html.indexOf('related-title');
    const text = html
      .slice(start, end > start ? end : undefined)
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z#0-9]+;/gi, ' ');
    const words = text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
    if (words < 600) fail(`only ${words} words of content (want 600+)`);
    else if (words > 1200) notes.push(`${urlPath}: ${words} words of content`);
    wordCounts.push(`${urlPath} ${words}`);
  }

  // Landmarks
  if (!/<main[\s>]/.test(html)) fail('missing <main>');

  // Internal links
  for (const [, href] of html.matchAll(/<a\s[^>]*href="(\/[^"]*)"/g)) {
    if (href.startsWith('//')) continue;
    if (!linkResolves(href)) fail(`broken link ${href}`);
    const pathPart = href.split(/[?#]/)[0];
    if (!pathPart.endsWith('/') && !/\.[a-z0-9]+$/i.test(pathPart)) fail(`link without trailing slash ${href}`);
  }

  // Images need size and alt text
  for (const [tag] of html.matchAll(/<img\s[^>]*>/g)) {
    if (!attr(tag, 'width') || !attr(tag, 'height')) fail(`<img> without width/height: ${tag.slice(0, 80)}`);
    if (attr(tag, 'alt') === undefined) fail(`<img> without alt: ${tag.slice(0, 80)}`);
  }

  // Every visible form control has a label: label[for], aria-label, or a wrapping <label>
  const wrapping = [...html.matchAll(/<label(?:\s[^>]*)?>[\s\S]*?<\/label>/g)].map((m) => [m.index, m.index + m[0].length]);
  for (const match of html.matchAll(/<(?:input|select|textarea)\s[^>]*>/g)) {
    const tag = match[0];
    if (/type="(hidden|submit|button|reset)"/.test(tag)) continue;
    const id = attr(tag, 'id');
    const labelled =
      attr(tag, 'aria-label') ||
      attr(tag, 'aria-labelledby') ||
      (id && html.includes(`<label for="${id}"`)) ||
      wrapping.some(([a, b]) => match.index > a && match.index < b);
    if (!labelled) fail(`unlabelled control: ${tag.slice(0, 80)}`);
  }
}

// Sitemap must not list noindex pages
const sitemap = existsSync(path.join(dist, 'sitemap-0.xml')) ? readFileSync(path.join(dist, 'sitemap-0.xml'), 'utf8') : '';
if (!sitemap) errors.push('sitemap-0.xml missing');
if (sitemap.includes('/404')) errors.push('sitemap lists the 404 page');

if (process.argv.includes('--words')) for (const w of wordCounts) console.log(`words ${w}`);
for (const note of notes) console.log(`note  ${note}`);
for (const error of errors) console.error(`error ${error}`);
console.log(`\nChecked ${files.length} pages: ${errors.length} error(s), ${notes.length} note(s).`);
process.exit(errors.length ? 1 : 0);
