"""Record exact photographs, video identities and scope against the approved base."""
import json,hashlib,pathlib,subprocess,collections,urllib.parse
from bs4 import BeautifulSoup
ROOT=pathlib.Path('.');D=ROOT/'docs/editorial-home-seven-20261102';base='e4152f766784acc0e8a02ee27821d0e6ff2dd428'
inventory=json.load(open(D/'inventory-before.json'));pool=json.load(open(D/'photo-candidates.json'));catalog=json.load(open(D/'catalog.json'))
phase1=json.load(open('docs/editorial-recovery-197-20261030/fase1-37/photo-manifest.json'));known={v['src']:v for v in [*pool.values(),*phase1.values()] if isinstance(v,dict)and 'src'in v}
manifest=[];used=set()
for a in inventory:
 s=BeautifulSoup(pathlib.Path(a['path']).read_text(),'html.parser');images=[];original=[i['src'] for i in a['images']];hashes=[]
 for im in s.select('main img'):
  src=im['src'];used.add(src);f=ROOT/urllib.parse.unquote(src).lstrip('/');digest=hashlib.sha256(f.read_bytes()).hexdigest();hashes.append(digest);record=known.get(src,{}).copy();chapter=im.find_parent(class_='pr-chapter');heading=chapter.find(['h2','h3']).get_text(' ',strip=True)if chapter else 'Abertura / introdução';fig=im.find_parent('figure');caption=fig.find('figcaption')if fig else None
  images.append({'src':src,'action':'preservada'if src in original else 'acrescentada','chapter':heading,'alt':im.get('alt'),'caption':caption.get_text(' ',strip=True)if caption else None,'sha256':digest,'provenance':record or {'source':'https://passportradio.online/'+a['path'],'credit':'Acervo original da matéria; fotógrafo não identificado no documento de origem.'},'type':'anúncio oficial preservado'if '/images/brand/'in src else 'documento/ilustração original'if a['number']==1 and src in original else 'fotografia editorial'})
 removed=[src for src in original if src not in [i['src'] for i in images]]
 videos=[dict(f.attrs)for f in s.select('main iframe')];assert len(videos)==len(a['videos']);assert all(v['src']==old['src']for v,old in zip(videos,a['videos']));assert len(hashes)==len(set(hashes)),f'Duplicate image {a["number"]}'
 reasons={3:'Abertura reorganizada com fotografia horizontal já existente; retrato duplicado substituído por Dusty Hill solo. As fotografias originais distintas continuam presentes.',6:'Removidas versões com logotipo sobreposto de Mortification, Deliverance e Extol; fotografias limpas documentadas em seu lugar.'}
 manifest.append({'number':a['number'],'path':a['path'],'model':catalog['articles'][a['number']-1]['model'],'images':images,'replacedOriginals':removed,'reason':reasons.get(a['number'],'Fotografias existentes preservadas; novas imagens distintas associadas aos capítulos.'),'videos':[{'src':v['src'],'action':'preservado','originalAttributes':old,'currentAttributes':v,'reason':'Identidade e endereço originais mantidos; apresentação responsiva aprovada.'}for v,old in zip(videos,a['videos'])]})
# No rejected candidates or unused media in the review branch.
for f in (ROOT/'images/editorial/home-seven-20261102').glob('*'):
 if '/'+f.as_posix() not in used:f.unlink()
pool={k:{**v,'status':'selected'}for k,v in pool.items()if v['src']in used};json.dump(pool,open(D/'photo-candidates.json','w'),ensure_ascii=False,indent=2)
for k in catalog['images']:
 if k in pool:catalog['images'][k]=pool[k]
json.dump(catalog,open(D/'catalog.json','w'),ensure_ascii=False,indent=2);json.dump(manifest,open(D/'photo-video-manifest.json','w'),ensure_ascii=False,indent=2)
paths=[a['path']for a in inventory];changed=[p for p in subprocess.check_output(['git','diff',base,'--name-only']).decode().splitlines() if p.endswith('.html') or p.startswith(('js/','css/'))];changed=sorted(set(changed+['css/passport-editorial-home-seven.css']));assert set(changed)==set(paths+['js/passport-persist-nav.js','css/passport-editorial-home-seven.css'])
protected=['index.html','js/passport-editorial-recovery.js','css/passport-editorial-recovery.css','css/passport-editorial-layout.css','data/editorial-recovery-phase1.json']
phaseInventory=json.load(open('docs/editorial-recovery-197-20261030/fase1-37/inventory.json'));rows=phaseInventory if isinstance(phaseInventory,list)else phaseInventory.get('articles',[])
for r in rows:
 p=r.get('path');
 if p and p not in paths:protected.append(p)
checks=[]
for p in protected:
 old=subprocess.check_output(['git','show',base+':'+p]);now=(ROOT/p).read_bytes();assert old==now,p;checks.append({'path':p,'unchanged':True,'sha256':hashlib.sha256(now).hexdigest()})
nav=(ROOT/'js/passport-persist-nav.js').read_text();oldnav=subprocess.check_output(['git','show',base+':js/passport-persist-nav.js']).decode();expected=oldnav.replace(' const known=url=>'," const homeArticles=new Set(['/sharon-den-adel-within-temptation-30-anos.html','/frank-beard-zz-top-1949-2026.html','/roger-taylor-i-see-you-now-novo-album-2026.html','/greta-van-fleet-palace-for-the-people.html','/white-metal-isso-e-musica-crista.html']);\n const known=url=>homeArticles.has(url.pathname)||")
assert nav==expected
json.dump({'base':base,'changedProductionFiles':changed,'protectedUnchanged':checks,'navigationDelta':'Only exact five root article paths added to existing known-route set; transport and audio code unchanged.','uniqueImagesPerArticle':True,'originalVideosPreserved':sum(len(a['videos'])for a in inventory)},open(D/'scope-preservation.json','w'),ensure_ascii=False,indent=2)
print(json.dumps({'articles':len(manifest),'imagePlacements':sum(len(a['images'])for a in manifest),'newAssets':len(list((ROOT/'images/editorial/home-seven-20261102').glob('*'))),'videos':sum(len(a['videos'])for a in inventory),'protectedFiles':len(checks)}))
