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

  // Structured data must parse
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json);
    } catch {
      fail('invalid JSON-LD');
    }
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

  // Every visible form control has a label
  for (const [tag] of html.matchAll(/<(?:input|select|textarea)\s[^>]*>/g)) {
    if (/type="(hidden|submit|button|reset)"/.test(tag)) continue;
    const id = attr(tag, 'id');
    const labelled =
      attr(tag, 'aria-label') || attr(tag, 'aria-labelledby') || (id && html.includes(`<label for="${id}"`));
    if (!labelled) fail(`unlabelled control: ${tag.slice(0, 80)}`);
  }
}

// Sitemap must not list noindex pages
const sitemap = existsSync(path.join(dist, 'sitemap-0.xml')) ? readFileSync(path.join(dist, 'sitemap-0.xml'), 'utf8') : '';
if (!sitemap) errors.push('sitemap-0.xml missing');
if (sitemap.includes('/404')) errors.push('sitemap lists the 404 page');

for (const note of notes) console.log(`note  ${note}`);
for (const error of errors) console.error(`error ${error}`);
console.log(`\nChecked ${files.length} pages: ${errors.length} error(s), ${notes.length} note(s).`);
process.exit(errors.length ? 1 : 0);
