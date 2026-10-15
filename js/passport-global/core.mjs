export const LANGUAGES = Object.freeze([
  {code:'pt-BR',label:'PT',name:'Português'},
  {code:'en-GB',label:'EN',name:'English (UK)'},
  {code:'es',label:'ES',name:'Español'},
  {code:'fr',label:'FR',name:'Français'},
  {code:'de',label:'DE',name:'Deutsch'}
]);
export const STORAGE_KEY='passport-global-language-v1';
export function resolveLanguage(code='pt-BR') {
  const base=String(code).replace('_','-').toLowerCase().split('-')[0];
  return ({pt:'pt-BR',en:'en-GB',es:'es',fr:'fr',de:'de'})[base]||'pt-BR';
}
export function detectLanguage(saved,languages=[]) {
  if(saved)return resolveLanguage(saved);
  for(const language of languages){const base=String(language).toLowerCase().split('-')[0];if(['pt','en','es','fr','de'].includes(base))return resolveLanguage(language);}
  return 'pt-BR';
}
export async function fingerprint(source) {
  const value=new TextEncoder().encode(source);
  const hash=await crypto.subtle.digest('SHA-256',value);
  return [...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export function checkedTranslation(source,value) {
  if(typeof value!=='string'||!value.trim()||/[<>]/.test(value)&&!/[<>]/.test(source))throw Error('INVALID_TRANSLATION');
  const protectedTokens=s=>s.match(/https?:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:R\$|€|£|\$)?\s*\d+(?:[.,:/-]\d+)*|\b(?:SKU[-_]\w+|[A-Z]{2,}[-_]\w*\d\w*)|[^\s]+™/g)||[];
  const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
  if(!same(protectedTokens(source).map(x=>x.trim()),protectedTokens(value).map(x=>x.trim())))throw Error('PROTECTED_TOKEN_CHANGED');
  return value;
}
export async function resolveBatch(records,locale,lookup) {
  if(locale==='pt-BR')return records.map(r=>r.source);
  const result=await Promise.all(records.map(async r=>{
    if(r.invariant)return r.source;
    const text=await lookup(r.source,locale);
    if(text==null)throw Error('INCOMPLETE_TRANSLATION');
    return checkedTranslation(r.source,text);
  }));
  return result;
}
export function localeMetadata(locale){return ({'pt-BR':'pt_BR','en-GB':'en_GB',es:'es_ES',fr:'fr_FR',de:'de_DE'})[locale]||'pt_BR';}
