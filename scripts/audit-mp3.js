#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'mp3-report.json');
const SKIP=new Set(['.git','node_modules']);
function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(SKIP.has(e.name))continue;const p=path.join(dir,e.name);e.isDirectory()?walk(p,out):out.push(p)}return out}
const files=walk(ROOT),mp3=files.filter(f=>/\.mp3$/i.test(f));
const textFiles=files.filter(f=>!(/\.(mp3|jpg|jpeg|png|webp|gif|ico|woff2?|ttf|zip|pdf)$/i.test(f))&&f!==OUT);
const corpus=textFiles.map(f=>{try{return [path.relative(ROOT,f),fs.readFileSync(f,'utf8')]}catch{return null}}).filter(Boolean);
const report=mp3.map(f=>{const rel=path.relative(ROOT,f).replace(/\\/g,'/'),base=path.basename(f);const refs=[];for(const [name,txt] of corpus){if(txt.includes(rel)||txt.includes(base)||txt.includes(encodeURI(rel))||txt.includes(encodeURI(base)))refs.push(name)}return{file:rel,bytes:fs.statSync(f).size,references:refs,orphan_candidate:refs.length===0}});
const summary={generated_at:new Date().toISOString(),mode:'dry-run',deleted:0,total_mp3:report.length,orphan_candidates:report.filter(x=>x.orphan_candidate).length,total_bytes:report.reduce((n,x)=>n+x.bytes,0)};
fs.writeFileSync(OUT,JSON.stringify({summary,files:report},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));console.log('DRY-RUN: nenhum arquivo foi removido.');
