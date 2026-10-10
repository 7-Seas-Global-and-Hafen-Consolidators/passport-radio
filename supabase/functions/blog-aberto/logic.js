// Blog Aberto — envio, comentário e painel.
// O navegador não insere. A chave de serviço só entra por ambiente.
// Publicar não atualiza refs/heads/main e não faz merge da #531.
// A tela só fica "publicada e verificada" depois que a URL responde.

const PARTICIPATION_TYPES = ["materia", "banda", "programa"];
const CATEGORIES = ["historias", "discos", "cultura", "shows", "entrevistas"];
const STATUSES = [
  "recebida",
  "pendente_revisao",
  "aprovada_aguardando",
  "publicando",
  "publicada_verificada",
  "rejeitada",
  "falha_publicacao"
];
const MAX_BODY = 8000;
const MIN_BODY = 40;
const MAX_FILE = 2 * 1024 * 1024;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 2 * 60 * 60 * 1000;
const FORBIDDEN_PR = 531;
const SITE = "https://passportradio.online";
const REPO_FALLBACK = "7-Seas-Global-and-Hafen-Consolidators/passport-radio";

const PHONE = /(?:\+55\s*)?\([1-9]{2}\)\s*(?:9\d{4}|\d{4})[-.\s]\d{4}|\b[1-9]{2}\s9\d{4}[-.\s]\d{4}\b|\b(?:telefone|celular|whatsapp|whats|zap|fone)\b[^.\n]{0,30}\d{4,5}[-.\s]\d{4}/i;
const CPF = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/;
const CEP = /\b\d{5}-\d{3}\b/;
const EMAIL_IN_TEXT = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const ADDRESS = /\b(?:rua|avenida|av\.|travessa|alameda|rodovia|estrada)\s+\S[^.\n]{0,80}?\d{1,5}\b/i;
const FAMILY = /\b(?:meu|minha)\s+(?:filho|filha|m[aã]e|pai|esposa|marido|irm[aã]o|irma)\s+[A-ZÁÉÍÓÚÂÊÔÃÕ][\p{L}'-]{1,40}/u;
const CIVIL = /\b(?:meu nome civil|meu nome completo|chamo-me|eu me chamo|portador(?:a)? do (?:rg|cpf)|meu rg\b|meu cpf\b|meu endere[cç]o)\b/i;
const HARM = [
  /\b(?:matar|eliminar|exterminar|espancar|expulsar)\s+(?:todos?\s+)?(?:os?\s+|as?\s+)?(?:negros|judeus|gays|homossexuais|indigenas|indígenas|mulheres|imigrantes|muçulmanos)\b/i,
  /\b(?:negros|judeus|gays|homossexuais|indígenas|imigrantes|muçulmanos)\s+(?:são|sao)\s+(?:inferiores|animais|pragas|vermes)\b/i,

  /\bvou te matar\b/i,
  /\bte mato\b/i,
  /\bmerece morrer\b/i,
  /\bsei onde (?:voc[eê]|vc) mora\b/i,
  /\bte vigio\b/i,
  /\bestou na sua porta\b/i,
  /\b(?:nigger|nigga)\b/i,
  /\bmacaco(?:s)?\s+(?:preto|preta|fedorento)s?\b/i,
  /\b(?:sua puta|seu viado|vou te estuprar)\b/i
];
const INJECT = [
  /<\s*script/i,
  /<\s*iframe/i,
  /javascript\s*:/i,
  /\bon(?:error|load|click|mouseover)\s*=/i,
  /data\s*:\s*text\/html/i,
  /\bunion\s+select\b/i,
  /\bdrop\s+table\b/i,
  /<\s*\/?\s*[a-z!]/i
];
const BAD_LINK = /https?:\/\/\S+\.(?:exe|zip|scr|apk|bat|cmd|msi)\b|https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/i;
const EMAIL_FIELD = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORY_PATH = /^\/[a-z0-9/_.-]+$/i;

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

export function privacyHit(text) {
  const raw = String(text || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (PHONE.test(raw) || CPF.test(raw) || /\b(?:cpf|rg|passaporte)\s*[:=]?\s*\d[\d. -]{6,}/i.test(raw) || /\b\d{11}\b/.test(raw) || CEP.test(raw) || ADDRESS.test(raw) || FAMILY.test(raw) || CIVIL.test(raw) || EMAIL_IN_TEXT.test(raw)) {
    return "Não recebido. Tem dado pessoal. Nada foi publicado.";
  }
  return "";
}

export function contentHit(text) {
  const raw = String(text || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "");
  for (const rule of HARM) {
    if (rule.test(raw)) return "Não recebido. O texto não entra. Nada foi publicado.";
  }
  for (const rule of INJECT) {
    if (rule.test(raw)) return "Não recebido. O texto não entra. Nada foi publicado.";
  }
  if (BAD_LINK.test(raw)) return "Não recebido. O texto não entra. Nada foi publicado.";
  const links = raw.match(/https?:\/\/\S+/gi) || [];
  if (links.length > 6) return "Não recebido. O texto não entra. Nada foi publicado.";
  return "";
}

function clean(value, max) {
  return String(value || "").replace(/\u0000/g, "").trim().slice(0, max);
}

function rulesOk(value) {
  return /^(1|true|on|sim|yes)$/i.test(String(value || "").trim());
}

function originOf(req) {
  const headed = req && req.headers && req.headers.get ? req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "" : "";
  const ip = String(headed).split(",")[0].trim() || "missing";
  return ip.slice(0, 80);
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(text)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function jwtPayload(token) {
  const part = String(token || "").split(".")[1];
  if (!part) return {};
  try {
    const pad = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function bearer(req) {
  const header = req && req.headers && req.headers.get ? req.headers.get("authorization") || "" : "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

function fail(status, message) {
  return { status, body: { ok: false, message } };
}

function received() {
  return { status: 200, body: { ok: true, message: "Recebido." } };
}

export function assertInsertStatus(status) {
  if (status && status !== "recebida") {
    throw Object.assign(new Error("status"), { publicMessage: "Não recebido. O estado não entra pelo visitante. Nada foi publicado." });
  }
}

function clock(ctx) {
  return typeof ctx.clock === "function" ? ctx.clock() : Date.now();
}

function iso(ctx) {
  return new Date(clock(ctx)).toISOString();
}

function tooFast(opened, ctx) {
  const started = Number(opened);
  if (!Number.isFinite(started)) return true;
  const delta = clock(ctx) - started;
  return delta < MIN_DELAY_MS || delta > MAX_DELAY_MS;
}

export function createMemoryStore(initial) {
  const seed = initial || {};
  const db = {
    blog_submissions: (seed.submissions || []).map((row) => ({ ...row })),
    blog_aberto_comments: (seed.comments || []).map((row) => ({ ...row })),
    blog_controls: [{
      id: 1,
      submissions_open: false,
      comments_open: false,
      attachments_open: false,
      interactions_closed: true,
      ...(seed.controls || {})
    }],
    blog_control_log: [],
    blog_rate_limits: []
  };
  return {
    dump: () => db,
    async getControls() {
      return { ...db.blog_controls[0] };
    },
    async setControls(patch) {
      Object.assign(db.blog_controls[0], patch);
      return { ...db.blog_controls[0] };
    },
    async insertSubmission(row) {
      if (row.status !== "recebida") throw new Error("status de insert recusado");
      db.blog_submissions.push({ ...row });
      return { ...row };
    },
    async updateSubmission(id, patch) {
      const row = db.blog_submissions.find((item) => item.id === id);
      if (!row) throw new Error("db");
      Object.assign(row, patch, { updated_at: new Date().toISOString() });
      return { ...row };
    },
    async listSubmissions() {
      return db.blog_submissions.map((row) => ({ ...row }));
    },
    async insertComment(row) {
      if (row.status !== "pendente_revisao") throw new Error("status de insert recusado");
      db.blog_aberto_comments.push({ ...row });
      return { ...row };
    },
    async updateComment(id, patch) {
      const row = db.blog_aberto_comments.find((item) => item.id === id);
      if (!row) throw new Error("db");
      Object.assign(row, patch);
      return { ...row };
    },
    async listComments() {
      return db.blog_aberto_comments.map((row) => ({ ...row }));
    },
    async listPublicComments(story) {
      return db.blog_aberto_comments
        .filter((row) => row.story_url === story && row.status === "aprovado")
        .map((row) => ({ pseudonym: row.pseudonym, body: row.body, created_at: row.created_at }));
    },
    async countRecent(originHash, kind, sinceIso) {
      return db.blog_rate_limits.filter((row) => row.origin_hash === originHash && row.kind === kind && row.created_at >= sinceIso).length;
    },
    async addAttempt(originHash, kind, createdAt) {
      db.blog_rate_limits.push({ origin_hash: originHash, kind, created_at: createdAt });
    },
    async addLog(entry) {
      db.blog_control_log.push(entry);
    },
    async listLog() {
      return db.blog_control_log.map((row) => ({ ...row }));
    },
    async saveAttachment(path) {
      db.attachments = db.attachments || [];
      db.attachments.push(path);
      return path;
    }
  };
}

function createFailingStore() {
  const boom = async () => { throw new Error("db"); };
  return {
    getControls: boom,
    setControls: boom,
    insertSubmission: boom,
    updateSubmission: boom,
    listSubmissions: boom,
    insertComment: boom,
    updateComment: boom,
    listComments: boom,
    listPublicComments: boom,
    countRecent: boom,
    addAttempt: boom,
    addLog: boom,
    listLog: boom,
    saveAttachment: boom
  };
}

async function restCall(fetchImpl, env, method, path, body, prefer) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetchImpl(env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1" + path, {
    method,
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: prefer || "return=representation"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (!res.ok) throw new Error("db");
  const text = await res.text();
  if (!text) return null;
  const data = JSON.parse(text);
  return Array.isArray(data) ? data[0] : data;
}

export function createRestStore(env, fetchImpl) {
  if (!env || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return createFailingStore();
  const call = (method, path, body, prefer) => restCall(fetchImpl, env, method, path, body, prefer);
  return {
    async getControls() {
      const row = await restCall(fetchImpl, env, "GET", "/blog_controls?id=eq.1&select=id,submissions_open,comments_open,attachments_open,interactions_closed", undefined, "return=representation");
      if (!row || !row.id) return { submissions_open: false, comments_open: false, attachments_open: false, interactions_closed: true };
      return row;
    },
    async setControls(patch) {
      await call("PATCH", "/blog_controls?id=eq.1", patch, "return=minimal");
      return patch;
    },
    async insertSubmission(row) {
      if (row.status !== "recebida") throw new Error("status de insert recusado");
      return call("POST", "/blog_submissions", row);
    },
    async updateSubmission(id, patch) {
      if (!UUID.test(id)) throw new Error("db");
      return call("PATCH", "/blog_submissions?id=eq." + encodeURIComponent(id), patch, "return=minimal");
    },
    async listSubmissions() {
      const res = await fetchImpl(env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/blog_submissions?select=id,pseudonym,email,title,category,body,status,created_at,approved_at,published_url,github_pr,github_branch,failure_note,attachment_path,publish_attempt,rules_accepted,user_id,participation_type,reference_links,official_links,rejection_reason,notification_status&order=created_at.desc&limit=100", {
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY }
      });
      if (!res.ok) throw new Error("db");
      return res.json();
    },
    async insertComment(row) {
      if (row.status !== "pendente_revisao") throw new Error("status de insert recusado");
      return call("POST", "/blog_aberto_comments", row);
    },
    async updateComment(id, patch) {
      if (!UUID.test(id)) throw new Error("db");
      return call("PATCH", "/blog_aberto_comments?id=eq." + encodeURIComponent(id), patch, "return=minimal");
    },
    async listComments() {
      const res = await fetchImpl(env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/blog_aberto_comments?select=id,story_url,pseudonym,email,body,status,created_at&order=created_at.desc&limit=100", {
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY }
      });
      if (!res.ok) throw new Error("db");
      return res.json();
    },
    async listPublicComments(story) {
      const res = await fetchImpl(env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/blog_aberto_comments?story_url=eq." + encodeURIComponent(story) + "&status=eq.aprovado&select=pseudonym,body,created_at,status", {
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY }
      });
      if (!res.ok) throw new Error("db");
      const rows = await res.json();
      return (rows || [])
        .filter((row) => row.status === "aprovado")
        .map((row) => ({ pseudonym: row.pseudonym, body: row.body, created_at: row.created_at }));
    },
    async countRecent(originHash, kind, sinceIso) {
      const res = await fetchImpl(env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/blog_rate_limits?select=id&origin_hash=eq." + encodeURIComponent(originHash) + "&kind=eq." + encodeURIComponent(kind) + "&created_at=gte." + encodeURIComponent(sinceIso), {
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY }
      });
      if (!res.ok) throw new Error("db");
      const rows = await res.json();
      return (rows || []).length;
    },
    async addAttempt(originHash, kind, createdAt) {
      await call("POST", "/blog_rate_limits", { origin_hash: originHash, kind, created_at: createdAt }, "return=minimal");
    },
    async addLog(entry) {
      await call("POST", "/blog_control_log", entry, "return=minimal");
    },
    async listLog() {
      const res = await fetchImpl(env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/blog_control_log?select=action,target_id,actor_id,detail,created_at&order=created_at.desc&limit=50", {
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY }
      });
      if (!res.ok) throw new Error("db");
      return res.json();
    },
    async signAttachment(path) {
      if (!/^[a-f0-9-]+\/[a-f0-9-]+\.(jpg|png|webp|pdf)$/.test(path)) throw new Error("attachment");
      const res = await fetchImpl(env.SUPABASE_URL.replace(/\/$/, "") + "/storage/v1/object/sign/blog-aberto-private/" + path, {
        method: "POST", headers: {apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY, "Content-Type":"application/json"}, body: JSON.stringify({expiresIn:300})
      });
      if (!res.ok) throw new Error("attachment");
      const data = await res.json();
      return env.SUPABASE_URL.replace(/\/$/, "") + "/storage/v1" + data.signedURL;
    },
    async saveAttachment(path, bytes, mime) {
      const res = await fetchImpl(env.SUPABASE_URL.replace(/\/$/, "") + "/storage/v1/object/blog-aberto-private/" + path, {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": mime,
          "x-upsert": "false"
        },
        body: bytes
      });
      if (!res.ok) throw new Error("db");
      return path;
    }
  };
}

