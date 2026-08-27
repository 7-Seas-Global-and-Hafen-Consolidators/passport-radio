(() => {
  const addRedditTop = () => {
    const actions = document.querySelector('.portal-top .top-actions');
    if (!actions || actions.querySelector('a[data-passport-reddit]')) return;

    const reddit = document.createElement('a');
    reddit.className = 'top-social';
    reddit.href = 'https://www.reddit.com/user/Passportradio_26/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button';
    reddit.target = '_blank';
    reddit.rel = 'noopener noreferrer';
    reddit.setAttribute('aria-label', 'Passport Radio no Reddit');
    reddit.setAttribute('data-passport-reddit', 'true');
    reddit.textContent = 'REDDIT';

    const youtube = [...actions.querySelectorAll('a')].find(a => a.textContent.trim() === 'YOUTUBE');
    if (youtube) youtube.insertAdjacentElement('afterend', reddit);
    else actions.appendChild(reddit);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addRedditTop, { once: true });
  } else {
    addRedditTop();
  }

  const load = src => new Promise((ok,fail)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=fail;document.head.appendChild(s)});
  (async()=>{try{await load('/js/global-signals-lib.js?v=5');await Promise.all([load('/js/global-signals-home.js?v=5'),load('/js/home-support.js?v=5')])}catch(e){console.error('Passport Home Wire',e)}})();
})();
