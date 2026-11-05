import fs from 'node:fs';
import path from 'node:path';
const root=process.env.PASSPORT_SOURCE;
if(!root)throw Error('Set PASSPORT_SOURCE to the PR checkout before regenerating resources');
const resources=Object.fromEntries(['/blog.html','/editorial/2026/10/07/kurt-cobain-lennon-mccartney-beatles.html'].map(file=>[file,fs.readFileSync(path.join(root,file),'utf8')]));
resources['/']=fs.readFileSync(path.join(root,'index.html'),'utf8'); resources['/index.html']=resources['/'];
for(const dir of ['js','css','assets'])for(const name of fs.readdirSync(path.join(root,dir))){if(/\.(?:js|css)$/.test(name))resources['/'+dir+'/'+name]=fs.readFileSync(path.join(root,dir,name),'utf8');}
let comments=resources['/js/passport-blog-comments.js'];
const start=comments.indexOf('      const frame = document.createElement');
const end=comments.indexOf('\n    });',start);
comments=comments.slice(0,start)+`      event.preventDefault();
      button.disabled = true;
      status.textContent = 'Enviando…';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      fetch('/__preview/comments', {
        method: 'POST', body: new URLSearchParams(new FormData(form)),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: controller.signal
      }).then(async response => {
        const message = await response.json();
        if (!response.ok || message.type !== 'passport-comment' || message.id !== id || typeof message.received !== 'boolean') throw Error('No verified receipt');
        if (message.received) {
          form.elements.nickname.value = ''; form.elements.comment.value = '';
          previousContent = undefined;
          status.textContent = 'Comentário recebido para moderação.';
        } else status.textContent = 'Envio recusado. Confira os campos e tente novamente em instantes.';
      }).catch(() => { status.textContent = 'O envio não foi confirmado. Você pode tentar novamente.'; })
        .finally(() => { clearTimeout(timeout); button.disabled = false; });`+comments.slice(end);
comments=comments.replace('crypto.randomUUID()', "(crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16)))");
resources['/js/passport-blog-comments.js']=comments;
const adapter=`document.addEventListener('click',function(e){const a=e.target.closest?.('a[href]');if(!a)return;const u=new URL(a.href,location.href);if(u.origin==='https://passportradio.online')a.href=u.pathname+u.search+u.hash;},true);`;
resources['/__preview/navigation.js']=adapter;
fs.writeFileSync('worker/resources.json',JSON.stringify(resources));
const core=fs.readFileSync('worker/core.mjs','utf8');
fs.writeFileSync('worker/index.js','const resources = '+JSON.stringify(resources)+';\n'+core);
