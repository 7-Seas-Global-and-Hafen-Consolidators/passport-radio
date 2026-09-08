#!/usr/bin/env node
/* PASSPORT STORE — CALCULADORA DE PREÇOS (PRIVATE → PUBLIC) */
const fs=require('fs'),path=require('path');
const PRIVATE_DIR=path.join(__dirname,'../data/_private'),PUBLIC_DIR=path.join(__dirname,'../data');
const SOURCE_MAP=path.join(PRIVATE_DIR,'store_source_map.json'),TEMPLATES=path.join(PRIVATE_DIR,'product_templates.json');
const round2=v=>Math.round(v*100)/100;
const RULES={camiseta:{multiplier:.80,pix_mult:.90,boleto_mult:.90,installments:12},lp_importado:{multiplier:1.05,pix_mult:null,boleto_mult:null,installments:12},vitrola:{multiplier:1.10,pix_mult:.95,boleto_mult:.95,installments:21},tenis:{multiplier:.65,pix_mult:.90,boleto_mult:.95,installments:10}};
function calc(sku,t,s){const r=RULES[t.type];if(!r)throw new Error(`Tipo desconhecido: ${t.type} (SKU ${sku})`);const sp=s.source_price;if(sp==null)return{id:sku,sku,type:t.type,category:t.category,name:t.name,variant:t.variant||null,price:null,pix_price:null,boleto_price:null,max_installments:r.installments,installment_interest_free:null,image:t.image||null,in_stock:false,publish:false,pending:'preço indisponível na fonte'};const price=round2(sp*r.multiplier);return{id:sku,sku,type:t.type,category:t.category,name:t.name,variant:t.variant||null,price,pix_price:r.pix_mult?round2(price*r.pix_mult):null,boleto_price:r.boleto_mult?round2(price*r.boleto_mult):null,max_installments:r.installments,installment_interest_free:null,image:t.image||null,in_stock:t.in_stock!==false,publish:true};}
function chunkOf(p){if(p.type==='vitrola')return'08';if(p.type==='camiseta'||p.type==='lp_importado')return'07';return null;}
if(!fs.existsSync(SOURCE_MAP)||!fs.existsSync(TEMPLATES)){console.error('❌ arquivos privados não encontrados');process.exit(1)}
const sm=JSON.parse(fs.readFileSync(SOURCE_MAP,'utf8')),tm=JSON.parse(fs.readFileSync(TEMPLATES,'utf8')),chunks={};
for(const [sku,t] of Object.entries(tm)){if(!sm[sku]){console.warn(`⚠️ ${sku} sem fonte`);continue}const p=calc(sku,t,sm[sku]),c=chunkOf(p);if(!c){console.warn(`⚠️ ${sku}: preservado fora desta geração; chunk já existente não será sobrescrito`);continue}(chunks[c]??=[]).push(p)}
for(const [c,products] of Object.entries(chunks)){fs.writeFileSync(path.join(PUBLIC_DIR,`store_inventory_${c}.json`),JSON.stringify({chunk_id:c,products},null,2));console.log(`✅ chunk ${c}: ${products.length}`)}
