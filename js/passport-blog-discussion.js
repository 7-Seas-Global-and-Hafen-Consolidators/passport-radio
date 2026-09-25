(() => {
  "use strict";

  const SUPABASE_URL = "https://kmrnnudmujezriomimwn.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y";
  const ACCOUNT = "/minha-passport.html";
  const MAX_LEN = 2000;
  const MAX_DEPTH = 2;
  const ABUSE = [
    /https?:\/\/\S+\.(exe|zip|scr|apk)\b/i,
    /<script/i,
    /javascript:/i,
    /onerror\s*=/i,
    /phishing/i,
    /\b(viagra|crypto faucet|nudes gratis)\b/i
  ];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(value) {
    const d = document.createElement("div");
    d.textContent = String(value || "");
    return d.innerHTML;
  }
  function when(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }

  function blockedReason(text) {
    const raw = String(text || "").trim();
    if (raw.length < 2) return "Escreva um comentário.";
    if (raw.length > MAX_LEN) return "O comentário ultrapassa 2.000 caracteres.";
    for (const rule of ABUSE) {
      if (rule.test(raw)) return "Este texto foi bloqueado por parecer abuso, spam ou ataque — não por discordar.";
    }
    const urls = raw.match(/https?:\/\/\S+/gi) || [];
    if (urls.length > 2) return "Muitos links de uma vez. Isso parece spam.";
    return "";
  }

  function swearOnlyNotBlocked(text) {
    return true;
  }

  async function boot(root) {
    const storyUrl = root.getAttribute("data-story-url") || location.pathname;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    root.innerHTML = `<h2>Discussão</h2><p class="blog-discussion__status">Carregando a conversa…</p>`;

    if (!window.supabase) {
      root.innerHTML = `<h2>Discussão</h2><p class="blog-discussion__status">A discussão usa a Conta Passport. Não foi possível carregar o serviço agora.</p><p><a href="${ACCOUNT}?returnTo=${encodeURIComponent(location.pathname + "#discussao")}">Entrar na Conta Passport</a></p>`;
      return;
    }

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    });

    async function sessionUser() {
      const { data } = await client.auth.getSession();
      return data.session && data.session.user;
    }

    async function loadThread() {
      const { data, error } = await client
        .from("blog_comments")
        .select("id, user_id, display_name, body, parent_id, created_at, support_count, deleted_at")
        .eq("story_url", storyUrl)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    }

    function tree(rows) {
      const byParent = {};
      rows.forEach((row) => {
        const key = row.parent_id || "root";
        (byParent[key] = byParent[key] || []).push(row);
      });
      function render(list, depth) {
        return (list || []).map((row) => {
          const kids = depth < MAX_DEPTH - 1 ? render(byParent[row.id] || [], depth + 1) : "";
          const reply = depth < MAX_DEPTH - 1
            ? `<button type="button" class="blog-disc-reply" data-reply="${row.id}">Responder</button>`
            : "";
          return `<article class="blog-comment" id="c-${row.id}" data-depth="${depth}">
            <header><strong>${esc(row.display_name || "Leitor Passport")}</strong><time datetime="${esc(row.created_at)}">${esc(when(row.created_at))}</time></header>
            <p>${esc(row.body)}</p>
            <div class="blog-comment__actions">
              <button type="button" data-support="${row.id}">Apoiar (${row.support_count || 0})</button>
              ${reply}
              <button type="button" data-report="${row.id}">Denunciar</button>
            </div>
            ${kids}
          </article>`;
        }).join("");
      }
      return render(byParent.root || [], 0);
    }

    async function paint() {
      const user = await sessionUser();
      let rows = [];
      let backend = "ok";
      try {
        rows = await loadThread();
      } catch (err) {
        backend = err && err.message || "offline";
      }
      const live = backend === "ok";
      const login = `${ACCOUNT}?returnTo=${encodeURIComponent(location.pathname + "#discussao")}`;
      const form = user && live
        ? `<form class="blog-disc-form" id="blog-disc-form">
            <label for="blog-disc-body">Comentar como ${esc(user.user_metadata && user.user_metadata.display_name || user.email || "Passport")}</label>
            <textarea id="blog-disc-body" name="body" maxlength="${MAX_LEN}" required placeholder="Discordar é permitido. Spam, ataque e fraude não."></textarea>
            <input type="hidden" name="parent_id" value="">
            <p class="blog-disc-error" hidden></p>
            <button type="submit">Publicar</button>
          </form>`
        : live
          ? `<p class="blog-discussion__status">Entre na <a href="${login}">Conta Passport</a> para comentar, apoiar ou denunciar.</p>`
          : `<p class="blog-discussion__status">A discussão não carregou agora. A matéria continua no ar. Para falar sobre ela, escreva para passportradio.online@gmail.com.</p>`;
      const thread = live
        ? (rows.length ? tree(rows) : "<p class=\"blog-discussion__status\">Nenhum comentário ainda. Seja o primeiro.</p>")
        : "";
      const count = live ? rows.length : 0;
      root.innerHTML = `<h2>Discussão</h2>
        <p class="blog-discussion__count">${live ? count + " comentário" + (count === 1 ? "" : "s") : "contagem indisponível"}</p>
        ${form}
        <div class="blog-comment-list">${thread}</div>`;

      const formEl = $("#blog-disc-form", root);
      if (formEl) {
        formEl.addEventListener("submit", async (ev) => {
          ev.preventDefault();
          const body = $("#blog-disc-body", formEl).value;
          const parent = formEl.parent_id.value || null;
          const errBox = $(".blog-disc-error", formEl);
          const reason = blockedReason(body);
          if (reason) {
            errBox.hidden = false;
            errBox.textContent = reason;
            return;
          }
          if (!swearOnlyNotBlocked(body)) return;
          const { error } = await client.from("blog_comments").insert({
            story_url: storyUrl,
            parent_id: parent,
            body: body.trim(),
            display_name: user.user_metadata && user.user_metadata.display_name || (user.email || "").split("@")[0] || "Leitor Passport"
          });
          if (error) {
            errBox.hidden = false;
            errBox.textContent = error.message && /relation|schema cache/i.test(error.message)
              ? "A mesa de discussão ainda não está no ar neste ambiente."
              : "Não foi possível publicar agora.";
            return;
          }
          await paint();
        });
      }
      root.querySelectorAll("[data-reply]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (!formEl) {
            location.href = login;
            return;
          }
          formEl.parent_id.value = btn.getAttribute("data-reply");
          $("#blog-disc-body", formEl).focus();
        });
      });
      root.querySelectorAll("[data-support]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!user) { location.href = login; return; }
          const id = btn.getAttribute("data-support");
          const { error } = await client.from("blog_comment_supports").insert({ comment_id: id });
          if (!error) await paint();
        });
      });
      root.querySelectorAll("[data-report]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!user) { location.href = login; return; }
          const id = btn.getAttribute("data-report");
          const reason = window.prompt("Descreva o abuso (spam, ameaça, doxxing, ataque). Discordância não é denúncia.") || "";
          if (!reason.trim()) return;
          await client.from("blog_comment_reports").insert({ comment_id: id, reason: reason.slice(0, 500) });
          btn.textContent = "Denúncia enviada";
          btn.disabled = true;
        });
      });
    }

    await paint();
  }

  function start() {
    const root = document.querySelector("[data-passport-discussion]");
    if (!root) return;
    boot(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
