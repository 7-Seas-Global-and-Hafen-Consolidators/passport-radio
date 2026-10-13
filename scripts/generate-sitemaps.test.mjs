import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {generate,FILES,escapeXml} from './generate-sitemaps.mjs';
test('nine unique maps: every head inspected; robots, redirects, canonical targets, private boundaries and original valid URLs',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'passport-sitemap-'));
 try{
 const pages={'index.html':'<html><head></head></html>','blog/e/noindex.html':'<html><meta content="noindex" name="robots"></html>','blog/e/testament.html':'<html><link href="https://www.passportradio.online/blog/e/testament.html" rel="canonical"></html>','blog/redirect.html':'<html><meta http-equiv="refresh" content="0;url=/blog/final.html"></html>','blog/final.html':'<html><meta name="lastmod" content="2026-99-99"></html>','blog/alias.html':'<html><link href="/blog/final.html" rel="canonical"></html>','blog/external.html':'<html><link href="https://external.test/" rel="canonical"></html>','blog/unquoted.html':'<html><meta name=robots content=noindex></html>','blog/comment.html':'<html><head><!-- <meta name="robots" content="noindex"> --><script>const template=\'<meta name="robots" content="noindex">\';</script></head></html>','loja/p/1.html':'<html><meta property="article:modified_time" content="2026-10-12T10:00:00Z"></html>','agenda/show.html':'<html>{"@type":"MusicEvent"}</html>','agenda/index.html':'<html>{"@type":"MusicEvent"}</html>','radio/one.html':'<html></html>','podcast/one.html':'<html></html>','jogos/one.html':'<html></html>','checkout.html':'<html></html>','docs/private.html':'<html></html>','foundation-preview.html':'<html></html>'};
 for(const [p,body] of Object.entries(pages)){fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),body);}
 fs.writeFileSync(path.join(root,'sitemap.xml'),'<urlset><url><loc>https://www.passportradio.online/loja/p/1.html</loc></url></urlset>');
 const r=generate(root);assert.equal(r.total,10);assert.equal(r.heads_checked,15);assert.equal(r.excluded,5);assert.equal(r.previous_indexable_public_urls_preserved,1);assert.equal(r.counts['sitemap-bandas.xml'],1);assert.equal(r.counts['sitemap-radios.xml'],1);assert.equal(r.counts['sitemap-shows.xml'],1);assert.equal(r.counts['sitemap-agenda.xml'],1);
 const all=FILES.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('');assert(all.includes('testament.html'));assert(all.includes('/blog/final.html'));assert(all.includes('/blog/comment.html'));for(const name of ['noindex.html','redirect.html','alias.html','external.html','unquoted.html','checkout.html','private.html','foundation-preview'])assert(!all.includes(name),name);assert(!all.includes('2026-99-99'));assert(all.includes('<lastmod>2026-10-12</lastmod>'));assert.equal([...all.matchAll(/<loc>(.*?)<\/loc>/g)].length,10);
 const log=JSON.parse(fs.readFileSync(path.join(root,'docs/sitemaps/exclusions.json'),'utf8'));assert.deepEqual(log.map(e=>e.reason).sort(),['canonical','canonical','noindex','noindex','redirect']);assert(log.some(e=>e.reason==='redirect'&&e.target==='https://passportradio.online/blog/final.html'));generate(root,{check:true});assert.equal(escapeXml('&<>"\''),'&amp;&lt;&gt;&quot;&apos;');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