function storeOf(ctx) {
  if (ctx.store) return ctx.store;
  return createRestStore(ctx.env || {}, ctx.fetch || fetch);
}

async function sniff(file, attachmentsOpen) {
  if (!file || typeof file === "string" || !file.arrayBuffer) return { path: null };
  if (!file.size) return { path: null };
  if (!attachmentsOpen) return { error: "Não recebido. Anexo desligado. Nada foi publicado." };
  if (file.size > MAX_FILE) return { error: "Não recebido. O anexo passou do limite. Nada foi publicado." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length > MAX_FILE || bytes.length < 4) return { error: "Não recebido. O anexo não serve. Nada foi publicado." };
  let ext = "";
  let mime = "";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    ext = "jpg"; mime = "image/jpeg";
  } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    ext = "png"; mime = "image/png";
  } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    ext = "webp"; mime = "image/webp";
  } else if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    ext = "pdf"; mime = "application/pdf";
  } else {
    return { error: "Não recebido. O anexo não serve. Nada foi publicado." };
  }
  // Private attachments are never automatically embedded or published.
  const text = new TextDecoder().decode(bytes);
  if (/<script|<iframe|javascript:|\/JavaScript|\/JS\b|\/Launch|\/EmbeddedFile/i.test(text)) return {error:"Não recebido. O anexo não serve. Nada foi publicado."};
  return { ext, mime, bytes };
}

