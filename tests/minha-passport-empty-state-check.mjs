import fs from 'node:fs';
const j=fs.readFileSync('js/passport-auth.js','utf8');
for(const x of ['Nenhum favorito salvo ainda.','Nenhum voto registrado ainda.']) if(!j.includes(x)) throw new Error('missing empty state '+x);
console.log('Minha Passport empty states OK');
