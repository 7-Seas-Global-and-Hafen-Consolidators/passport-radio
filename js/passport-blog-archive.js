(function () {
  var grid = document.getElementById("blog-archive-grid");
  var empty = document.getElementById("blog-archive-empty");
  if (!grid) return;

  var COVER = "/historias/contar-historias-que-dao-vontade-de-ouvir.html";

  function stamp(iso) {
    if (!iso) return "PASSPORT RADIO";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "PASSPORT RADIO";
    var months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    return "PASSPORT RADIO · " + d.getUTCDate() + " " + months[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }

  function card(item) {
    var a = document.createElement("a");
    a.className = "blog-card";
    a.href = item.url;
    var eyebrow = document.createElement("span");
    eyebrow.className = "blog-card__eyebrow";
    eyebrow.textContent = (item.category || "BLOG").toString().toUpperCase();
    var h = document.createElement("h2");
    h.textContent = item.title || "";
    var p = document.createElement("p");
    p.textContent = item.deck || "";
    var meta = document.createElement("span");
    meta.className = "blog-card__meta";
    meta.textContent = stamp(item.published_at);
    a.appendChild(eyebrow);
    a.appendChild(h);
    a.appendChild(p);
    a.appendChild(meta);
    return a;
  }

  fetch("/data/blog-feed.json", { credentials: "same-origin" })
    .then(function (res) { return res.ok ? res.json() : { items: [] }; })
    .then(function (payload) {
      var items = (payload && payload.items) || [];
      var cover = (payload && payload.cover_url) || COVER;
      var shown = 0;
      items.forEach(function (item) {
        if (!item || !item.url || item.url === cover) return;
        grid.appendChild(card(item));
        shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
    })
    .catch(function () {
      if (empty) empty.hidden = false;
    });
})();
