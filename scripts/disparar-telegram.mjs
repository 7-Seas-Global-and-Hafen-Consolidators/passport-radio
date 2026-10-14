import fs from 'node:fs/promises';
import path from 'node:path';
const ROOT=path.resolve(import.meta.dirname,'..');
const statePath=path.join(ROOT,'data/telegram-sent.json');
const token=process.env.TELEGRAM_BOT_TOKEN;
const chat=process.env.TELEGRAM_CHAT_ID;
const bootstrap=process.argv.includes('--bootstrap');
const xml=await fs.readFile(path.join(ROOT,'sitemap-blog.xml'),'utf8');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1].replace(/&amp;/g,'&')).filter(u=>/^https:\/\/(?:www\.)?passportradio\.online\/blog\/.*\.html$/.test(u));
const unique=[...new Set(urls)];
let sent;
try {sent=JSON.parse(await fs.readFile(statePath,'utf8'));if(!Array.isArray(sent))throw Error('Invalid state');}
catch(e){if(e.code!=='ENOENT')throw e;sent=[];}
const seen=new Set(sent);
if (bootstrap || (sent.length===0 && !process.env.TELEGRAM_ALLOW_INITIAL_SEND)) {
  await fs.mkdir(path.dirname(statePath),{recursive:true});
  await fs.writeFile(statePath,JSON.stringify(unique,null,2)+'\n');
  console.log('Initialized Telegram state without publishing historical URLs:',unique.length);
  process.exit(0);
}
if(!token||!chat) {console.log('Telegram secrets missing; no messages sent');process.exit(0);}
const fresh=unique.filter(u=>!seen.has(u));
for(const url of fresh) {
  const slug=decodeURIComponent(url.split('/').pop().replace(/\.html$/,''));
  const title=slug.replace(/^\d+-/,'').replace(/-/g,' ').replace(/\b\p{L}/gu,x=>x.toUpperCase());
  const text='🎸 NOVA NA PASSPORT RADIO\n\n'+title+'\n\n🔗 '+url;
  const res=await fetch('https://api.telegram.org/bot'+token+'/sendMessage',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chat,text})});
  const data=await res.json();
  if(!res.ok||!data.ok)throw Error('Telegram send failed: '+JSON.stringify(data));
  seen.add(url);
  await fs.mkdir(path.dirname(statePath),{recursive:true});
  await fs.writeFile(statePath,JSON.stringify([...seen],null,2)+'\n');
  console.log('Sent:',url);
}
console.log('New publications sent:',fresh.length);
