(() => {
  const PASSPORT_WHATSAPP='https://wa.me/5511991351500?text=Ol%C3%A1%21%20Vim%20pelo%20site%20da%20Passport%20Radio%20e%20gostaria%20de%20falar%20com%20voc%C3%AAs.';

  const fixPassportContact=()=>{
    document.querySelectorAll('a[href*="wa.me/48732099369"]').forEach((link)=>{
      link.href=PASSPORT_WHATSAPP;
    });

    const contact=document.getElementById('contato');
    if(contact){
      const whatsapp=contact.querySelector('a[href*="wa.me/"]');
      if(whatsapp) whatsapp.href=PASSPORT_WHATSAPP;
      const advertise=[...contact.querySelectorAll('a')].find((link)=>/VER FORMATOS/i.test(link.textContent||''));
      if(advertise) advertise.href='/anuncie.html';
    }
  };

  const loadPassportAccount=()=>{
    if(document.querySelector('script[data-passport-account-home]')) return;
    if(!document.querySelector('script[src*="supabase-js"]')){
      const supabase=document.createElement('script');
      supabase.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      supabase.defer=true;
      supabase.onload=loadPassportAccount;
      supabase.dataset.passportSupabaseHome='1';
      document.head.appendChild(supabase);
      return;
    }
    if(!window.supabase){setTimeout(loadPassportAccount,100);return;}
    const account=document.createElement('script');
    account.src='/js/home-passport-account.js?v=20260902';
    account.defer=true;
    account.dataset.passportAccountHome='1';
    document.head.appendChild(account);
  };

  const boot=()=>{fixPassportContact();loadPassportAccount();};
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }

  if(document.querySelector('script[data-passport-support-global]')) return;
  const script=document.createElement('script');
  script.src='/js/passport-support.js?v=10';
  script.defer=true;
  script.dataset.passportSupportGlobal='1';
  document.head.appendChild(script);
})();
