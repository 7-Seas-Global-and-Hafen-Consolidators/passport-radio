(() => {
  'use strict';
  const audio = document.getElementById('recado-audio');
  const toggle = document.getElementById('recado-toggle');
  const stop = document.getElementById('recado-stop');
  const status = document.getElementById('recado-status');
  if (audio && toggle && stop && status) {
    const paint = () => {
      toggle.textContent = audio.ended ? '▶ OUÇA DE NOVO' : audio.paused ? '▶ OUÇA O RECADO' : '❚❚ PAUSAR RECADO';
      toggle.setAttribute('aria-pressed', String(!audio.paused));
      stop.disabled = audio.currentTime === 0 && audio.paused;
      status.textContent = audio.ended ? 'Recado entregue. Pode ouvir de novo.' : audio.paused ? (audio.currentTime > 0 ? 'Recado pausado.' : '15 segundos de recado. Aperte o play.') : 'O recado está tocando.';
    };
    toggle.addEventListener('click', async () => {
      if (!audio.paused) { audio.pause(); return; }
      if (audio.ended) audio.currentTime = 0;
      try { await audio.play(); } catch (_) { paint(); status.textContent = 'Não foi possível tocar o recado. Aperte o play para tentar novamente.'; }
    });
    stop.addEventListener('click', () => { audio.pause(); audio.currentTime = 0; paint(); });
    ['play','pause','ended','loadedmetadata'].forEach(event => audio.addEventListener(event, paint));
    audio.addEventListener('error', () => { paint(); status.textContent = 'Áudio indisponível. Tente novamente.'; });
    paint();
  }
  const copy=document.getElementById('copy-pix');
  const copyStatus=document.getElementById('pix-copy-status');
  const pixKey='passportradio.online@gmail.com';
  function fallbackCopy() {
    const field=document.createElement('textarea');field.value=pixKey;
    field.setAttribute('readonly','');field.style.position='fixed';field.style.left='-9999px';
    document.body.append(field);field.select();
    let copied=false;
    try { copied=document.execCommand('copy'); } finally { field.remove();copy.focus({preventScroll:true}); }
    if(!copied) throw new Error('Copy unavailable');
  }
  copy?.addEventListener('click',async()=>{
    try {
      try { if(!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(pixKey); }
      catch (_) { fallbackCopy(); }
      copy.textContent='CHAVE COPIADA';copyStatus.textContent='CHAVE COPIADA';
    } catch (_) { copyStatus.textContent='Selecione a chave para copiar.'; }
  });
  const choose = (format, days) => {
    const select = document.getElementById('ad-format');
    if (format) select.value = format;
    select.dispatchEvent(new Event('change'));
    if (days) { const period = document.getElementById('ad-days'); period.value = String(days); period.dispatchEvent(new Event('change')); }
  };
  document.querySelectorAll('[data-select-format]').forEach(a => a.addEventListener('click', () => choose(a.dataset.selectFormat)));
  document.getElementById('choose-trial')?.addEventListener('click', () => choose('strip', 10));
})();
