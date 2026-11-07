/* Separate scenery, water surfaces, foam, atmospheric particles and articulated plants.
   The scenery is always drawn at its original coordinates. No photograph UV warping. */
(() => {
  'use strict';
  const W=1672,H=941,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const P=window.FathersHousePhysics;
  function random(seed){let n=seed|0;return()=>{n=Math.imul(n^n>>>15,1|n);n^=n+Math.imul(n^n>>>7,61|n);return((n^n>>>14)>>>0)/4294967296;};}
  function polygon(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
  const river=[[1042,485],[1118,493],[1080,525],[1215,539],[1222,561],[1120,581],[1100,614],[1230,636],[1196,672],[1260,706],[1415,749],[1672,793],[1672,941],[1090,941],[1054,887],[1005,845],[970,800],[845,768],[711,721],[748,690],[842,674],[920,659],[950,642],[935,615],[1010,596],[1040,567],[1100,546],[1035,529],[966,516]];
  const falls=[
    {shape:[[621,501],[673,507],[698,570],[721,667],[700,691],[650,679],[636,606]],base:[682,689],top:501,bottom:690},
    {shape:[[456,482],[489,485],[512,520],[520,591],[502,612],[472,598],[464,540]],base:[498,610],top:482,bottom:610},
    {shape:[[1192,390],[1233,391],[1242,427],[1255,470],[1230,487],[1203,474],[1198,429]],base:[1230,486],top:390,bottom:486},
    {shape:[[832,402],[875,401],[882,438],[860,460],[837,447]],base:[859,459],top:402,bottom:459},
    {shape:[[1336,390],[1391,391],[1416,418],[1398,440],[1355,432]],base:[1390,437],top:390,bottom:438},
    {shape:[[1335,675],[1380,674],[1404,706],[1380,738],[1343,731]],base:[1375,738],top:674,bottom:738},
    {shape:[[955,614],[988,615],[1013,637],[991,649],[966,641]],base:[992,647],top:614,bottom:647},
    {shape:[[1082,683],[1144,683],[1160,704],[1133,715],[1098,705]],base:[1135,714],top:683,bottom:715},
    {shape:[[1060,812],[1094,817],[1124,875],[1106,897],[1080,873]],base:[1108,895],top:812,bottom:895}
  ];
  function makeNoise(){const rng=random(387231),small=Float32Array.from({length:33*33},()=>rng()),noise=new Uint8Array(256*256);
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){const gx=x/8,gy=y/8,ix=gx|0,iy=gy|0;let u=gx-ix,v=gy-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);const a=small[iy*33+ix]*(1-u)+small[iy*33+ix+1]*u,b=small[(iy+1)*33+ix]*(1-u)+small[(iy+1)*33+ix+1]*u;noise[y*256+x]=Math.round((a*(1-v)+b*v)*255);}return noise;}
  function createWater(image){
    const width=window.innerWidth<700?720:960,height=Math.round(width*H/W),sx=width/W,sy=height/H;
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');if(!ctx)return null;
    const mask=document.createElement('canvas');mask.width=width;mask.height=height;const mc=mask.getContext('2d');
    mc.scale(sx,sy);mc.fillStyle='#fff';polygon(mc,river);const riverMask=mc.getImageData(0,0,width,height).data;
    const type=new Uint8Array(width*height);for(let i=0;i<type.length;i++)if(riverMask[i*4+3])type[i]=1;
    for(let f=0;f<falls.length;f++){mc.clearRect(0,0,W,H);polygon(mc,falls[f].shape);const data=mc.getImageData(0,0,width,height).data;for(let i=0;i<type.length;i++)if(data[i*4+3]>128)type[i]=f+2;}
    ctx.drawImage(image,0,0,width,height);const base=ctx.getImageData(0,0,width,height).data;
    const pixels=ctx.createImageData(width,height),samples=[],alphaMap=new Uint8Array(width*height);
    for(let i=0;i<type.length;i++){
      if(!type[i])continue;const k=i*4,r=base[k],g=base[k+1],b=base[k+2],x=(i%width)/sx,y=Math.floor(i/width)/sy;
      const cyan=clamp((g-r-4)/22)*clamp((b-r-3)/20);
      const foam=clamp((Math.min(r,g,b)-155)/65)*clamp((70-(Math.max(r,g,b)-Math.min(r,g,b)))/40);
      const gold=type[i]===1&&x>1005&&x<1110&&y>540?clamp((r-145)/70)*clamp((g-120)/70):0;
      let a=type[i]>1?Math.max(foam,cyan):Math.max(cyan,foam,gold);
      if(type[i]===1)a*=riverMask[k+3]/255;
      if(a<.03)continue;const depth=clamp((y-480)/460),fall=type[i]>1?falls[type[i]-2]:null;
      alphaMap[i]=Math.round(a*255);pixels.data[k+3]=Math.round(a*245);samples.push({i,k,x,y,r,g,b,a,depth,fall,sun:Math.exp(-(((x-1045)/55)**2)),flowFactor:fall?.55+.8*clamp((y-fall.top)/(fall.bottom-fall.top)):.45+depth,noiseX:x*(fall?2.2:.5),noiseY:y*(fall?.22:.65),fi:clamp(Math.floor((y-480)/461*42),1,42)*72+clamp(Math.floor((x-650)/1022*70),1,70)});
    }
    const noise=makeNoise(),surface=new P.WaterSurface(72,44),rng=random(17243);
    const foam=Array.from({length:190},()=>({phase:rng(),side:rng()*2-1,size:1+rng()*2.5,rate:.018+rng()*.014}));
    let lastTime=0,lastDraw=-1,lastImpulse=-1;
    const channel=[[1065,510,35],[1120,555,70],[1110,605,80],[1030,655,90],[940,700,150],[1090,745,210],[1360,805,270],[1390,940,270]];
    function onWater(x,y){const px=Math.round(x*sx),py=Math.round(y*sy);return px>=0&&px<width&&py>=0&&py<height&&alphaMap[py*width+px]>140;}
    function draw(time){
      const tick=Math.floor(time*20+1e-6);if(tick===lastDraw)return canvas;
      const dt=clamp(time-lastTime,0,.1);lastTime=time;lastDraw=tick;
      const impulse=Math.floor(time*2.2);if(impulse!==lastImpulse){lastImpulse=impulse;surface.disturb(.18+(impulse*37%63)/100,.18+(impulse*23%58)/100,.12);}
      surface.step(dt);const out=pixels.data,shift=time*17,fallShift=time*65;
      for(const s of samples){
        const {k,x,y,r,g,b,depth,fall,fi}=s;
        const speed=(fall?fallShift:shift)*s.flowFactor;
        const ix=(s.noiseX+time*2)|0,iy=(s.noiseY-speed)|0;
        const n=noise[(iy&255)*256+(ix&255)]/255;
        const dx=(noise[(iy&255)*256+((ix+2)&255)]-noise[(iy&255)*256+((ix-2)&255)])/255;
        const dy=(noise[((iy+2)&255)*256+(ix&255)]-noise[((iy-2)&255)*256+(ix&255)])/255;
        const nx=(surface.h[fi+1]-surface.h[fi-1])*2+dx*.35,ny=(surface.h[fi+72]-surface.h[fi-72])*2+dy*.25;
        let lighting=.91+nx*.8-ny*.55;
        let shine=1-Math.abs(nx-.02)*9-Math.abs(ny+.01)*10;if(shine<0)shine=0;shine*=shine;shine*=shine;
        const sun=s.sun;
        let glint=shine*sun*(12+depth*26);
        if(fall){lighting=.77+n*.36;glint=n>.66?(n-.66)*90:0;}
        out[k]=r*lighting+glint;out[k+1]=g*lighting+glint*.92;out[k+2]=b*lighting+glint*.75;
      }
      ctx.putImageData(pixels,0,0);ctx.save();ctx.scale(sx,sy);ctx.lineCap='round';
      for(const bit of foam){const t=(bit.phase+time*bit.rate)%1,part=t*(channel.length-1),i=Math.min(channel.length-2,Math.floor(part)),u=part-i;
        const a=channel[i],b=channel[i+1],x=a[0]+(b[0]-a[0])*u+bit.side*(a[2]+(b[2]-a[2])*u),y=a[1]+(b[1]-a[1])*u;
        if(!onWater(x,y))continue;const z=clamp((y-490)/450);ctx.globalAlpha=.12+z*.23;ctx.strokeStyle='#dff9ed';ctx.lineWidth=.45+z*.8;
        ctx.beginPath();ctx.ellipse(x,y,bit.size*(1+z*2.6),(.3+z)*bit.size*.35,-.15,Math.PI*.1,Math.PI*1.1);ctx.stroke();}
      ctx.restore();return canvas;
    }
    return {draw,onWater,sampleCount:samples.length};
  }
  function makeMist(){const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const ctx=canvas.getContext('2d'),rng=random(72333);
    for(let i=0;i<35;i++){const x=20+rng()*56,y=20+rng()*56,r=10+rng()*25,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#e3edf127');g.addColorStop(1,'#e3edf100');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}return canvas;}
  function plantDefinitions(){const list=[];
    for(let i=0;i<10;i++)list.push({x:12+(i*37%150),y:933-i%3*18,height:125+i%4*38,head:0,headSize:55+i%3*13,leaf:3,seed:i*.73});
    for(let i=0;i<9;i++)list.push({x:180+i*17,y:940-i%2*20,height:90+i%4*20,head:2,headSize:70+i%3*9,leaf:4,seed:9+i*.71});
    for(let i=0;i<9;i++)list.push({x:552+i*18,y:818+i%3*7,height:60+i%4*13,head:i%3===0?5:1,headSize:29+i%3*5,leaf:4,seed:20+i*.91});
    for(let i=0;i<9;i++)list.push({x:1515+i*20,y:945+i%2*5,height:65+i%4*22,head:i%3===0?0:1,headSize:30+i%3*8,leaf:4,seed:30+i*.67});
    return list.sort((a,b)=>a.y-b.y).map(d=>({...d,stem:new P.Stem(d.x,d.y,d.height,d.seed)}));
  }
  const anchors=[[.41,.81],[.47,.79],[.51,.96],[.43,.94],[.5,.95],[.5,.93]];
  function create(image,atlas){
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');if(!ctx)return null;
    const water=createWater(image),mist=makeMist(),plants=plantDefinitions();let lastTime=0;
    // Cache each component at an appropriate display resolution, not a full atlas per leaf.
    const parts=[];
    if(atlas&&atlas.naturalWidth){
      const sw=atlas.naturalWidth/3,sh=atlas.naturalHeight/2;
      for(let index=0;index<6;index++){
        const part=document.createElement('canvas');part.width=part.height=144;
        const pc=part.getContext('2d');pc.imageSmoothingQuality='high';
        pc.drawImage(atlas,index%3*sw,Math.floor(index/3)*sh,sw,sh,0,0,144,144);parts.push(part);
      }
    }
    function sprite(index,x,y,size,angle=0,flip=1,shade=1){if(!atlas||!atlas.naturalWidth)return;
      const a=anchors[index],height=size;
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(flip,1);ctx.globalAlpha=shade;
      ctx.drawImage(parts[index],-a[0]*size,-a[1]*height,size,height);ctx.restore();}
    function draw(time){
      const dt=clamp(time-lastTime,0,.1);lastTime=time;
      ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(image,0,0,W,H);
      if(water)ctx.drawImage(water.draw(time),0,0,W,H);
      // Independent droplets and mist occupy space above the impact points.
      for(let f=0;f<falls.length;f++){const fall=falls[f];for(let j=0;j<7;j++){
        const age=(time*(.09+j*.004)+j*.173+f*.137)%1,size=(22+age*45)*(f<3?1:.6);
        const x=fall.base[0]+(j-3)*8+age*(15+8*Math.sin(f)),y=fall.base[1]-age*(18+f%3*4);
        ctx.globalAlpha=Math.sin(age*Math.PI)*.13;ctx.drawImage(mist,x-size/2,y-size/2,size,size);}}
      ctx.globalAlpha=1;
      // Cloud volumes move independently of the masonry behind them.
      for(let i=0;i<5;i++){const x=360+i*31+Math.sin(time*.075+i)*15,y=235+i%2*17;ctx.globalAlpha=.035;ctx.drawImage(mist,x,y,150,58);}
      ctx.globalAlpha=1;
      for(const plant of plants){
        plant.stem.step(dt,P.wind(time,plant.x,plant.seed));const points=plant.stem.points();
        // Root stays fixed; each joint supplies a new leaf/head attachment point.
        ctx.save();const stemLight=ctx.createLinearGradient(plant.x-3,0,plant.x+3,0);stemLight.addColorStop(0,'#29412a');stemLight.addColorStop(.6,'#77944d');stemLight.addColorStop(1,'#b6bc76');ctx.strokeStyle=stemLight;ctx.lineWidth=plant.head===0?2.3:1.3;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length-1;i++)ctx.quadraticCurveTo(points[i].x,points[i].y,(points[i].x+points[i+1].x)/2,(points[i].y+points[i+1].y)/2);const tip=points[points.length-1];ctx.lineTo(tip.x,tip.y);ctx.stroke();ctx.restore();
        // Separate low leaf clusters fill the planting bed while the roots remain anchored.
        sprite(plant.leaf,plant.x-4,plant.y-3,plant.head===0?65:47,Math.sin(time*.9+plant.seed)*.025,-1,.94);
        sprite(plant.leaf,plant.x+4,plant.y-2,plant.head===0?56:42,.22+Math.sin(time*.8+plant.seed+1)*.025,1,.9);
        for(let j=2;j<=4;j+=2){const node=points[j],side=j===2?-1:1;const flutter=Math.sin(time*(1.5+j*.12)+plant.seed+j)*.055;
          sprite(plant.leaf,node.x,node.y,(plant.head===0?48:28)+plant.height*.1,node.angle+side*.43+flutter,side,.91);}
        const nod=points[points.length-1];sprite(plant.head,nod.x,nod.y,plant.headSize,nod.angle*.7+Math.sin(time*1.1+plant.seed)*.018,1,1);
      }
      ctx.globalAlpha=1;return canvas;
    }
    return {backend:'independent-layers',draw,waterSamples:water?water.sampleCount:0};
  }
  function createBethany(){const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d'),mist=makeMist();if(!ctx)return null;
    return {draw(time){ctx.clearRect(0,0,1280,720);const glow=ctx.createRadialGradient(1120,40,0,1120,40,360);glow.addColorStop(0,'#ffe6a614');glow.addColorStop(1,'#ffe6a600');ctx.globalAlpha=.65+Math.sin(time*.4)*.15;ctx.fillStyle=glow;ctx.fillRect(0,0,1280,720);
      for(let i=0;i<6;i++){const age=(time*.04+i*.163)%1;ctx.globalAlpha=Math.sin(age*Math.PI)*.045;ctx.drawImage(mist,340+age*60+i*13,570-age*60,100,35);}ctx.globalAlpha=1;return canvas;}};
  }
  window.FathersHouseSimulation={create,createBethany};
})();
