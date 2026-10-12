// Passport Store — checkout server-side. Never commit credentials.
// Node.js 20+. Start: MP_ACCESS_TOKEN=... node backend/server.mjs
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 3000);
const token = process.env.MP_ACCESS_TOKEN;
const site = process.env.STORE_ORIGIN || 'https://passportradio.online';
const allowedOrigin = new URL(site).origin;
const respond = (res, status, data) => {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':allowedOrigin,'Vary':'Origin'});
  res.end(JSON.stringify(data));
};
async function inventory() {
  const data = JSON.parse(await fs.readFile(path.join(root,'data/store_inventory.json'),'utf8'));
  if (Array.isArray(data.products)) return data.products;
  if (!Array.isArray(data.chunks)) throw new Error('Inventory structure unsupported');
  const chunks = await Promise.all(data.chunks.map(async entry => {
    const rel = typeof entry === 'string' ? entry : entry.path;
    if (!rel || /^https?:/i.test(rel)) throw new Error('Unexpected inventory chunk');
    const file = path.resolve(root, rel.replace(/^\//,''));
    if (!file.startsWith(root + path.sep)) throw new Error('Unsafe inventory path');
    return JSON.parse(await fs.readFile(file,'utf8')).products || [];
  }));
  return chunks.flat();
}
const server = http.createServer(async (req,res) => {
  if (req.method === 'OPTIONS') {res.writeHead(204,{'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'});return res.end();}
  if (req.url === '/api/health' && req.method === 'GET') return respond(res,200,{ok:true,checkoutConfigured:!!token});
  if (req.url !== '/api/checkout' || req.method !== 'POST') return respond(res,404,{error:'Not found'});
  if (req.headers.origin && req.headers.origin !== allowedOrigin) return respond(res,403,{error:'Origin not allowed'});
  if (!token) return respond(res,503,{error:'Checkout not configured'});
  try {
    let raw=''; for await (const chunk of req) {raw+=chunk; if(raw.length>16384) throw new Error('Payload too large');}
    const payload=JSON.parse(raw);
    if (!Array.isArray(payload.items) || !payload.items.length || payload.items.length>30) return respond(res,400,{error:'Invalid cart'});
    // Shipping is NOT implemented: never accept an arbitrary shipping value from the browser.
    return respond(res,503,{error:'Checkout awaiting verified Correios shipping calculation; no payment created'});
  } catch(e) {return respond(res,400,{error:'Invalid request'});}
});
server.listen(port,()=>console.log('Passport Store backend listening on '+port));
