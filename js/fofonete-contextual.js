(()=>{const SUPPORT='https://www.asaas.com/c/shpb8gbiswnw4t2n';if(window.__PASSPORT_FOFONETE_CONTEXTUAL__)return;window.__PASSPORT_FOFONETE_CONTEXTUAL__=true;
const path=location.pathname;
const skip=/\/produto\//.test(path);
if(skip)return;
const isStore=path==='/loja.html';
const isAds=path==='/anuncie.html';
const copy=isStore?['Eu vi que você entrou na loja. 👀📒','Gostou de alguma coisa? A loja também ajuda a manter a Passport no ar.']:isAds?['Cinco marcas. Só cinco. Eu anotei. 📒','Enquanto o comercial trabalha, eu continuo de olho nas contas da rádio.']:['Eu fiz as contas de novo. 👀📒','Histórias, rádio e arquivo continuam porque alguém banca a máquina.'];
const mount=()=>{if(document.querySelector('.fofonete-contextual'))return;const box=document.createElement('aside');box.className='fofonete-contextual';box.setAttribute('aria-label','Fofonete da Passport');box.innerHTML=`<button class="fofonete-contextual__close" type="button" aria-label="Fechar">×</button><img class="fofonete-contextual__img" src="/images/grok_1788580858549.jpg" alt="Fofonete da Passport com caderno de contas" loading="lazy"><div class="fofonete-contextual__body"><div class="fofonete-contextual__badge">FOFONETE · PASSPORT</div><strong>${copy[0]}</strong><p>${copy[1]}</p><a href="${SUPPORT}" target="_blank" rel="noopener">APOIAR A PASSPORT →</a></div>`;document.body.appendChild(box);box.querySelector('button').addEventListener('click',()=>box.remove())};
const delay=(path==='/'||path==='/index.html')?18000:isStore?9000:14000;setTimeout(mount,delay)})();