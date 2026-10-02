"""Manual, deterministic Agenda materialization; no acquisition or scheduling."""
import json,html,re,datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE='https://www.passportradio.online'
DATA=ROOT/'data/passport-agenda.json'
def h(v):return html.escape(str(v or ''),quote=True)
def j(v):return json.dumps(v,ensure_ascii=False).replace('<','\\u003c')
def shell(title,description,path,body,extra=''):
 ref=(ROOT/'politica-de-privacidade.html').read_text()
 mast=re.search(r'<header .*?</header>',ref,re.S)[0];footer=re.search(r'<footer .*?</footer>',ref,re.S)[0]
 fonts=re.search(r'<link href="https://fonts.googleapis.com/css2[^>]*>',ref)[0]
 return f'''<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{h(title)} | Passport Radio</title><meta name="description" content="{h(description)}"><link rel="canonical" href="{BASE+path}"><meta property="og:type" content="website"><meta property="og:title" content="{h(title)}"><meta property="og:description" content="{h(description)}"><meta property="og:url" content="{BASE+path}">{fonts}<link rel="stylesheet" href="/css/passport-participe-paper.css?v=20260930"><link rel="stylesheet" href="/css/passport-agenda.css">{extra}</head><body class="passport-participe-paper">{mast}{body}{footer}<script src="/js/passport-audio-continuity.js" data-passport-continuity defer></script></body></html>'''
