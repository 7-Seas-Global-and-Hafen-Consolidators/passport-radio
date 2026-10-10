(function () {
  "use strict";
  var SUPABASE_URL = "https://kmrnnudmujezriomimwn.supabase.co";
  var PUBLISHABLE = "sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y";
  var ENDPOINT = SUPABASE_URL + "/functions/v1/blog-aberto";
  if (!window.supabase) { document.getElementById("ba-auth-msg").textContent = "Não foi possível carregar a autenticação. Recarregue o painel."; return; }
  var client = window.supabase.createClient(SUPABASE_URL, PUBLISHABLE, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  var factorId = "";
  var challengeId = "";
  var msg = document.getElementById("ba-auth-msg");

  function say(text, bad) {
    msg.textContent = text;
    msg.dataset.state = bad ? "no" : "yes";
  }

  async function token() {
    var session = await client.auth.getSession();
    return session.data.session && session.data.session.access_token;
  }

  async function call(action, extra) {
    var access = await token();
    if (!access) { say("Sessão ausente.", true); return null; }
    try {
    var res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + access },
      body: JSON.stringify(Object.assign({ action: action }, extra || {}))
    });
    var data = await res.json();
    if (!res.ok || !data || data.ok !== true) {
      if (res.status === 401 || res.status === 403) { document.getElementById("ba-desk").hidden = true; document.getElementById("ba-queue").replaceChildren(); }
      say((data && data.message) || "Recusado.", true);
      return null;
    }
    return data;
    } catch { say("Não foi possível comunicar com o painel. Nenhuma ação foi confirmada. Tente novamente.", true); return null; }
  }

  function button(label, action, id) {
    var el = document.createElement("button");
    el.type = "button";
    el.textContent = label;
    el.addEventListener("click", function () {
      var extra = {id:id};
      if(action === "admin-reject") {
        var reason = prompt("Motivo editorial da rejeição (sem dados pessoais):");
        if(!reason) return;
        extra.reason = reason;
      }
      call(action, extra).then(function () { load(); });
    });
    return el;
  }

  function load() {
    call("admin-list").then(function (data) {
      if (!data) return;
      document.getElementById("ba-login").hidden = true;
      document.getElementById("ba-link-login").hidden = true;
      document.getElementById("ba-code-login").hidden = true;
      document.getElementById("ba-mfa").hidden = true;
      say("Acesso administrativo confirmado. Fila carregada.", false);
      document.getElementById("ba-desk").hidden = false;
      var flags = data.controls || {};
      document.getElementById("ba-flags").textContent = "Envios " + (flags.submissions_open ? "ligados" : "desligados") + ". Comentários " + (flags.comments_open ? "ligados" : "desligados") + ". Interações " + (flags.interactions_closed ? "fechadas" : "abertas") + ".";
      var queue = document.getElementById("ba-queue");
      queue.replaceChildren();
      (data.submissions || []).forEach(function (row) {
        var li = document.createElement("li");
        li.textContent = row.status + " — " + row.title + " — " + row.pseudonym + " — " + row.email;
        var details = document.createElement("details");
        var summary = document.createElement("summary"); summary.textContent = "Analisar material completo";
        var body = document.createElement("p"); body.textContent = row.body || ""; body.style.whiteSpace="pre-wrap";
        var type = document.createElement("p"); type.textContent = "Tipo: " + (row.participation_type || "matéria") + " · " + row.created_at;
        details.append(summary,type,body);
        (row.reference_links || []).concat(row.official_links || []).forEach(function(url){
          try { var parsed=new URL(url); if(parsed.protocol!=="https:" || parsed.username || parsed.password) return; }
          catch { return; }
          var link=document.createElement("a");link.href=url;link.textContent=url;link.target="_blank";link.rel="noopener noreferrer";
          var paragraph=document.createElement("p");paragraph.append(link);details.append(paragraph);
        });
        if(row.attachment_path){
          var attachment=document.createElement("button");attachment.type="button";attachment.textContent="Obter link privado do anexo (5 minutos)";
          attachment.addEventListener("click",async function(){var data=await call("admin-attachment",{id:row.id});if(data?.url){var link=document.createElement("a");link.href=data.url;link.textContent="Abrir anexo privado";link.target="_blank";link.rel="noopener noreferrer";details.append(link);}});
          details.append(attachment);
        }
        if(row.rejection_reason){var reason=document.createElement("p");reason.textContent="Motivo: "+row.rejection_reason;details.append(reason);}
        li.append(details);
        if (row.status !== "publicada_verificada" && row.status !== "rejeitada") {
          li.append(button("Aprovar / preparar PR", "admin-approve", row.id));
          li.append(button("Rejeitar", "admin-reject", row.id));
        }
        if (row.status === "falha_publicacao" || row.status === "aprovada_aguardando" || row.status === "publicando") {
          li.append(button("Tentar de novo", "admin-retry", row.id));
        }
        if (row.failure_note) {
          var note = document.createElement("p");
          note.textContent = row.failure_note;
          li.append(note);
        }
        queue.appendChild(li);
      });
      var comments = document.getElementById("ba-comments");
      comments.replaceChildren();
      (data.comments || []).forEach(function (row) {
        var li = document.createElement("li");
        li.textContent = row.status + " — " + row.pseudonym + " — " + row.body;
        if (row.status === "pendente_revisao") {
          li.append(button("Aprovar comentário", "admin-comment-approve", row.id));
          li.append(button("Rejeitar comentário", "admin-comment-reject", row.id));
        }
        comments.appendChild(li);
      });
      var log = document.getElementById("ba-log");
      log.replaceChildren();
      (data.log || []).forEach(function (row) {
        var li = document.createElement("li");
        li.textContent = row.action + " — " + (row.detail || "");
        log.appendChild(li);
      });
    }).catch(function () { say("Não foi possível apresentar a fila. Recarregue o painel; nenhuma ação foi confirmada.", true); });
  }

  async function openSession() {
    var saved = await client.auth.getSession();
    if (saved.error) throw saved.error;
    if (!saved.data.session) { say("Envie um link de acesso ao seu e-mail ou entre com sua senha.", false); return; }
    var level = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (level.error) throw level.error;
    if (level.data.nextLevel === "aal2" && level.data.currentLevel !== "aal2") {
      var factors = await client.auth.mfa.listFactors();
      if (factors.error) throw factors.error;
      var totp = (factors.data.totp || []).find(function (f) { return f.status === "verified"; });
      if (!totp) { say("A conta exige um segundo fator. Use o fator cadastrado.", true); return; }
      var challenge = await client.auth.mfa.challenge({ factorId: totp.id });
      if (challenge.error) throw challenge.error;
      factorId = totp.id; challengeId = challenge.data.id;
      document.getElementById("ba-mfa").hidden = false;
      say("Confirme o código do seu segundo fator para abrir a fila.", false); return;
    }
    if (await call("admin-session")) load();
  }

  function busy(form, active) {
    form.dataset.busy = active ? "yes" : "no";
    form.querySelector("button[type=submit]").disabled = active;
  }
  function bindAccess(id, work) {
    document.getElementById(id).addEventListener("submit", async function (event) {
      event.preventDefault(); var form = event.target;
      if (form.dataset.busy === "yes") return;
      busy(form, true); say("Processando o acesso…", false);
      try { await work(new FormData(form)); }
      catch (error) { say("Não foi possível concluir o acesso: " + (error.message || "erro de rede") + ". Tente novamente.", true); }
      finally { busy(form, false); }
    });
  }
  var accessEmail = "";
  bindAccess("ba-link-login", async function (fd) {
    accessEmail = String(fd.get("email") || "").trim();
    var redirect = "https://passportradio.online/minha-passport.html?bemvindo=1&returnTo=%2Fprivado%2Fblog-aberto.html";
    var result = await client.auth.signInWithOtp({ email: accessEmail, options: { shouldCreateUser: false, emailRedirectTo: redirect } });
    if (result.error) throw result.error;
    document.getElementById("ba-code-login").hidden = false;
    say("Pedido enviado ao Supabase. Abra o link recebido no seu e-mail. Se vier um código, informe abaixo. O acesso à fila depende da validação administrativa.", false);
  });
  bindAccess("ba-code-login", async function (fd) {
    var result = await client.auth.verifyOtp({ email: accessEmail || document.querySelector("#ba-link-login [name=email]").value.trim(), token: String(fd.get("token") || "").trim(), type: "email" });
    if (result.error) throw result.error;
    await openSession();
  });
  bindAccess("ba-login", async function (fd) {
    var signed = await client.auth.signInWithPassword({ email: String(fd.get("email") || ""), password: String(fd.get("password") || "") });
    if (signed.error) throw signed.error;
    await openSession();
  });

  document.getElementById("ba-mfa").addEventListener("submit", async function (event) {
    event.preventDefault();
    var code = String(new FormData(event.target).get("code") || "");
    try {
    var verified = await client.auth.mfa.verify({ factorId: factorId, challengeId: challengeId, code: code });
    if (verified.error) { say("Falta o segundo fator.", true); return; }
    var session = await call("admin-session");
    if (session) load();
    } catch { say("Não foi possível verificar o segundo fator. Tente novamente.", true); }
  });

  document.querySelectorAll("[data-control]").forEach(function (el) {
    el.addEventListener("click", function () {
      call("admin-control", { control: el.getAttribute("data-control") }).then(function () { load(); });
    });
  });
  client.auth.onAuthStateChange(function (event, session) {
    if (event === "SIGNED_OUT") {
      document.getElementById("ba-desk").hidden = true;
      document.getElementById("ba-queue").replaceChildren();
      document.getElementById("ba-comments").replaceChildren();
      document.getElementById("ba-log").replaceChildren();
      document.getElementById("ba-login").hidden = false;
      document.getElementById("ba-link-login").hidden = false;
    } else if (session && event === "SIGNED_IN") {
      setTimeout(function () { openSession().catch(function () { say("Não foi possível validar a sessão administrativa. Tente novamente.", true); }); }, 0);
    }
  });
  openSession().catch(function (error) { say("Falha ao recuperar a sessão: " + (error.message || "erro de rede"), true); });
})();
