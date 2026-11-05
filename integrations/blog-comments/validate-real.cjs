/* Owner-authorized live acceptance. Writes two labelled test comments and replays their IDs. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright');
const root = path.resolve(__dirname, '../..');
const output = path.join(root, 'docs/blog-comments-validation-20261105');
const site = 'https://passportradio.online';
const article = '/editorial/2026/10/07/kurt-cobain-lennon-mccartney-beatles.html';
const files = ['/js/passport-blog-shell.js', '/js/passport-editorial-layout.js', '/js/passport-blog-comments.js', '/css/passport-blog-comments.css'];
const endpoint = fs.readFileSync(path.join(root, files[2]), 'utf8').match(/const endpoint = '([^']+)'/)[1];
const report = {
  testedHead: require('node:child_process').execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  browser: 'Chromium, new contexts without Google login',
  physicalPhone: false,
  method: 'Public pages with exactly four PR resources intercepted from the tested commit. Real radio streams and Google endpoint. No HTML fixture or audio response substitution.',
  codeHashes: Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')])),
  cases: []
};
fs.mkdirSync(output, { recursive: true });
const resultFile = process.env.COMMENTS_RETRY_ID ? 'retry-results.json' : 'browser-results.json';
const save = () => fs.writeFileSync(path.join(output, resultFile), JSON.stringify(report, null, 2) + '\n');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.COMMENTS_CHROME,
    args: ['--no-sandbox'],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined
  });
  try {
    for (const width of process.env.COMMENTS_ONLY_WIDTH ? [Number(process.env.COMMENTS_ONLY_WIDTH)] : [1440, 390]) {
      const result = { width, passed: false, snapshots: [], postIds: [], screenshots: [] };
      report.cases.push(result);
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        isMobile: width === 390,
        hasTouch: width === 390,
        ignoreHTTPSErrors: true
      });
      if (process.env.COMMENTS_RETRY_ID) await context.addInitScript(id => {
        Object.defineProperty(crypto, 'randomUUID', { value: () => id });
      }, process.env.COMMENTS_RETRY_ID);
      const page = await context.newPage();
      result.googleRequests = [];
      result.messages = [];
      result.pageErrors = [];
      page.on('pageerror', error => result.pageErrors.push(error.message));
      page.on('response', response => {
        const url = new URL(response.url());
        if (url.hostname === 'script.google.com' || url.hostname.endsWith('googleusercontent.com')) {
          result.googleRequests.push({ host: url.hostname, status: response.status() });
          save();
        }
      });
      page.on('requestfailed', request => {
        const url = new URL(request.url());
        if (url.hostname === 'script.google.com' || url.hostname.endsWith('googleusercontent.com')) {
          result.googleRequests.push({ host: url.hostname, error: request.failure()?.errorText });
          save();
        }
      });
      await page.exposeFunction('recordReceipt', message => { result.messages.push(message); save(); });
      await context.addInitScript(() => {
        window.addEventListener('message', event => {
          if (event.data?.type === 'passport-comment') window.recordReceipt?.({ origin: event.origin, data: event.data });
        });
      });
      page.setDefaultTimeout(35000);
      await context.route('**/*', route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin === site && files.includes(url.pathname)) {
          return route.fulfill({
            body: fs.readFileSync(path.join(root, url.pathname)),
            contentType: url.pathname.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8'
          });
        }
        // Embedded provider documents are outside the radio stream/form acceptance.
        if (request.resourceType() === 'document' && url.origin !== site &&
            url.hostname !== 'script.google.com' && !url.hostname.endsWith('googleusercontent.com')) return route.abort();
        return route.continue();
      });
      page.on('request', request => {
        if (request.method() === 'POST' && request.url() === endpoint) {
          const fields = Object.fromEntries(new URLSearchParams(request.postData()));
          result.postIds.push(fields.requestId);
          result.lastPost = fields;
          save();
          console.log(JSON.stringify({ width, postId: fields.requestId }));
        }
      });
      async function snapshot(label) {
        const state = await page.evaluate(() => {
          const audio = document.getElementById('passportHitsAudio');
          return {
            sameAudio: audio === window.acceptanceAudio,
            sameDocument: performance.timeOrigin === window.acceptanceDocument,
            sameSource: audio?.currentSrc === window.acceptanceSource,
            currentTime: audio?.currentTime,
            decodedBytes: audio?.webkitAudioDecodedByteCount,
            volume: audio?.volume,
            paused: audio?.paused,
            active: [...document.querySelectorAll('audio')].filter(item => !item.paused).length
          };
        });
        const previous = result.snapshots.at(-1);
        assert(state.sameAudio && state.sameDocument && state.sameSource && !state.paused && state.active === 1, label);
        if (previous) {
          assert(state.currentTime > previous.currentTime, label + ': time');
          assert(state.decodedBytes > previous.decodedBytes, label + ': decoding');
          assert.equal(state.volume, previous.volume);
        }
        result.snapshots.push({ label, ...state });
        save();
      }
      async function capture(label, form) {
        await form.scrollIntoViewIfNeeded();
        await page.evaluate(() => document.fonts.ready);
        const file = width + '-' + label + '.png';
        await page.screenshot({ path: path.join(output, file) });
        await form.screenshot({ path: path.join(output, width + '-' + label + '-form.png') });
        result.screenshots.push(file, width + '-' + label + '-form.png');
      }
      try {
        await page.goto(site + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() => window.PassportAudioRuntime?.ready, null, { timeout: 150000 });
        const cookies = page.getByRole('button', { name: 'ACEITAR COOKIES', exact: true });
        if (await cookies.count()) await cookies.click();
        assert.equal(await page.locator('audio').evaluateAll(items => items.filter(item => !item.paused).length), 0);
        await page.getByRole('button', { name: 'Hits', exact: true }).click();
        await page.waitForFunction(() => {
          const audio = document.getElementById('passportHitsAudio');
          return audio && !audio.paused && audio.currentTime > 1 && audio.webkitAudioDecodedByteCount > 0;
        }, null, { timeout: 65000 });
        await page.evaluate(() => {
          window.acceptanceAudio = document.getElementById('passportHitsAudio');
          window.acceptanceDocument = performance.timeOrigin;
          window.acceptanceSource = window.acceptanceAudio.currentSrc;
        });
        await snapshot('Home');
        await page.locator('.pb-nav a[href="/blog.html"]').first().click();
        await page.waitForURL(site + '/blog.html');
        await page.locator('#passport-editorial-outlet main').waitFor();
        await page.waitForTimeout(800);
        await snapshot('Blog');
        await page.locator('#passport-editorial-outlet a[href="' + article + '?passport-area=blog"]').first().click();
        await page.waitForURL(site + article + '?passport-area=blog');
        const form = page.locator('#passport-editorial-outlet .passport-blog-comments');
        await form.waitFor();
        await page.waitForTimeout(800);
        await snapshot('Article');
        result.before = await form.evaluate(section => ({
          width: innerWidth,
          pageWidth: document.documentElement.scrollWidth,
          sectionWidth: section.getBoundingClientRect().width,
          headingFont: getComputedStyle(section.querySelector('h2')).fontFamily,
          inputFont: getComputedStyle(section.querySelector('input')).fontFamily,
          buttonFont: getComputedStyle(section.querySelector('button')).fontFamily,
          color: getComputedStyle(section).color,
          background: getComputedStyle(section).backgroundColor,
          buttonBackground: getComputedStyle(section.querySelector('button')).backgroundColor,
          overflow: [...section.querySelectorAll('*')].filter(element => {
            const box = element.getBoundingClientRect();
            return box.width && (box.left < -1 || box.right > innerWidth + 1);
          }).map(element => element.tagName)
        }));
        assert(result.before.pageWidth <= width && !result.before.overflow.length, 'Form overflow');
        await capture('empty', form);
        await form.getByLabel('Apelido', { exact: true }).fill('Teste Work PR 589 — ' + width);
        await form.getByLabel('Comentário', { exact: true }).fill('Teste técnico autorizado de validação visual ' + width + ' px. Não publicar.');
        await capture('filled', form);
        const pagesBefore = context.pages().length;
        await form.getByRole('button', { name: 'ENVIAR', exact: true }).dblclick({ delay: 40 });
        await form.getByText('Comentário recebido para moderação.', { exact: true }).waitFor({ timeout: 70000 });
        assert.equal(result.postIds.length, 1, 'Double click sent twice');
        assert.equal(context.pages().length, pagesBefore, 'Submission opened another page');
        result.confirmed = true;
        await capture('received', form);
        await snapshot('After send');
        // Replay exactly the same ID, without creating a second logical comment.
        await page.evaluate(({ endpoint, fields }) => {
          window.replayReceipt = null;
          window.addEventListener('message', event => {
            if (event.data?.type === 'passport-comment' && event.data.id === fields.requestId &&
                /^https:\/\/(?:script\.google\.com|[a-z0-9-]+-script\.googleusercontent\.com)$/.test(event.origin)) {
              window.replayReceipt = event.data.received;
            }
          });
          const frame = document.createElement('iframe');
          frame.hidden = true;
          frame.name = 'acceptance-replay';
          document.body.append(frame);
          const replay = document.createElement('form');
          replay.hidden = true;
          replay.method = 'post';
          replay.action = endpoint;
          replay.target = frame.name;
          for (const [name, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.name = name;
            input.value = value;
            replay.append(input);
          }
          document.body.append(replay);
          replay.submit();
        }, { endpoint, fields: result.lastPost });
        await page.waitForFunction(() => window.replayReceipt === true, null, { timeout: 90000 });
        result.replayConfirmed = true;
        assert.equal(result.postIds.length, 2);
        assert.equal(new Set(result.postIds).size, 1);
        await snapshot('After replay');
        await page.locator('.pb-nav a[href="/"]').first().click();
        await page.waitForURL(site + '/');
        await page.waitForTimeout(800);
        await snapshot('Return Home');
        result.passed = true;
        console.log(JSON.stringify({ width, passed: true, id: result.postIds[0] }));
      } catch (error) {
        result.error = error.message;
        console.log(JSON.stringify({ width, error: error.message }));
        result.status = await page.locator('.passport-blog-comments [role="status"]').textContent().catch(() => null);
        result.frameStates = await Promise.all(page.frames().filter(frame => frame.url().includes('script.google')).map(async frame => ({
          host: new URL(frame.url()).hostname,
          text: await frame.locator('body').innerText().then(text => text.replace(/[^\s@]+@[^\s]+/g, '[email redacted]').slice(0, 150)).catch(() => '')
        })));
        await page.screenshot({ path: path.join(output, width + '-failure.png') }).catch(() => {});
        await snapshot('After failure').catch(() => {});
        await page.locator('.pb-nav a[href="/"]').first().click().then(async () => {
          await page.waitForURL(site + '/');
          await page.waitForTimeout(800);
          await snapshot('Return Home after failure');
        }).catch(() => {});
      } finally {
        save();
        await context.close();
      }
    }
  } finally {
    await browser.close();
    save();
  }
  if (report.cases.some(result => !result.passed)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
