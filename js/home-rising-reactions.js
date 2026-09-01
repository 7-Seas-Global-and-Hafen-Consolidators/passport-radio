(() => {
  'use strict';

  if (document.documentElement.dataset.passportRisingReactions === '2') return;
  document.documentElement.dataset.passportRisingReactions = '2';

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const style = document.createElement('style');
  style.id = 'passport-rising-reactions-style';
  style.textContent = `
    .passport-rising-reactions{position:fixed;right:clamp(10px,2vw,28px);bottom:clamp(18px,4vh,48px);width:min(260px,42vw);height:min(48vh,430px);pointer-events:none;z-index:48;overflow:visible;contain:layout style}
    .passport-rising-reaction{position:absolute;right:0;bottom:0;display:flex;align-items:center;gap:7px;max-width:240px;min-height:40px;padding:8px 11px;border-radius:999px;background:rgba(9,11,14,.90);border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 28px rgba(0,0,0,.28);color:#fff;font:700 11px/1.2 Inter,Arial,sans-serif;white-space:nowrap;opacity:0;will-change:transform,opacity;animation:passportReactionRise var(--passport-reaction-duration,5.2s) cubic-bezier(.18,.72,.25,1) forwards}
    .passport-rising-reaction--emoji{width:42px;height:42px;padding:0;justify-content:center;font-size:21px}
    .passport-rising-reaction__emoji{font-size:18px;flex:0 0 auto}.passport-rising-reaction__text{overflow:hidden;text-overflow:ellipsis}.passport-rising-reaction__name{font-weight:900}
    @keyframes passportReactionRise{0%{opacity:0;transform:translate3d(0,18px,0) scale(.78) rotate(-2deg)}14%{opacity:.96;transform:translate3d(var(--passport-reaction-drift,0px),0,0) scale(1.03) rotate(1deg)}72%{opacity:.90}100%{opacity:0;transform:translate3d(calc(var(--passport-reaction-drift,0px) * -1),calc(-1 * var(--passport-reaction-rise,280px)),0) scale(1.08) rotate(var(--passport-reaction-rotate,5deg))}}
    @media(max-width:700px){.passport-rising-reactions{right:7px;bottom:16px;width:min(220px,64vw);height:38vh}.passport-rising-reaction{max-width:210px;min-height:36px;padding:7px 9px;font-size:10px}.passport-rising-reaction--emoji{width:36px;height:36px;padding:0;font-size:18px}}
    @media(prefers-reduced-motion:reduce){.passport-rising-reactions{display:none!important}}
  `;
  document.head.appendChild(style);

  const zone = document.createElement('div');
  zone.className = 'passport-rising-reactions';
  zone.setAttribute('aria-hidden', 'true');
  document.body.appendChild(zone);

  const reactions = ['❤️','🔥','🤘','🎵','🎸','🎧'];
  const firstNames = ['Ana','Alice','Amanda','Beatriz','Bianca','Bruna','Camila','Carolina','Clara','Daniela','Eduarda','Elisa','Fernanda','Gabriela','Helena','Isabela','Julia','Larissa','Laura','Leticia','Luana','Mariana','Marina','Natalia','Paula','Rafaela','Renata','Sofia','Valentina','Vitoria','Adriana','Aline','Barbara','Cecilia','Debora','Evelyn','Flavia','Giovana','Heloisa','Ingrid','Jessica','Karen','Livia','Manuela','Nicole','Patricia','Raquel','Samara','Taina','Vanessa','Alex','Andre','Arthur','Bruno','Caio','Carlos','Daniel','Diego','Eduardo','Felipe','Gabriel','Gustavo','Henrique','Igor','Joao','Leonardo','Lucas','Marcelo','Mateus','Nicolas','Paulo','Rafael','Renan','Ricardo','Rodrigo','Samuel','Thiago','Vinicius','Adrian','Alessandro','Antoine','Bastien','Ben','Christian','David','Elias','Emil','Enzo','Erik','Fabian','Finn','Hugo','Ivan','Julian','Lars','Leo','Liam','Lorenzo','Luca','Marco','Martin','Matteo','Max','Milan','Nico','Noah','Oliver','Oscar','Pablo','Pierre','Sebastian','Theo','Thomas','Victor','Yann','Yuki','Akira','Aiko','Amelie','Anna','Anya','Astrid','Camille','Carla','Chiara','Chloe','Elena','Elise','Emma','Eva','Freya','Giulia','Hana','Ines','Iris','Jade','Julie','Klara','Lena','Leonie','Lina','Louise','Lucia','Maja','Mia','Nina','Olivia','Rita','Sara','Sarah','Selma','Stella','Zoe'];
  const lastNames = ['Silva','Santos','Oliveira','Souza','Costa','Pereira','Almeida','Ferreira','Rodrigues','Lima','Gomes','Ribeiro','Carvalho','Martins','Rocha','Barbosa','Melo','Cardoso','Teixeira','Correia','Moreira','Monteiro','Mendes','Nunes','Araujo','Freitas','Castro','Moura','Pinto','Vieira','Ramos','Reis','Lopes','Fernandes','Schmidt','Weber','Meyer','Fischer','Wagner','Becker','Hoffmann','Klein','Wolf','Schneider','Rossi','Romano','Bianchi','Ricci','Ferrari','Conti','Moretti','Marino','Greco','Bernard','Dubois','Thomas','Robert','Petit','Garcia','Lopez','Martinez','Sanchez','Romero','Navarro','Torres','Vega','Moreno','Ruiz','Jensen','Nielsen','Andersen','Johansson','Lindberg','Berg','Eriksen','Kowalski','Novak','Horvat','Petrov','Ivanov','Tanaka','Sato','Nakamura','Kim','Park','Lee'];
  const names = [];
  for (let i=0;i<firstNames.length;i++) {
    for (let j=0;j<4;j++) names.push(`${firstNames[i]} ${lastNames[(i*7+j*19)%lastNames.length]}`);
  }

  const activities = [
    ['❤️','curtiu a Passport'],['🔥','entrou no World Dial'],['🤘','descobriu um Tunnel'],['🎧','está ouvindo agora'],['🎵','voltou para ouvir'],['🎸','está explorando a Passport'],['❤️','favoritou uma estação'],['🔥','entrou em Live & Rare'],['🎧','está no Continuous Signals'],['🤘','descobriu uma nova rádio']
  ];

  let timer = 0;
  let running = true;
  let lastNameIndex = -1;

  const pickName = () => {
    let index;
    do index = Math.floor(Math.random()*names.length); while(index===lastNameIndex && names.length>1);
    lastNameIndex=index;
    return names[index];
  };

  const decorate = bubble => {
    bubble.style.setProperty('--passport-reaction-drift', `${Math.round(Math.random()*30-15)}px`);
    bubble.style.setProperty('--passport-reaction-rise', `${240+Math.round(Math.random()*120)}px`);
    bubble.style.setProperty('--passport-reaction-rotate', `${Math.round(Math.random()*10-5)}deg`);
    bubble.style.setProperty('--passport-reaction-duration', `${(4.7+Math.random()*1.8).toFixed(2)}s`);
    zone.appendChild(bubble);
    bubble.addEventListener('animationend',()=>bubble.remove(),{once:true});
    window.setTimeout(()=>bubble.remove(),7200);
  };

  const emitEmoji = symbol => {
    if(!running||document.visibilityState!=='visible')return;
    const bubble=document.createElement('span');
    bubble.className='passport-rising-reaction passport-rising-reaction--emoji';
    bubble.textContent=symbol||reactions[Math.floor(Math.random()*reactions.length)];
    decorate(bubble);
  };

  const emitActivity = () => {
    if(!running||document.visibilityState!=='visible')return;
    const [emoji,action]=activities[Math.floor(Math.random()*activities.length)];
    const bubble=document.createElement('span');
    bubble.className='passport-rising-reaction passport-rising-reaction--activity';
    const icon=document.createElement('span'); icon.className='passport-rising-reaction__emoji'; icon.textContent=emoji;
    const text=document.createElement('span'); text.className='passport-rising-reaction__text';
    const name=document.createElement('span'); name.className='passport-rising-reaction__name'; name.textContent=pickName();
    text.append(name,document.createTextNode(` ${action}`)); bubble.append(icon,text); decorate(bubble);
  };

  const emit = symbol => symbol ? emitEmoji(symbol) : (Math.random()<.58 ? emitActivity() : emitEmoji());
  const schedule = () => {
    window.clearTimeout(timer); if(!running)return;
    timer=window.setTimeout(()=>{emit();if(Math.random()<.20)window.setTimeout(()=>emit(),300+Math.random()*500);schedule();},1500+Math.random()*2700);
  };

  document.addEventListener('visibilitychange',()=>{running=document.visibilityState==='visible';if(running)schedule();else window.clearTimeout(timer);});
  window.PassportReactions=Object.freeze({emit,emitActivity,emitEmoji,namesCount:names.length});
  window.setTimeout(()=>emitActivity(),900);
  schedule();
})();
