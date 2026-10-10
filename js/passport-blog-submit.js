(() => {
  "use strict";

  const ENDPOINT = "https://kmrnnudmujezriomimwn.supabase.co/functions/v1/blog-aberto";
  const FAIL = "Não recebido. O destino não gravou. Nada foi publicado.";

  function paint(node, ok, message) {
    if (!node) return;
    node.textContent = ok ? "Recebido." : message;
    node.dataset.state = ok ? "yes" : "no";
  }

  function stamp() {
    const opened = String(Date.now());
    document.querySelectorAll('input[name="opened"]').forEach((input) => {
      input.value = opened;
    });
  }

  async function flags() {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "public-controls" })
      });
      const data = await res.json();
      if (!res.ok || !data || data.ok !== true) return null;
      return data;
    } catch {
      return null;
    }
  }

  async function send(event, form, action) {
    event.preventDefault();
    const result = form.querySelector(".ba-result");
    const button = form.querySelector("button");
    if (button) button.disabled = true;
    const body = new FormData(form);
    body.set("action", action);
    if (action === "comment") body.set("story_url", location.pathname);
    let message = FAIL;
    let ok = false;
    try {
      const headers = {};
      if (action === "submit") {
        const account = window.PassportAccount;
        if (!account) throw new Error("account");
        const checked = await account.client.auth.getUser();
        const current = await account.client.auth.getSession();
        if (checked.error || !checked.data.user || !current.data.session) {
          message = "Entre na Minha Passport para enviar. Nada foi publicado.";
          throw new Error("session");
        }
        headers.Authorization = "Bearer " + current.data.session.access_token;
      }
      const res = await fetch(ENDPOINT, { method: "POST", headers, body });
      const data = await res.json();
      if (data && typeof data.message === "string") message = data.message;
      ok = !!(res.ok && data && data.ok === true && data.message === "Recebido.");
    } catch {
      ok = false;
    }
    if (!ok && message === "Recebido.") message = FAIL;
    paint(result, ok, message);
    if (button) button.disabled = false;
    if (ok) {
      form.reset();
      stamp();
      if(action === "submit") window.dispatchEvent(new CustomEvent("passport-account",{detail:{session:window.PassportAccount.session}}));
    }
  }

  function bind(form, action) {
    form.addEventListener("submit", (event) => send(event, form, action));
  }

  async function showApproved() {
    const list = document.querySelector("[data-blog-comments]");
    if (!list) return;
    list.replaceChildren();
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "public-comments", story_url: location.pathname })
      });
      const data = await res.json();
      if (!res.ok || !data || data.ok !== true) return;
      (data.comments || []).forEach((row) => {
        const li = document.createElement("li");
        const who = document.createElement("strong");
        who.textContent = row.pseudonym || "";
        const text = document.createElement("p");
        text.textContent = row.body || "";
        li.append(who, text);
        list.appendChild(li);
      });
    } catch {
      list.replaceChildren();
    }
  }

  async function boot() {
    const submitForm = document.getElementById("ba-send");
    const commentForm = document.getElementById("ba-c-send");
    if (!submitForm && !commentForm) return;
    stamp();
    const data = await flags();
    const openSubmissions = !!(data && data.submissions === true);
    const openComments = !!(data && data.comments === true);
    const openFiles = !!(data && data.attachments === true);
    if (submitForm) {
      const note = document.getElementById("ba-closed");
      function refresh(session) {
        const active = !!(openSubmissions && session && session.user);
        submitForm.hidden = !active;
        if (note) {
          note.hidden = active;
          note.textContent = openSubmissions ? "Entre na Minha Passport para enviar. Nada é publicado antes da aprovação editorial." : "Envios suspensos pela redação. Nada foi publicado.";
        }
        if (active) {
          const nickname = submitForm.querySelector('[name="pseudonym"]');
          if (nickname && !nickname.value) nickname.value = session.user.user_metadata?.display_name || "";
          const email = submitForm.querySelector('[name="email"]');
          if (email) { email.value = session.user.email || ""; email.readOnly = true; }
          submitForm.querySelectorAll(".ba-file").forEach(el => { el.hidden = !openFiles; });
          stamp();
        }
      }
      window.addEventListener("passport-account", event => refresh(event.detail.session));
      if (window.PassportAccount) {
        await window.PassportAccount.ready;
        refresh(window.PassportAccount.session);
      } else refresh(null);
      bind(submitForm, "submit");
      document.querySelectorAll("[data-participation]").forEach(link => {
        link.addEventListener("click", () => {
          const type = submitForm.querySelector('[name="participation_type"]');
          if (type) type.value = link.dataset.participation;
        });
      });
    }
    if (commentForm && openComments) {
      const note = document.getElementById("ba-c-closed");
      if (note) note.hidden = true;
      commentForm.hidden = false;
      bind(commentForm, "comment");
      showApproved();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
