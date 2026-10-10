export async function handle(req, env, fetcher = fetch) {
  const json = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
  if(req.method!=='POST') return json({ok:false},405);
  const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'};
  async function rpc(name,body){const r=await fetcher(`${env.SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error('database');return r.json();}
  try {
    if(!await rpc('participe_worker_authorized',{worker_token:req.headers.get('X-Worker-Token')||''}))return json({ok:false},401);
    const missing=['RESEND_API_KEY','PASSPORT_EDITORIAL_MAIL_FROM'].filter(k=>!env[k]);
    if(missing.length)return json({ok:false,code:'missing_email_configuration',missing},503);
    const rows=await rpc('participe_claim_notifications',{});let delivered=0,waiting=0,failed=0;
    const providerHeaders={Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'};
    for(const row of rows){let id=row.provider_id,outcome='pending',error=null;
      try {
        if(!id){
          // Resend deduplicates for 24h. Never retry an ambiguous request after that window.
          if(Date.now()-Date.parse(row.first_attempt_at)>23*3600000){outcome='failed';error='reconciliation_required';}
          else {
            const text=['A redação da Passport Radio recebeu uma nova participação.',`Tipo: ${row.participation_type}`,`Título: ${row.title}`,`Pseudônimo: ${row.pseudonym}`,`Data: ${row.submitted_at}`,`Identificador: ${row.submission_id}`,'Painel (login administrativo obrigatório): https://passportradio.online/privado/blog-aberto.html'].join('\n\n');
            const r=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{...providerHeaders,'Idempotency-Key':`participe/${row.submission_id}`},body:JSON.stringify({from:env.PASSPORT_EDITORIAL_MAIL_FROM,to:['passportradio.online@gmail.com'],subject:`🎸 Passport Radio — Novo material recebido: ${row.title.replace(/[\r\n]/g,' ')}`,text}),signal:AbortSignal.timeout(15000)});
            if(!r.ok){error=`provider_http_${r.status}`;if(r.status>=400&&r.status<500&&![408,409,429].includes(r.status))outcome='failed';}
            else {const data=await r.json();if(typeof data.id!=='string'||!data.id)throw new Error('provider_missing_id');id=data.id;
              // Persist accepted ID before polling: acceptance alone is not delivery.
              if(!await rpc('participe_finish_notification',{item_id:row.submission_id,token:row.claim_token,email_id:id,outcome:'pending',error_code:null}))throw new Error('claim_lost');waiting++;continue;
            }
          }
        }else{
          const r=await fetcher(`https://api.resend.com/emails/${encodeURIComponent(id)}`,{headers:providerHeaders,signal:AbortSignal.timeout(15000)});
          if(!r.ok)error=`provider_lookup_${r.status}`;
          else {const data=await r.json();if(data.id!==id)throw new Error('provider_id_mismatch');if(['delivered','opened','clicked'].includes(data.last_event))outcome='sent';else if(['bounced','failed','canceled'].includes(data.last_event)){outcome='failed';error=`provider_${data.last_event}`;}}
        }
      }catch{error='provider_or_persistence_unconfirmed';}
      await rpc('participe_finish_notification',{item_id:row.submission_id,token:row.claim_token,email_id:id||null,outcome,error_code:error});
      if(outcome==='sent')delivered++;else if(outcome==='failed')failed++;else waiting++;
    }
    return json({ok:true,delivered,waiting,failed});
  }catch{return json({ok:false,code:'worker_unconfirmed'},503);}
}
