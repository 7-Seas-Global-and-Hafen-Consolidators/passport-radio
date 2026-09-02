import fs from 'node:fs';
const html=fs.readFileSync('minha-passport.html','utf8');
const js=fs.readFileSync('js/passport-auth.js','utf8');
for(const needle of ['account-favorites','account-votes','noindex,nofollow']) if(!html.includes(needle)) throw new Error('missing '+needle);
for(const needle of ["from('favorites')","from('votes')","from('profiles')",'resetPasswordForEmail','Confirmação enviada para ']) if(!js.includes(needle)) throw new Error('missing '+needle);
console.log('Minha Passport static account checks OK');
