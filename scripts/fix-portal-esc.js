/* node scripts/fix-portal-esc.js */
const fs = require("fs");
const P = "js/passport-portal-v3.js";
let src = fs.readFileSync(P, "utf8");
if (src.indexOf('"""') === -1 && src.indexOf("fromCharCode(38)") !== -1) {
  console.log("NADA A FAZER: esc() já ressuscitado neste SHA.");
  process.exit(0);
}
const NOVA =
  'const esc = (s) => { const A = String.fromCharCode(38); ' +
  'return String(s == null ? "" : s).replace(/[&<>"\']/g, (c) => ({ ' +
  '"&": A + "amp;", "<": A + "lt;", ">": A + "gt;", \'"\': A + "quot;", "\'": A + "#39;" ' +
  '}[c])); };\n';
const antes = src;
src = src.replace(/const esc = \(s\) =>[^\n]*\n/, NOVA);
if (src === antes) {
  console.log("ERRO: linha do esc() não casou.");
  process.exit(1);
}
fs.writeFileSync(P, src);
console.log("esc() substituído. Valide: node --check " + P);
