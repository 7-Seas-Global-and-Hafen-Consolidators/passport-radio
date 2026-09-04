(() => {
  if (location.pathname !== '/editorial/2026/09/03/festa-ploc-musicas-anos-80-nostalgia-shows-ao-vivo.html') return;
  const PLOC_LOGO = 'https://qualistage.com.br/files/Webdoors/image_mobile/4e90b1bb-debc-43fc-9a59-6deae0f3a96f/WEB-MOBILE.png';
  const fix = () => {
    const logo = document.querySelector('.ploc-brand');
    if (!logo) return false;
    logo.src = PLOC_LOGO;
    logo.alt = 'Festa PLOC';
    logo.style.cssText = 'position:absolute;z-index:4;top:26px;left:max(24px,calc((100vw - 1180px)/2));width:118px;height:74px;object-fit:cover;object-position:50% 8%;border-radius:10px;box-shadow:0 8px 22px rgba(0,0,0,.28);border:2px solid rgba(255,255,255,.9);';
    return true;
  };
  if (fix()) return;
  const observer = new MutationObserver(() => { if (fix()) observer.disconnect(); });
  observer.observe(document.documentElement, {childList:true, subtree:true});
  setTimeout(() => observer.disconnect(), 8000);
})();
