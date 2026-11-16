(() => {
  'use strict';

  if (document.documentElement.hasAttribute('data-passport-legal-shield')) return;
  document.documentElement.setAttribute('data-passport-legal-shield', '');

  const protectedContent = 'audio, video, .member-photo, .band-banner, #mr-nomad-photo';
  let dialog;

  function showNotice() {
    if (!dialog?.isConnected) {
      dialog = document.createElement('dialog');
      dialog.id = 'passport-legal-notice';
      dialog.setAttribute('aria-labelledby', 'passport-legal-notice-title');
      dialog.setAttribute('aria-describedby', 'passport-legal-notice-text');
      dialog.innerHTML = `
        <h2 id="passport-legal-notice-title">⚠️ PROPRIEDADE INTELECTUAL PROTEGIDA — PASSPORT RADIO®</h2>
        <p id="passport-legal-notice-text">Este conteúdo fonográfico, audiovisual ou gráfico é propriedade exclusiva da Passport Radio® (CNPJ 68.923.772/0001-39 · Campinas/SP), protegido pela Lei Federal nº 9.610/98 e normas internacionais (DMCA). A cópia, extração (ripping), download ou reprodução não autorizada constitui violação de direitos autorais sujeita às sanções civis e penais cabíveis (Art. 184 do Código Penal).</p>
        <form method="dialog">
          <a href="/direitos-autorais.html">Ler Aviso Legal Completo</a>
          <button type="submit" autofocus>Fechar</button>
        </form>`;

      if (!document.getElementById('passport-legal-notice-style')) {
        const style = document.createElement('style');
        style.id = 'passport-legal-notice-style';
        style.textContent = `
          #passport-legal-notice {
            box-sizing: border-box;
            position: fixed;
            inset: 0;
            margin: auto;
            inline-size: min(40rem, calc(100% - 2rem));
            max-block-size: calc(100% - 2rem);
            overflow: auto;
            padding: clamp(1rem, 4vw, 2rem);
            background: #f7f5f0;
            color: #111;
            border: 1px solid #666;
            border-radius: 0.5rem;
            font: 1rem/1.55 "Instrument Sans", Arial, sans-serif;
          }
          #passport-legal-notice::backdrop { background: rgb(0 0 0 / 65%); }
          #passport-legal-notice h2 {
            margin: 0;
            font: 700 clamp(1.15rem, 4vw, 1.6rem)/1.2 "Bodoni Moda", Georgia, serif;
          }
          #passport-legal-notice form { display: flex; flex-wrap: wrap; gap: 0.75rem; }
          #passport-legal-notice a, #passport-legal-notice button {
            padding: 0.65rem 1rem;
            border: 1px solid #b20f18;
            border-radius: 0.25rem;
            font: inherit;
            cursor: pointer;
          }
          #passport-legal-notice a { background: #b20f18; color: #fff; text-decoration: none; }
          #passport-legal-notice button { background: transparent; color: #111; }
        `;
        document.head.append(style);
      }

      dialog.querySelector('a').addEventListener('click', () => dialog.close());
      document.body.append(dialog);
    }
    if (!dialog.open) dialog.showModal();
  }

  document.addEventListener('contextmenu', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest(protectedContent)) return;
    event.preventDefault();
    showNotice();
  });

  document.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
    if (!['s', 'u'].includes(event.key.toLowerCase())) return;
    event.preventDefault();
    showNotice();
  });
})();
