import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertGithubWrite,
  createGithub,
  createMemoryStore,
  dispatch,
  escapeHtml,
  handleRequest,
  privacyHit
} from "./logic.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const NOW = 1700000000000;
const EMAIL = "ficcao@example.com";

function story(extra) {
  return {
    action: "submit",
    opened: NOW - 5000,
    pseudonym: "Testemunha",
    email: EMAIL,
    title: "A noite do disco",
    category: "discos",
    body: "O disco ficou na memória porque o palco de 1998 não cabia na fita que eu levei para casa.",
    rules: "sim",
    ...extra
  };
}

function req(extraHeaders) {
  return new Request("https://passportradio.online/blog/aberto.html", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://passportradio.online",
      "x-forwarded-for": "203.0.113.9",
      ...(extraHeaders || {})
    }
  });
}

function ctx(store, extra) {
  return { clock: () => NOW, store, env: {}, ...(extra || {}) };
}

async function post(fields, store, extra) {
  const request = new Request("https://passportradio.online/blog/aberto.html", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://passportradio.online",
      "x-forwarded-for": "203.0.113.9",
      ...((extra && extra.headers) || {})
    },
    body: JSON.stringify(fields)
  });
  const res = await handleRequest(request, ctx(store, extra));
  const body = await res.json();
  return { status: res.status, body };
}

function openStore(seed) {
  return createMemoryStore({
    controls: {
      submissions_open: true,
      comments_open: true,
      attachments_open: false,
      interactions_closed: false
    },
    ...(seed || {})
  });
}

function jwt(payload) {
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return "aaa." + body + ".sig";
}

function adminFetch(user, factors) {
  return async (url) => {
    if (String(url).endsWith("/auth/v1/user")) return Response.json(user);
    if (String(url).endsWith("/auth/v1/factors")) return Response.json({ all: factors || [] });
    throw new Error("fetch inesperado " + url);
  };
}

const adminEnv = {
  SUPABASE_URL: "https://kmrnnudmujezriomimwn.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-test",
  BLOG_ABERTO_ADMIN_USER_ID: "admin-1"
};

test("escape keeps the entity", () => {
  assert.equal(escapeHtml("A & B <c>"), "A &" + "amp; B &" + "lt;c&" + "gt;");
});

test("anonymous submit returns only the receipt", async () => {
  const store = openStore();
  const out = await post(story(), store);
  assert.equal(out.status, 200);
  assert.deepEqual(Object.keys(out.body).sort(), ["message", "ok"]);
  assert.equal(out.body.ok, true);
  assert.equal(out.body.message, "Recebido.");
  assert.equal(JSON.stringify(out.body).includes(EMAIL), false);
  const rows = store.dump().blog_submissions;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, "recebida");
  assert.equal(rows[0].email, EMAIL);
  assert.equal(JSON.stringify(out.body).includes(rows[0].id), false);
});

test("anonymous cannot read pending", async () => {
  const store = openStore({
    submissions: [{
      id: crypto.randomUUID(),
      title: "Segredo",
      email: "secreto@example.com",
      status: "recebida",
      body: "texto",
      pseudonym: "X"
    }]
  });
  const out = await post({ action: "admin-list" }, store);
  assert.equal(out.body.ok, false);
  assert.equal(JSON.stringify(out.body).includes("secreto@example.com"), false);
  assert.equal(JSON.stringify(out.body).includes("Segredo"), false);
  const comments = await dispatch({ action: "public-comments", story_url: "/blog/aberto.html" }, req(), ctx(store));
  assert.deepEqual(comments.body.comments, []);
});

test("published status on insert is refused", async () => {
  const store = openStore();
  const out = await post(story({ status: "publicada_verificada" }), store);
  assert.equal(out.body.ok, false);
  assert.match(out.body.message, /estado/);
  assert.equal(store.dump().blog_submissions.length, 0);
});

