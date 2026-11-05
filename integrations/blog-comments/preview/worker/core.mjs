const OFFICIAL='https://passportradio.online';
const GOOGLE='https://script.google.com/macros/s/AKfycbw2OU703B9TnicycjN1ZsXCcLSfcwm8dlAF2yvvkmVJDfCuEu3WgpaOQFAkfQD2NiDI/exec';
export function parseReceipt(html,id) {
  const init=html.match(/goog\.script\.init\("((?:\\.|[^"\\])*)"/);
  if(!init)throw Error('Google receipt envelope missing');
  const decoded=JSON.parse('"'+init[1].replace(/\\x([0-9a-f]{2})/gi,(_,h)=>'\\u00'+h)+'"');
  const data=JSON.parse(decoded);
  const match=data.userHtml?.match(/window\.top\.postMessage\((\{[^\n]+?\}),\s*"https:\/\/passportradio\.online"\);/);
  if(!match)throw Error('Google receipt missing');
  const receipt=JSON.parse(match[1]);
  if(receipt.type!=='passport-comment'||receipt.id!==id||typeof receipt.received!=='boolean')throw Error('Invalid Google receipt');
  return receipt;
}
function headers(type){return {'content-type':type,'cache-control':'no-store','x-robots-tag':'noindex, nofollow','x-passport-preview':'pr589-complete'};}
function rewriteHTML(html){
  return html.replace(/((?:href|src|action)=["'])https:\/\/passportradio\.online(?=\/|["'])/gi,'$1')
    .replace(/<head([^>]*)>/i,'<head$1><meta name="robots" content="noindex,nofollow"><script src="/__preview/navigation.js"></script>');
}
export default {
 async fetch(request) {
  const url=new URL(request.url);
  if(url.pathname==='/__preview/comments'){
   if(request.method!=='POST')return new Response('Method not allowed',{status:405});
   if(request.headers.get('origin')!==url.origin)return new Response('Origin rejected',{status:403});
   const raw=await request.text();if(raw.length>16000)return new Response('Too large',{status:413});
   const fields=new URLSearchParams(raw),id=fields.get('requestId');
   if(!/^[0-9a-f-]{36}$/.test(id||''))return Response.json({error:'Invalid ID'},{status:400,headers:headers('application/json')});
   try{
    const response=await fetch(GOOGLE,{method:'POST',body:fields,redirect:'follow',signal:AbortSignal.timeout(50000)});
    if(!response.ok)throw Error('Google returned error');
    const receipt=parseReceipt(await response.text(),id);
    return Response.json(receipt,{headers:headers('application/json')});
   }catch(_){return Response.json({error:'No verified Google receipt'},{status:502,headers:headers('application/json')});}
  }
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
  if(url.pathname==='/robots.txt')return new Response('User-agent: *\nDisallow: /\n',{headers:headers('text/plain')});
  if(Object.hasOwn(resources,url.pathname)){
   const type=url.pathname.endsWith('.js')?'application/javascript; charset=utf-8':url.pathname.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8';
   let text=resources[url.pathname];if(type.startsWith('text/html'))text=rewriteHTML(text);
   return new Response(request.method==='HEAD'?null:text,{headers:headers(type)});
  }
  // Public media/data retain their official URLs; never relay or modify streams.
  if(!url.pathname.endsWith('.html')&&!url.pathname.endsWith('/'))return Response.redirect(OFFICIAL+url.pathname+url.search,302);
  const upstream=await fetch(OFFICIAL+url.pathname+url.search,{redirect:'manual',headers:{'accept':request.headers.get('accept')||'*/*'}});
  if(upstream.status>=300&&upstream.status<400){const location=upstream.headers.get('location');if(location){const target=new URL(location,OFFICIAL);return Response.redirect(target.origin===OFFICIAL?url.origin+target.pathname+target.search:target.href,upstream.status);}}
  const h=new Headers(upstream.headers);h.delete('set-cookie');h.set('x-robots-tag','noindex, nofollow');
  if((h.get('content-type')||'').includes('text/html')){h.delete('content-length');h.delete('content-encoding');return new Response(rewriteHTML(await upstream.text()),{status:upstream.status,headers:h});}
  return new Response(upstream.body,{status:upstream.status,headers:h});
 }
};
