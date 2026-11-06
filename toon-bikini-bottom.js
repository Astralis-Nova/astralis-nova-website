/* Articulated canvas puppets: rounded shaded forms, independent limbs, facial
   motion and individual activity clocks. No rigid sprite-card flips. */
export function createBikiniVillage() {
  const actors = [
    {name:'SpongeBob',home:.28,range:.07,height:152,depth:.91,paint:sponge},
    {name:'Patrick',home:.69,range:.05,height:164,depth:.90,paint:patrick},
    {name:'Sandy',home:.87,range:.045,height:151,depth:.90,paint:sandy},
    {name:'Mr. Krabs',home:.39,range:.065,height:133,depth:.94,paint:krabs},
    {name:'Squidward',home:.51,range:.045,height:174,depth:.88,paint:squidward}
  ].map((a,i)=>({...a,x:a.home,from:a.home,to:a.home,action:'look',start:0,end:2+i*1.3,phase:i*1.7,seed:977+i*831}));
  let c;
  function random(a){a.seed=(a.seed*1664525+1013904223)>>>0;return a.seed/4294967296;}
  function gradient(x,y,r,light,dark){const g=c.createRadialGradient(x-r*.3,y-r*.35,r*.05,x,y,r);g.addColorStop(0,light);g.addColorStop(1,dark);return g;}
  function ellipse(x,y,rx,ry,color,edge){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=1;c.stroke();}}
  function path(points,color,edge){c.beginPath();for(const p of points){const [op,...v]=p;c[op](...v);}c.fillStyle=color;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=1;c.stroke();}}
  function line(points,color,width=2){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
  function rect(x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
  function smile(x,y,w,color='#55382c'){c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x,y+w*.65,x+w,y);c.strokeStyle=color;c.lineWidth=1.7;c.stroke();}
  function eye(x,y,rx,ry,p,blue=false,lid='#d4e5c7'){
    ellipse(x,y,rx,ry,'#f6f6e9','#43545077');
    const look=Math.sin(p.t*.48+p.phase)*1.5;
    if(blue)ellipse(x+look,y+1,rx*.48,ry*.49,gradient(x+look,y,rx*.5,'#79daed','#2875ac'));
    ellipse(x+look,y+1,rx*(blue?.24:.30),ry*.42,'#192a30');ellipse(x+look-rx*.11,y-ry*.15,rx*.11,ry*.12,'#fff');
    const cycle=(p.t+p.phase)%5.7,blink=cycle<.17?Math.sin(cycle/.17*Math.PI):0;
    if(blink>.02){c.save();c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.clip();c.fillStyle=lid;c.fillRect(x-rx,y-ry,rx*2,ry*2*blink);c.restore();}
  }
  function hand(x,y,color){ellipse(x,y,4.3,4.3,color);for(let i=0;i<3;i++)line([[x,y],[x+5+i*.6,y-4+i*3]],color,2);}
  function limb(side,p,color,shoulderY=-86){
    const greeting=p.action==='greet'&&side===-1;
    const swing=p.walk?Math.sin(p.gait+side)*5:Math.sin(p.t*1.2+p.phase)*1.3;
    const x=side*35,elbowX=side*(43+swing*.4),elbowY=shoulderY+(greeting?-9:18),hx=side*(48+swing),hy=shoulderY+(greeting?-29+Math.sin(p.t*5)*5:31);
    line([[x,shoulderY],[elbowX,elbowY],[hx,hy]],'#27474866',5);line([[x,shoulderY],[elbowX,elbowY],[hx,hy]],color,3.5);hand(hx,hy,color);
  }
  function sponge(p){
    const yellow=gradient(-5,-113,65,'#ffec6d','#c6a12d');
    for(const side of [-1,1]){
      const step=p.walk?Math.sin(p.gait+(side<0?0:Math.PI)):0,x=side*16;
      line([[x,-34],[x+step*3,-15]],'#e8cd45',4);
      line([[x+step*3,-15],[x+step*4,-6-Math.max(0,step)*4]],'#f5f6df',6);
      line([[x-2+step*3,-13],[x+2+step*3,-13]],'#c54f3a',1.5);
      ellipse(x+3+step*4,-4-Math.max(0,step)*4,11,5,gradient(x,-4,12,'#47535c','#111c27'));
    }
    limb(-1,p,'#e4ce48',-83);limb(1,p,'#e4ce48',-83);
    rect(-33,-60,66,26,4,gradient(-12,-53,65,'#ae7950','#65492d'),'#584830');
    rect(-33,-73,66,16,2,'#f3f6df','#a0bcb4');
    for(const x of [-24,-7,10,24])rect(x,-55,8,3,0,'#342f27');
    path([['moveTo',-5,-70],['lineTo',5,-70],['lineTo',2,-64],['lineTo',6,-51],['lineTo',0,-46],['lineTo',-6,-51],['lineTo',-2,-64],['closePath']], '#c84136','#803126');
    path([['moveTo',-35,-146],['quadraticCurveTo',-21,-151,-12,-146],['quadraticCurveTo',0,-150,13,-146],['quadraticCurveTo',25,-151,35,-145],['lineTo',33,-76],['quadraticCurveTo',19,-71,8,-75],['quadraticCurveTo',-9,-71,-33,-76],['closePath']],yellow,'#b2a044');
    for(const [x,y,r] of [[-27,-136,4],[25,-135,3],[-28,-105,3.4],[26,-92,4],[-24,-80,2],[-4,-140,2],[29,-116,2],[-30,-119,2]]){
      ellipse(x,y,r,r*.73,'#b79f35aa');ellipse(x-1,y-1,r*.6,r*.4,'#9a852855');
    }
    eye(-13,-121,15,18,p,true,'#e5d349');eye(13,-121,15,18,p,true,'#e5d349');
    for(const x of [-13,13])for(let i=-1;i<=1;i++)line([[x+i*7,-138],[x+i*9,-144]],'#4a482c',1.8);
    ellipse(0,-108,5,11,gradient(-1,-111,12,'#fff078','#d5b236'),'#b39b35');
    ellipse(-24,-98,7,4,'#dc99634d');ellipse(24,-98,7,4,'#dc99634d');
    smile(0,-98,23);rect(-8,-97,7,9,1,'#fffce9');rect(1,-97,7,9,1,'#fffce9');
  }
  function flower(x,y,r,color){for(let i=0;i<5;i++){const a=i*Math.PI*.4;ellipse(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,r*.45,r*.42,color);}ellipse(x,y,r*.22,r*.22,'#efc161');}
  function patrick(p){
    const pink=gradient(-8,-91,86,'#f5a4a1','#bc637a');
    for(const side of [-1,1]){const step=p.walk?Math.sin(p.gait+side*1.5)*3:0;ellipse(side*20+step,-10,14,13,pink);}
    path([['moveTo',-34,-55],['quadraticCurveTo',-43,-61,-55,-90],['quadraticCurveTo',-68,-119,-50,-105],['lineTo',-26,-88],['quadraticCurveTo',-20,-126,-6,-159],['quadraticCurveTo',0,-171,8,-154],['lineTo',27,-89],['lineTo',49,-104],['quadraticCurveTo',67,-117,55,-88],['quadraticCurveTo',46,-66,34,-55],['closePath']],pink,'#ae6777');
    ellipse(0,-56,38,35,pink);
    path([['moveTo',-38,-54],['quadraticCurveTo',0,-40,38,-54],['lineTo',33,-21],['lineTo',7,-21],['lineTo',0,-29],['lineTo',-7,-21],['lineTo',-33,-21],['closePath']],gradient(-5,-45,47,'#bdd883','#729e56'),'#729258');
    c.save();c.beginPath();c.rect(-36,-48,72,26);c.clip();flower(-20,-35,9,'#a377b3');flower(22,-43,9,'#a377b3');c.restore();
    eye(-8,-113,7,13,p,false,'#e69b9b');eye(8,-113,7,13,p,false,'#e69b9b');
    smile(0,-94,15);ellipse(1,-66,2,2.5,'#b96e7f');
    for(const side of [-1,1])line([[side*8,-130],[side*17,-132]],'#754a52',2);
  }
  function sandy(p){
    const suit=gradient(-5,-76,66,'#f3f7ed','#8da6a6');
    // Her furry tail is visible behind the white pressure suit.
    path([['moveTo',25,-37],['bezierCurveTo',66,-52,68,-104,48,-115],['bezierCurveTo',27,-124,20,-92,38,-78],['quadraticCurveTo',48,-61,25,-55],['closePath']],gradient(43,-87,35,'#ceaa72','#795338'),'#765c3b');
    for(const side of [-1,1]){const step=p.walk?Math.sin(p.gait+side*1.5)*3:0;rect(side*15-8+step,-39,16,28,5,suit,'#6d909a');ellipse(side*17+step,-9,14,7,'#aebfc0');limb(side,p,'#d9e4de',-81);}
    rect(-28,-96,56,61,18,suit,'#7d969d');rect(-26,-59,52,8,2,'#be6456');rect(-15,-83,30,18,4,'#afc5c7');
    rect(-9,-78,18,4,1,'#596f7a');ellipse(17,-71,4,4,'#518bb1');
    ellipse(0,-123,36,37,'#d2f4ed24','#c1e6e9aa');
    ellipse(-18,-137,10,11,'#9b734c');ellipse(18,-137,10,11,'#9b734c');
    ellipse(0,-119,24,25,gradient(-5,-124,32,'#c6a071','#79593d'));
    ellipse(-9,-120,11,14,'#e6cda2');ellipse(9,-120,11,14,'#e6cda2');
    eye(-9,-123,6,8,p,false,'#d0ad7a');eye(9,-123,6,8,p,false,'#d0ad7a');
    ellipse(0,-111,5,3,'#594435');smile(0,-105,11);rect(-4,-104,8,6,1,'#f9f3dc');
    c.beginPath();c.ellipse(-2,-125,33,34,-.15,Math.PI,Math.PI*1.43);c.strokeStyle='#f3ffff99';c.lineWidth=2.5;c.stroke();
    flower(22,-153,11,'#d791b4');
  }
  function krabs(p){
    const red=gradient(-4,-91,56,'#ef7957','#ad3337');
    for(const side of [-1,1]){
      const step=p.walk?Math.sin(p.gait+side)*3:0;
      line([[side*17,-30],[side*22+step,-11]],'#bc4540',5);ellipse(side*24+step,-7,11,6,red);
      const clawY=p.action==='greet'&&side<0?-107+Math.sin(p.t*4)*4:-78+Math.sin(p.t*1.2+side)*2;
      line([[side*31,-70],[side*45,-57],[side*56,clawY+9]],'#b43e3b',6);
      ellipse(side*59,clawY,14,19,red,'#9e3637');
      path([['moveTo',side*59,clawY-20],['lineTo',side*62,clawY-7],['lineTo',side*70,clawY-17],['closePath']], '#19566c');
    }
    ellipse(0,-38,34,18,gradient(0,-42,40,'#8c82b0','#494966'));
    path([['moveTo',-39,-83],['quadraticCurveTo',0,-104,39,-83],['lineTo',32,-43],['quadraticCurveTo',0,-32,-32,-43],['closePath']],gradient(-5,-75,55,'#a6d9e2','#5992b0'),'#3e6f8a');
    rect(-30,-46,60,7,1,'#353139');rect(-6,-47,12,10,1,'#c9af67');rect(-3,-45,6,6,0,'#4d4640');
    ellipse(0,-100,36,24,red,'#a23639');
    for(const side of [-1,1]){line([[side*15,-115],[side*19,-143]],'#d45c4c',7);eye(side*19,-146,8,14,p,false,'#dc6a51');}
    smile(0,-98,23,'#6f262c');line([[-7,-111],[-11,-116]],'#893134',2);line([[7,-111],[11,-116]],'#893134',2);
  }
  function squidward(p){
    const teal=gradient(-5,-111,58,'#a9cbb9','#588f8c');
    // Four separate tentacle feet, with a different stride phase on each.
    for(let i=0;i<4;i++){
      const x=(i-1.5)*12,step=p.walk?Math.sin(p.gait+i*1.6)*4:Math.sin(p.t*.6+i)*.6;
      line([[x*.6,-43],[x+step*.4,-23],[x+step,-9]],'#5e8f89',9);ellipse(x+step+4,-7,10,5,teal);
      for(let n=0;n<3;n++)ellipse(x+step+n*3,-5,1.2,1,'#b6d2bd');
    }
    limb(-1,p,'#81aea1',-84);limb(1,p,'#81aea1',-84);
    path([['moveTo',-25,-99],['lineTo',-35,-84],['lineTo',-27,-72],['lineTo',-23,-43],['quadraticCurveTo',0,-37,23,-43],['lineTo',27,-72],['lineTo',35,-84],['lineTo',25,-99],['closePath']],gradient(-4,-76,43,'#ba9864','#816341'),'#715e44');
    line([[0,-94],[0,-71]],'#746042',1.2);path([['moveTo',-12,-99],['lineTo',0,-86],['lineTo',12,-99],['closePath']], '#d0ac7a');
    ellipse(0,-132,34,34,teal,'#527e7a');
    ellipse(-12,-121,12,17,'#e6dfb8');ellipse(12,-121,12,17,'#e6dfb8');
    eye(-12,-120,11,13,p,false,'#91b8a7');eye(12,-120,11,13,p,false,'#91b8a7');
    c.fillStyle='#8ab09e';c.fillRect(-24,-137,48,11);
    line([[-23,-126],[-2,-126]],'#608f84',1.5);line([[2,-126],[23,-126]],'#608f84',1.5);
    ellipse(0,-108,9,23,gradient(-3,-113,29,'#b5cdb7','#719d90'),'#608e83');
    line([[-17,-95],[-8,-94]],'#4f7f77',1.5);line([[8,-94],[17,-95]],'#4f7f77',1.5);
    for(const [x,y] of [[-14,-154],[0,-158],[15,-152]])ellipse(x,y,2,2,'#709c8c');
  }
  return {
    load(){},
    draw(ctx,t,{w,sceneY,sceneH}){
      c=ctx;const unit=Math.min(1.3,Math.max(.34,w/1536));
      for(const a of actors){
        if(t>=a.end){a.from=a.x;a.start=t;a.action=random(a)<.56?'walk':(random(a)<.5?'look':'greet');a.to=a.action==='walk'?a.home+(random(a)-.5)*a.range*2:a.x;a.end=t+(a.action==='walk'?5+random(a)*5:3+random(a)*6);}
        const q=Math.min(1,Math.max(0,(t-a.start)/(a.end-a.start))),ease=q*q*(3-2*q);a.x=a.from+(a.to-a.from)*ease;
        const walking=a.action==='walk',gait=t*(a.name==='Squidward'?4:6)+a.phase,height=a.height*unit;
        c.save();c.translate(w*a.x,sceneY+sceneH*a.depth);
        ellipse(0,1,height*.23,height*.034,'#153e436b');
        const bob=walking?Math.abs(Math.sin(gait))*height*.014:Math.sin(t*1.9+a.phase)*height*.003;
        c.translate(0,-bob);c.scale(height/175,height/175);c.rotate(Math.sin(t*(walking?3:.6)+a.phase)*(walking?.012:.006));
        a.paint({t,phase:a.phase,walk:walking,gait,action:a.action});c.restore();
      }
    }
  };
}
