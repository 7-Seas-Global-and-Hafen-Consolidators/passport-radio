/* Globo de Ouro: the six existing archive programs, unchanged. */
(() => {
  "use strict";
  const LIST = ["E5uyPR8Zb9A","zjxnOpUnRis","mgIl2h7rr7E","FwcHnyEPzEY","T-cindr--4c","lBBOTVtXftA"];
  const button = document.getElementById("gdoPlay");
  const status = document.getElementById("gdoStatus");
  let player = null, ready = false;
  button.disabled = true;
  status.textContent = "CARREGANDO PLAYER";
  function paint() {
    const playing = ready && player.getPlayerState() === 1;
    button.textContent = playing ? "Ⅱ" : "▶";
    status.textContent = playing ? "ON AIR" : "READY";
  }
  function stop() {
    if (ready) player.pauseVideo();
    button.textContent = "▶";
    if (ready) status.textContent = "PAUSADO";
  }
  function create() {
    if (player) return;
    player = new YT.Player("gdoHidden", {
      width:1,height:1,videoId:LIST[0],
      playerVars:{autoplay:0,controls:0,rel:0,playsinline:1,playlist:LIST.join(",")},
      events:{
        onReady() { ready=true; button.disabled=false; paint(); },
        onStateChange(event) {
          if (event.data===1 && !window.PassportBus.allowed()) { stop(); return; }
          paint();
        },
        onError() { status.textContent="ARQUIVO INDISPONÍVEL"; button.textContent="▶"; }
      }
    });
  }
  window.PassportGloboPlayer = {stop};
  button.addEventListener("click", () => {
    if (!ready) return;
    if (player.getPlayerState()===1) stop();
    else { player.unMute(); player.playVideo(); }
  });
  if (window.YT && window.YT.Player) create();
  else {
    const previous=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{if(typeof previous==="function")previous();create();};
    const script=document.createElement("script");
    script.src="https://www.youtube.com/iframe_api";
    script.onerror=()=>{status.textContent="PLAYER INDISPONÍVEL";};
    document.head.appendChild(script);
  }
})();