test("another user cannot approve", async () => {
  const id = crypto.randomUUID();
  const store = openStore({
    submissions: [{
      id,
      status: "recebida",
      title: "A noite do disco",
      email: "secreto@example.com",
      pseudonym: "Testemunha",
      category: "discos",
      body: "texto longo o bastante para existir na fila do painel sem ir ao ar.",
      rules_accepted: true
    }]
  });
  const out = await post({ action: "admin-approve", id, email: "mrnomad@example.com" }, store, {
    env: adminEnv,
    fetch: adminFetch({ id: "other-user", email: "mrnomad@example.com" }, []),
    headers: { Authorization: "Bearer " + jwt({ aal: "aal1" }) }
  });
  assert.equal(out.body.ok, false);
  assert.match(out.body.message, /não autoriza/);
  assert.equal(store.dump().blog_submissions[0].status, "recebida");
  assert.equal(JSON.stringify(out.body).includes("secreto@example.com"), false);
});

test("locked control refuses and keeps the row", async () => {
  const id = crypto.randomUUID();
  const store = createMemoryStore({
    submissions: [{ id, status: "recebida", title: "Fila", email: EMAIL }]
  });
  const out = await post(story(), store);
  assert.equal(out.body.ok, false);
  assert.match(out.body.message, /fechado/);
  assert.equal(store.dump().blog_submissions.length, 1);
});

test("phone and address do not publish", async () => {
  const phone = openStore();
  const phoneOut = await post(story({
    body: "Liguei depois do show para (11) 98888-7766 e contei a história do disco que ainda não estava no mapa da cidade."
  }), phone);
  assert.equal(phoneOut.body.ok, false);
  assert.match(phoneOut.body.message, /dado pessoal/);
  assert.equal(phone.dump().blog_submissions.length, 0);

  const address = openStore();
  const addressOut = await post(story({
    body: "O encontro foi na Rua das Flores, 123, depois do show, e a história do disco ficou maior que a noite de 1998."
  }), address);
  assert.equal(addressOut.body.ok, false);
  assert.equal(address.dump().blog_submissions.length, 0);
  assert.equal(privacyHit("meu pai ouvia Black Sabbath a noite inteira"), "");
});

test("swear and criticism pass, threat and script do not", async () => {
  const okStore = openStore();
  const ok = await post(story({
    body: "Que porra de disco. A mixagem estoura e mesmo assim a noite de 1998 ficou na memória de quem estava na grade."
  }), okStore);
  assert.equal(ok.body.message, "Recebido.");
  const threat = openStore();
  const bad = await post(story({
    body: "Eu vou te matar por causa dessa crítica do disco, e não me importa a noite de 1998 nem o palco."
  }), threat);
  assert.equal(bad.body.ok, false);
  assert.equal(threat.dump().blog_submissions.length, 0);
  const script = openStore();
  const injected = await post(story({
    body: "Texto longo o bastante para passar o minimo, mas com <script>alert(1)</script> no meio da história do disco."
  }), script);
  assert.equal(injected.body.ok, false);
  assert.equal(script.dump().blog_submissions.length, 0);
});

test("comment stays hidden until approval", async () => {
  const store = openStore();
  const sent = await post({
    action: "comment",
    opened: NOW - 5000,
    story_url: "/blog/aberto/p/teste.html",
    pseudonym: "Leitor",
    email: "leitor@example.com",
    body: "A mixagem estoura, mas o show de 1998 ficou.",
    rules: "sim"
  }, store);
  assert.equal(sent.body.message, "Recebido.");
  assert.equal(store.dump().blog_aberto_comments[0].status, "pendente_revisao");
  const hidden = await dispatch({ action: "public-comments", story_url: "/blog/aberto/p/teste.html" }, req(), ctx(store));
  assert.deepEqual(hidden.body.comments, []);
  assert.equal(JSON.stringify(hidden.body).includes("leitor@example.com"), false);
});

test("database failure does not publish", async () => {
  const store = openStore();
  store.insertSubmission = async () => { throw new Error("db"); };
  const out = await post(story(), store);
  assert.equal(out.status, 503);
  assert.match(out.body.message, /não gravou/);
  assert.equal(out.body.message.includes("Recebido"), false);
  assert.equal(store.dump().blog_submissions.length, 0);
});

test("missing service key does not pretend success", async () => {
  let called = 0;
  const out = await post(story(), null, {
    env: {},
    fetch: async () => { called += 1; return new Response("[]", { status: 200 }); }
  });
  assert.equal(out.body.ok, false);
  assert.match(out.body.message, /não gravou/);
  assert.equal(called, 0);
});