def photo(e,cover=False):return f'<img class="{"agenda-cover" if cover else "agenda-photo"}" src="{h(e["image"])}" alt="{h(e["image_alt"])}" loading="lazy">' if e.get('image') else '<div class="agenda-photo agenda-no-photo">Sem foto disponível</div>'
def row(e):return f'<article class="agenda-row">{photo(e)}<div><time datetime="{h(e["date"])}">{h(e["date"].split("-")[::-1][0])}/{e["date"][5:7]}/{e["date"][:4]}</time><h2><a href="/agenda/{h(e["slug"])}.html">{h(e["artist"])}</a></h2><p>{h(e["city"])} / {h(e["state"])}</p><p>{h(e["venue"])}</p><p>{h(" · ".join(e["genres"]) or "Gênero não informado")}</p><p><a href="{h(e["ticket_url"])}" rel="nofollow">{h(e["ticket_seller"])} →</a></p><span class="agenda-status">{h(e["status"])}</span></div></article>'
def build():
 events=json.loads(DATA.read_text());today=datetime.datetime.now(datetime.timezone.utc).astimezone(__import__('zoneinfo').ZoneInfo('America/Sao_Paulo')).date().isoformat();assert len({e['id'] for e in events})==len(events);assert len({e['slug'] for e in events})==len(events)
 for e in events:
  assert e['state'] in 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split()
  assert re.fullmatch(r'[a-z0-9-]+',e['slug']);datetime.date.fromisoformat(e['date']);assert e['source_urls'];assert e['ticket_url'].startswith(('https://','http://'))
 filters='<form class="agenda-filters" id="agenda-filters" role="search"><label>ARTISTA / EVENTO / CASA<input type="search" name="q" placeholder="Buscar na Agenda"></label>'+''.join(f'<label>{label}<select name="{key}"><option value="">Todos</option></select></label>' for key,label in [('state','UF'),('city','CIDADE'),('month','MÊS'),('genre','GÊNERO'),('status','STATUS')])+'</form>'
 body='<main class="agenda-paper"><h1>AGENDA</h1><p class="agenda-kicker">ONDE A MÚSICA VAI ACONTECER.</p><nav class="agenda-tabs" aria-label="Período"><a href="/agenda.html" data-agenda-view="upcoming" aria-current="page">PRÓXIMOS</a><a href="/agenda.html?view=archive" data-agenda-view="archive">REALIZADOS / ARQUIVO</a></nav>'+filters+'<p id="agenda-count" class="agenda-count" aria-live="polite"></p><div id="agenda-events" class="agenda-list">'+''.join(row(e) for e in sorted((e for e in events if e['date']>=today),key=lambda e:e['date'])[:24])+'</div><nav class="agenda-pagination" id="agenda-pagination" aria-label="Páginas da Agenda"></nav><noscript><p>Ative JavaScript para utilizar filtros e paginação. As páginas dos eventos também podem ser acessadas diretamente.</p></noscript></main><script type="application/json" id="agenda-data">'+j(events)+'</script><script src="/js/passport-agenda.js" defer></script>'
 (ROOT/'agenda.html').write_text(shell('Agenda Brasil','Agenda de música ao vivo no Brasil: apresentações, datas, cidades, casas e bilheterias oficiais.','/agenda.html',body))
 directory=ROOT/'agenda';directory.mkdir(exist_ok=True)
 statuses={'Cancelado':'EventCancelled','Adiado':'EventPostponed','Remarcado':'EventRescheduled'}
 for e in events:
  path='/agenda/'+e['slug']+'.html';fields=[('EVENTO / TURNÊ',e['event_name']),('DATA','/'.join(e['date'].split('-')[::-1])),('HORÁRIO',e['time']),('CIDADE / UF',e['city']+' / '+e['state']),('CASA',e['venue']),('ENDEREÇO',e['address']),('GÊNERO',', '.join(e['genres']) or 'Não informado pela fonte'),('STATUS','Realizado' if e['date']<today and e['status'] not in statuses else e['status']),('BILHETERIA',e['ticket_seller'])]
  caption=f'<figcaption class="agenda-credit">{h(e["image_credit"])}</figcaption>' if e['image_credit'] else ''
  cta='VER INFORMAÇÕES →' if e['status'] in ['Cancelado','Adiado','Esgotado','Ingressos em breve'] else 'VER INGRESSOS →'
  related=[x for x in events if x['artist']==e['artist'] and x['id']!=e['id']]
  body='<main class="agenda-paper agenda-detail"><a class="agenda-back" href="/agenda.html">← VOLTAR À AGENDA</a><h1>'+h(e['artist'])+'</h1><figure>'+photo(e,True)+caption+'</figure><dl class="agenda-details">'+''.join('<dt>'+label+'</dt><dd>'+h(value)+'</dd>' for label,value in fields if value)+'</dl><a class="agenda-ticket" href="'+h(e['ticket_url'])+'" rel="nofollow">'+cta+'</a><p class="agenda-credit">O ingresso é oferecido pela bilheteria indicada. A Passport Radio não vende ingressos.</p><h2>Fontes</h2><ul class="agenda-sources">'+''.join('<li><a href="'+h(u)+'">'+h(u)+'</a></li>' for u in e['source_urls'])+'</ul><p class="agenda-credit">Atualizado em '+h(e['updated_at'])+'.</p>'
  if e['related_passport_article']:body+='<p><a href="'+h(e['related_passport_article'])+'">LEIA NA PASSPORT →</a></p>'
  if related:body+='<h2>Outras apresentações</h2><ul>'+''.join('<li><a href="/agenda/'+h(x['slug'])+'.html">'+h(x['city'])+' · '+h(x['date'])+'</a></li>' for x in related)+'</ul>'
  body+='</main>';schema={'@context':'https://schema.org','@type':'MusicEvent','name':e['event_name'],'startDate':e['date']+('T'+e['time'] if e['time'] else ''),'eventStatus':'https://schema.org/'+statuses.get(e['status'],'EventScheduled'),'location':{'@type':'Place','name':e['venue'],'address':{'@type':'PostalAddress','addressLocality':e['city'],'addressRegion':e['state'],'addressCountry':'BR'}},'offers':{'@type':'Offer','url':e['ticket_url']},'url':BASE+path}
  if e['address']:schema['location']['address']['streetAddress']=e['address']
  if e['image']:schema['image']=BASE+e['image'] if e['image'].startswith('/') else e['image']
  extra='<script type="application/ld+json">'+j(schema)+'</script>'+(f'<meta property="og:image" content="{h(BASE+e["image"] if e["image"].startswith('/') else e["image"])}">' if e['image'] else '')
  (directory/(e['slug']+'.html')).write_text(shell(e['artist']+' — '+e['city']+' — '+e['date'],e['artist']+' em '+e['venue']+', '+e['city']+'/'+e['state']+', '+e['date']+'. '+e['status']+'.',path,body,extra))
 sitemap=ROOT/'sitemap-agenda.xml';sitemap.write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+BASE+p+'</loc></url>' for p in ['/agenda.html']+['/agenda/'+e['slug']+'.html' for e in events])+'</urlset>')
 print('Agenda generated:',len(events),'events')
if __name__=='__main__':build()
