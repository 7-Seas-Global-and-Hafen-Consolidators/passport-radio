(() => {
  'use strict';
  if(!document.body.classList.contains('passport-apoio-paper')) return;
  async function copy(text){
    try {if(!navigator.clipboard?.writeText)throw new Error('Unavailable');await navigator.clipboard.writeText(text);return;}
    catch (_) {
      const previous=document.activeElement,field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.position='fixed';field.style.left='-9999px';document.body.append(field);field.select();
      let copied=false;try{copied=document.execCommand('copy');}finally{field.remove();previous?.focus({preventScroll:true});}if(!copied)throw new Error('Copy unavailable');
    }
  }
  const pix=document.getElementById('copy-pix'),pixStatus=document.getElementById('pix-status');
  pix?.addEventListener('click',async()=>{try{await copy('passportradio.online@gmail.com');pix.textContent='CHAVE COPIADA';pixStatus.textContent='CHAVE COPIADA';}catch(_){pixStatus.textContent='Selecione a chave para copiar.';}});
  const share=document.getElementById('share-passport'),status=document.getElementById('share-status');
  share?.addEventListener('click',async()=>{
    const url='https://www.passportradio.online/';
    try {
      if(navigator.share){try{await navigator.share({title:'Passport Radio',text:'Uma história compartilhada pode trazer a próxima história da Passport.',url});status.textContent='OBRIGADO POR COMPARTILHAR';return;}catch(e){if(e.name==='AbortError')return;}}
      await copy(url);status.textContent='LINK COPIADO';
    }catch(_){status.textContent='Compartilhe: '+url;}
  });
})();