test("approval failure keeps approval and does not duplicate", async () => {
  const id = crypto.randomUUID();
  const store = openStore({
    submissions: [{
      id,
      status: "recebida",
      title: "A noite do disco",
      pseudonym: "Testemunha",
      email: EMAIL,
      category: "discos",
      body: "O disco ficou na memória porque o palco de 1998 não cabia na fita que eu levei para casa.",
      rules_accepted: true,
      publish_attempt: 0
    }]
  });
  let opens = 0;
  let merges = 0;
  let liveOk = false;
  let buildOk = false;
  const github = {
    async mainSha() { return "abc123"; },
    async ensureBranch() {},
    async putFileOnBranch(_branch, _path, html) {
      assert.equal(html.includes(EMAIL), false);
      assert.equal(html.includes("refs/heads/main"), false);
      return "commit1";
    },
    async openPull() { opens += 1; return 900; },
    async branchSha() { return "commit1"; },
    async waitBuild(sha) {
      assert.equal(sha, "commit1");
      return buildOk;
    },
    async mergePull(number) {
      assert.notEqual(number, 531);
      merges += 1;
      return true;
    }
  };
  const extra = {
    env: adminEnv,
    fetch: adminFetch({ id: "admin-1" }, []),
    headers: { Authorization: "Bearer " + jwt({ aal: "aal1", sub: "admin-1" }) },
    github,
    live: async (url) => liveOk && url.startsWith("https://passportradio.online/blog/aberto/p/" + id)
  };
  const first = await post({ action: "admin-approve", id }, store, extra);
  assert.equal(first.body.published, false);
  assert.equal(first.body.status, "falha_publicacao");
  const saved = store.dump().blog_submissions[0].approved_at;
  assert.ok(saved);
  assert.equal(opens, 1);
  assert.equal(merges, 0);
  const second = await post({ action: "admin-retry", id }, store, extra);
  assert.equal(second.body.published, false);
  assert.equal(opens, 1);
  assert.equal(store.dump().blog_submissions[0].approved_at, saved);
  buildOk = true;
  liveOk = false;
  const third = await post({ action: "admin-retry", id }, store, extra);
  assert.equal(third.body.published, false);
  assert.equal(third.body.published_url, null);
  assert.equal(opens, 1);
  assert.equal(merges, 1);
  liveOk = true;
  const fourth = await post({ action: "admin-retry", id }, store, extra);
  assert.equal(fourth.body.published, true);
  assert.equal(fourth.body.status, "publicada_verificada");
  assert.equal(store.dump().blog_submissions.length, 1);
  assert.equal(store.dump().blog_submissions[0].approved_at, saved);
  assert.equal(opens, 1);
});

test("no repository credential does not mark published", async () => {
  const id = crypto.randomUUID();
  const store = openStore({
    submissions: [{
      id,
      status: "recebida",
      title: "A noite do disco",
      pseudonym: "Testemunha",
      email: EMAIL,
      category: "discos",
      body: "O disco ficou na memória porque o palco de 1998 não cabia na fita que eu levei para casa."
    }]
  });
  const out = await post({ action: "admin-approve", id }, store, {
    env: adminEnv,
    fetch: adminFetch({ id: "admin-1" }, []),
    headers: { Authorization: "Bearer " + jwt({ aal: "aal2" }) }
  });
  assert.equal(out.body.published, false);
  assert.equal(out.body.status, "falha_publicacao");
  assert.ok(store.dump().blog_submissions[0].approved_at);
});

test("second factor is required only when enrolled", async () => {
  const store = openStore();
  const blocked = await post({ action: "admin-session" }, store, {
    env: adminEnv,
    fetch: adminFetch({ id: "admin-1" }, [{ status: "verified", factor_type: "totp" }]),
    headers: { Authorization: "Bearer " + jwt({ aal: "aal1" }) }
  });
  assert.match(blocked.body.message, /segundo fator/);
  const allowed = await post({ action: "admin-session" }, store, {
    env: adminEnv,
    fetch: adminFetch({ id: "admin-1" }, []),
    headers: { Authorization: "Bearer " + jwt({ aal: "aal1" }) }
  });
  assert.equal(allowed.body.ok, true);
  assert.equal(allowed.body.email, undefined);
});

