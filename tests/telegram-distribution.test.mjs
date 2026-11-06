import test from 'node:test';
import assert from 'node:assert/strict';
import { selectArticles, publish } from '../scripts/disparar-telegram.mjs';

const blog = 'https://passportradio.online/blog/w/teste.html';
const news = 'https://passportradio.online/editorial/2026/11/05/teste.html';
const state = () => ({ baseline: ['https://passportradio.online/blog/w/historico.html'], deliveries: {} });

test('selects Blog and Notícias, deduplicates aliases and excludes navigation', () => {
  const xml = urls => '<urlset>' + urls.map(url => '<url><loc>' + url + '</loc></url>').join('') + '</urlset>';
  assert.deepEqual(selectArticles([xml([blog, news, blog.replace('://', '://www.') + '?x=1', 'https://passportradio.online/blog/e/teste.html'])]), [blog, news]);
  assert.throws(() => selectArticles(['<html>erro</html>']), /Sitemap inválido/);
});

test('persists intent and receipt, drains backlog and does not resend', async () => {
  const journal = state();
  const events = [];
  const options = {
    urls: [journal.baseline[0], blog, news], state: journal, limit: 1,
    save: async value => events.push(structuredClone(value.deliveries)),
    send: async url => { events.push(url); return 42; },
  };
  assert.equal(await publish(options), 1);
  assert.deepEqual(events, [{ [blog]: { status: 'pending' } }, blog, { [blog]: { status: 'sent', messageId: 42 } }]);
  assert.equal(await publish(options), 0);
  assert.equal(events[4], news);
  assert.equal(await publish(options), 0);
  assert.equal(events.length, 6);
});

test('ambiguous delivery blocks retry and failed persistence prevents sending', async () => {
  const journal = state();
  const options = { urls: [blog], state: journal, save: async () => {}, send: async () => { throw Error('timeout'); } };
  await assert.rejects(publish(options), /timeout/);
  await assert.rejects(publish(options), /sem confirmação/);
  await assert.rejects(publish({ ...options, state: state(), save: async () => { throw Error('push'); },
    send: async () => assert.fail('sent without persistence') }), /push/);
  await assert.rejects(publish({ ...options, state: {} }), /Histórico/);
});
