/* PASSPORT RADIO · SOUL TUNNEL
   Isolated external Soul Central Radio embed.
   Injected after the 80s section. Does not modify the existing Live & Rare,
   80s Tunnel, or any protected 24h player engine.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;
  if (document.getElementById("passportSoul")) return;

  const anchor = document.getElementById("passport80s");
  if (!anchor) return;

  const style = document.createElement("style");
  style.textContent = `
    .passport-soul-section{
      padding:52px 0 58px;
      border-bottom:1px solid #d8d0c5;
      background:#efe7db;
      color:#101010;
    }
    .passport-soul-shell{
      width:min(calc(100% - 40px),1180px);
      margin:auto;
      display:grid;
      grid-template-columns:minmax(220px,.52fr) minmax(0,1.48fr);
      gap:42px;
      align-items:center;
    }
    .passport-soul-kicker{
      color:#7e1834;
      font-size:.54rem;
      font-weight:900;
      letter-spacing:.18em;
      text-transform:uppercase;
    }
    .passport-soul-title{
      margin:8px 0 0;
      font-family:"Bebas Neue",Impact,sans-serif;
      font-size:clamp(2.8rem,5vw,5rem);
      font-weight:400;
      line-height:.88;
      letter-spacing:.01em;
    }
    .passport-soul-copy{
      max-width:350px;
      margin:16px 0 0;
      color:#716960;
      font-size:.76rem;
      line-height:1.65;
    }
    .passport-soul-script{
      display:block;
      margin-top:23px;
      color:#7e1834;
      font-family:Caveat,cursive;
      font-size:clamp(1.8rem,3vw,2.7rem);
      font-weight:600;
      line-height:.95;
      transform:rotate(-2deg);
    }
    .passport-soul-card{
      border-radius:26px 4px 26px 4px;
      background:#130d0f;
      color:#fff;
      overflow:hidden;
      box-shadow:0 22px 58px rgba(68,31,40,.13);
    }
    .passport-soul-cardhead{
      display:grid;
      grid-template-columns:1fr auto;
      gap:18px;
      align-items:center;
      padding:20px 22px;
      border-bottom:1px solid rgba(255,255,255,.08);
    }
    .passport-soul-cardhead small{
      display:block;
      color:#c6a46c;
      font-size:.49rem;
      font-weight:900;
      letter-spacing:.16em;
      text-transform:uppercase;
    }
    .passport-soul-cardhead strong{
      display:block;
      margin-top:5px;
      font-size:.9rem;
      letter-spacing:-.02em;
    }
    .passport-soul-toggle{
      min-height:38px;
      padding:0 13px;
      border:1px solid #7e1834;
      background:#7e1834;
      color:#fff;
      cursor:pointer;
      font-size:.5rem;
      font-weight:900;
      letter-spacing:.08em;
      text-transform:uppercase;
    }
    .passport-soul-framewrap{
      display:none;
      height:510px;
      overflow:hidden;
      background:#fff;
    }
    .passport-soul-card.is-open .passport-soul-framewrap{display:block}
    .passport-soul-frame{
      display:block;
      width:100%;
      height:700px;
      border:0;
      background:#fff;
    }
    .passport-soul-note{
      padding:11px 22px 13px;
      color:#746b70;
      font-size:.48rem;
      line-height:1.5;
    }
    @media(max-width:900px){
      .passport-soul-shell{grid-template-columns:1fr;gap:26px}
      .passport-soul-copy{max-width:540px}
    }
    @media(max-width:560px){
      .passport-soul-section{padding:46px 0 50px}
      .passport-soul-shell{width:min(calc(100% - 28px),1180px)}
      .passport-soul-cardhead{padding:17px}
      .passport-soul-framewrap{height:500px}
      .passport-soul-frame{height:680px}
      .passport-soul-note{padding:10px 17px 12px}
    }
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "passport-soul-section";
  section.id = "passportSoul";
  section.setAttribute("aria-labelledby", "passportSoulHeading");
  section.innerHTML = `
    <div class="passport-soul-shell">
      <div>
        <span class="passport-soul-kicker">PASSPORT RADIO™ · SOUL SIGNAL</span>
        <h2 class="passport-soul-title" id="passportSoulHeading">Soul<br>Tunnel™</h2>
        <p class="passport-soul-copy">Soul, funk, disco, jazz e grooves do Reino Unido em um sinal externo separado dos nossos players principais.</p>
        <span class="passport-soul-script">where the groove remembers.</span>
      </div>
      <div class="passport-soul-card" id="passportSoulCard">
        <div class="passport-soul-cardhead">
          <div>
            <small>UK · EXTERNAL LIVE SIGNAL</small>
            <strong>Soul Central Radio</strong>
          </div>
          <button class="passport-soul-toggle" id="passportSoulToggle" type="button" aria-expanded="false">ABRIR PLAYER</button>
        </div>
        <div class="passport-soul-framewrap">
          <iframe
            class="passport-soul-frame"
            id="passportSoulFrame"
            title="Soul Central Radio live"
            loading="lazy"
            allow="autoplay; encrypted-media"
            referrerpolicy="strict-origin-when-cross-origin"
            data-src="https://e.radio-uk.co.uk/embed/soul-central-radio-466344"></iframe>
        </div>
        <div class="passport-soul-note">Feed externo da Soul Central Radio. O player é carregado somente quando você abre esta seção.</div>
      </div>
    </div>`;

  anchor.insertAdjacentElement("afterend", section);

  const card = document.getElementById("passportSoulCard");
  const button = document.getElementById("passportSoulToggle");
  const frame = document.getElementById("passportSoulFrame");

  function pausePassportPlayers(){
    const yt = document.getElementById("tunnelPlay");
    if (yt && (yt.textContent || "").trim() === "Ⅱ") yt.click();
    const eighties = document.getElementById("passport80sAudio");
    if (eighties && !eighties.paused) eighties.pause();
  }

  button.addEventListener("click", () => {
    const open = !card.classList.contains("is-open");
    if (open) {
      pausePassportPlayers();
      if (!frame.src) frame.src = frame.dataset.src;
      card.classList.add("is-open");
      button.textContent = "FECHAR PLAYER";
      button.setAttribute("aria-expanded", "true");
    } else {
      card.classList.remove("is-open");
      button.textContent = "ABRIR PLAYER";
      button.setAttribute("aria-expanded", "false");
    }
  });
})();
