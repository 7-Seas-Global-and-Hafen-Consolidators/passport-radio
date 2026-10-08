from pathlib import Path
exec(Path(__file__).with_name('translation-source.py').read_text())
assets=json.loads((out/'assets-recovery.json').read_text());assetmap={x['source']:x for x in assets}
catpath=root/'data/jogos/desafios-catalog.json';cat=json.loads(catpath.read_text());meta={g['id']:g for g in cat['games']};old={}
for p in (root/'data/jogos/desafios').glob('*.json'):
 d=json.loads(p.read_text())
 if d.get('sourceId') and int(d['id'].split('-')[1])<=11:old[d['sourceId']]=d
strip=lambda s:html.unescape(re.sub(r'<[^>]+>','',s or '')).strip()
def media(url,alt):
 if not url:return None
 x=assetmap[url];return {'src':'/'+x['path'],'alt':alt,'source':url}
inv=[];drafts=[]
for sid,rec in M.items():
 native=rec['quiz'];base=old.get(sid);num=int(base['id'].split('-')[1]) if base else IDS[sid];id=f'dp-{num:02d}';gmeta=meta.get(id,{})
 qs=V(native['questions']);profile=any('results' in a for q in qs for a in V(q['answers']));g={**(base or {}),'id':id,'version':1,'title':TITLES[sid],'family':'Perfil' if profile else gmeta.get('family','Conhecimento'),'type':gmeta.get('type','trivia'),'mode':'profile' if profile else 'quiz','questions':[],'results':[],'sourceId':sid}
 if g['family']=='Em preparação':g['family']='Visual' if any(q.get('image') for q in qs) and sid in ['687','520','471','423','345','231','807'] else 'Conhecimento'
 if g['type']=='perfil' and not profile:g['type']='trivia'
 g['presentation']={'questionLayout':native['settings'].get('question_layout','multiple'),'skin':native['settings'].get('skin','flat'),'answerLayout':'stacked','imagePlacement':'left','sourceTitle':native['name']}
 g['sourceFiles']=rec['sources'];g['sourceSettings']={k:native['settings'][k] for k in ['question_layout','skin','rand_questions','rand_answers','restart_questions','show_next_button','end_answers'] if k in native['settings']}
 for i,q in enumerate(qs):
  oldq=base['questions'][i] if base else None
  title=strip(q['title']);prompt=oldq['prompt'] if oldq else Q[sid][i] if sid in Q else COMMON.get(title)
  assert prompt,(sid,i,title)
  x={**(oldq or {}),'id':q['id'],'prompt':prompt,'type':oldq['type'] if oldq else g['type'],'options':[],'sourceIndex':i,'answerType':q.get('answerType','text')}
  if q.get('image'):x['image']=media(q['image'],'Imagem da pergunta '+str(i+1))
  else:x.pop('image',None)
  if q.get('imagePlaceholder'):x['imagePlaceholder']=media(q['imagePlaceholder'],'Imagem da pergunta '+str(i+1))
  if q.get('desc'):x['explanation']=oldq.get('explanation') if oldq else D[sid][i];assert x['explanation'],(sid,i,'desc')
  if q.get('hint'):x['hint']=H[sid][i]
  for j,a in enumerate(V(q['answers'])):
   raw=strip(a['title']);label=oldq['options'][j]['label'] if oldq else A.get(a['id'],COMMON.get(raw,raw))
   if not oldq:
    if sid in ['423','417','373']:label=re.sub(r'\bvon (?:den )?', 'de ',label)
    if sid=='654':label=label.replace(' mit ',' com ')
    if sid=='315':label=label.replace(' und die ',' e ').replace(' und ',' e ');label='Scorpions' if label=='Die Scorpions' else label
   o={'id':a['id'],'label':label}
   if profile:o['weights']={k:int(v) for k,v in a.get('results',{}).items()}
   else:o['correct']=str(a.get('isCorrect','0'))=='1'
   if a.get('image'):o['image']=media(a['image'],'Imagem da alternativa '+str(j+1))
   x['options'].append(o)
  if set(strip(a['title']) for a in V(q['answers']))=={'Wahr','Falsch'}:x['type']='verdadeiro-falso'
  g['questions'].append(x)
 for r in V(native['results']):
  v={'id':r['id'],**R[r['id']]}
  if not profile:v.update(min=int(r['min']),max=int(r['max']))
  if r.get('image'):v['image']=media(r['image'],'Imagem do resultado '+R[r['id']]['title'])
  g['results'].append(v)
 if base:g['versionHash']=base['versionHash']
 else:g['versionHash']=hashlib.sha256(json.dumps(g['questions'],ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:16]
 assert len(g['questions'])==len(qs)
 dest=root/f'data/jogos/desafios/{id}.json';dest.write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n')
 gmeta.update(id=id,title=g['title'],family=g['family'],type=g['type'],questions=len(qs),status='completo',available=True,data=f'/data/jogos/desafios/{id}.json',description='Perfil com resultados ponderados.' if profile else 'Quiz com perguntas e alternativas da fonte original.');meta[id]=gmeta
 used={a['path'] for a in assets if any(u[0]==sid for u in a['uses'])}
 inv.append({'id':id,'sourceId':sid,'titleOriginal':native['name'],'titlePtBr':g['title'],'sourceFiles':rec['sources'],'questions':len(qs),'assets':len(used),'status':'completo','action':'completado' if base else 'implementado','mode':g['mode'],'questionLayout':g['presentation']['questionLayout']})
cat['games']=[meta[k] for k in sorted(meta)];cat['version']=2;cat['sourceGames']=45;catpath.write_text(json.dumps(cat,ensure_ascii=False,indent=2)+'\n')
inv.sort(key=lambda x:x['id']);(out/'inventory.json').write_text(json.dumps(inv,ensure_ascii=False,indent=2)+'\n')
assert len(inv)==45 and sum(x['questions'] for x in inv)==666
print({'games':len(inv),'questions':sum(x['questions'] for x in inv),'assets':len(assets),'new':sum(x['status']=='saved-new' for x in assets)})
# Reconcile all supplied visual references with the native source IDs too.
audit=json.loads((out/'sources-audit.json').read_text());by_number={x['file'][:2]:x['file'] for x in audit};screens={'10':'687','11':'520','15':'471','18':'423','27':'345','36':'231','41':'1077','44':'1029','46':'1009','51':'807'}
for x in inv:
 nums={Path(p).name[:2] for p in x['sourceFiles'] if Path(p).name[:2] in by_number}|{n for n,s in screens.items() if s==x['sourceId']}
 x['recoveryFiles']=[by_number[n] for n in sorted(nums)];x['sourceFiles']=list(dict.fromkeys(x['sourceFiles']+x['recoveryFiles']))
assert {f for x in inv for f in x['recoveryFiles']}=={x['file'] for x in audit}
(out/'inventory.json').write_text(json.dumps(inv,ensure_ascii=False,indent=2)+'\n')
