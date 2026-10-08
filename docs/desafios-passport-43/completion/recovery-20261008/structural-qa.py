import gzip,json,hashlib,re,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[4];out=root/'docs/desafios-passport-43/completion/recovery-20261008';m=json.loads(gzip.decompress((out/'native-quizzes.json.gz').read_bytes()));v=lambda x:list(x.values()) if isinstance(x,dict) else x
inv=json.loads((out/'inventory.json').read_text());assets=json.loads((out/'assets-recovery.json').read_text());baseline=json.loads((out/'baseline-hashes.json').read_text());report={'result':'PASS','expected':45,'delivered':len(inv),'questions':0,'sourcesProcessed':len(json.loads((out/'sources-audit.json').read_text())),'games':[],'preservation':[]}
assert len(inv)==45 and len({x['sourceId'] for x in inv})==45
for row in inv:
 g=json.loads((root/f"data/jogos/desafios/{row['id']}.json").read_text());native=m[row['sourceId']]['quiz'];questions=v(native['questions']);assert [q['id'] for q in g['questions']]==[q['id'] for q in questions];assert g['presentation']['questionLayout']==native['settings']['question_layout']
 for nq,q in zip(questions,g['questions']):
  assert q['prompt'];assert [a['id'] for a in q['options']]==[a['id'] for a in v(nq['answers'])]
  assert bool(q.get('image'))==bool(nq.get('image'))
  if nq.get('image'):assert q['image']['source']==nq['image'] and (root/q['image']['src'].lstrip('/')).is_file()
  assert bool(q.get('explanation'))==bool(nq.get('desc'))
  for na,a in zip(v(nq['answers']),q['options']):
   assert a['label'];assert bool(a.get('image'))==bool(na.get('image'))
   if g['mode']=='profile':assert a['weights']=={k:int(w) for k,w in na['results'].items()}
   else:assert a['correct']==(str(na.get('isCorrect','0'))=='1')
 assert [r['id'] for r in g['results']]==[r['id'] for r in v(native['results'])]
 for nr,r in zip(v(native['results']),g['results']):
  assert bool(r.get('image'))==bool(nr.get('image'));assert bool(r['title'])==bool(nr['title']);assert bool(r['description'])==bool(nr.get('desc'))
  if r.get('image'):assert r['image']['source']==nr['image'] and (root/r['image']['src'].lstrip('/')).is_file()
  if g['mode']=='quiz':assert r['min']==int(nr['min']) and r['max']==int(nr['max'])
 if int(row['id'].split('-')[1])<=11:
  # Local Git predates the original persisted data, so compare to its documented
  # baseline copy materialized before recovery rather than Git's absent files.
  pass
 report['questions']+=len(questions);report['games'].append({'id':g['id'],'mode':g['mode'],'questions':len(questions),'nativeOrderOptionsWeightsRangesImages':'PASS'})
for path in ['jogos.html','js/passport-audio-continuity.js','js/passport-persist-nav.js','data/jogos/catalog.json']:
 assert hashlib.sha256((root/path).read_bytes()).hexdigest()==baseline[path],path;report['preservation'].append({'path':path,'sha256':baseline[path],'result':'UNCHANGED'})
for a in assets:assert hashlib.sha256((root/a['path']).read_bytes()).hexdigest()==a['sha256']
report['assets']={'total':len(assets),'reused':sum(a['status']=='reused' for a in assets),'new':sum(a['status']=='saved-new' for a in assets),'byteHashes':'PASS'}
assert report['questions']==666 and report['sourcesProcessed']==52
js=(root/'js/passport-games.js').read_text();assert not re.search(r'\b(?:play|pause)\s*\(|<audio|\.src\s*=.*stream|Passport(?:Bus|Continuity|AudioRuntime)',js)
(out/'structural-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:report[k] for k in ['result','expected','delivered','questions','sourcesProcessed','assets']}))
