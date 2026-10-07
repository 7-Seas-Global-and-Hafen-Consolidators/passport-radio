from pathlib import Path
import json,re,hashlib,subprocess
D=Path(__file__).parent;base='8122e83318423a922ddf5b7b5d06e7cf3fb8fa1c';inventory=json.loads((D/'inventory.json').read_text());catalog=json.loads(Path('data/jogos/desafios-catalog.json').read_text());assert len(inventory)==len(catalog['games'])==43;assert len({g['id']for g in catalog['games']})==43
# Decode exact native payloads from all persisted packs, including overlapping legacy dumps.
native={};sources=[]
for directory in ['docs/desafios-passport-43/source','docs/desafios-passport-43/source-correct']:
 for p in sorted(Path(directory).iterdir()):
  raw=p.read_text();sources.append({'file':str(p),'sha256':hashlib.sha256(raw.encode()).hexdigest()});s=re.sub(r'\\([\\`*_{}\[\]()#+\-.!<>:])',r'\1',raw)
  for match in re.finditer(r'var\s+((?:trivia|personality)Quiz\d+)\s*=\s*',s):
   q,end=json.JSONDecoder().raw_decode(s[match.end():]);sid=str(q['id'])
   if sid in native:assert native[sid]==q,'conflicting native payload '+sid
   native[sid]=q
count=0;tested=[]
for meta in catalog['games']:
 if not meta['available']:assert meta['status']=='fonte-parcial';assert meta['questions']==0;assert 'data'not in meta;continue
 g=json.loads(Path(meta['data'][1:]).read_text());src=native[g['sourceId']];assert len(g['questions'])==len(src['questions']);assert [q['id']for q in g['questions']]==list(src['questions']);count+=len(g['questions'])
 for q in g['questions']:
  sq=src['questions'][q['id']];assert[q['id']for q in q['options']]==list(sq['answers']);assert bool(q.get('image'))==bool(sq.get('image'));assert bool(q.get('explanation'))==bool(sq.get('desc'))
  if q.get('image'):assert Path(q['image']['src'][1:]).is_file();assert q['image']['alt'].startswith('Pista visual');assert not any(a['label'].strip().lower()in q['image']['alt'].lower()for a in q['options'])
  for o in q['options']:
   so=sq['answers'][o['id']]
   if g['mode']=='profile':assert o['weights']=={k:int(v)for k,v in so['results'].items()}
   else:assert o['correct']==(so.get('isCorrect')=='1')
  assert q['prompt'].strip()
 if g['mode']=='quiz':
  for r in g['results']:assert (r['min'],r['max'])==(int(src['results'][r['id']]['min']),int(src['results'][r['id']]['max']))
 tested.append({'id':g['id'],'questions':len(g['questions']),'source':g['sourceId'],'keysWeightsImages':'EXACT_MATCH'})
assert count==186
assets=json.loads((D/'assets.json').read_text());assert sum(a['status']=='saved'for a in assets)==22
for a in assets:
 if a['status']=='saved':assert hashlib.sha256(Path(a['path']).read_bytes()).hexdigest()==a['sha256']
 else:assert a['status']=='excluded-brand' and a['path']is None
protected=['js/passport-audio-continuity.js','js/passport-persist-nav.js','js/passport-games-navigation.js','data/jogos/catalog.json','data/jogos/universe.json','index.html','radio.html'];result=[]
for f in protected:
 before=subprocess.check_output(['git','show',base+':'+f]);actual=Path(f).read_bytes();assert actual==before,f;result.append({'file':f,'sha256':hashlib.sha256(actual).hexdigest(),'status':'BYTE_IDENTICAL'})
s=Path('js/passport-games.js').read_text();assert not re.search(r'Passport(?:Audio|Continuity|Bus)|\b(?:audio|play|pause)\s*\(|sessionStorage|currentSrc|engine\.select|new Audio',s);assert 'passport.games.v1.'in s and 'passport.games.desafios.v1.'in s
page=Path('jogos.html').read_text();assert page.count('src="/js/passport-audio-continuity.js"')==1;assert '<audio'not in page and '<iframe'not in page;assert 'data/jogos/desafios'not in page;assert '<h1>DESAFIOS PASSPORT</h1>'in page
css=Path('css/passport-games.css').read_text();assert not re.search(r'#(?:666|777|333|[a-f0-9]{6})\b',css,re.I) or set(re.findall(r'#[a-f0-9]{6}\b',css,re.I))<={'#111111','#FFFFFF','#C41E3A'}
(D/'structural-qa.json').write_text(json.dumps({'result':'PASS','catalogIds':43,'playableNew':11,'partialIds':[a['id']for a in inventory if not a['available']],'sourceQuestions':186,'localClueAssets':22,'games':tested,'protected':result,'sourceHashes':sources,'notCertified':'Missing source bodies are not invented; source-only mechanics have no real UI test.'},ensure_ascii=False,indent=2)+'\n');print('PASS43 IDs,186 exact source questions/keys/weights,22 assets, legacy and audio protected')
