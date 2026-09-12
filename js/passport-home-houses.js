/* Mount each original engine in its own document, inside the Home. */
(() => {
  "use strict";
  const root=document.getElementById("passport-casas");
  if(!root)return;
  const grid=root.querySelector(".casas-grid");
  if(grid&&!grid.querySelector('[data-house="/radio-jovem-guarda.html"]')){
    const card=document.createElement("details");
    card.className="casa";
    card.dataset.house="/radio-jovem-guarda.html";
    card.dataset.name="Jovem Guarda™";
    card.innerHTML='<summary>Jovem Guarda™<span>Passport Radio · Jovem Guarda · ABRIR PLAYER</span></summary><div class="casa-actions"><a href="/radio-jovem-guarda.html" target="_blank" rel="noopener">Abrir Jovem Guarda™ em outra página</a><button type="button" data-close-house>Fechar e parar</button></div><div class="casa-stage"></div>';
    grid.appendChild(card);
  }
  if(grid&&!grid.querySelector('[data-house="/radio-nostalgia-passport.html"]')){
    const card=document.createElement("details");
    card.className="casa";
    card.dataset.house="/radio-nostalgia-passport.html";
    card.dataset.name="Nostalgia Passport™";
    card.innerHTML='<summary>Nostalgia Passport™<span>Passport Radio · Nostalgia Passport · ABRIR PLAYER</span></summary><div class="casa-actions"><a href="/radio-nostalgia-passport.html" target="_blank" rel="noopener">Abrir Nostalgia Passport™ em outra página</a><button type="button" data-close-house>Fechar e parar</button></div><div class="casa-stage"></div>';
    grid.appendChild(card);
  }
  function triggerAutoplay(frame) {
    try {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      if (!win || !doc) return;
      // 1. CLAIM THE BUS!
      // O PassportBus pausa o áudio se não tiver claimed.
      // Como o domínio tem sticky activation, o claim direto funciona e libera o bus!
      if (win.PassportBus) {
        win.PassportBus.claim(win);
      }
      const house = frame.src.split('/').pop().split('?')[0];
      
      function tryPlay() {
        try {
          let playBtn = null;
          if (house === 'radio-continuous.html') playBtn = doc.getElementById('passport-live-play');
          else if (house === 'radio-live-rare.html') playBtn = doc.getElementById('tunnelPlay');
          else if (house === 'radio-80s.html') playBtn = doc.getElementById('passport80sPlay');
          else if (house === 'radio-soul.html') playBtn = doc.getElementById('passportSoulPlay');
          else if (house === 'radio-mpb.html') playBtn = doc.getElementById('passportMPBPlay');
          else if (house === 'radio-hits.html') playBtn = doc.getElementById('passportHitsPlay');
          else if (house === 'radio-rock-brasil.html') playBtn = doc.getElementById('passportBRRockPlay');
          else if (house === 'radio-50s-60s.html') playBtn = doc.getElementById('passport5060Play');
          else if (house === 'radio-flash-house.html') {
            const audio = doc.getElementById('passportFlashHouseAudio');
            if (audio && audio.paused) audio.play().catch(() => {});
            return true;
          }
          else if (house === 'radio-novelas.html') playBtn = doc.getElementById('novelasPlay');
          else if (house === 'globo-de-ouro-player.html') playBtn = doc.getElementById('gdoPlay');
          else if (house === 'radio-mundo-player.html') playBtn = doc.getElementById('world-play');
          else if (house === 'radio-jovem-guarda.html') playBtn = doc.getElementById('passportJovemGuardaPlay');
          else if (house === 'radio-nostalgia-passport.html') playBtn = doc.getElementById('passportNostalgiaPlay');
          if (playBtn) {
            // YouTube/HLS podem deixar o botão disabled enquanto carregam
            if (playBtn.disabled) return false;
            // Se já tiver tocando, não clica de novo
            const txt = playBtn.textContent.trim();
            if (txt === 'Ⅱ' || txt === 'PAUSE' || txt === 'STOP' || txt.includes('PAUSADO')) return true;
            playBtn.click();
            return true;
          }
          return false;
        } catch(_) {
          return false;
        }
      }
      if (!tryPlay()) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          // Se o iframe for destruído (unmount), para o polling
          if (!frame.isConnected || tryPlay() || attempts > 150) {
            clearInterval(interval);
          }
        }, 100);
      }
    } catch(_) {}
  }
  root.querySelectorAll("details[data-house]").forEach(card=>{
    function mount() {
      if(!card.open||card.querySelector("iframe"))return;
      const frame=document.createElement("iframe");
      frame.title=card.dataset.name+" · player";
      frame.src=card.dataset.house;
      frame.allow="autoplay";
      frame.addEventListener("load",()=>{
        try{
          const doc=frame.contentDocument;
          if(!doc)return;
          if(!frame.contentWindow.PassportBus){
            const script=doc.createElement("script");
            script.src="/js/passport-bus.js?v=20260910";
            script.onload = () => triggerAutoplay(frame);
            doc.head.appendChild(script);
          } else {
            triggerAutoplay(frame);
          }
        }catch(_){}
      });
      card.querySelector(".casa-stage").appendChild(frame);
    }
    function unmount() {
      const frame=card.querySelector("iframe");
      if(!frame)return;
      try {
        frame.contentWindow.PassportBus?.silence();
        window.PassportBus.unregister(frame.contentWindow);
      }catch(_){}
      frame.remove();
    }
    card.addEventListener("toggle",()=>card.open?mount():unmount());
    card.querySelector("[data-close-house]").addEventListener("click",()=>{
      card.open=false;unmount();card.querySelector("summary").focus();
    });
    mount();
  });
  window.addEventListener("message",event=>{
    if(event.origin!==location.origin||event.data?.type!=="passport-house-height")return;
    const frame=[...root.querySelectorAll("iframe")].find(frame=>frame.contentWindow===event.source);
    const height=Number(event.data.height);
    if(frame&&Number.isFinite(height)&&height>0)frame.style.height=Math.min(1100,Math.max(300,height+12))+"px";
  });
})();
