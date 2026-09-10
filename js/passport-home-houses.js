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

  root.querySelectorAll("details[data-house]").forEach(card=>{
    function mount() {
      if(!card.open||card.querySelector("iframe"))return;
      const frame=document.createElement("iframe");
      frame.title=card.dataset.name+" · player";
      frame.src=card.dataset.house;
      frame.allow="autoplay";
      // The permission enables click-initiated media after async engine loading.
      // Every engine retains autoplay:0; the bus requires a trusted user gesture.
      frame.addEventListener("load",()=>{
        try{
          const doc=frame.contentDocument;
          if(!doc)return;
          if(!frame.contentWindow.PassportBus){
            const script=doc.createElement("script");
            script.src="/js/passport-bus.js?v=20260910";
            doc.head.appendChild(script);
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
      // Destroy the document to cancel even an engine's pending reconnect timer.
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
