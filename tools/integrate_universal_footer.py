"""Footer bootstrap only: keep every byte outside the inserted footer loader."""
from pathlib import Path
import csv, hashlib, json, subprocess, re, urllib.request
ROOT = Path(__file__).resolve().parents[1]
LOADER = '<script src="/js/passport-universal-footer.js?v=20261010" data-passport-universal-footer defer></script>'
EXCLUDED = {'docs', 'tests', 'privado', 'assets', 'node_modules'}

def public_html(path):
    parts = path.parts
    return path.suffix == '.html' and not any(p.startswith(('_', '.')) for p in parts) and parts[0] not in EXCLUDED

def install_footer_fonts():
    # Exact official font families already used by the site, scoped with aliases
    # so loading a footer never changes typography elsewhere in the document.
    url='https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,700;1,6..96,700&family=Instrument+Sans:wght@400;500;600;700&family=Source+Serif+4:wght@400&display=swap'
    request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    css=urllib.request.urlopen(request,timeout=60).read().decode()
    folder=ROOT/'fonts/passport-footer';folder.mkdir(parents=True,exist_ok=True)
    for remote in sorted(set(re.findall(r'url\((https://fonts\.gstatic\.com/[^)]+)\)',css))):
        data=urllib.request.urlopen(remote,timeout=60).read()
        filename=hashlib.sha256(data).hexdigest()[:16]+'.'+remote.split('.')[-1]
        (folder/filename).write_bytes(data)
        css=css.replace(remote,'/fonts/passport-footer/'+filename)
    for name in ['Bodoni Moda','Instrument Sans','Source Serif 4']:
        css=css.replace("font-family: '"+name+"'", "font-family: 'Passport Footer "+name+"'")
    (ROOT/'css/passport-footer-fonts.css').write_text(css)

def integrate():
    install_footer_fonts()
    paths = subprocess.check_output(['git','ls-files','-z','*.html'],cwd=ROOT).decode().split('\0')
    rows=[]
    for name in paths:
        if not name or not public_html(Path(name)): continue
        p=ROOT/name; before=p.read_bytes()
        # Only complete public documents; embedded fragments do not gain a shell.
        if b'</body>' not in before.lower(): continue
        if b'data-passport-universal-footer defer' in before: continue
        index=before.lower().rfind(b'</body>')
        insertion=(LOADER+'\n').encode()
        after=before[:index]+insertion+before[index:]
        assert after.replace(insertion,b'',1)==before
        p.write_bytes(after)
        rows.append({'arquivo':name,'sha256_antes':hashlib.sha256(before).hexdigest(),'sha256_depois':hashlib.sha256(after).hexdigest(),'alteracao':'Somente inclusão do loader do rodapé antes de </body>'})
    out=ROOT/'docs/universal-footer-20261010';out.mkdir(parents=True,exist_ok=True)
    with (out/'FILES.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=['arquivo','sha256_antes','sha256_depois','alteracao']);w.writeheader();w.writerows(rows)
    (out/'COVERAGE.json').write_text(json.dumps({'html_integrados':len(rows),'component':'/js/passport-universal-footer.js','css':'/css/passport-universal-footer.css','conteudo_externo_preservado_byte_a_byte':True,'excluidos':'documentação/fixtures/cofre/painel privado/fragments sem body; nenhuma rota nova','nota':'Documentos de player/widget sem footer recebem apenas bootstrap inerte; o componente não cria footer neles.'},ensure_ascii=False,indent=2)+'\n')
    print(f'Footer bootstrap integrated: {len(rows)} HTML; exact inverse verified for all.')

if __name__=='__main__': integrate()
