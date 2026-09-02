import fs from 'node:fs';
const html=fs.readFileSync('minha-passport.html','utf8');
const js=fs.readFileSync('js/passport-auth.js','utf8');
const checks=[
  ['account favorites target',html.includes('id="account-favorites"')],
  ['account votes target',html.includes('id="account-votes"')],
  ['noindex account page',html.includes('noindex,nofollow')],
  ['favorites query',js.includes("from('favorites').select('*').eq('user_id',user.id)")],
  ['votes query',js.includes("from('votes').select('*').eq('user_id',user.id)")],
  ['profile name query',js.includes("from('profiles').select('display_name')")],
  ['confirmation state',js.includes('Confirmação enviada para ')],
  ['password recovery',js.includes('resetPasswordForEmail')&&js.includes('updateUser({password})')]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks) console.log(`${ok?'OK':'FAIL'} ${name}`);
if(failed.length) process.exit(1);
