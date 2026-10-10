"""Presentation-only migration of the 110 existing A–Z documents."""
import re
from pathlib import Path

LABELS = {
 'albunsquemarcaram':'Álbuns que marcaram', 'bangersopenair2026':'Bangers Open Air 2026',
 'bangersopenair2027':'Bangers Open Air 2027', 'cds':'CDs', 'clubedos27':'Clube dos 27',
 'colecoes':'Coleções', 'e-studos':'Estudos', 'historiasdemusicas':'Histórias de músicas',
 'historiasdemusicassaxon':'Histórias de músicas — Saxon', 'ibagenscast':'Ibagens Cast',
 'lancamentos':'Lançamentos', 'melhores2025':'Melhores 2025',
 'melhoresporestilorym':'Melhores por estilo — RYM', 'morteozzyosbourne':'Morte de Ozzy Osbourne',
 'newmetal':'New metal', 'opinioes':'Opiniões', 'pedepagina':'Pé de página', 'policia':'Polícia',
 'rock-and-rollhalloffame':'Rock and Roll Hall of Fame', 'rock-inrio1985':'Rock in Rio 1985',
 'rock-inrio2026':'Rock in Rio 2026', 'the-town2025':'The Town 2025',
 'traducoes':'Traduções', 'woodstock1969':'Woodstock 1969',
}
def href(page):
 return '/blog/arquivo/letras.html' if page == 1 else f'/blog/arquivo/letras/{page}.html'
def pager(page, total=110):
 start=max(1,min(page-2,total-4));numbers=list(range(start,min(total,start+4)+1))
 def a(n,text=None):
  return f'<a href="{href(n)}"'+(' aria-current="page"' if n==page else '')+f'>{text or n}</a>'
 out=[f'<span class="passport-az-page-status">Página {page} de {total}</span>']
 out.append(a(page-1,'Anterior') if page>1 else '<span aria-disabled="true">Anterior</span>')
 if start>1:
  out.append(a(1))
  if start>2:out.append('<span aria-hidden="true">…</span>')
 out.extend(a(n) for n in numbers)
 if numbers[-1]<total:
  if numbers[-1]<total-1:out.append('<span aria-hidden="true">…</span>')
  out.append(a(total))
 out.append(a(page+1,'Próxima') if page<total else '<span aria-disabled="true">Próxima</span>')
 return '<nav class="passport-az-static-pages" aria-label="Páginas do diretório">'+''.join(out)+'</nav>'
def migrate(root=Path('.')):
 files=[root/'blog/arquivo/letras.html']+[root/f'blog/arquivo/letras/{n}.html' for n in range(2,111)]
 for page,path in enumerate(files,1):
  original=path.read_text();s,n=re.subn(r'<nav class="passport-az-static-pages"[^>]*>.*?</nav>',pager(page),original,flags=re.S);assert n==1,path
  def labels(match):
   block=match[0]
   for slug,label in LABELS.items():
    block=re.sub(r'(<a href="/blog/e/'+re.escape(slug)+r'\.html">)[^<]*( <small>)',lambda m:m[1]+label+m[2],block)
   return block
  s=re.sub(r'<section class="passport-az-themes".*?</section>',labels,s,flags=re.S)
  s=s.replace('/css/passport-artist-navigation.css?v=20261010-az24','/css/passport-artist-navigation.css?v=20261010-compact').replace('/js/passport-artist-navigation.js?v=20261010-az24','/js/passport-artist-navigation.js?v=20261010-compact')
  if s!=original:path.write_text(s)
 return files
if __name__=='__main__':migrate()
