#!/usr/bin/env node
const fs=require('fs'),path=require('path'),D=path.join(__dirname,'../data'),E=[];
const man=JSON.parse(fs.readFileSync(path.join(D,'store_inventory.json'),'utf8'));let all=[];
if(Number(man?.technical_capacity?.cartao_max_installments||0)>10)E.push('manifesto: teto público de cartão acima de 10x');
for(const u of man.chunks||[]){const p=path.join(D,u.replace(/^\/data\//,''));if(!fs.existsSync(p)){E.push(`${u}: arquivo não encontrado`);continue}const raw=fs.readFileSync(p,'utf8');if(/"source_[^"]*"\s*:/i.test(raw))E.push(`${u}: contém source_*`);all=all.concat(JSON.parse(raw).products||[])}
const ids=new Set();for(const p of all){const k=p.sku||p.id;if(ids.has(k))E.push(`${k}: SKU duplicado`);ids.add(k);if(p.publish!==false&&(!(Number(p.price)>0)||!String(p.name||'').trim()))E.push(`${k}: publicável incompleto`);if(/"source_[^"]*"\s*:/i.test(JSON.stringify(p)))E.push(`${k}: source_* exposto`);if(/^https?:\/\//i.test(String(p.image||'')))E.push(`${k}: asset externo no catálogo público`)}
console.log(`📦 Total: ${all.length} · publicáveis: ${all.filter(p=>p.publish!==false&&Number(p.price)>0).length}`);if(E.length){console.error(`❌ ${E.length} erros`);E.forEach(x=>console.error('  '+x));process.exit(1)}console.log('✅ Catálogo público válido · sem source_* · sem asset externo · teto do manifesto 10x');
