// Anonymous public measurement API; database access is exclusively server-side.
const PUBLIC_KEY = 'sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y';
const origins = new Set(['https://passportradio.online','https://www.passportradio.online']);
const rpc = async (name: string, body: unknown) => {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/${name}`, {
    method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${key}`},body:JSON.stringify(body)
  });
};
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const headers = {'Content-Type':'application/json','Access-Control-Allow-Origin':origin || '*','Access-Control-Allow-Headers':'apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS',Vary:'Origin','Cache-Control':'no-store'};
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body),{status,headers});
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers});
  // Explicit public API-key authentication; no privileged key in the frontend.
  if (req.headers.get('apikey') !== PUBLIC_KEY) return reply({error:'Unauthorized'},401);
  try {
    if (req.method === 'GET') {
      const result = await rpc('passport_media_report',{});
      if (!result.ok) return reply({error:'Measurement unavailable'},503);
      return reply(await result.json());
    }
    if (req.method !== 'POST') return reply({error:'Method not allowed'},405);
    if (!origins.has(origin)) return reply({error:'Production origin required'},403);
    if (Number(req.headers.get('content-length') || 0) > 2048) return reply({error:'Payload too large'},413);
    const raw = await req.text();
    if (raw.length > 2048) return reply({error:'Payload too large'},413);
    const data = JSON.parse(raw);
    if (data.consent !== true || !['desktop','mobile','tablet'].includes(data.device) || !['direct','search','social','internal','referral'].includes(data.source) || typeof data.path !== 'string' || !/^\/[A-Za-z0-9_./%-]{0,250}$/.test(data.path)) return reply({error:'Invalid measurement'},400);
    const ua = req.headers.get('user-agent') || '';
    if (/bot|crawler|spider|headless/i.test(ua)) return reply({recorded:false});
    // Short-lived keyed hash, never raw IP or UA in storage. Deduplicate one
    // same-browser/path event per minute. No person/unique-user claim.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const minute = Math.floor(Date.now()/60000);
    const seed = `${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}|${ip}|${ua}|${data.path}|${minute}`;
    const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(seed));
    const token = Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
    const result = await rpc('passport_media_collect',{p_token:token,p_device:data.device,p_source:data.source});
    if (!result.ok) return reply({error:'Measurement unavailable'},503);
    return reply({recorded:await result.json()});
  } catch (_) { return reply({error:'Measurement unavailable'},503); }
});
