import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://passportradio.online';
const MARK = '<!-- PASSPORT TRAFFIC SEO V1 -->';
const DRY = process.argv.includes('--dry-run');
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const clean = s => decode(s.replace(/<[^>]+>/g, '').trim());
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function* walk(dir) {
  let entries; try { entries = await fs.readdir(path.join(ROOT, dir), {withFileTypes:true}); } catch { return; }
  for (const e of entries) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) yield* walk(rel);
    else if (e.isFile() && e.name.endsWith('.html')) yield rel;
  }
}
function metadata(html, rel) {
  const title = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const heading = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
  const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1];
  const description = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)/i)?.[1];
  return {title, heading, description:description ? decode(description):undefined, url:canonical || SITE+'/'+rel};
}
function schema(html, rel, kind) {
  const m = metadata(html,rel);
  if (kind==='band') return {'@context':'https://schema.org','@type':'MusicGroup',name:m.heading || m.title.split('|')[0].trim(),url:m.url};
  if (kind==='article') return {'@context':'https://schema.org','@type':'Article',headline:m.heading || m.title,url:m.url,description:m.description,publisher:{'@type':'Organization',name:'Passport Radio'}};
  const productName = m.heading || m.title.split('|')[0].trim();
  const price = html.match(/(?:R\$\s*)(\d[\d.]*(?:,\d{2})?)/)?.[1]?.replace(/\./g,'').replace(',','.');
  const item = {'@context':'https://schema.org','@type':'Product',name:productName,url:m.url};
  if (price) item.offers={'@type':'Offer',price,priceCurrency:'BRL',url:m.url};
  return item;
}
function hasSchema(html,kind) {
  const type = {band:'MusicGroup',article:'Article',product:'Product'}[kind];
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .some(m => {try {return JSON.stringify(JSON.parse(m[1])).includes('"'+type+'"');} catch {return false;}});
}
function links(name) {
  return '<section class="passport-traffic-related" aria-label="Continue na Passport" style="margin:2rem 0;padding:1.5rem 0;border-top:2px solid #C41E3A;color:#111111">'+
  '<h2 style="font-family:Bodoni Moda,serif">CONTINUE NA PASSPORT</h2><p>'+esc(name)+'</p>'+
  '<p><a href="/loja.html?q='+encodeURIComponent(name)+'">Loja: buscar '+esc(name)+'</a> · '+
  '<a href="/radio.html">Ouvir na Passport</a> · '+
  '<a href="/blog/arquivo/letras.html">Acervo A–Z</a></p></section>';
}
let scanned=0, changed=0, skipped=0;
for (const dir of ['blog/e','editorial','blog','loja/p']) {
  for await (const rel of walk(dir)) {
    if (dir==='blog' && (rel.startsWith('blog/e/') || !rel.startsWith('blog/w/'))) continue;
    if (dir==='editorial' && rel==='editorial/index.html') continue;
    const kind=rel.startsWith('blog/e/')?'band':rel.startsWith('loja/p/')?'product':'article';
    scanned++;
    const file=path.join(ROOT,rel);let html=await fs.readFile(file,'utf8');
    if (html.includes(MARK)) {skipped++;continue;}
    let additions='';
    if (!hasSchema(html,kind)) {
      const json=JSON.stringify(schema(html,rel,kind)).replace(/</g,'\\u003c');
      if (/<\/head>/i.test(html)) html=html.replace(/<\/head>/i,MARK+'\n<script type="application/ld+json">'+json+'</script>\n</head>');
      else {skipped++;continue;}
    }
    if (kind==='band' && !html.includes('passport-traffic-related')) {
      const m=metadata(html,rel);
      const name=m.heading || m.title.split('|')[0].trim();
      additions=links(name);
    }
    if (additions) html=html.replace(/<\/main>/i,additions+'\n</main>');
    if (!html.includes(MARK)) html=html.replace(/<\/head>/i,MARK+'\n</head>');
    if (!DRY) await fs.writeFile(file,html);
    changed++;
  }
}
console.log(JSON.stringify({dryRun:DRY,scanned,changed,skipped}));
