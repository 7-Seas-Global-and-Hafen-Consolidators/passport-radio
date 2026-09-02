(()=>{
  'use strict';

  const SUPABASE_URL='https://kmrnnudmujezriomimwn.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y';
  const ACCOUNT_URL='https://passportradio.online/minha-passport.html';

  const $=id=>document.getElementById(id);
  const loginForm=$('login-form');
  const signupForm=$('signup-form');
  const recoveryForm=$('recovery-form');
  const accountPanel=$('account-panel');
  const message=$('auth-message');
  const tabs=[...document.querySelectorAll('[data-auth-view]')];
  let recoveryMode=new URLSearchParams(location.search).get('recovery')==='1';

  if(!window.supabase){show('Não foi possível carregar o serviço de conta. Tente novamente.',true);return;}

  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

  function show(text,isError=false,isSuccess=false){message.textContent=text;message.className='auth-message is-visible'+(isError?' is-error':'')+(isSuccess?' is-success':'');}
  function clearMessage(){message.textContent='';message.className='auth-message';}
  function setBusy(form,busy){const button=form?.querySelector('button[type="submit"]');if(button) button.disabled=busy;}

  function setView(view){
    recoveryMode=false;clearMessage();
    tabs.forEach(tab=>{const active=tab.dataset.authView===view;tab.hidden=false;tab.classList.toggle('is-active',active);tab.setAttribute('aria-selected',String(active));});
    loginForm.hidden=view!=='login';signupForm.hidden=view!=='signup';recoveryForm.hidden=true;accountPanel.hidden=true;
  }

  function showRecovery(){
    recoveryMode=true;tabs.forEach(tab=>tab.hidden=true);loginForm.hidden=true;signupForm.hidden=true;accountPanel.hidden=true;recoveryForm.hidden=false;
    show('Crie uma nova senha para sua Passport.',false,true);
  }

  function rowLabel(row,type){
    const keys=type==='favorites'
      ? ['item_name','title','name','label','station_name','article_title','artist','slug']
      : ['signal','choice','vote','option','item_name','title','name','round'];
    const values=[];
    keys.forEach(key=>{if(row?.[key]!==undefined&&row[key]!==null&&String(row[key]).trim()&&!values.includes(String(row[key]).trim())) values.push(String(row[key]).trim());});
    return values.slice(0,2).join(' · ') || (type==='favorites'?'Favorito salvo':'Voto registrado');
  }

  function renderRows(targetId,rows,type){
    const target=$(targetId);if(!target) return;
    if(!rows.length){
      target.textContent=type==='favorites'?'Você ainda não salvou nenhum favorito. Explore a Passport e guarde o que quiser reencontrar.':'Você ainda não participou de nenhuma votação. Quando uma votação estiver aberta, sua escolha aparecerá aqui.';
      return;
    }
    target.textContent=rows.slice(0,5).map(row=>rowLabel(row,type)).join(' • ')+(rows.length>5?` • +${rows.length-5}`:'');
  }

  async function loadMemberData(userId){
    const favoritesTarget=$('account-favorites');
    const votesTarget=$('account-votes');
    if(favoritesTarget) favoritesTarget.textContent='Carregando seus favoritos…';
    if(votesTarget) votesTarget.textContent='Carregando suas votações…';

    const [favoritesResult,votesResult]=await Promise.all([
      client.from('favorites').select('*').eq('user_id',userId),
      client.from('votes').select('*').eq('user_id',userId)
    ]);

    if(favoritesResult.error){
      if(favoritesTarget) favoritesTarget.textContent='Não foi possível carregar seus favoritos agora.';
      console.warn('Minha Passport: favorites unavailable',favoritesResult.error.message);
    }else renderRows('account-favorites',favoritesResult.data||[],'favorites');

    if(votesResult.error){
      if(votesTarget) votesTarget.textContent='Não foi possível carregar suas votações agora.';
      console.warn('Minha Passport: votes unavailable',votesResult.error.message);
    }else renderRows('account-votes',votesResult.data||[],'votes');
  }

  async function renderSession(session){
    if(recoveryMode){showRecovery();return;}
    if(!session?.user){accountPanel.hidden=true;recoveryForm.hidden=true;loginForm.hidden=false;signupForm.hidden=true;tabs.forEach(tab=>tab.hidden=false);return;}

    loginForm.hidden=true;signupForm.hidden=true;recoveryForm.hidden=true;tabs.forEach(tab=>tab.hidden=true);accountPanel.hidden=false;
    const user=session.user;
    let displayName=user.user_metadata?.display_name || user.email?.split('@')[0] || 'Minha Passport';
    const {data}=await client.from('profiles').select('display_name').eq('id',user.id).maybeSingle();
    if(data?.display_name) displayName=data.display_name;
    $('account-name').textContent=displayName;$('account-email').textContent=user.email || '';clearMessage();
    await loadMemberData(user.id);
  }

  tabs.forEach(tab=>tab.addEventListener('click',()=>setView(tab.dataset.authView)));

  loginForm.addEventListener('submit',async event=>{
    event.preventDefault();clearMessage();setBusy(loginForm,true);
    const email=$('login-email').value.trim();const password=$('login-password').value;
    const {data,error}=await client.auth.signInWithPassword({email,password});setBusy(loginForm,false);
    if(error){show('Não foi possível entrar. Confira e-mail e senha.',true);return;}await renderSession(data.session);
  });

  signupForm.addEventListener('submit',async event=>{
    event.preventDefault();clearMessage();setBusy(signupForm,true);
    const displayName=$('signup-name').value.trim();const email=$('signup-email').value.trim();const password=$('signup-password').value;
    const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:displayName},emailRedirectTo:ACCOUNT_URL}});setBusy(signupForm,false);
    if(error){show(error.message || 'Não foi possível criar a conta.',true);return;}
    if(data.session){await renderSession(data.session);show('Conta criada. Você já está conectado.',false,true);}else show('Conta criada. Confira seu e-mail para confirmar o cadastro.',false,true);
  });

  $('forgot-password').addEventListener('click',async()=>{
    const email=$('login-email').value.trim();if(!email){show('Digite seu e-mail primeiro.',true);return;}
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:ACCOUNT_URL+'?recovery=1'});
    if(error){show('Não foi possível enviar a recuperação agora.',true);return;}show('Enviamos as instruções de recuperação para seu e-mail.',false,true);
  });

  recoveryForm.addEventListener('submit',async event=>{
    event.preventDefault();clearMessage();const password=$('recovery-password').value;const confirm=$('recovery-password-confirm').value;
    if(password!==confirm){show('As duas senhas precisam ser iguais.',true);return;}setBusy(recoveryForm,true);
    const {error}=await client.auth.updateUser({password});setBusy(recoveryForm,false);
    if(error){show('Não foi possível atualizar a senha. Abra novamente o link enviado por e-mail.',true);return;}
    recoveryMode=false;history.replaceState({},'',location.pathname);recoveryForm.reset();const {data}=await client.auth.getSession();await renderSession(data.session);show('Senha atualizada com sucesso.',false,true);
  });

  $('logout-button').addEventListener('click',async()=>{await client.auth.signOut();setView('login');show('Você saiu da sua conta.',false,true);});
  client.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY') recoveryMode=true;setTimeout(()=>renderSession(session),0);});
  client.auth.getSession().then(({data})=>renderSession(data.session));
})();
