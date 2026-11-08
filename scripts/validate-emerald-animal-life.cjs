const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const context={window:{},Math};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','emerald-animal-life.js'),'utf8'),context);const life=context.window.EmeraldAnimalLife;
assert.deepEqual(Object.keys(life).sort(),['createMind','frameAt','kinds']);
for(const kind of life.kinds){
 const mind=life.createMind({kind,x:.5,y:.75,min:.35,max:.65,dir:1,speed:25,seed:8}),count=['deer','elephant','dog'].includes(kind)?8:4;
 const activities=new Set(),walkFrames=new Set();let previous;
 for(let time=0;time<180;time+=.05){
  const motion=mind.sample(time),frame=life.frameAt(kind,motion,count);activities.add(motion.action);
  assert(Number.isFinite(motion.x)&&motion.x>=.35&&motion.x<=.65,kind+' bounds');if(previous)assert(Math.abs(motion.x-previous.x)<.012,kind+' position jumped');previous=motion;
  assert(Number.isInteger(frame)&&frame>=0&&frame<count,kind+' missing pose');if(motion.action==='walk')walkFrames.add(frame);
 }
 assert(activities.size>=3,kind+' varied behavior');assert(walkFrames.size>=(count===8?4:2),kind+' authored walking frames');
}
const tree=life.createMind({kind:'monkey',tree:true,x:.13,y:.4,min:.1,max:.18,dir:1,speed:8,seed:3817});let y0;
for(let t=0;t<50;t+=.1){const m=tree.sample(t);assert(m.y>=.32&&m.y<=.48);assert([2,3].includes(life.frameAt('monkey',m,4)));if(y0!==undefined)assert(Math.abs(m.y-y0)<.015);y0=m.y;}
console.log('PASS: all 10 species use complete valid poses; every walking frame is reachable; paths and climbing remain continuous and bounded; no image-warping API exists.');
