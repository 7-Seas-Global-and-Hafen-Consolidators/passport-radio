"""Targeted regression checks for the Paula Toller layout; stdlib only."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib, json, re, unittest
ROOT = Path(__file__).resolve().parents[1]
ARTICLE = ROOT / 'editorial/2026/10/28/paula-toller-cinco-discos-influencias-musicais.html'
class Story(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth=0; self.text=[]; self.images=[]; self.frames=[]; self.h1=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='div' and a.get('id')=='article-text':self.depth=1
        elif self.depth and tag=='div':self.depth+=1
        if tag=='img':self.images.append(a)
        if tag=='iframe':self.frames.append(a)
        if tag=='h1':self.h1+=1
    def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs)
    def handle_endtag(self,tag):
        if self.depth and tag=='div':self.depth-=1
    def handle_data(self,data):
        if self.depth:self.text.append(data)
class PaulaLayout(unittest.TestCase):
    def setUp(self):
        self.html=ARTICLE.read_text();self.story=Story();self.story.feed(self.html)
    def test_complete_approved_narrative(self):
        text=re.sub(r'\s+',' ',' '.join(self.story.text)).strip()
        self.assertEqual(hashlib.sha256(text.encode()).hexdigest(),'642b94976cee64d4f887ea3aacecbe883ca1c0ab76e94ad6c280b2f15d3a8e0f')
        self.assertEqual(self.story.h1,1)
        self.assertEqual(len(re.findall(r'id="disco-[1-6]"',self.html)),6)
    def test_six_embeds_preserve_approved_sources_without_autoplay(self):
        self.assertEqual([x['src'].rsplit('/',1)[-1] for x in self.story.frames],['cYF1zjpMnuI','M5AUxr_DvPM','hWbr7kp3JEA','ERPOfpeGHSA','sr5xcISnkDU','nnHHZinlG8A'])
        for frame in self.story.frames:
            self.assertTrue(frame['src'].startswith('https://www.youtube-nocookie.com/embed/'))
            self.assertNotIn('autoplay',frame.get('allow',''));self.assertNotIn('autoplay=',frame['src'])
    def test_local_images_and_isolated_feed_change(self):
        for img in self.story.images:
            self.assertTrue((ROOT/img['src'].lstrip('/')).is_file())
        self.assertEqual(len(self.story.images),7)
        feed=json.loads((ROOT/'data/editorial-manual-feed.json').read_text())
        rest=json.dumps(feed['items'][1:],ensure_ascii=False,sort_keys=True)
        self.assertEqual(hashlib.sha256(rest.encode()).hexdigest(),'a492caf2d1be89ac2beb8de2d22065960bfb7f9e29ef5b9edbe5da30f143cf17')
        self.assertEqual(feed['items'][0]['image']['fit'],'cover')
    def test_official_footer_without_local_duplicate(self):
        self.assertEqual(self.html.count('<footer'),1)
        self.assertIn('data-passport-universal-footer=""',self.html)
        self.assertIn('/js/passport-universal-footer.js?v=20261010',self.html)
        self.assertIn('/css/passport-universal-footer.css?v=20261023c',self.html)
        self.assertNotIn('passport-legal-footer.js',self.html)
        self.assertNotIn('passport-support-float',self.html)
if __name__=='__main__':unittest.main(verbosity=2)
