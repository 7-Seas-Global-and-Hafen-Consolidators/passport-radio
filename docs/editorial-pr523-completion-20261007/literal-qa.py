from html.parser import HTMLParser
from pathlib import Path
import json,re
D=Path(__file__).parent;m=json.loads((D/'article-manifest.json').read_text())
class Text(HTMLParser):
 def __init__(self,body=False):super().__init__();self.parts=[];self.active=not body;self.depth=0;self.body=body
 def handle_starttag(self,t,a):
  if dict(a).get('id')=='article-text':self.active=True;self.depth=1
  elif self.active and self.body and t=='div':self.depth+=1
 def handle_endtag(self,t):
  if self.body and self.active and t=='div':
   self.depth-=1
   if self.depth==0:self.active=False
 def handle_data(self,s):
  if self.active:self.parts.append(s)
for a in m:
 expected=Text();expected.feed((D/(str(a['n'])+'-expected.html')).read_text());actual=Text(True);actual.feed(Path(a['route'][1:]).read_text());norm=lambda p:' '.join(''.join(p.parts).split());assert norm(actual)==norm(expected),a['name'];(D/(str(a['n'])+'-expected.html')).unlink()
(D/'literal-qa.json').write_text(json.dumps({'result':'PASS','articles':[a['name'] for a in m],'method':'Rendered body text compared to Markdown parsed directly from the persistent source; only authorized Soundgarden correction and embed operational marker removed.'},ensure_ascii=False,indent=2)+'\n');print('PASS10 literal article bodies')
