import fs from 'node:fs';
const js=fs.readFileSync('js/passport-auth.js','utf8');
for(const x of ['user_metadata?.display_name',"from('profiles').select('display_name')",'data?.display_name']) if(!js.includes(x)) throw new Error('profile regression '+x);
console.log('Profile display-name behavior preserved');
