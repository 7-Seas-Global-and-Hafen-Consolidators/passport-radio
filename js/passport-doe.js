/* PASSPORT RADIO · área DOE — Fofonete pede, Passport recebe, Asaas converte. */
(() => {
  "use strict";
  const ASAAS = "https://www.asaas.com/c/shpb8gbiswnw4t2n";
  const root = document.getElementById("pp-doe");
  if (!root) return;
  const home = root.getAttribute("data-doe") === "home";
  const call = home ? "" : `<div class="pp-doe__call">
    <img src="/images/fofonete-caderninho.jpg" alt="Fofonete da Passport Radio com o caderninho de contas">
    <div>
      <span class="pp-doe__kicker">Fofonete pede · Passport recebe</span>
      <p>A Fofonete chama, cobra e conduz. A doação é para a Passport Radio — não para a personagem.</p>
    </div>
  </div>`;
  root.innerHTML = `
    <header class="pp-doe__open">
      <span class="pp-doe__kicker">DOE · PASSPORT RADIO</span>
      <h1 class="pp-doe__title">DOE</h1>
      <p class="pp-doe__sub">Ajude a manter a Passport Radio viva.</p>
      <em class="pp-doe__sign">Passport Radio</em>
    </header>
    ${call}
    <div class="pp-doe__why">
      <h2>Quem criou e quem mantém</h2>
      <p>A Passport Radio é um projeto independente criado e mantido por Mr. Nomad. A rádio, o arquivo editorial, as estações, a infraestrutura e a produção têm custos permanentes. Sua doação ajuda a manter a Passport no ar e a continuar ampliando seu acervo musical.</p>
    </div>
    <ul class="pp-doe__uses">
      <li><b>Infraestrutura e servidores</b><span>A casa digital, o domínio e o que segura a rádio no ar.</span></li>
      <li><b>Streaming e distribuição</b><span>Sinais 24h, estações e o caminho da música até o ouvinte.</span></li>
      <li><b>Produção editorial</b><span>Matérias, arquivo vivo e a redação que a Passport apresenta.</span></li>
      <li><b>Preservação e expansão do acervo</b><span>Memória musical que não cabe em um feed de passagem.</span></li>
    </ul>
    <div class="pp-doe__flow">
      <p>A Passport explica. A Fofonete chama. DOE AGORA converte. O Asaas recebe — PIX, boleto ou cartão. A Passport não fixa o valor: no checkout você escolhe a contribuição.</p>
      <a class="pp-doe__cta" href="${ASAAS}" target="_blank" rel="noopener">DOE AGORA</a>
      <span class="pp-doe__gate">Pagamento processado por Asaas · Passport Radio</span>
    </div>`;
})();