test("github client refuses main and pull 531", async () => {
  let called = 0;
  const gh = createGithub(
    { BLOG_ABERTO_GITHUB_TOKEN: "x", GITHUB_REPOSITORY: "o/r" },
    async () => { called += 1; return new Response("{}", { status: 200 }); }
  );
  assert.throws(() => assertGithubWrite("PATCH", "/repos/o/r/git/refs/heads/main", {}));
  assert.throws(() => assertGithubWrite("PUT", "/repos/o/r/pulls/531/merge", {}));
  await assert.rejects(() => gh.mergePull(531));
  await assert.rejects(() => gh.putFileOnBranch("main", "blog/aberto/p/x.html", "<p>x</p>"));
  assert.equal(called, 0);
});

test("rest insert uses the service key and only recebida", async () => {
  const calls = [];
  const fake = async (url, opts = {}) => {
    calls.push({ url: String(url), method: opts.method || "GET", body: opts.body, auth: opts.headers && opts.headers.Authorization });
    if (String(url).includes("/blog_controls")) {
      return Response.json([{ id: 1, submissions_open: true, comments_open: false, attachments_open: false, interactions_closed: false }]);
    }
    if (String(url).includes("/blog_rate_limits") && (opts.method || "GET") === "GET") return Response.json([]);
    if (String(url).includes("/blog_rate_limits")) return new Response("", { status: 201 });
    if (String(url).includes("/blog_submissions") && opts.method === "POST") {
      const body = JSON.parse(opts.body);
      assert.equal(body.status, "recebida");
      return Response.json([body], { status: 201 });
    }
    return new Response("miss", { status: 500 });
  };
  const out = await post(story(), null, {
    env: { SUPABASE_URL: "https://kmrnnudmujezriomimwn.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "service-test" },
    fetch: fake
  });
  assert.equal(out.body.message, "Recebido.");
  assert.equal(JSON.stringify(out.body).includes("service-test"), false);
  assert.ok(calls.some((call) => call.auth === "Bearer service-test" && call.method === "POST" && call.url.includes("/blog_submissions")));
});

test("pages keep the archive and do not send from the browser", () => {
  const aberto = readFileSync(resolve(root, "blog/aberto.html"), "utf8");
  const envie = readFileSync(resolve(root, "blog/envie-sua-historia.html"), "utf8");
  const css = readFileSync(resolve(root, "css/passport-blog-aberto.css"), "utf8");
  const js = readFileSync(resolve(root, "js/passport-blog-submit.js"), "utf8");
  const submissions = readFileSync(resolve(root, "supabase/blog_submissions.sql"), "utf8");
  const comments = readFileSync(resolve(root, "supabase/blog_comments.sql"), "utf8");
  const controls = readFileSync(resolve(root, "supabase/blog_controls.sql"), "utf8");
  assert.match(aberto, /\/images\/blog-aberto-capa\.jpg/);
  assert.match(aberto, /\/data\/blog-search\/manifest\.json/);
  assert.match(aberto, /PAGE = 40/);
  assert.match(aberto, /https:\/\/passportradio\.online\/blog\/aberto\.html/);
  assert.match(aberto, /id="ba-send"/);
  assert.equal(aberto.includes("sb_publishable"), false);
  assert.equal(aberto.includes('name="status"'), false);
  assert.match(envie, /id="ba-send"/);
  assert.equal(envie.includes("Conta Passport"), false);
  assert.equal(envie.includes("supabase-js"), false);
  assert.match(css, /#ffffff/);
  assert.match(css, /#111111/);
  assert.match(css, /#c41e3a/);
  assert.match(css, /@media/);
  assert.equal(js.includes("sb_publishable"), false);
  assert.equal(js.includes("/rest/v1/"), false);
  assert.equal(js.includes(".from("), false);
  assert.equal(js.includes("minha-passport"), false);
  assert.match(js, /functions\/v1\/blog-aberto/);
  assert.equal(submissions.includes("auth.uid()"), false);
  assert.match(submissions, /status de insert recusado/);
  assert.match(submissions, /revoke all on table public\.blog_submissions from public, anon, authenticated/);
  assert.match(comments, /blog_aberto_comments/);
  assert.match(comments, /pendente_revisao/);
  assert.equal(comments.includes("for select"), false);
  assert.match(controls, /1, false, false, false, true/);
  assert.match(controls, /interactions_closed boolean not null default true/);
});
