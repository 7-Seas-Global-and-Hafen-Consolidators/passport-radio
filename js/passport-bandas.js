/* Índice Bandas & Artistas. Os nomes vêm do JSON gerado do acervo. */
(() => {
  "use strict";
  const root = document.getElementById("az-app");
  if (!root) return;
  const preset = (document.body.getAttribute("data-letra") || "A").toUpperCase();
  let rows = [];
  let letter = preset;
  let query = "";

  const letters = ["0–9"].concat("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));

  function letterOf(row) {
    const ch = (row.letter || "#").toUpperCase();
    return ch === "#" || /\d/.test(ch) ? "0–9" : ch;
  }

  function visible() {
    const q = query.trim().toLowerCase();
    if (q) {
      return rows.filter((row) => (row.displayName + " " + row.slug).toLowerCase().indexOf(q) !== -1);
    }
    return rows.filter((row) => letterOf(row) === letter);
  }

  function esc(value) {
    return String(value || "").replace(/[&<>"]/g, (ch) => {
      if (ch === "&") return "&amp;";
      if (ch === "<") return "&lt;";
      if (ch === ">") return "&gt;";
      return "&quot;";
    });
  }

  function draw() {
    const list = visible();
    const q = query.trim();
    root.innerHTML = ""
      + '<p class="az-count">' + (q
        ? (list.length + " nomes para “" + esc(q) + "”.")
        : (list.length + " nomes na letra " + esc(letter) + "."))
      + "</p>"
      + '<table class="az-table"><thead><tr><th>Artista</th><th class="num">Matérias</th></tr></thead><tbody>'
      + list.map((row) => '<tr class="' + (row.reviewState === "needs_review" ? "is-review" : "") + '"><td><a href="' + esc(row.href) + '">' + esc(row.displayName) + "</a></td><td class=\"num\">" + esc(row.articleCount) + "</td></tr>").join("")
      + (list.length ? "" : '<tr><td colspan="2">Nenhum nome com esse recorte.</td></tr>')
      + "</tbody></table>";
  }

  function drawLetters() {
    const nav = document.getElementById("az-letters");
    if (!nav) return;
    nav.innerHTML = letters.map((item) => {
      const on = !query && item === letter;
      return '<a href="#' + encodeURIComponent(item) + '" data-letra="' + item + '"' + (on ? ' aria-current="page"' : "") + ">" + item + "</a>";
    }).join("");
  }

  function drawTop() {
    const box = document.getElementById("az-top");
    if (!box) return;
    const top = rows.slice().sort((a, b) => b.articleCount - a.articleCount).slice(0, 12);
    box.innerHTML = "<h2>Mais matérias</h2>" + top.map((row) => '<a href="' + esc(row.href) + '">' + esc(row.displayName) + " <span>" + esc(row.articleCount) + "</span></a>").join("");
  }

  document.getElementById("az-letters").addEventListener("click", (event) => {
    const link = event.target.closest("[data-letra]");
    if (!link) return;
    event.preventDefault();
    letter = link.getAttribute("data-letra");
    query = "";
    const input = document.getElementById("az-q");
    if (input) input.value = "";
    history.replaceState(null, "", "#" + encodeURIComponent(letter));
    drawLetters();
    draw();
  });

  document.getElementById("az-form").addEventListener("submit", (event) => {
    event.preventDefault();
    query = document.getElementById("az-q").value || "";
    drawLetters();
    draw();
  });
  document.getElementById("az-q").addEventListener("input", (event) => {
    query = event.target.value || "";
    drawLetters();
    draw();
  });

  fetch("/data/bandas-artistas.json", { credentials: "same-origin" })
    .then((res) => res.json())
    .then((data) => {
      rows = (data.entities || []).filter((row) => String(row.displayName || row.canonicalName || "").trim().toLowerCase() !== "a cena");
      const hash = decodeURIComponent((location.hash || "").replace("#", ""));
      if (letters.indexOf(hash) !== -1) letter = hash;
      drawLetters();
      drawTop();
      draw();
    })
    .catch(() => {
      root.textContent = "O índice não carregou.";
    });
})();
