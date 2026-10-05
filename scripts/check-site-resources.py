import json, pathlib, re, posixpath
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote

ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE='https://astralis-nova-website.pages.dev/'
files={p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file() and 'node_modules' not in p.parts and '.git' not in p.parts}
def route(path):
    p=unquote(path).lstrip('/')
    for candidate in [p,(p+'index.html' if p.endswith('/') else p+'/index.html') if p else 'index.html',p+'.html']:
        if candidate in files:return candidate
    if p.startswith('api/'):
        for candidate in ['functions/'+p+'.js','functions/'+p+'/index.js']:
            if candidate in files:return candidate
        if p.startswith('api/guestbook/') and 'functions/api/guestbook/[id].js' in files:return 'functions/api/guestbook/[id].js'
    return None
class Page(HTMLParser):
    def __init__(self):super().__init__();self.refs=[];self.ids=set();self.duplicate_ids=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):
            if a['id'] in self.ids:self.duplicate_ids.append(a['id'])
            self.ids.add(a['id'])
        for key in ['href','src','poster','action']:
            if a.get(key):self.refs.append((tag,key,a[key]))
        if a.get('srcset'):
            for s in a['srcset'].split(','):self.refs.append((tag,'srcset',s.strip().split(' ')[0]))
pages={}
for f in sorted(files):
    if f.endswith('.html'):
        page=Page();page.feed((ROOT/f).read_text(errors='replace'));pages[f]=page
issues=[];external={};internal={};refs=0
def check(source,tag,key,value,fragment=True):
    global refs
    if not value or value.startswith(('data:','mailto:','tel:','javascript:','blob:')) or '${' in value or '{{' in value:return
    u=urlsplit(urljoin(BASE+source,value));refs+=1
    if u.netloc!=urlsplit(BASE).netloc:
        external.setdefault(u.geturl(),[]).append(source);return
    path=route(u.path)
    internal.setdefault(u.path,[]).append(source)
    if not path:
        issues.append({'source':source,'type':'missing-file','tag':tag,'attribute':key,'url':value,'resolved':u.path})
    elif fragment and u.fragment and path in pages and u.fragment not in pages[path].ids:
        issues.append({'source':source,'type':'missing-anchor','url':value,'target':path,'anchor':u.fragment})
for f,page in pages.items():
    for tag,key,value in page.refs:check(f,tag,key,value)
    for id in page.duplicate_ids:issues.append({'source':f,'type':'duplicate-id','id':id})
for f in sorted(files):
    if not f.endswith(('.js','.css','.html','.svg','.webmanifest','.json')) or f.startswith(('tests/','docs/','.github/','functions/','scripts/')):continue
    s=(ROOT/f).read_text(errors='replace')
    for match in re.finditer(r'url\(\s*[\"\']?([^\)\"\']+)\s*[\"\']?\)',s):
        value=match.group(1).strip()
        if value.startswith('#'):continue
        check(f,'css','url',value,False)
    if f.endswith('.js'):
        for match in re.finditer(r'''["']((?:/|\./|\.\./)[^"'\s<>]*\.(?:js|css|png|jpe?g|webp|svg|mp3|mp4|webm|json|html|mid|midi)(?:\?[^"'\s<>]*)?)["']''',s):
            check(f,'js','asset',match.group(1),False)
result={'pages':len(pages),'files':len(files),'references':refs,'issues':issues,'external':external,'internal':internal}
errors=[i for i in issues if i['type'] in ('missing-file','duplicate-id')]
print(f"Checked {len(pages)} HTML pages and {refs} resource references")
for issue in errors: print(json.dumps(issue))
raise SystemExit(bool(errors))
