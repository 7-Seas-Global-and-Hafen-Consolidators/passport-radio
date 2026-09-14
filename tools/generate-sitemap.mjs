#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ORIGIN = 'https://passportradio.online';
const EXCLUDED_DIRS = new Set(['.git', '.github', 'node_modules', 'build']);
const EXCLUDED_FILES = new Set([
  'index-95x.html',
  'passport-player-v2.html',
  'exposicao.html',
  'instrument-masters.html'
]);

function walk(dir = ROOT) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name))) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function canonicalFrom(html, relative) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  if (match) {
    try {
      const u = new URL(match[1], `${ORIGIN}/`);
      if (u.hostname.replace(/^www\./, '') === 'passportradio.online') {
        u.protocol = 'https:';
        u.hostname = 'passportradio.online';
        u.hash = '';
        u.search = '';
        return u.toString();
      }
    } catch {}
  }
  return `${ORIGIN}/${relative === 'index.html' ? '' : relative}`;
}

const urls = new Map();
for (const full of walk()) {
  const relative = path.relative(ROOT, full).split(path.sep).join('/');
  if (EXCLUDED_FILES.has(relative)) continue;
  const html = fs.readFileSync(full, 'utf8');
  if (/<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
  if (/<meta\s+[^>]*http-equiv=["']refresh["']/i.test(html)) continue;
  const canonical = canonicalFrom(html, relative);
  const expectedPath = relative === 'index.html' ? '/' : `/${relative}`;
  const canonicalPath = new URL(canonical).pathname;
  if (canonicalPath !== expectedPath) continue;
  const stat = fs.statSync(full);
  urls.set(canonical, stat.mtime.toISOString().slice(0, 10));
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([loc,lastmod])=>`  <url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync('sitemap.xml', xml);
console.log('sitemap.xml', urls.size);
