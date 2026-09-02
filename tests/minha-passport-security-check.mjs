import fs from 'node:fs';
const j=fs.readFileSync('js/passport-auth.js','utf8');
if(/service_role/i.test(j)) throw new Error('service role key must never be client-side');
if(!j.includes(".eq('user_id',user.id)")) throw new Error('account data must be user scoped');
console.log('Minha Passport client security checks OK');
