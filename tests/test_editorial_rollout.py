"""Fase 2: byte-preserved articles, explicit photo localization and future factory."""
from pathlib import Path
import json,re,subprocess,unittest,sys,importlib.util
ROOT=Path(__file__).resolve().parents[1]
BASE='4139873dc89454c17116534691651f125fdf6e90'
DOC=ROOT/'docs/fase2-editorial-rollout-20261030'
HOOK='<link rel="stylesheet" href="/css/passport-editorial-layout.css?v=20261030"><script defer src="/js/passport-editorial-layout.js?v=20261030"></script>'
def original(path):return subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT).decode()
class EditorialRollout(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.articles=json.loads((DOC/'articles.json').read_text());cls.changes=json.loads((DOC/'image-changes.json').read_text())
 def test_complete_public_article_inventory(self):
  paths=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT).decode().splitlines()
  expected=set(p for p in paths if p.startswith('editorial/')and p.endswith('.html'))
  for p in paths:
   if p.endswith('.html')and('/'not in p or p.startswith('historias/')):
    if re.search(r'<body[^>]*class=["\'][^"\']*\bpp-article\b',original(p)):expected.add(p)
  actual=[x['path']for x in self.articles];self.assertEqual(len(actual),197);self.assertEqual(len(actual),len(set(actual)));self.assertEqual(set(actual),expected)
 def test_every_original_article_byte_preserved_except_registered_photos_and_hooks(self):
  for row in self.articles:
   with self.subTest(path=row['path']):
    text=(ROOT/row['path']).read_text();self.assertEqual(text.count(HOOK),1)
    self.assertEqual(text.count('data-passport-editorial-presentation>'),1)
    text=text.replace(HOOK,'');text=text.replace(' passport-editorial-rollout','',1);text=re.sub(r'<script type="application/json" data-passport-editorial-presentation>.*?</script>','',text,flags=re.S)
    # Map image changes by occurrence; no anchor, embed or narrative replacements are permitted.
    changes=[c for c in self.changes if c['path']==row['path']]
    for c in reversed(changes):
     import html
     def restore(m):return m.group(1)+m.group(2)+html.escape(c['before'],quote=False)+m.group(2) if html.unescape(m.group(3))==c['after'] else m.group(0)
     # Original HTML may encode &, so use the original attribute's literal spelling.
     old=original(row['path']);match=next((m for m in re.finditer(r'(<img\b[^>]*?\bsrc=)(["\'])(.*?)\2',old,re.I|re.S)if html.unescape(m.group(3))==c['before']),None)
     if match:
      text=re.sub(r'(<img\b[^>]*?\bsrc=)(["\'])(.*?)\2',lambda m:m.group(1)+m.group(2)+match.group(3)+m.group(2)if html.unescape(m.group(3))==c['after']else m.group(0),text,flags=re.I|re.S)
    self.assertEqual(text,original(row['path']))
 def test_all_configured_photos_are_local_present_and_nonempty(self):
  for row in self.articles:
   text=(ROOT/row['path']).read_text();config=json.loads(re.search(r'data-passport-editorial-presentation>(.*?)</script>',text,re.S)[1]);self.assertTrue(config['hero']);self.assertTrue(config['images'])
   for image in config['images']:
    self.assertTrue(image['src'].startswith('/'));file=ROOT/image['src'].lstrip('/');self.assertTrue(file.is_file(),file);self.assertGreater(file.stat().st_size,100);self.assertGreater(image['width'],0);self.assertGreater(image['height'],0)
 def test_protected_existing_files_unchanged(self):
  changed=subprocess.check_output(['git','diff','--name-only','--diff-filter=MD',BASE],cwd=ROOT).decode().splitlines()
  allowed={a['path']for a in self.articles}|{'tools/editorial_engine.py','tests/test_lambrini_editorial_pilot.py','js/passport-persist-nav.js'}
  self.assertEqual(set(changed)-allowed,set())
  old_nav=original('js/passport-persist-nav.js');expected=old_nav.replace("['passport-blog-search','passport-blog-cover','passport-news','passport-archive']","['passport-blog-search','passport-blog-cover','passport-news','passport-archive','passport-editorial-layout']",1);self.assertEqual((ROOT/'js/passport-persist-nav.js').read_text(),expected)
  js=(ROOT/'js/passport-editorial-layout.js').read_text()
  for token in ['new Audio(','.play(','.pause(','.volume =','localStorage','sessionStorage','passport-audio','stream','mutex','interlock']:
   self.assertNotIn(token,js)
 def test_future_renderer_shares_real_local_photographs_and_complete_content(self):
  sys.path.insert(0,str(ROOT/'tools'));import editorial_engine as engine
  article={'title':'Um título preservado','deck':'Um resumo preservado','meta_description':'Descrição','published_at':'2026-10-30','category':'rock','format':'STORY','kicker':'ROCK','entities':['Amy Winehouse'],'sections':[{'heading':'Um capítulo','paragraphs':['Texto integral.']}],'closing':'Encerramento.'}
  rendered=engine.render_article(article,'/editorial/future-test.html',[])
  self.assertIn(HOOK,rendered);self.assertIn('Um título preservado',rendered);self.assertIn('Texto integral.',rendered)
  config=json.loads(re.search(r'data-passport-editorial-presentation>(.*?)</script>',rendered,re.S)[1]);self.assertTrue(config['hero']);self.assertTrue(config['hero']['src'].startswith('/'));self.assertIn('Amy Winehouse',[i.get('subject')for i in config['images']])
if __name__=='__main__':unittest.main(verbosity=2)