function closedMessage() {
  return "Não recebido. O Blog Aberto está fechado. Nada foi publicado.";
}

function receiving(controls, kind) {
  if (!controls || controls.interactions_closed) return false;
  if (kind === "submit") return !!controls.submissions_open;
  if (kind === "comment") return !!controls.comments_open;
  return false;
}

async function gate(store, req, ctx, kind) {
  const controls = await store.getControls();
  if (!receiving(controls, kind)) return { error: fail(403, closedMessage()), controls };
  const originHash = await sha256(originOf(req));
  if (String((ctx.fields && ctx.fields.passport_fax) || "").trim()) {
    await store.addAttempt(originHash, kind, iso(ctx));
    return { error: fail(403, "Não recebido. Parece automático. Nada foi publicado."), controls };
  }
  const since = new Date(clock(ctx) - RATE_WINDOW_MS).toISOString();
  const count = await store.countRecent(originHash, kind, since);
  if (count >= RATE_LIMIT) return { error: fail(429, "Não recebido. Parece automático. Nada foi publicado."), controls };
  await store.addAttempt(originHash, kind, iso(ctx));
  return { controls, originHash };
}

function scanBundle(parts) {
  const joined = parts.filter(Boolean).join("\n");
  return privacyHit(joined) || contentHit(joined);
}

