"""Lambrini editorial pilot: original content/media and isolated presentation."""
from html.parser import HTMLParser
from pathlib import Path
import re, subprocess, unittest
ROOT=Path(__file__).resolve().parents[1]
BASE='674a1fe6092eaf34ac01db09c7d465d1f00821a3'
ARTICLE='editorial/2026/10/22/lambrini-girls-no-refunds-the-basement-spilt.html'
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Document(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True)
        self.stack=[];self.narrative=[];self.images=[];self.frames=[];self.links=[];self.scripts=[];self.footer=[];self.headings=[];self.metadata=[]
        self.feed(text)
    def inside(self,tag=None,ident=None):
        return any((not tag or t==tag) and (not ident or a.get('id')==ident) for t,a in self.stack)
    def handle_starttag(self,tag,attrs):
        a={k:v or '' for k,v in attrs};inside_main=self.inside('main')
        if tag=='a' and a.get('class')!='editorial-return':self.links.append(a.get('href'))
        if tag=='img' and inside_main:self.images.append(a)
        if tag=='iframe' and inside_main:self.frames.append(a)
        if tag=='script' and 'src' in a:self.scripts.append(a['src'])
        if tag=='meta':self.metadata.append(a)
        if tag=='footer' or self.inside('footer'):self.footer.append(('start',tag,sorted(a.items())))
        if tag not in VOID:self.stack.append((tag,a))
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag not in VOID:self.handle_endtag(tag)
    def handle_endtag(self,tag):
        if self.inside('footer'):self.footer.append(('end',tag))
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag:self.stack=self.stack[:i];break
    def handle_data(self,data):
        if self.inside(ident='article-text'):self.narrative.append(data)
        if self.inside('footer') and data.strip():self.footer.append(('text',data.strip()))
        if self.stack and self.stack[-1][0] in {'h1','h2','h3'} and self.inside('main'):
            self.headings.append((self.stack[-1][0],data))
def old(path):return subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT).decode()
def norm(chunks):return re.sub(r'\s+',' ',' '.join(chunks)).strip()
class LambriniPilot(unittest.TestCase):
    def setUp(self):
        self.before=Document(old(ARTICLE));self.after=Document((ROOT/ARTICLE).read_text())
    def test_integral_narrative_and_heading_order(self):
        self.assertEqual(norm(self.before.narrative),norm(self.after.narrative))
        self.assertEqual(self.before.headings,self.after.headings)
    def test_all_photos_video_identifiers_links_and_metadata_preserved(self):
        self.assertEqual(len(self.after.images),len(self.before.images))
        for a,b in zip(self.before.images,self.after.images):
            for key,value in a.items():self.assertEqual(b[key],value)
        self.assertEqual(self.after.frames,self.before.frames)
        self.assertEqual(len(self.after.frames),1)
        self.assertIn('fpzBSVpE9Lk',self.after.frames[0]['src'])
        self.assertNotIn('autoplay',self.after.frames[0].get('allow',''))
        links=self.after.links.copy()
        self.assertEqual(links,self.before.links)
        self.assertEqual(self.after.metadata,self.before.metadata)
    def test_shared_footer_scripts_and_masthead_resources_unchanged(self):
        self.assertEqual(self.after.footer,self.before.footer)
        self.assertEqual([x for x in self.after.scripts if not x.startswith('/js/passport-editorial-layout.js')],self.before.scripts)
        paths=['js/',':(exclude)js/passport-persist-nav.js','data/','assets/','fonts/','images/','index.html','noticias.html','css/passport-masthead.css','css/passport-universal-footer.css','css/passport-paula-toller.css']
        subprocess.check_output(['git','diff','--exit-code','--diff-filter=MD',BASE,'--',*paths],cwd=ROOT)
    def test_new_styles_apply_only_to_the_pilot(self):
        changes=subprocess.check_output(['git','diff','--name-only',BASE,'--','*.html'],cwd=ROOT).decode().splitlines()
        authorized={r['path'] for r in __import__('json').loads((ROOT/'docs/fase2-editorial-rollout-20261030/articles.json').read_text())};self.assertTrue(set(changes)<=authorized);self.assertIn(ARTICLE,changes)
        css=(ROOT/'css/passport-editorial-pilot.css').read_text()
        self.assertIn('.passport-editorial-pilot #article-text',css)
        self.assertNotIn('audio',css)
        for font in re.findall(r"url\('([^']+)'\)",css):self.assertTrue((ROOT/font.lstrip('/')).is_file())
if __name__=='__main__':unittest.main(verbosity=2)
