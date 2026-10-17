import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import { onRequestGet, onRequestPost } from '../functions/api/memories-approve.js';
import { onRequest as brain } from '../functions/api/nova-brain.js';
import { authorizeMemoryAI, readLimitedJson } from '../functions/lib/memory-security.js';
import { onRequestPost as requestAccess } from '../functions/api/memories-request.js';

function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(`CREATE TABLE memory_access_requests(id TEXT PRIMARY KEY,name TEXT,email TEXT,status TEXT,approval_token TEXT,created_at TEXT,updated_at TEXT);
    CREATE TABLE memory_people(id TEXT PRIMARY KEY,display_name TEXT,email TEXT UNIQUE,status TEXT,access_level TEXT,created_at TEXT,updated_at TEXT);`);
  const DB = { prepare(query) { let args=[]; return { bind(...v){args=v;return this}, async first(){return sql.prepare(query).get(...args)}, async run(){const result=sql.prepare(query).run(...args);return {meta:{changes:Number(result.changes)}}} }; },
    async batch(statements){sql.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sql.exec('COMMIT');return result}catch(e){sql.exec('ROLLBACK');throw e}} };
  return {sql, DB};
}
const base='https://example.com';
function insert(sql,age=0) { sql.prepare('INSERT INTO memory_access_requests VALUES(?,?,?,?,?,?,?)').run('r1','<img src=x onerror=alert(1)>','family@example.com','pending','secret',new Date(Date.now()-age).toISOString(),''); }
async function review(env,decision='approve') {
  const result=await onRequestGet({request:new Request(`${base}/api/memories-approve?id=r1&token=secret&decision=${decision}`),env});
  const html=await result.text();
  const csrf=html.match(/name="csrf" value="([^"]+)"/)?.[1];
  return {result,html,csrf};
}
function post(env,csrf,decision='approve',extra={}) {
  return onRequestPost({env,request:new Request(`${base}/api/memories-approve`,{method:'POST',headers:{origin:base,cookie:`nova_memory_review=${csrf}`,...extra},body:new URLSearchParams({id:'r1',token:'secret',decision,csrf,confirmed:'yes'})})});
}
test('GET only previews, escapes submitted names, and forbids framing',async()=>{
  const {sql,DB}=database();insert(sql);const {result,html}=await review({DB});
  assert.equal(result.status,200);assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img'));
  assert.match(result.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.equal(sql.prepare('SELECT status FROM memory_access_requests').get().status,'pending');assert.equal(sql.prepare('SELECT count(*) AS n FROM memory_people').get().n,0);
});
test('confirmed POST approves once, consumes token; repeat cannot change decision',async()=>{
  const {sql,DB}=database();insert(sql);const {csrf}=await review({DB});
  assert.equal((await post({DB},csrf)).status,200);assert.equal(sql.prepare('SELECT count(*) AS n FROM memory_people').get().n,1);
  assert.equal(sql.prepare('SELECT approval_token FROM memory_access_requests').get().approval_token,'');
  assert.equal((await post({DB},csrf,'deny')).status,400);
});
test('deny, expired token, CSRF and foreign origin protections',async()=>{
  const {sql,DB}=database();insert(sql);let {csrf}=await review({DB});
  assert.equal((await post({DB},csrf,'approve',{origin:'https://evil.example'})).status,403);
  assert.equal((await post({DB},csrf,'approve',{cookie:'nova_memory_review=wrong'})).status,403);
  assert.equal((await post({DB},csrf,'deny')).status,200);assert.equal(sql.prepare('SELECT count(*) AS n FROM memory_people').get().n,0);
  sql.exec('DELETE FROM memory_access_requests');insert(sql,49*3600000);assert.equal((await review({DB})).result.status,400);
});
const aiRequest=(token='test-secret',consent=true)=>new Request(`${base}/api/nova-brain`,{method:'POST',headers:{origin:base,authorization:`Bearer ${token}`,...(consent?{'x-nova-consent':'preview-confirmed'}:{})},body:JSON.stringify({query:'test',memories:[{title:'test',story:'synthetic memory'}]})});
test('AI rejects unauthenticated and unconfirmed calls before invoking model',async()=>{
  let called=false;const env={ADMIN_TOKEN:'test-secret',AI:{run(){called=true}}};
  assert.equal((await brain({request:aiRequest('wrong'),env})).status,401);
  assert.equal((await brain({request:aiRequest('test-secret',false),env})).status,403);assert.equal(called,false);
});
test('AI atomic rate limit allows six calls then fails closed',async()=>{
  const {DB}=database(),env={ADMIN_TOKEN:'test-secret',DB};
  for(let i=0;i<6;i++)assert.equal(await authorizeMemoryAI(aiRequest(),env),null);
  assert.equal((await authorizeMemoryAI(aiRequest(),env)).status,429);
  assert.equal((await authorizeMemoryAI(aiRequest(),{ADMIN_TOKEN:'test-secret'})).status,503);
});
test('body limit works without Content-Length',async()=>{await assert.rejects(readLimitedJson(new Request(base,{method:'POST',body:'x'.repeat(200)}),100),/too large/)});
test('access request renews an expired pending link and throttles repeated submissions',async()=>{
  const {sql,DB}=database();
  sql.exec("ALTER TABLE memory_access_requests ADD COLUMN relationship TEXT; ALTER TABLE memory_access_requests ADD COLUMN note TEXT; ALTER TABLE memory_access_requests ADD COLUMN ip_hash TEXT;");
  sql.prepare('INSERT INTO memory_access_requests(id,name,email,status,approval_token,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run('old','Example','example0@example.com','pending','old-token',new Date(Date.now()-49*3600000).toISOString(),'');
  for(let i=0;i<5;i++){
    const response=await requestAccess({env:{DB},request:new Request(base+'/api/memories-request',{method:'POST',headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.1'},body:JSON.stringify({name:'Example',email:`example${i}@example.com`})})});
    assert.equal(response.status,i<4?201:429);
  }
  assert.equal(sql.prepare('SELECT count(*) AS n FROM memory_access_requests WHERE email=?').get('example0@example.com').n,2);
});
test('default analysis and experience study have no upload path',()=>{
  const html=fs.readFileSync(new URL('../memories/index.html',import.meta.url),'utf8');
  const local=html.slice(html.indexOf('async function runBrain('),html.indexOf('async function approveInsight('));
  assert.ok(!local.includes('fetch('));assert.ok(local.includes('localResult('));
  const experience=fs.readFileSync(new URL('../memories/experience-chamber.js',import.meta.url),'utf8');assert.ok(!experience.includes('fetch('));
});
test('inactivity lock reloads without clearing encrypted data and locks on return',()=>{
  const listeners={},elements=new Map();let now=0,reloads=0,cleared=false;
  const element=()=>({value:'',textContent:'',checked:false,hidden:false,open:false,setAttribute(){},addEventListener(){},querySelector(sel){if(!elements.has(sel))elements.set(sel,element());return elements.get(sel)},close(){this.open=false},showModal(){this.open=true},focus(){}});
  const dialog=element();const context={document:{body:{appendChild(){}},createElement:()=>dialog,addEventListener:(n,f)=>listeners[n]=f,getElementById:()=>element()},window:{addEventListener(){}},sessionStorage:{removeItem(){}},localStorage:{clear(){cleared=true}},location:{reload(){reloads++}},setTimeout(){return 1},clearTimeout(){},Date:{now:()=>now}};
  vm.runInNewContext(fs.readFileSync(new URL('../memories/privacy-controls.js',import.meta.url),'utf8'),context);
  context.window.NovaMemoryPrivacy.unlocked();now=16*60000;listeners.visibilitychange();assert.equal(reloads,1);assert.equal(cleared,false);
});
test('online analysis sends nothing until the exact preview is explicitly confirmed',async()=>{
  const nodes=new Map();let calls=0,sent;
  const node=()=>({handlers:{},value:'',checked:false,open:false,textContent:'',setAttribute(){},focus(){},close(){this.open=false},showModal(){this.open=true},addEventListener(n,f){this.handlers[n]=f},querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},reportValidity(){return nodes.get('input[type=checkbox]').checked&&!!nodes.get('input[type=password]').value}});
  const dialog=node(),context={window:{addEventListener(){}},document:{body:{appendChild(){}},createElement:()=>dialog,addEventListener(){},getElementById:node},sessionStorage:{removeItem(){}},location:{reload(){}},AbortController,setTimeout:()=>1,clearTimeout(){},fetch:async(url,options)=>{calls++;sent={url,options};return new Response('{"answer":"synthetic"}')},Date};
  vm.runInNewContext(fs.readFileSync(new URL('../memories/privacy-controls.js',import.meta.url),'utf8'),context);
  const privacy=context.window.NovaMemoryPrivacy;privacy.unlocked();
  const payload={query:'Example question',memories:[{title:'Example',story:'Synthetic story'}]};
  let pending=privacy.analyze(payload);assert.equal(calls,0);assert.deepEqual(JSON.parse(nodes.get('pre').textContent),payload);
  nodes.get('[data-cancel]').handlers.click();assert.equal(await pending,null);assert.equal(calls,0);
  pending=privacy.analyze(payload);nodes.get('input[type=password]').value='synthetic-owner-token';
  nodes.get('form').handlers.submit({preventDefault(){},target:nodes.get('form')});assert.equal(calls,0);
  nodes.get('input[type=checkbox]').checked=true;nodes.get('form').handlers.submit({preventDefault(){},target:nodes.get('form')});
  assert.equal((await pending).answer,'synthetic');assert.equal(calls,1);assert.equal(sent.options.body,JSON.stringify(payload));assert.equal(nodes.get('input[type=password]').value,'');assert.equal(sent.options.headers['x-nova-consent'],'preview-confirmed');
});
