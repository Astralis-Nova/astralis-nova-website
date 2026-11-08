const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const context={window:{},Math};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','emerald-animal-life.js'),'utf8'),context);const life=context.window.EmeraldAnimalLife;
let samples=0;for(const [kind,profile]of Object.entries(life.profiles)){
 const mind=life.createMind({kind,x:.5,y:.75,min:.35,max:.65,dir:1,speed:25,seed:8});const seen=new Set();let prev;
 for(let time=0;time<180;time+=.05){const m=mind.sample(time);seen.add(m.action);assert(Number.isFinite(m.x)&&m.x>=.35&&m.x<=.65,kind);if(prev)assert(Math.abs(m.x-prev.x)<.012,kind+' position jumped');prev=m;
 if(time<3){const p=life.prepareMotion(kind,{...m,action:'walk',speed:1},0);for(let y=0;y<=10;y++)for(let x=0;x<=10;x++){const q=life.deformPoint(x/10,y/10,p);assert(q.every(Number.isFinite),kind+' invalid mesh');samples++;}
 for(let i=0;i<p.chains.length;i++){const c=p.chains[i],l=profile.legs[i];assert(Math.abs(Math.hypot(c[1][0]-c[0][0],c[1][1]-c[0][1])-Math.hypot(l.knee[0]-l.hip[0],l.knee[1]-l.hip[1]))<1e-5,kind+' upper leg stretch');}}
 }
 assert(seen.size>=3,kind+' needs varied behavior');
}
const sample=(kind,gait,time)=>life.prepareMotion(kind,{action:'walk',speed:1,gait,time,weight:1,blink:0,tree:false},0);
for(const kind of ['deer','elephant','dog','monkey','bull','peacock','mouse','turtle','hare']){
 const foot=life.profiles[kind].legs[0].foot,a=life.deformPoint(...foot,sample(kind,.1,0)),b=life.deformPoint(...foot,sample(kind,.45,1));assert(Math.hypot(a[0]-b[0],a[1]-b[1])>.001,kind+' foot did not articulate');
}
const shell=life.deformPoint(.45,.2,sample('turtle',.4,1));assert.deepEqual([...shell],[.45,.2]);
const monkey=life.prepareMotion('monkey',{action:'climb',speed:1,gait:.1,time:1,weight:1,blink:0,tree:true},3);assert(monkey.chains.length===4);
console.log(`PASS: ${samples} finite mesh samples; bounded, continuous paths for all 10 species; joint lengths preserved; feet articulate; turtle shell stays rigid; climbing monkey has four moving limbs.`);
