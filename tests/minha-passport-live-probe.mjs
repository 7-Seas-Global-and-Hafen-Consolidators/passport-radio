const url='https://www.passportradio.online/minha-passport.html';
const res=await fetch(url,{redirect:'follow',headers:{'cache-control':'no-cache'}});
if(!res.ok) throw new Error(`HTTP ${res.status}`);
const html=await res.text();
const checks=[['page title',html.includes('Minha Passport | Passport Radio')],['favorites target',html.includes('id="account-favorites"')],['votes target',html.includes('id="account-votes"')],['auth v3',html.includes('/js/passport-auth.js?v=3')]];
for(const [name,ok] of checks) console.log(`${ok?'OK':'FAIL'} ${name}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
