import fs from 'node:fs';
const js=fs.readFileSync('js/passport-auth.js','utf8');
if(!js.includes("const ACCOUNT_URL='https://passportradio.online/minha-passport.html'")) throw new Error('wrong account URL');
if(!js.includes("redirectTo:ACCOUNT_URL+'?recovery=1'")) throw new Error('wrong recovery URL');
console.log('Minha Passport auth URLs OK');
