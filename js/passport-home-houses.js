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
  function playingLabel(txt) {
    return txt === "Ⅱ" || txt === "PAUSE" || txt === "STOP" || txt.indexOf("PAUSADO") !== -1;
  }
  function engineReady(house, win, doc, playBtn) {
    if (!playBtn || playBtn.disabled) return false;
    if (house === "radio-live-rare.html") {
      try {
        const p = win.YT && win.YT.get && win.YT.get("passport-tunnel-engine");
        if (!p || !p.getPlayerState) return false;
        return p.getPlayerState() !== -1;
      } catch (_) { return false; }
    }
    if (house === "globo-de-ouro-player.html") {
      return !playBtn.disabled;
    }
    return true;
  }
  function kickYouTube(win, ids) {
    try {
      const YT = win.YT;
      if (!YT || !YT.get) return false;
      for (let i = 0; i < ids.length; i++) {
        const p = YT.get(ids[i]);
        if (!p || !p.getPlayerState) continue;
        const s = p.getPlayerState();
        if (s === 1) return true;
        if (s === -1) continue;
        try { if (p.unMute) p.unMute(); p.playVideo(); } catch (_) {}
      }
    } catch (_) {}
    return false;
  }
  function mediaPlaying(doc, win) {
    const audio = doc.querySelector("audio");
    if (audio && audio.paused === false && audio.currentTime > 0) return true;
    try {
      if (win.PassportGloboPlayer && win.PassportGloboPlayer.state() === 1) return true;
    } catch (_) {}
    try {
      const YT = win.YT;
      if (YT && YT.get) {
        const ids = ["passport-tunnel-engine", "passportNovelasHidden", "gdoHidden"];
        for (let i = 0; i < ids.length; i++) {
          const p = YT.get(ids[i]);
          if (p && p.getPlayerState && p.getPlayerState() === 1) return true;
        }
      }
    } catch (_) {}
    return false;
  }
  function triggerAutoplay(frame) {
    try {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      if (!win || !doc) return;
      if (win.PassportBus) {
        win.PassportBus.claim(win);
      }
      const house = frame.src.split("/").pop().split("?")[0];
      function tryPlay() {
        try {
          if (mediaPlaying(doc, win)) return true;
          if (house === "radio-flash-house.html") {
            const audio = doc.getElementById("passportFlashHouseAudio");
            if (audio && audio.paused) audio.play().catch(function () {});
            return !!(audio && audio.paused === false);
          }
          let playBtn = null;
          if (house === "radio-continuous.html") playBtn = doc.getElementById("passport-live-play");
          else if (house === "radio-live-rare.html") playBtn = doc.getElementById("tunnelPlay");
          else if (house === "radio-80s.html") playBtn = doc.getElementById("passport80sPlay");
          else if (house === "radio-soul.html") playBtn = doc.getElementById("passportSoulPlay");
          else if (house === "radio-mpb.html") playBtn = doc.getElementById("passportMPBPlay");
          else if (house === "radio-hits.html") playBtn = doc.getElementById("passportHitsPlay");
          else if (house === "radio-rock-brasil.html") playBtn = doc.getElementById("passportBRRockPlay");
          else if (house === "radio-50s-60s.html") playBtn = doc.getElementById("passport5060Play");
          else if (house === "radio-novelas.html") playBtn = doc.getElementById("novelasPlay");
          else if (house === "globo-de-ouro-player.html") playBtn = doc.getElementById("gdoPlay");
          else if (house === "radio-mundo-player.html") playBtn = doc.getElementById("world-play");
          else if (house === "radio-jovem-guarda.html") playBtn = doc.getElementById("passportJovemGuardaPlay");
          else if (house === "radio-nostalgia-passport.html") playBtn = doc.getElementById("passportNostalgiaPlay");
          if (!playBtn) return false;
          const txt = playBtn.textContent.trim();
          if (playingLabel(txt)) return true;
          if (kickYouTube(win, ["passport-tunnel-engine", "passportNovelasHidden", "gdoHidden"])) return true;
          if (!engineReady(house, win, doc, playBtn)) return false;
          if (playBtn.getAttribute("data-pp-armed") !== "1") {
            playBtn.setAttribute("data-pp-armed", "1");
            playBtn.click();
          }
          kickYouTube(win, ["passport-tunnel-engine", "passportNovelasHidden", "gdoHidden"]);
          return false;
        } catch (_) {
          return false;
        }
      }
      if (!tryPlay()) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (!frame.isConnected || tryPlay() || attempts > 150) {
            clearInterval(interval);
          }
        }, 100);
      }
    } catch (_) {}
  }
  root.querySelectorAll("details[data-house]").forEach(card=>{
    function mount() {
      if(!card.open||card.querySelector("iframe"))return;
      const frame=document.createElement("iframe");
      frame.title=card.dataset.name+" · player";
      frame.src=card.dataset.house;
      frame.allow="autoplay; encrypted-media";
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
