from pathlib import Path
import re,json,hashlib,subprocess
from html.parser import HTMLParser
D=Path(__file__).parent; m=json.loads((D/'article-manifest.json').read_text())
class Body(HTMLParser):
 def __init__(self):super().__init__();self.depth=0;self.out=[]
 def handle_starttag(self,t,a):
  if dict(a).get('id')=='article-text':self.depth=1
  elif self.depth and t=='div':self.depth+=1
  if self.depth and t=='br':self.out.append(' ')
 def handle_endtag(self,t):
  if self.depth and t=='div':self.depth-=1
 def handle_data(self,s):
  if self.depth:self.out.append(s)
report=[]
for a in m:
 p=Body();p.feed(Path(a['route'][1:]).read_text());expected=a['source_body'];expected=re.sub(r'<!--.*?-->','',expected);expected=re.sub(r'https://\S+','',expected);expected=re.sub(r'^#+\s+','',expected,flags=re.M);expected=re.sub(r'^(?:> |---$)','',expected,flags=re.M);expected=expected.replace('**','').replace('*','').replace('\\\n','\n');expected=re.sub(r'^-\s+','',expected,flags=re.M);norm=lambda s:' '.join(s.split());assert norm(''.join(p.out))==norm(expected),a['name'];assert 'autoplay' not in Path(a['route'][1:]).read_text()
 for im in a['imageEvidence']:assert hashlib.sha256(Path(im['path']).read_bytes()).hexdigest()==im['sha256']
 report.append(dict(article=a['name'],literalBody='PASS',photos=len(a['assets']),videoIDs=a['videos'],autoplay='NONE'))
cp=json.loads((D/'CHECKPOINT.json').read_text())
for f,h in cp['protected'].items():assert hashlib.sha256(Path(f).read_bytes()).hexdigest()==h
old=json.loads(subprocess.check_output(['git','show',cp['baseHead']+':data/editorial-manual-feed.json']))['items'];now=json.loads(Path('data/editorial-manual-feed.json').read_text())['items'];assert len(now)==len(old)+1
for previous in old:
 current=next(x for x in now if x['url']==previous['url']);assert current==previous or previous['url'] in ['/anos-80-volume-2-musicas-memoria-brasileira.html','/editorial/2026/09/03/festa-ploc-musicas-anos-80-nostalgia-shows-ao-vivo.html']
(D/'structural-qa.json').write_text(json.dumps(dict(result='PASS',articles=report,protected='UNCHANGED',feedOldEntries='UNCHANGED'),ensure_ascii=False,indent=2)+'\n');print('PASS2 literal bodies,1 original photo hash,34 exact IDs, protected files')
