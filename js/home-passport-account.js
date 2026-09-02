(()=>{
  'use strict';

  const SUPABASE_URL='https://kmrnnudmujezriomimwn.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y';
  const ACCOUNT_URL='/minha-passport.html';

  function mount(){
    const contact=document.querySelector('#contato .shell.contact');
    if(!contact || document.getElementById('passport-account-home')) return;

    const card=document.createElement('article');
    card.className='contact-card';
    card.id='passport-account-home';
    card.innerHTML=`
      <small>MINHA PASSPORT</small>
      <h3 id="passport-account-title">Entrar ou criar conta.</h3>
      <p id="passport-account-copy">Guarde favoritos, participe das votações e construa sua experiência na Passport.</p>
      <a id="passport-account-link" href="${ACCOUNT_URL}">ENTRAR / CRIAR CONTA →</a>
    `;
    contact.appendChild(card);

    if(!window.supabase) return;
    const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });

    const render=(session)=>{
      const title=document.getElementById('passport-account-title');
      const copy=document.getElementById('passport-account-copy');
      const link=document.getElementById('passport-account-link');
      if(!title || !copy || !link) return;
      if(session?.user){
        const name=session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'sua conta';
        title.textContent=`Olá, ${name}.`;
        copy.textContent='Sua Passport está conectada. Acesse sua conta, favoritos e participação.';
        link.textContent='ABRIR MINHA PASSPORT →';
      }else{
        title.textContent='Entrar ou criar conta.';
        copy.textContent='Guarde favoritos, participe das votações e construa sua experiência na Passport.';
        link.textContent='ENTRAR / CRIAR CONTA →';
      }
    };

    client.auth.getSession().then(({data})=>render(data.session));
    client.auth.onAuthStateChange((_event,session)=>render(session));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
