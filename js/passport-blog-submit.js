(() => {
  "use strict";

  const SUPABASE_URL = "https://kmrnnudmujezriomimwn.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y";
  const ACCOUNT = "/minha-passport.html";
  const STATUS_LABEL = {
    recebida: "Recebida",
    em_analise: "Em análise",
    ajustes: "Ajustes solicitados",
    aprovada: "Aprovada",
    publicada: "Publicada",
    nao_publicada: "Não publicada"
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(value) {
    const d = document.createElement("div");
    d.textContent = String(value || "");
    return d.innerHTML;
  }
  function params() {
    const q = new URLSearchParams(location.search);
    return {
      entity: q.get("entity") || "",
      format: q.get("format") || "",
      period: q.get("period") || ""
    };
  }

  function field(name, label, opts) {
    const extra = opts || {};
    if (extra.area) {
      return `<label>${esc(label)}<textarea name="${name}" ${extra.required ? "required" : ""} maxlength="${extra.max || 20000}" rows="${extra.rows || 8}">${esc(extra.value || "")}</textarea></label>`;
    }
    return `<label>${esc(label)}<input name="${name}" type="${extra.type || "text"}" ${extra.required ? "required" : ""} maxlength="${extra.max || 200}" value="${esc(extra.value || "")}"></label>`;
  }

  async function boot(root) {
    const pre = params();
    if (!window.supabase) {
      root.innerHTML = `<p>A colaboração usa a Conta Passport. <a href="${ACCOUNT}?returnTo=${encodeURIComponent(location.pathname + location.search)}">Entrar</a></p>`;
      return;
    }
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    const { data } = await client.auth.getSession();
    const user = data.session && data.session.user;
    if (!user) {
      root.innerHTML = `<p>Entre na Conta Passport para enviar um relato, foto, flyer ou informação que complete uma história.</p><p><a class="blog-submit-login" href="${ACCOUNT}?returnTo=${encodeURIComponent(location.pathname + location.search)}">Entrar na Conta Passport</a></p>`;
      return;
    }
    const name = user.user_metadata && (user.user_metadata.display_name || user.user_metadata.full_name) || user.email || "Colaborador Passport";

    async function loadMine() {
      const { data: rows, error } = await client
        .from("blog_submissions")
        .select("id, title, status, created_at, editor_note")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return rows || [];
    }

    function listHtml(rows) {
      if (!rows.length) return "<p>Você ainda não enviou relatos.</p>";
      return `<ol class="blog-submit-list">${rows.map((row) =>
        `<li><strong>${esc(row.title)}</strong> · ${esc(STATUS_LABEL[row.status] || row.status)}${row.editor_note ? `<em>${esc(row.editor_note)}</em>` : ""}</li>`
      ).join("")}</ol>`;
    }

    async function paint(message, isError) {
      let rows = [];
      try { rows = await loadMine(); } catch (err) {
        rows = [];
        if (!message) message = "Ainda não foi possível ler suas submissões. A migration SQL precisa ser aplicada no Supabase.";
      }
      root.innerHTML = `
        <p>Olá, ${esc(name)}. O envio entra como <b>recebida</b>. A redação muda o estado. Palavrão sozinho não é infração; spam e impersonação são.</p>
        ${message ? `<p class="${isError ? "blog-disc-error" : ""}">${esc(message)}</p>` : ""}
        <form class="blog-submit-form">
          ${field("title", "Título", { required: true, max: 160 })}
          ${field("deck", "Linha fina (opcional)", { max: 280 })}
          ${field("body", "Relato", { area: true, required: true, rows: 10 })}
          ${field("entity", "Artista / banda / pessoa / obra", { value: pre.entity, max: 120 })}
          ${field("country", "País", { max: 80 })}
          ${field("period", "Ano / década / período", { value: pre.period, max: 80 })}
          ${field("format", "Tipo", { value: pre.format, max: 40 })}
          ${field("sources", "Fontes e links")}
          ${field("media_urls", "Fotos, documentos ou vídeo (URLs que você pode ceder)")}
          ${field("notes", "Observação ao editor", { area: true, rows: 3, max: 2000 })}
          <button type="submit">Enviar relato</button>
        </form>
        <h2>Meus envios</h2>
        ${listHtml(rows)}
      `;
      const form = $("form", root);
      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const fd = new FormData(form);
        const payload = {
          user_id: user.id,
          display_name: name,
          title: String(fd.get("title") || "").trim(),
          deck: String(fd.get("deck") || "").trim() || null,
          body: String(fd.get("body") || "").trim(),
          entity: String(fd.get("entity") || "").trim() || null,
          country: String(fd.get("country") || "").trim() || null,
          period: String(fd.get("period") || "").trim() || null,
          format: String(fd.get("format") || "").trim() || null,
          sources: String(fd.get("sources") || "").trim() || null,
          media_urls: String(fd.get("media_urls") || "").trim() || null,
          notes: String(fd.get("notes") || "").trim() || null,
          status: "recebida"
        };
        if (payload.title.length < 8 || payload.body.length < 40) {
          await paint("Escreva um título e um relato com substância. Isto não é um cartório.", true);
          return;
        }
        const { error } = await client.from("blog_submissions").insert(payload);
        if (error) {
          await paint("Não foi possível gravar. Se a tabela ainda não existe no projeto, a única ação externa é aplicar supabase/blog_submissions.sql.", true);
          return;
        }
        await paint("Relato recebido. Acompanhe o estado nesta página.");
      });
    }

    await paint("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-blog-submit]");
    if (root) boot(root);
  });
})();
