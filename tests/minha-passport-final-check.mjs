import fs from 'node:fs';
const h=fs.readFileSync('minha-passport.html','utf8'),j=fs.readFileSync('js/passport-auth.js','utf8');
const bad=h.includes('Em breve aqui.');
const good=['account-favorites','account-votes','noindex,nofollow'].every(x=>h.includes(x))&&["from('favorites')","from('votes')",'resetPasswordForEmail','updateUser({password})','display_name'].every(x=>j.includes(x));
if(bad||!good) throw new Error('Minha Passport final check failed');
console.log('Minha Passport final check OK');
