import json,pathlib,subprocess,copy
from bs4 import BeautifulSoup
ROOT=pathlib.Path('.');D=ROOT/'docs/editorial-home-seven-20261102';D.mkdir(parents=True,exist_ok=True)
base='e4152f766784acc0e8a02ee27821d0e6ff2dd428';inventory=json.load(open(D/'inventory-before.json'))
reference=BeautifulSoup(subprocess.check_output(['git','show',base+':editorial/2026/10/07/dave-grohl-acdc-highway-to-hell.html']).decode(),'html.parser')
for a in inventory:
 raw=subprocess.check_output(['git','show',base+':'+a['path']]).decode();s=BeautifulSoup(raw,'html.parser');m=s.main
 for n in m.select('template[data-passport-editorial-presentation]'):n.decompose()
 m['class']=['participe-content','pr-home-seven'];m['data-passport-automatic-article']='';m['data-editorial-home-seven']=str(a['number']);m.attrs.setdefault('id','home-seven-'+str(a['number']))
 # Preserve the interview turns as complete speaker-labelled semantic blocks.
 for n in m.select('.dialogue-turn'):
  n.name='blockquote';n['class']=n.get('class',[])+['pr-interview-turn']
 for n in m.select('.big-number'):
  n.name='blockquote';n['class']=['pr-metric']
 # Keep instrument/role labels with their own member rather than the previous card.
 for n in m.select('.member'):
  small=n.find('small',recursive=False);h=n.find('h3',recursive=False)
  if small and h:small.extract();small['class']=['pr-member-role'];h.insert(0,' ');h.insert(0,small)
 for dl in m.select('dl'):
  table=s.new_tag('table',attrs={'class':'pr-credits'});row=None
  for n in dl.select('dt,dd'):
   if n.name=='dt':row=s.new_tag('tr');table.append(row)
   if row is None:row=s.new_tag('tr');table.append(row)
   cell=s.new_tag('th'if n.name=='dt'else'td');cell.extend(list(n.contents));row.append(cell)
  if dl.get('id'):table['id']=dl['id']
  dl.replace_with(table)
 if a['number']==1:
  art=m.select_one('article');hero=s.new_tag('section',attrs={'class':'hero'});copybox=s.new_tag('div',attrs={'class':'hero-copy'});hero.append(copybox)
  for n in list(art.children):
   if getattr(n,'name',None) in ['h1','span']or getattr(n,'get',lambda k:None)('class')==['az-entities']:copybox.append(n.extract())
   elif getattr(n,'name',None)=='p':break
  old=m.select_one('img.hero');old['class']=['pr-archive-cover']
  # Original magazine document and the two explicitly narrated illustrations stay in the prose.
  art.insert(0,hero)
 else:
  hero=m.select_one('section.hero,section.story-hero');hero['class']=['hero']
  box=hero.select_one('.hero-copy,.story-hero__copy,.shell')
  if box is None:
   box=s.new_tag('div',attrs={'class':'hero-copy'});box.extend(list(hero.contents));hero.append(box)
  box['class']=['hero-copy']
 for n in m.select('p.cap'):n['class']=['caption']
 # Explicit image corrections, without deleting any narrative or changing video identities.
 if a['number']==1:
  im=s.new_tag('img',src='/images/editorial/home-seven-20261102/mission-1988.webp',alt='The Mission em fotografia de 1988');hero.append(im)
 if a['number']==3:
  im=hero.select_one('img');im['src']='/images/frank-beard-zz-top-03.avif';im['alt']='Billy Gibbons, Dusty Hill e Frank Beard, ZZ Top'
  body_images=[im for im in m.select('img')if not im.find_parent(class_='hero')]
  for im in body_images:
   if im['src']=='/images/frank-beard-zz-top-03.avif':im['src']='/images/frank-beard-zz-top-01.jpg'
   elif im['src']=='/images/frank-beard-zz-top-01.jpg':
    im['src']='/images/editorial/home-seven-20261102/dusty.webp';im['alt']='Dusty Hill no palco';cap=im.parent.select_one('.caption')
    if cap:cap.string='Dusty Hill no palco.'
 if a['number']==6:
  hero.select_one('img')['src']='/images/editorial/home-seven-20261102/mortif-trio.webp'
  replacements={'/images/white-metal/Mortification.jpg':('mortif-1991','Mortification · formação dos primeiros discos'),'/images/white-metal/deliverance-16c.jpg':('deliverance-ochoa','George Ochoa, guitarrista do Deliverance'),'/images/white-metal/Extol.jpg':('extol-2012','Extol · formação de 2012')}
  for im in m.select('img'):
   if im.get('src')in replacements:
    key,alt=replacements[im['src']];im['src']='/images/editorial/home-seven-20261102/'+key+'.webp';im['alt']=alt
 # Correct the page's own image metadata when its opening picture changes.
 main_image=hero.select_one('img')
 if main_image:
  for meta in s.select('meta[property="og:image"],meta[name="twitter:image"]'):meta['content']='https://passportradio.online'+main_image['src']
 for n in hero.select('.deck,.story-deck,.lead'):n['class']=['dek']
 for n in hero.select('.kicker,.story-kicker'):n['class']=['pr-category']
 for n in hero.select('.story-meta,.life-dates'):n['class']=['byline']
 # A native 16:9 iframe keeps every existing URL. Remove only obsolete fixed black wrappers via compositor flattening.
 for f in m.select('iframe'):
  if not f.get('loading'):f['loading']='lazy'
  if not f.get('referrerpolicy'):f['referrerpolicy']='strict-origin-when-cross-origin'
 # Remove old page-wide visual rules, retaining metadata and structured editorial data.
 for n in s.head.select('style,link[rel=stylesheet],script[src]'):n.decompose()
 for href in ['/css/passport-participe-paper.css?v=20260930','/css/passport-editorial-layout.css?v=20261030','/css/passport-editorial-recovery.css','/css/passport-automatic-editorial.css','/css/passport-editorial-home-seven.css?v=20261102']:
  s.head.append(s.new_tag('link',rel='stylesheet',href=href))
 for src in ['/js/passport-editorial-layout.js?v=20261030','/js/passport-automatic-editorial.js']:
  s.head.append(s.new_tag('script',src=src,defer=''))
 template=s.new_tag('template',attrs={'data-passport-editorial-presentation':''});template.string='{}';m.insert(0,template)
 # Reuse the official fallback chrome; the existing native bootstrap supplies the same App on direct entry.
 body=s.body;body.clear();body['class']=['pp-article','passport-participe-paper','passport-editorial-rollout']
 skip=s.new_tag('a',attrs={'class':'participe-paper-skip','href':'#'+m['id']});skip.string='Ir para o conteúdo';body.append(skip)
 for selector in ['header.participe-paper-mast','.participe-paper-rule-double','nav.participe-paper-nav']:body.append(copy.deepcopy(reference.select_one(selector)))
 body.append(m);body.append(copy.deepcopy(reference.select_one('footer')))
 for src in ['/js/passport-legal-footer.js?v=20260903','/js/passport-universal-footer.js?v=20261010']:
  script=s.new_tag('script',src=src,defer='')
  if 'universal-footer'in src:script['data-passport-universal-footer']=''
  body.append(script)
 ROOT.joinpath(a['path']).write_text(str(s))
 print(a['number'],a['path'])
