/* Home interactions only. Não possui áudio nem cria players. */
(() => {
  "use strict";
  function openHouse(path) {
    const house=document.querySelector('#passport-casas details[data-house="'+CSS.escape(path)+'"]');
    if(!house)return;
    house.open=true;
    house.scrollIntoView({behavior:"smooth",block:"start"});
  }
  document.addEventListener("click",event=>{
    const trigger=event.target.closest("[data-open-existing-house]");
    if(!trigger)return;
    event.preventDefault();openHouse(trigger.dataset.openExistingHouse);
  });
})();