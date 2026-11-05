const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const modules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const { chromium } = require(modules ? modules + '/playwright' : 'playwright');
const root = path.resolve(__dirname, '../..');
const site = 'https://passportradio.online';
const endpoint = 'https://script.google.com/macros/s/browser-test/exec';
const article = '/blog/w/000001-led-zeppelin.html';
const editorial = '/editorial/2026/10/07/kurt-cobain-lennon-mccartney-beatles.html';

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.COMMENTS_CHROME, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const posts = [];
    page.on('pageerror', error => console.error(error.message));
    page.setDefaultTimeout(5000);
    let active = false;
    await page.route('**/*', async route => {
      const req = route.request();
      const url = new URL(req.url());
      if (req.url() === endpoint) {
        assert.equal(req.method(), 'POST');
        const fields = new URLSearchParams(req.postData());
        posts.push(Object.fromEntries(fields));
        return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<script>top.postMessage(' +
          JSON.stringify({ type: 'passport-comment', id: fields.get('requestId'), received: true }) +
          ', "https://passportradio.online");</script>' });
      }
      if (url.origin !== site) return route.abort();
      if (url.pathname === article || url.pathname === editorial || url.pathname === '/blog.html') {
        const script = url.pathname === editorial ? 'passport-editorial-layout' : 'passport-blog-shell';
        return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<main><h1>Matéria</h1><article>Texto original</article><audio id="radio"></audio></main>' +
          '<script src="/js/' + script + '.js" defer></script>' });
      }
      if (/^\/(js|css)\/[^/]+$/.test(url.pathname)) {
        const file = path.join(root, url.pathname);
        if (!fs.existsSync(file)) return route.fulfill({ status: 404 });
        let body = fs.readFileSync(file, 'utf8');
        if (url.pathname.endsWith('/passport-blog-comments.js')) {
          body = body.replace(/const endpoint = '[^']*';/, 'const endpoint = ' + JSON.stringify(active ? endpoint : '') + ';');
        }
        return route.fulfill({ body, contentType: url.pathname.endsWith('.css') ? 'text/css' : 'application/javascript; charset=utf-8' });
      }
      return route.abort();
    });
    await page.goto(site + article);
    await page.getByText('Envio em preparação.').waitFor();
    assert(await page.getByRole('button', { name: 'ENVIAR', exact: true }).isDisabled());
    assert.equal(posts.length, 0);
    await page.goto(site + '/blog.html');
    assert.equal(await page.locator('.passport-blog-comments').count(), 0);
    active = true;
    for (const entry of [article, editorial]) {
      await page.goto(site + entry);
      await page.getByLabel('Apelido').fill('Leitor');
      await page.getByLabel('Comentário', { exact: true }).fill('Ótima matéria.');
      await page.evaluate(() => { window.originalRadio = document.querySelector('#radio'); });
      await page.getByRole('button', { name: 'ENVIAR', exact: true }).click();
      await page.getByText('Comentário recebido para moderação.').waitFor();
      assert.equal(posts.at(-1).article, entry);
      assert.equal(posts.at(-1).nickname, 'Leitor');
      assert.equal(posts.at(-1).comment, 'Ótima matéria.');
      assert(await page.evaluate(() => window.originalRadio === document.querySelector('#radio')));
      assert.equal(await page.locator('article').textContent(), 'Texto original');
    }
    await page.evaluate(route => {
      history.pushState(null, '', route);
      const main = document.createElement('main');
      main.innerHTML = '<h1>Outra matéria</h1><article>Preservado</article>';
      document.querySelector('main').replaceWith(main);
      dispatchEvent(new Event('passport:editorial-rendered'));
    }, article);
    await page.getByLabel('Apelido').waitFor();
    assert.equal(await page.locator('.passport-blog-comments').count(), 1);
    assert.equal(posts.length, 2);
    console.log('PASS: inactive form, Blog cover exclusion, two article entries, anonymous POST and receipt, original nodes, editorial navigation event.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
