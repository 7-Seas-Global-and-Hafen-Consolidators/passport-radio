import fs from 'node:fs';
const html=fs.readFileSync('minha-passport.html','utf8');
if(html.includes('Em breve aqui.')) throw new Error('Minha Passport placeholder regression');
console.log('No Minha Passport placeholders');
