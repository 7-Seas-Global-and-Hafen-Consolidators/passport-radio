import assert from 'node:assert/strict';
import test from 'node:test';
import { deliver } from './whatsapp_channel_bridge.mjs';
const items = ['a', 'b'].map(id => ({id, url: 'https://passportradio.online/blog/w/' + id + '.html', text: id}));
test('records intent and server acknowledgement in order, then skips receipts', async () => {
  const journal = { sent: [], deliveries: {} };
  const events = [];
  const save = value => events.push(Object.values(value.deliveries).at(-1).status);
  const send = async text => { events.push(text); return String(events.length); };
  await deliver(items, journal, save, send, () => 'local');
  await deliver(items, journal, save, send, () => 'local');
  assert.deepEqual(events, ['pending', 'a', 'sent', 'pending', 'b', 'sent']);
});
test('missing server ID leaves pending and prevents a second attempt', async () => {
  const journal = { sent: [], deliveries: {} };
  await assert.rejects(deliver(items, journal, () => {}, async () => undefined, () => 'local'), /post ID/);
  await assert.rejects(deliver(items, journal, () => {}, async () => assert.fail('duplicate'), () => 'local'), /Unconfirmed/);
});
