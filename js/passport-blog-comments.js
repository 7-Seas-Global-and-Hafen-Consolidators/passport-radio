(() => {
  'use strict';
  if (window.PassportBlogComments) return;
  window.PassportBlogComments = true;

  // Fill only after the owner has deployed and verified the anonymous web app.
  const endpoint = 'https://script.google.com/macros/s/AKfycbw2OU703B9TnicycjN1ZsXCcLSfcwm8dlAF2yvvkmVJDfCuEu3WgpaOQFAkfQD2NiDI/exec';
  const articlePattern = /^\/(?:blog\/w\/|editorial\/\d{4}\/\d{2}\/\d{2}\/)[a-z0-9-]+\.html$/;
  const googleOrigin = /^https:\/\/(?:script\.google\.com|(?:[a-z0-9-]+\.)?script\.googleusercontent\.com|[a-z0-9-]+-script\.googleusercontent\.com)$/;

  function mount() {
    const main = document.querySelector('#passport-editorial-outlet main') || document.querySelector('main');
    if (!main || !articlePattern.test(location.pathname) || main.querySelector('.passport-blog-comments')) return;
    const presentation = main.querySelector('template[data-passport-editorial-presentation]');
    if (presentation && main.dataset.prReady !== 'true' && !main.dataset.prError) {
      try {
        if (JSON.parse(presentation.content.textContent).recovery) return;
      } catch (_) { /* An invalid presentation does not block comments. */ }
    }
    const section = document.createElement('section');
    section.className = 'passport-blog-comments';
    section.setAttribute('aria-labelledby', 'passport-comment-heading');
    section.innerHTML = `
      <h2 id="passport-comment-heading">Deixe seu comentário</h2>
      <p>Seu comentário passa por moderação. Use um apelido e evite dados pessoais.</p>
      <form method="post" accept-charset="UTF-8">
        <fieldset disabled>
          <label>Apelido <input name="nickname" maxlength="60" required></label>
          <label>Comentário <textarea name="comment" minlength="2" maxlength="2000" rows="5" required></textarea></label>
          <div hidden aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>
          <input name="article" type="hidden">
          <input name="requestId" type="hidden">
          <button type="submit">ENVIAR</button>
        </fieldset>
        <p role="status" aria-live="polite"></p>
      </form>`;
    main.append(section);
    const form = section.querySelector('form');
    const fields = form.querySelector('fieldset');
    const status = form.querySelector('[role="status"]');
    const button = form.querySelector('button');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) {
      status.textContent = 'Envio em preparação.';
      return;
    }
    fields.disabled = false;
    form.action = endpoint;
    form.elements.article.value = location.pathname;
    let previousContent;
    let previousId;
    form.addEventListener('submit', event => {
      if (button.disabled) {
        event.preventDefault();
        return;
      }
      const content = JSON.stringify([form.elements.nickname.value, form.elements.comment.value]);
      const id = content === previousContent ? previousId : crypto.randomUUID();
      previousContent = content;
      previousId = id;
      form.elements.requestId.value = id;
      const frame = document.createElement('iframe');
      frame.name = 'passport-comment-' + id;
      frame.hidden = true;
      frame.title = 'Confirmação do comentário';
      section.append(frame);
      form.target = frame.name;
      button.disabled = true;
      status.textContent = 'Enviando…';

      function finish(message) {
        clearTimeout(timeout);
        window.removeEventListener('message', receive);
        frame.remove();
        button.disabled = false;
        status.textContent = message;
      }
      function receive(event) {
        if (!googleOrigin.test(event.origin) || event.data?.type !== 'passport-comment' || event.data.id !== id) return;
        if (event.data.received === true) {
          form.elements.nickname.value = '';
          form.elements.comment.value = '';
          previousContent = undefined;
          finish('Comentário recebido para moderação.');
        } else {
          finish('Envio recusado. Confira os campos e tente novamente em instantes.');
        }
      }
      const timeout = setTimeout(() => finish('O envio não foi confirmado. Você pode tentar novamente.'), 20000);
      window.addEventListener('message', receive);
    });
  }

  function start() {
    mount();
    new MutationObserver(records => {
      if (records.some(record => record.type === 'attributes' || [...record.addedNodes].some(node =>
        node.nodeType === 1 && (node.matches('main') || node.querySelector('main'))))) mount();
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-pr-ready', 'data-pr-error'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.addEventListener('passport:editorial-rendered', mount);
})();
