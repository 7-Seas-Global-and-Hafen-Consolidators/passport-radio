"""Apply verified captions and source links only to selected photographs."""
import json,pathlib
from bs4 import BeautifulSoup
D=pathlib.Path('docs/editorial-home-seven-20261102');pool=json.load(open(D/'photo-candidates.json'))
for a in json.load(open(D/'inventory-before.json')):
 p=pathlib.Path(a['path']);s=BeautifulSoup(p.read_text(),'html.parser')
 for im in s.select('main img'):
  record=next((v for v in pool.values()if v['src']==im.get('src')),None)
  if not record:continue
  fig=im.find_parent('figure')
  if fig is None:continue
  cap=fig.find('figcaption')
  if cap and not fig.has_attr('data-pr-added')and not cap.has_attr('data-pr-added'):continue
  if cap is None:cap=s.new_tag('figcaption');fig.append(cap)
  cap['data-pr-added']='true';cap.clear();cap.append(record.get('caption',record['alt'])+' · '+record['credit']+' · ')
  link=s.new_tag('a',href=record['source'],attrs={'target':'_blank','rel':'noopener noreferrer'});link.string='Fonte';cap.append(link)
 p.write_text(str(s))
