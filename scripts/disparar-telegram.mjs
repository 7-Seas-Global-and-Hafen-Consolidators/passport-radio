import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const site = 'https://passportradio.online';
const officialChat = '@passportradioofficial';
const officialBot = 'PassportRadioOficial_bot';

export function canonical(value) {
  const url = new URL(value, site);
  if (url.protocol !== 'https:' || !['passportradio.online', 'www.passportradio.online'].includes(url.hostname) ||
      url.port || url.username || url.password) return null;
  return site + url.pathname;
}

export function selectArticles(sitemaps, indexedUrls = []) {
  const indexed = new Set(indexedUrls.map(canonical));
  const found = new Set();
  for (const xml of sitemaps) {
    if (!/<urlset\b/.test(xml) || !/<\/urlset>/.test(xml)) throw Error('Sitemap inválido');
    for (const [, location] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = canonical(location.replaceAll('&amp;', '&'));
      if (!url) continue;
      const route = new URL(url).pathname;
      if (/^\/(?:editorial|blog)\/\d{4}\/\d{2}\/\d{2}\/[^/]+\.html$/.test(route) ||
          /^\/blog\/w\/[^/]+\.html$/.test(route) || indexed.has(url)) found.add(url);
    }
  }
  if (!found.size) throw Error('Nenhuma matéria publicada encontrada');
  return [...found];
}

export async function publish({ urls, state, save, send, limit = 10 }) {
  if (!Array.isArray(state.baseline) || !state.baseline.length || !state.deliveries ||
      Array.isArray(state.deliveries) || typeof state.deliveries !== 'object') {
    throw Error('Histórico ausente ou inválido. Revise o marco e os envios anteriores.');
  }
  for (const [url, entry] of Object.entries(state.deliveries)) {
    if (entry?.status !== 'sent' || !Number.isSafeInteger(entry.messageId)) {
      throw Error('Envio sem confirmação. Confira no canal antes de retomar: ' + url);
    }
  }
  const baseline = new Set(state.baseline.map(canonical));
  const queue = urls.filter(url => !baseline.has(url) && !Object.hasOwn(state.deliveries, url));
  for (const url of queue.slice(0, limit)) {
    state.deliveries[url] = { status: 'pending' };
    await save(state);
    const messageId = await send(url);
    if (!Number.isSafeInteger(messageId)) throw Error('Telegram não retornou ID de mensagem');
    state.deliveries[url] = { status: 'sent', messageId };
    await save(state);
    console.log('Envio confirmado:', url, messageId);
  }
  return Math.max(0, queue.length - limit);
}

async function telegram(token, method, parameters) {
  let response;
  try {
    response = await fetch('https://api.telegram.org/bot' + token + '/' + method, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(parameters),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw Error('Telegram ' + method + ': resposta indisponível');
  }
  if (!response.ok) throw Error('Telegram ' + method + ': HTTP ' + response.status);
  const payload = await response.json();
  if (!payload.ok) throw Error('Telegram recusou ' + method);
  return payload.result;
}

export async function verifyDestination(call, chat) {
  const bot = await call('getMe', {});
  if (bot?.username?.toLowerCase() !== officialBot.toLowerCase()) throw Error('Bot diferente do oficial');
  const channel = await call('getChat', { chat_id: chat });
  if (channel?.type !== 'channel' || '@' + channel.username?.toLowerCase() !== officialChat) {
    throw Error('Destino diferente do canal oficial');
  }
  const member = await call('getChatMember', { chat_id: channel.id, user_id: bot.id });
  if (member?.status !== 'administrator' || member.can_post_messages !== true) {
    throw Error('Bot sem permissão para publicar no canal oficial');
  }
  return channel.id;
}

async function main() {
  const stateDir = process.env.TELEGRAM_STATE_DIR;
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chat = process.env.TELEGRAM_CHAT_ID?.trim() || officialChat;
  if (!token) throw Error('TELEGRAM_BOT_TOKEN é obrigatório');
  const call = (method, parameters) => telegram(token, method, parameters);
  const channelId = await verifyDestination(call, chat);
  console.log('Bot, canal oficial e permissão de postagem verificados');
  if (process.argv.includes('--verify')) return;
  if (!stateDir) throw Error('Diretório do histórico obrigatório');
  const stateFile = path.join(stateDir, 'telegram-sent.json');
  const state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
  const read = async name => {
    const res = await fetch(site + '/' + name, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw Error('Falha ao ler ' + name + ': HTTP ' + res.status);
    return res.text();
  };
  const sitemaps = await Promise.all(['sitemap-blog.xml', 'sitemap.xml'].map(read));
  const indexes = await Promise.all(['editorial-feed', 'editorial-manual-feed', 'editorial-priority-feed', 'blog-feed']
    .map(async name => JSON.parse(await read('data/' + name + '.json')).items.map(item => item.url).filter(Boolean)));
  const urls = selectArticles(sitemaps, indexes.flat());
  const remaining = await publish({
    urls, state,
    async save(value) {
      await fs.writeFile(stateFile + '.tmp', JSON.stringify(value, null, 2) + '\n');
      await fs.rename(stateFile + '.tmp', stateFile);
      const git = (...args) => execFileSync('git', ['-C', stateDir, ...args], { stdio: 'inherit' });
      git('add', '--', 'telegram-sent.json');
      git('commit', '-m', 'Record Telegram delivery state');
      git('push', 'origin', 'HEAD:refs/heads/telegram-delivery-state');
    },
    async send(url) {
      const message = await call('sendMessage', {
        chat_id: channelId,
        text: '🎸 NOVA NA PASSPORT RADIO\n\n' + url,
      });
      return message?.message_id;
    },
  });
  console.log('Matérias aguardando próximo lote:', remaining);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
