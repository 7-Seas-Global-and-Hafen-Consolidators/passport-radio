(()=>{
  'use strict';

  const SUPABASE_URL='https://kmrnnudmujezriomimwn.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='PASTE_SUPABASE_PUBLISHABLE_KEY_HERE';

  const $=id=>document.getElementById(id);
  const loginForm=$('login-form');
  const signupForm=$('signup-form');
  const accountPanel=$('account-panel');
  const message=$('auth-message');
  const tabs=[...document.querySelectorAll('[data-auth-view]')];

  if(!window.supabase){
    show('Não foi possível carregar o serviço de conta. Tente novamente.',true);
    return;
  }

  if(SUPABASE_PUBLISHABLE_KEY.includes('PASTE_')){
    show('Configuração da conta ainda não foi concluída.',true);
    return;
  }

  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });

  function show(text,isError=false,isSuccess=false){
    message.textContent=text;
    message.className='auth-message is-visible'+(isError?' is-error':'')+(isSuccess?' is-success':'');
  }

  function clearMessage(){
    message.textContent='';
    message.className='auth-message';
  }

  function setBusy(form,busy){
    const button=form?.querySelector('button[type="submit"]');
    if(button) button.disabled=busy;
  }

  function setView(view){
    clearMessage();
    tabs.forEach(tab=>{
      const active=tab.dataset.authView===view;
      tab.classList.toggle('is-active',active);
      tab.setAttribute('aria-selected',String(active));
    });
    loginForm.hidden=view!=='login';
    signupForm.hidden=view!=='signup';
    accountPanel.hidden=true;
  }

  async function renderSession(session){
    if(!session?.user){
      accountPanel.hidden=true;
      loginForm.hidden=false;
      tabs.forEach(tab=>tab.hidden=false);
      return;
    }

    loginForm.hidden=true;
    signupForm.hidden=true;
    tabs.forEach(tab=>tab.hidden=true);
    accountPanel.hidden=false;

    const user=session.user;
    let displayName=user.user_metadata?.display_name || user.email?.split('@')[0] || 'Minha Passport';
    const {data}=await client.from('profiles').select('display_name').eq('id',user.id).maybeSingle();
    if(data?.display_name) displayName=data.display_name;

    $('account-name').textContent=displayName;
    $('account-email').textContent=user.email || '';
    clearMessage();
  }

  tabs.forEach(tab=>tab.addEventListener('click',()=>setView(tab.dataset.authView)));

  loginForm.addEventListener('submit',async event=>{
    event.preventDefault();
    clearMessage();
    setBusy(loginForm,true);
    const email=$('login-email').value.trim();
    const password=$('login-password').value;
    const {error}=await client.auth.signInWithPassword({email,password});
    setBusy(loginForm,false);
    if(error){show('Não foi possível entrar. Confira e-mail e senha.',true);return;}
  });

  signupForm.addEventListener('submit',async event=>{
    event.preventDefault();
    clearMessage();
    setBusy(signupForm,true);
    const displayName=$('signup-name').value.trim();
    const email=$('signup-email').value.trim();
    const password=$('signup-password').value;
    const {data,error}=await client.auth.signUp({
      email,
      password,
      options:{
        data:{display_name:displayName},
        emailRedirectTo:'https://www.passportradio.online/minha-passport.html'
      }
    });
    setBusy(signupForm,false);
    if(error){show(error.message || 'Não foi possível criar a conta.',true);return;}
    if(data.session){
      show('Conta criada. Você já está conectado.',false,true);
    }else{
      show('Conta criada. Confira seu e-mail para confirmar o cadastro.',false,true);
    }
  });

  $('forgot-password').addEventListener('click',async()=>{
    const email=$('login-email').value.trim();
    if(!email){show('Digite seu e-mail primeiro.',true);return;}
    const {error}=await client.auth.resetPasswordForEmail(email,{
      redirectTo:'https://www.passportradio.online/minha-passport.html?recovery=1'
    });
    if(error){show('Não foi possível enviar a recuperação agora.',true);return;}
    show('Enviamos as instruções de recuperação para seu e-mail.',false,true);
  });

  $('logout-button').addEventListener('click',async()=>{
    await client.auth.signOut();
    setView('login');
    show('Você saiu da sua conta.',false,true);
  });

  client.auth.onAuthStateChange((_event,session)=>{renderSession(session);});
  client.auth.getSession().then(({data})=>renderSession(data.session));
})();