export function renderArticle(row) {
  const id = row.id;
  const url = SITE + "/blog/aberto/p/" + id + ".html";
  const paragraphs = String(row.body || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const body = paragraphs.map((line) => "<p>" + escapeHtml(line) + "</p>").join("\n");
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(row.title)} | Blog Aberto</title>
<link rel="canonical" href="${url}">
<link rel="stylesheet" href="/css/passport-blog-aberto.css?v=20261010a">
</head>
<body class="blog-aberto">
<header class="ba-mast"><p class="ba-mast__brand">Passport Radio</p><h1>BLOG ABERTO</h1></header>
<main class="ba-wrap">
<article>
<p class="ba-meta">${escapeHtml(row.category)}</p>
<h2>${escapeHtml(row.title)}</h2>
<p>por ${escapeHtml(row.pseudonym)}</p>
${body}
</article>
<section class="ba-block" data-blog-comment="1">
<h2>Comentário</h2>
<p class="ba-closed" id="ba-c-closed">Comentários fechados. Nada pendente aparece nesta página.</p>
<form class="ba-send" id="ba-c-send" hidden novalidate>
<label>Pseudônimo <input name="pseudonym" maxlength="40" required autocomplete="nickname"></label>
<label>E-mail privado <input name="email" type="email" maxlength="120" required autocomplete="email"></label>
<label>Comentário <textarea name="body" maxlength="2000" required rows="5"></textarea></label>
<label class="ba-check"><input name="rules" type="checkbox" value="sim" required> Li que o comentário nasce pendente e que dado pessoal não entra.</label>
<div class="ba-hp" aria-hidden="true"><label>Fax <input name="passport_fax" tabindex="-1" autocomplete="off"></label></div>
<input type="hidden" name="opened" value="">
<button type="submit">Enviar comentário</button>
<p class="ba-note">A resposta é só “recebido”. O e-mail não aparece. Sem conta.</p>
<p class="ba-result" id="ba-c-result" role="status"></p>
</form>
<ol class="ba-list" data-blog-comments></ol>
</section>
<p class="ba-foot"><a href="/blog/aberto.html">Blog Aberto</a></p>
</main>
<script src="/js/passport-blog-submit.js?v=20261010a" defer></script>
</body>
</html>`;
}

export function assertGithubWrite(method, path, body) {
  if (String(method).toUpperCase() === "PATCH" && /\/git\/refs\/heads\/main(?:\?|$)/.test(path)) {
    throw new Error("recusa atualizar a main direto");
  }
  if (String(method).toUpperCase() === "PUT" && /\/pulls\/531\/merge(?:\?|$)/.test(path)) {
    throw new Error("recusa merge da 531");
  }
  if (String(method).toUpperCase() === "POST" && /\/git\/refs(?:\?|$)/.test(path) && body && body.ref === "refs/heads/main") {
    throw new Error("recusa criar a main");
  }
}

export function createGithub(env, fetchImpl) {
  const repo = env.GITHUB_REPOSITORY || REPO_FALLBACK;
  const token = env.BLOG_ABERTO_GITHUB_TOKEN || "";
  async function api(method, path, body) {
    assertGithubWrite(method, path, body);
    const res = await fetchImpl("https://api.github.com" + path, {
      method,
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "passport-blog-aberto"
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await res.text();
    let parsed = null;
    try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
    return { ok: res.ok, status: res.status, body: parsed };
  }
  return {
    async mainSha() {
      const out = await api("GET", "/repos/" + repo + "/git/ref/heads/main");
      if (!out.ok || !out.body || !out.body.object) throw new Error("main");
      return out.body.object.sha;
    },
    async ensureBranch(branch, sha) {
      if (!branch.startsWith("blog-aberto/publish-")) throw new Error("branch recusada");
      const look = await api("GET", "/repos/" + repo + "/git/ref/heads/" + encodeURIComponent(branch).replace(/%2F/g, "/"));
      if (look.ok) return;
      const made = await api("POST", "/repos/" + repo + "/git/refs", { ref: "refs/heads/" + branch, sha });
      if (!made.ok && made.status !== 422) throw new Error("branch");
    },
    async putFileOnBranch(branch, path, html) {
      if (branch === "main" || !branch.startsWith("blog-aberto/publish-")) throw new Error("branch recusada");
      const head = await api("GET", "/repos/" + repo + "/git/ref/heads/" + branch);
      if (!head.ok || !head.body || !head.body.object) throw new Error("branch");
      const parentSha = head.body.object.sha;
      const bytes = new TextEncoder().encode(html);
      let bin = "";
      for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
      const blob = await api("POST", "/repos/" + repo + "/git/blobs", { content: btoa(bin), encoding: "base64" });
      if (!blob.ok) throw new Error("blob");
      const parent = await api("GET", "/repos/" + repo + "/git/commits/" + parentSha);
      if (!parent.ok) throw new Error("parent");
      const tree = await api("POST", "/repos/" + repo + "/git/trees", {
        base_tree: parent.body.tree.sha,
        tree: [{ path, mode: "100644", type: "blob", sha: blob.body.sha }]
      });
      if (!tree.ok) throw new Error("tree");
      const commit = await api("POST", "/repos/" + repo + "/git/commits", {
        message: "Publica matéria aprovada do Blog Aberto.\n\nO texto é o aprovado no painel. Sem segunda aprovação. Sem atualizar a main direto.",
        tree: tree.body.sha,
        parents: [parentSha]
      });
      if (!commit.ok) throw new Error("commit");
      const ref = await api("PATCH", "/repos/" + repo + "/git/refs/heads/" + branch, { sha: commit.body.sha, force: false });
      if (!ref.ok) throw new Error("ref");
      return commit.body.sha;
    },
    async branchSha(branch) {
      const look = await api("GET", "/repos/" + repo + "/git/ref/heads/" + branch);
      if (!look.ok || !look.body || !look.body.object) return null;
      return look.body.object.sha;
    },
    async openPull(branch) {
      if (!branch.startsWith("blog-aberto/publish-")) throw new Error("branch recusada");
      const owner = repo.split("/")[0];
      const found = await api("GET", "/repos/" + repo + "/pulls?head=" + encodeURIComponent(owner + ":" + branch) + "&state=open");
      const existing = found.ok && Array.isArray(found.body) ? found.body[0] : null;
      if (existing && existing.number) {
        if (existing.number === FORBIDDEN_PR) throw new Error("recusa merge da 531");
        return existing.number;
      }
      const made = await api("POST", "/repos/" + repo + "/pulls", {
        title: "Blog Aberto — publicação técnica",
        head: branch,
        base: "main",
        draft: false,
        body: "Publicação técnica de matéria já aprovada no painel do Blog Aberto. Não altera a #531. Não atualiza a main direto. Entra só se o check build passar."
      });
      if (!made.ok || !made.body || made.body.number === FORBIDDEN_PR) throw new Error("pr");
      return made.body.number;
    },
    async waitBuild(sha) {
      const out = await api("GET", "/repos/" + repo + "/commits/" + sha + "/check-runs");
      if (!out.ok || !out.body) return false;
      const run = (out.body.check_runs || []).find((item) => item.name === "build");
      return !!(run && run.conclusion === "success");
    },
    async pullMerged(number) {
      const look = await api("GET", "/repos/" + repo + "/pulls/" + number);
      return !!(look.ok && look.body?.merged);
    }
  };
}

export async function runPublication(row, ctx) {
  const approvedAt = row.approved_at;
  const attempt = (row.publish_attempt || 0) + 1;
  const branch = row.github_branch || ("blog-aberto/publish-" + String(row.id || "").slice(0, 12));
  const path = "blog/aberto/p/" + row.id + ".html";
  const url = SITE + "/" + path;
  let pr = row.github_pr || null;
  const baseResult = {
    approved_at: approvedAt,
    github_branch: branch,
    github_pr: pr,
    published_url: row.published_url || null,
    publish_attempt: attempt
  };
  if (!UUID.test(row.id || "")) {
    return { ...baseResult, status: "falha_publicacao", failure_note: "Identificador inválido. A aprovação permanece." };
  }
  if (!ctx.github) {
    if (!ctx.env || !ctx.env.BLOG_ABERTO_GITHUB_TOKEN) {
      return { ...baseResult, status: "falha_publicacao", failure_note: "Sem credencial de repositório. A aprovação permanece." };
    }
    ctx = { ...ctx, github: createGithub(ctx.env, ctx.fetch || fetch) };
  }
  if (typeof ctx.live !== "function") ctx = {...ctx,live:async(target,title)=>{
    const res = await (ctx.fetch || fetch)(target);
    return res.ok && (await res.text()).includes(escapeHtml(title));
  }};
  try {
    let sha = null;
    if (!row.published_url) {
      if (!pr) {
        const main = await ctx.github.mainSha();
        await ctx.github.ensureBranch(branch, main);
        sha = await ctx.github.putFileOnBranch(branch, path, renderArticle(row));
        pr = await ctx.github.openPull(branch);
      } else if (typeof ctx.github.branchSha === "function") {
        sha = await ctx.github.branchSha(branch);
      }
      if (Number(pr) === FORBIDDEN_PR) throw new Error("recusa merge da 531");
      if (!sha) {
        return { ...baseResult, status: "falha_publicacao", github_pr: pr, failure_note: "O commit da matéria não está na branch. A aprovação permanece." };
      }
      const built = await ctx.github.waitBuild(sha);
      if (!built) {
        return { ...baseResult, status: "falha_publicacao", github_pr: pr, failure_note: "O check build não passou. A aprovação permanece." };
      }
      const merged = typeof ctx.github.pullMerged === "function" && await ctx.github.pullMerged(pr);
      if (!merged) {
        return { ...baseResult, status: "aprovada_aguardando", github_pr: pr, failure_note: "PR técnica pronta. Aguarda merge autorizado após o check build." };
      }
    }
    const target = row.published_url || url;
    const ok = await ctx.live(target, row.title);
    if (!ok) {
      return { ...baseResult, status: "falha_publicacao", github_pr: pr, published_url: target, failure_note: "A URL ainda não respondeu com a matéria. A aprovação permanece." };
    }
    return { ...baseResult, status: "publicada_verificada", github_pr: pr, published_url: target, failure_note: null };
  } catch {
    return { ...baseResult, status: "falha_publicacao", github_pr: pr, failure_note: "A publicação técnica falhou. A aprovação permanece." };
  }
}

async function requireMember(req, ctx) {
  const token = bearer(req);
  if (!token) return fail(401, "Entre na Minha Passport para enviar. Nada foi publicado.");
  const env = ctx.env || {};
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return fail(503, "Autenticação indisponível. Nada foi publicado.");
  const res = await (ctx.fetch || fetch)(env.SUPABASE_URL.replace(/\/$/, "") + "/auth/v1/user", {
    headers: {Authorization: "Bearer " + token, apikey: env.SUPABASE_SERVICE_ROLE_KEY}
  });
  if (!res.ok) return fail(401, "Sessão inválida. Entre novamente. Nada foi publicado.");
  const user = await res.json();
  if (!UUID.test(user?.id || "") || !EMAIL_FIELD.test(user?.email || "") || !user.email_confirmed_at || user.is_anonymous) return fail(403, "Confirme o e-mail da sua conta. Nada foi publicado.");
  return {ok:true,user};
}

function linksField(value) {
  const lines = String(value || "").trim().split(/\n+/).map(s=>s.trim()).filter(Boolean);
  if (lines.length > 2) throw new Error("links");
  for (const line of lines) {
    if (line.length > 1000 || privacyHit(line) || contentHit(line)) throw new Error("links");
    const url = new URL(line);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") || /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|\[)/i.test(url.hostname)) throw new Error("links");
  }
  return lines;
}

async function requireAdmin(req, ctx) {
  const token = bearer(req);
  if (!token) return fail(401, "Sessão ausente.");
  const adminId = (ctx.env && ctx.env.BLOG_ABERTO_ADMIN_USER_ID) || "";
  if (!adminId) return fail(403, "Identidade administrativa não configurada.");
  if (!ctx.env.SUPABASE_URL || !ctx.env.SUPABASE_SERVICE_ROLE_KEY) return fail(403, "Sessão recusada.");
  const fetchImpl = ctx.fetch || fetch;
  const root = ctx.env.SUPABASE_URL.replace(/\/$/, "");
  const headers = { Authorization: "Bearer " + token, apikey: ctx.env.SUPABASE_SERVICE_ROLE_KEY };
  const userRes = await fetchImpl(root + "/auth/v1/user", { headers });
  if (!userRes.ok) return fail(403, "Sessão recusada.");
  const user = await userRes.json();
  if (!user || String(user.id || "").toLowerCase() !== adminId.toLowerCase()) {
    return fail(403, "Esta sessão não autoriza o painel.");
  }
  // Auth's verified getUser response carries enrolled factors; no unverified metadata.
  const list = Array.isArray(user.factors) ? user.factors : [];
  const verified = list.filter((factor) => factor && factor.status === "verified");
  const aal = jwtPayload(token).aal || "aal1";
  if (verified.length && aal !== "aal2") return fail(403, "Falta o segundo fator.");
  return { ok: true, userId: user.id };
}

function publicFlags(controls) {
  const open = controls && !controls.interactions_closed;
  return {
    ok: true,
    authentication_required: true,
    submissions: !!(open && controls.submissions_open),
    comments: !!(open && controls.comments_open),
    attachments: !!(open && controls.submissions_open && controls.attachments_open)
  };
}

async function readFields(req) {
  const ctype = (req.headers.get("content-type") || "").toLowerCase();
  if (ctype.includes("multipart/form-data")) {
    const form = await req.formData();
    const fields = {};
    for (const [key, value] of form.entries()) {
      if (key === "attachment" && value && typeof value === "object") fields.attachment = value;
      else fields[key] = value;
    }
    return fields;
  }
  return req.json();
}

export async function dispatch(fields, req, ctx) {
  const action = String((fields && fields.action) || "");
  const store = storeOf(ctx);
  if (action === "public-controls") {
    const controls = await store.getControls();
    return { status: 200, body: publicFlags(controls) };
  }
  if (action === "public-comments") {
    const story = clean(fields.story_url, 200);
    if (!STORY_PATH.test(story) || story.includes("..")) return fail(400, "Não recebido.");
    const rows = await store.listPublicComments(story);
    return { status: 200, body: { ok: true, comments: rows } };
  }
  if (action === "submit") return submit(fields, req, ctx, store);
  if (action === "comment") return comment(fields, req, ctx, store);
  if (action.startsWith("admin-")) return admin(action, fields, req, ctx, store);
  return fail(400, "Não recebido.");
}

async function submit(fields, req, ctx, store) {
  const member = await requireMember(req, ctx);
  if (!member.ok) return member;
  try { assertInsertStatus(fields.status); }
  catch (err) { return fail(403, err.publicMessage || closedMessage()); }
  const gated = await gate(store, req, { ...ctx, fields }, "submit");
  if (gated.error) return gated.error;
  if (tooFast(fields.opened, ctx) || String(fields.passport_fax || "").trim()) {
    return fail(403, "Não recebido. Parece automático. Nada foi publicado.");
  }
  const pseudonym = clean(fields.pseudonym, 40);
  const email = clean(member.user.email, 120);
  const title = clean(fields.title, 160);
  const category = clean(fields.category, 20);
  const body = clean(fields.body, MAX_BODY);
  const participationType = clean(fields.participation_type || "materia",20);
  if (!PARTICIPATION_TYPES.includes(participationType)) return fail(400,"Tipo de participação inválido. Nada foi publicado.");
  let referenceLinks, officialLinks;
  try { referenceLinks = linksField(fields.reference_links); officialLinks = linksField(fields.official_links); }
  catch { return fail(400,"Links inválidos. Use até dois links HTTPS por campo. Nada foi publicado."); }
  if (String(fields.body || "").length > MAX_BODY || String(fields.title || "").length > 160) return fail(400,"Texto acima do limite. Nada foi publicado.");
  if (pseudonym.length < 2 || title.length < 8 || body.length < MIN_BODY) {
    return fail(400, "Não recebido. Falta título ou relato. Nada foi publicado.");
  }
  if (!EMAIL_FIELD.test(email)) return fail(400, "Não recebido. O e-mail privado não serve. Nada foi publicado.");
  if (!CATEGORIES.includes(category)) return fail(400, "Não recebido. A categoria não serve. Nada foi publicado.");
  if (!rulesOk(fields.rules)) return fail(400, "Não recebido. Falta o aceite das regras. Nada foi publicado.");
  const blocked = scanBundle([pseudonym, title, category, body, fields.attachment && fields.attachment.name]);
  if (blocked) return fail(403, blocked);
  const file = await sniff(fields.attachment, gated.controls.attachments_open && !gated.controls.interactions_closed);
  if (file.error) return fail(403, file.error);
  const id = crypto.randomUUID();
  let attachmentPath = null;
  if (file.ext) {
    attachmentPath = id + "/" + id + "." + file.ext;
    await store.saveAttachment(attachmentPath, file.bytes, file.mime);
  }
  await store.insertSubmission({
    id,
    user_id: member.user.id,
    participation_type: participationType,
    reference_links: referenceLinks,
    official_links: officialLinks,
    pseudonym,
    email,
    title,
    category,
    body,
    rules_accepted: true,
    status: "recebida",
    attachment_path: attachmentPath,
    publish_attempt: 0,
    created_at: iso(ctx)
  });
  return received();
}

async function comment(fields, req, ctx, store) {
  const gated = await gate(store, req, { ...ctx, fields }, "comment");
  if (gated.error) return gated.error;
  if (tooFast(fields.opened, ctx) || String(fields.passport_fax || "").trim()) {
    return fail(403, "Não recebido. Parece automático. Nada foi publicado.");
  }
  const story = clean(fields.story_url, 200);
  const pseudonym = clean(fields.pseudonym, 40);
  const email = clean(fields.email, 120);
  const body = clean(fields.body, 2000);
  if (!STORY_PATH.test(story) || story.includes("..")) return fail(400, "Não recebido.");
  if (pseudonym.length < 2 || body.length < 2) return fail(400, "Não recebido. Falta o comentário. Nada foi publicado.");
  if (!EMAIL_FIELD.test(email)) return fail(400, "Não recebido. O e-mail privado não serve. Nada foi publicado.");
  if (!rulesOk(fields.rules)) return fail(400, "Não recebido. Falta o aceite das regras. Nada foi publicado.");
  const blocked = scanBundle([pseudonym, body, story]);
  if (blocked) return fail(403, blocked);
  await store.insertComment({
    id: crypto.randomUUID(),
    story_url: story,
    pseudonym,
    email,
    body,
    status: "pendente_revisao",
    created_at: iso(ctx)
  });
  return received();
}

async function admin(action, fields, req, ctx, store) {
  const auth = await requireAdmin(req, ctx);
  if (!auth.ok) return auth;
  if (action === "admin-session") return { status: 200, body: { ok: true, message: "Sessão aceita." } };
  if (action === "admin-attachment") {
    const rows = await store.listSubmissions();
    const row = rows.find(item => item.id === fields.id);
    if (!row?.attachment_path || !store.signAttachment) return fail(404,"Anexo indisponível.");
    return {status:200,body:{ok:true,url:await store.signAttachment(row.attachment_path)}};
  }
  if (action === "admin-list") {
    const controls = await store.getControls();
    const submissions = await store.listSubmissions();
    const comments = await store.listComments();
    const log = await store.listLog();
    return { status: 200, body: { ok: true, controls, submissions, comments, log } };
  }
  if (action === "admin-control") return adminControl(fields, auth.userId, store);
  if (action === "admin-approve" || action === "admin-retry") return adminApprove(fields, auth.userId, ctx, store);
  if (action === "admin-reject") return adminReject(fields, auth.userId, store, "submission");
  if (action === "admin-comment-approve") return adminComment(fields, auth.userId, store, "aprovado");
  if (action === "admin-comment-reject") return adminComment(fields, auth.userId, store, "rejeitado");
  return fail(400, "Não recebido.");
}

async function adminControl(fields, actor, store) {
  const current = await store.getControls();
  const next = { ...current };
  const name = String(fields.control || "");
  if (name === "submissions_on") next.submissions_open = true;
  else if (name === "submissions_off") next.submissions_open = false;
  else if (name === "comments_on") next.comments_open = true;
  else if (name === "comments_off") next.comments_open = false;
  else if (name === "attachments_on") next.attachments_open = true;
  else if (name === "attachments_off") next.attachments_open = false;
  else if (name === "close_all") next.interactions_closed = true;
  else if (name === "reopen") next.interactions_closed = false;
  else return fail(400, "Controle desconhecido.");
  const detail = name;
  await store.setControls({
    submissions_open: next.submissions_open,
    comments_open: next.comments_open,
    attachments_open: next.attachments_open,
    interactions_closed: next.interactions_closed
  }, actor, detail);
  await store.addLog({ action: "controle", target_id: null, actor_id: actor, detail, created_at: new Date().toISOString() });
  return { status: 200, body: { ok: true, message: "Controle gravado.", flags: publicFlags(next) } };
}

async function adminApprove(fields, actor, ctx, store) {
  const id = String(fields.id || "");
  if (!UUID.test(id)) return fail(400, "Não recebido.");
  const rows = await store.listSubmissions();
  const row = rows.find((item) => item.id === id);
  if (!row) return fail(404, "Não achou o envio.");
  if (row.status === "rejeitada" || row.status === "publicada_verificada") {
    return fail(409, "Esse estado não volta por aqui.");
  }
  const blocked = scanBundle([row.pseudonym,row.title,row.body,...(row.reference_links || []),...(row.official_links || [])]);
  if (blocked || !row.rules_accepted) return fail(403,"Material precisa de correção editorial antes da aprovação.");
  const approvedAt = row.approved_at || iso(ctx);
  await store.updateSubmission(id, { status: "aprovada_aguardando", approved_at: approvedAt });
  await store.addLog({ action: "aprovar", target_id: id, actor_id: actor, detail: "aprovada_aguardando", created_at: iso(ctx) });
  const published = await runPublication({ ...row, status: "aprovada_aguardando", approved_at: approvedAt }, ctx);
  await store.updateSubmission(id, {
    status: published.status,
    approved_at: published.approved_at,
    github_branch: published.github_branch,
    github_pr: published.github_pr,
    published_url: published.published_url,
    publish_attempt: published.publish_attempt,
    failure_note: published.failure_note
  });
  await store.addLog({ action: "publicar", target_id: id, actor_id: actor, detail: published.status, created_at: iso(ctx) });
  return {
    status: 200,
    body: {
      ok: true,
      status: published.status,
      published: published.status === "publicada_verificada",
      published_url: published.status === "publicada_verificada" ? published.published_url : null,
      failure_note: published.failure_note || null
    }
  };
}

async function adminReject(fields, actor, store, _kind) {
  const id = String(fields.id || "");
  if (!UUID.test(id)) return fail(400, "Não recebido.");
  const rows = await store.listSubmissions();
  const row = rows.find((item) => item.id === id);
  if (!row) return fail(404, "Não achou o envio.");
  if (row.status === "publicada_verificada") return fail(409, "Já verificada no ar. Não retiro por este botão.");
  const reason = clean(fields.reason,1000);
  if (reason.length < 3 || privacyHit(reason) || contentHit(reason)) return fail(400,"Informe um motivo editorial sem dados privados.");
  await store.updateSubmission(id, { status: "rejeitada", rejection_reason:reason });
  await store.addLog({ action: "rejeitar", target_id: id, actor_id: actor, detail: "rejeitada", created_at: new Date().toISOString() });
  return { status: 200, body: { ok: true, status: "rejeitada", published: false } };
}

async function adminComment(fields, actor, store, status) {
  const id = String(fields.id || "");
  if (!UUID.test(id)) return fail(400, "Não recebido.");
  const rows = await store.listComments();
  const row = rows.find((item) => item.id === id);
  if (!row) return fail(404, "Não achou o comentário.");
  await store.updateComment(id, { status });
  await store.addLog({ action: status === "aprovado" ? "aprovar_comentario" : "rejeitar_comentario", target_id: id, actor_id: actor, detail: status, created_at: new Date().toISOString() });
  return { status: 200, body: { ok: true, status, published: false } };
}

function cors(origin) {
  const allow = [SITE,"https://www.passportradio.online"].includes(origin) ? origin : SITE;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
    Vary: "Origin"
  };
}

export async function handleRequest(req, ctx) {
  const origin = req.headers.get("origin") || "";
  const headers = cors(origin);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, message: "Não recebido. Nada foi publicado." }), { status: 405, headers: { ...headers, "Content-Type": "application/json" } });
  }
  const len = Number(req.headers.get("content-length") || 0);
  if (len > 3_000_000) {
    return new Response(JSON.stringify({ ok: false, message: "Não recebido. O anexo passou do limite. Nada foi publicado." }), { status: 413, headers: { ...headers, "Content-Type": "application/json" } });
  }
  let fields;
  try {
    fields = await readFields(req);
  } catch {
    return new Response(JSON.stringify({ ok: false, message: "Não recebido. O formulário não entrou. Nada foi publicado." }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });
  }
  try {
    const result = await dispatch(fields || {}, req, ctx || {});
    return new Response(JSON.stringify(result.body), { status: result.status, headers: { ...headers, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ ok: false, message: "Não recebido. O destino não gravou. Nada foi publicado." }), { status: 503, headers: { ...headers, "Content-Type": "application/json" } });
  }
}

export const LIMITS = { CATEGORIES, STATUSES, MAX_BODY, MAX_FILE, FORBIDDEN_PR };
