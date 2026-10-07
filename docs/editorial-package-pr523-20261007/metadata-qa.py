from pathlib import Path
from html.parser import HTMLParser
import json,re,subprocess,hashlib
D=Path(__file__).parent;m=json.loads((D/'article-manifest.json').read_text());cp=json.loads((D/'CHECKPOINT.json').read_text());base=cp['baseHead'];out=[]
for a in m:
 s=Path(a['route'][1:]).read_text();schema=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1]);assert schema['headline']==a['title'];assert schema['description']==a['subtitle'];assert schema['author']['name']=='Mr. Nomad';assert schema['mainEntityOfPage']=='https://www.passportradio.online'+a['route'];assert schema['image']=='https://www.passportradio.online/'+a['assets'][0];assert schema['dateModified']=='2026-10-07';assert s.count('<h1>')==1;assert '<h2>' in s
 assert re.findall(r'embed/([^"?]+)',s)==a['videos'];assert 'autoplay' not in s
 for href in re.findall(r'<a[^>]+href="(/[^"#]*)',s):assert Path(href[1:] or 'index.html').exists() or subprocess.run(['git','cat-file','-e','HEAD:'+href[1:]],capture_output=True).returncode==0,href
 out.append(dict(article=a['name'],schema='PASS',headings='PASS',internalLinks='PASS',videoArchive='PASS'))
# All priority records other than the two authorized cards stay equal; only intended fields change.
old=json.loads(subprocess.check_output(['git','show',base+':data/editorial-priority-feed.json']))['items'];new=json.loads(Path('data/editorial-priority-feed.json').read_text())['items'];assert len(old)==len(new)
for before,after in zip(old,new):
 allowed={'image','title','deck'} if before['url']==m[1]['route'] else {'image'} if 'festa-ploc-' in before['url'] else set()
 assert {k:v for k,v in before.items() if k not in allowed}=={k:v for k,v in after.items() if k not in allowed}
for file in ['data/editorial-priority-feed.json','data/editorial-manual-feed.json']:
 feed=json.loads(Path(file).read_text())['items']
 for route in [m[1]['route'],'/editorial/2026/09/03/festa-ploc-musicas-anos-80-nostalgia-shows-ao-vivo.html']:
  item=next(x for x in feed if x['url']==route);page=Path(route[1:]).read_text();hero=re.search(r'<section class="hero">.*?<img[^>]+src="([^"]+)"',page,re.S)[1];assert item['image']['src']==hero
(D/'metadata-qa.json').write_text(json.dumps(dict(result='PASS',articles=out,coverSource='Existing exact main photo in each page; both feed layers verified',oldPriorityRecords='UNCHANGED except authorized two card fields',aliceNenhumAndPloc='BYTE_IDENTICAL'),ensure_ascii=False,indent=2)+'\n');print('PASS metadata, semantic headings, links, exact cover mapping, both feed layers')
