(()=>{
  'use strict';
  const SUPABASE_URL='https://kmrnnudmujezriomimwn.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y';
  const ACCOUNT_URL='https://passportradio.online/minha-passport.html';
  const $=id=>document.getElementById(id);
  const loginForm=$('login-form'),signupForm=$('signup-form'),recoveryForm=$('recovery-form'),accountPanel=$('account-panel'),message=$('auth-message');
  const tabs=[...document.querySelectorAll('[data-auth-view]')];
  let recoveryMode=new URLSearchParams(location.search).get('recovery')==='1';
  if(!window.supabase){show('Não foi possível carregar o serviço de conta. Tente novamente.',true);return;}
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  function show(text,isError=false,isSuccess=false){message.textContent=text;message.className='auth-message is-visible'+(isError?' is-error':'')+(isSuccess?' is-success':'');}
  function clearMessage(){message.textContent='';message.className='auth-message';}
  function setBusy(form,busy){const button=form?.querySelector('button[type="submit"]');if(button)button.disabled=busy;}
  function setView(view){recoveryMode=false;clearMessage();tabs.forEach(tab=>{const active=tab.dataset.authView===view;tab.hidden=false;tab.classList.toggle('is-active',active);tab.setAttribute('aria-selected',String(active));});loginForm.hidden=view!=='login';signupForm.hidden=view!=='signup';recoveryForm.hidden=true;accountPanel.hidden=true;}
  function showRecovery(){recoveryMode=true;tabs.forEach(tab=>tab.hidden=true);loginForm.hidden=true;signupForm.hidden=true;accountPanel.hidden=true;recoveryForm.hidden=false;show('Crie uma nova senha para sua Passport.',false,true);}
  function emptyState(kind){return kind==='favorites'?'Nada salvo ainda. Explore a Passport e guarde o que quiser rever.':'Nenhum voto ainda. Participe das votações da Passport.';}
  async function loadMemberData(user){
    const fav=$('account-favorites'),votes=$('account-votes');
    fav.textContent='Carregando…';votes.textContent='Carregando…';
    const [f,v]=await Promise.all([
      client.from('favorites').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(6),
      client.from('votes').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(6)
    ]);
    if(f.error){fav.textContent='Seus favoritos aparecerão aqui assim que forem salvos.';}else if(!f.data?.length){fav.textContent=emptyState('favorites');}else{fav.innerHTML='';const ul=document.createElement('ul');f.data.forEach(row=>{const li=document.createElement('li');li.textContent=row.item_name||row.title||row.name||row.item_id||'Item salvo';ul.appendChild(li);});fav.appendChild(ul);}
    if(v.error){votes.textContent='Seus votos aparecerão aqui assim que forem registrados.';}else if(!v.data?.length){votes.textContent=emptyState('votes');}else{votes.innerHTML='';const ul=document.createElement('ul');v.data.forEach(row=>{const li=document.createElement('li');const label=row.signal||row.item_name||row.title||row.choice||row.vote||'Voto registrado';li.textContent=row.round?`${label} · rodada ${row.round}`:label;ul.appendChild(li);});votes.appendChild(ul);}
  }
  async function renderSession(session){
    if(recoveryMode){showRecovery();return;}
    if(!session?.user){accountPanel.hidden=true;recoveryForm.hidden=true;loginForm.hidden=false;signupForm.hidden=true;tabs.forEach(tab=>tab.hidden=false);return;}
    loginForm.hidden=true;signupForm.hidden=true;recoveryForm.hidden=true;tabs.forEach(tab=>tab.hidden=true);accountPanel.hidden=false;
    const user=session.user;let displayName=user.user_metadata?.display_name||user.email?.split('@')[0]||'Minha Passport';
    const {data}=await client.from('profiles').select('display_name').eq('id',user.id).maybeSingle();if(data?.display_name)displayName=data.display_name;
    $('account-name').textContent=displayName;$('account-email').textContent=user.email||'';clearMessage();await loadMemberData(user);
  }
  tabs.forEach(tab=>tab.addEventListener('click',()=>setView(tab.dataset.authView)));
  loginForm.addEventListener('submit',async event=>{event.preventDefault();clearMessage();setBusy(loginForm,true);const email=$('login-email').value.trim(),password=$('login-password').value;const {data,error}=await client.auth.signInWithPassword({email,password});setBusy(loginForm,false);if(error){show('Não foi possível entrar. Confira e-mail e senha.',true);return;}await renderSession(data.session);});
  signupForm.addEventListener('submit',async event=>{event.preventDefault();clearMessage();setBusy(signupForm,true);const displayName=$('signup-name').value.trim(),email=$('signup-email').value.trim(),password=$('signup-password').value;const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:displayName},emailRedirectTo:ACCOUNT_URL+'?welcome=1'}});setBusy(signupForm,false);if(error){show(error.message||'Não foi possível criar a conta.',true);return;}if(data.session){await renderSession(data.session);show('Conta criada. Bem-vindo à Passport.',false,true);}else{signupForm.hidden=true;tabs.forEach(tab=>tab.hidden=true);show(`Confirmação enviada para ${email}. Abra seu e-mail e clique no link para ativar sua Passport.`,false,true);}});
  $('forgot-password').addEventListener('click',async()=>{const email=$('login-email').value.trim();if(!email){show('Digite seu e-mail primeiro.',true);return;}const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:ACCOUNT_URL+'?recovery=1'});if(error){show('Não foi possível enviar a recuperação agora.',true);return;}show('Enviamos as instruções de recuperação para seu e-mail.',false,true);});
  recoveryForm.addEventListener('submit',async event=>{event.preventDefault();clearMessage();const password=$('recovery-password').value,confirm=$('recovery-password-confirm').value;if(password!==confirm){show('As duas senhas precisam ser iguais.',true);return;}setBusy(recoveryForm,true);const {error}=await client.auth.updateUser({password});setBusy(recoveryForm,false);if(error){show('Não foi possível atualizar a senha. Abra novamente o link enviado por e-mail.',true);return;}recoveryMode=false;history.replaceState({},'',location.pathname);recoveryForm.reset();const {data}=await client.auth.getSession();await renderSession(data.session);show('Senha atualizada com sucesso.',false,true);});
  $('logout-button').addEventListener('click',async()=>{await client.auth.signOut();setView('login');show('Você saiu da sua conta.',false,true);});
  client.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY')recoveryMode=true;setTimeout(()=>renderSession(session),0);});
  client.auth.getSession().then(async({data})=>{await renderSession(data.session);if(data.session&&new URLSearchParams(location.search).get('welcome')==='1'){show('Conta confirmada. Bem-vindo à Passport!',false,true);history.replaceState({},'',location.pathname);}});
})();
