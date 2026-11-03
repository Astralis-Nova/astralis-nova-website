/* A 3D cutaway rendered with rays through a curved shell, retina and iris.
   The texture is artwork based on the reference, not a clinical reconstruction. */
(() => {
  'use strict';
  const root = document.querySelector('#astralis-celestial-drift .eye-world');
  const canvas = root?.querySelector('canvas');
  if (!canvas || root.dataset.eyeReady) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  root.dataset.eyeReady = 'loading';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => start(image);
  image.onerror = () => start();
  image.src = '/assets/eye/retina-art.webp';

  function start(texture) {
    const mapSize = 256;
    const map = document.createElement('canvas');
    map.width = map.height = mapSize;
    const paint = map.getContext('2d', {willReadFrequently:true});
    if (texture) paint.drawImage(texture, 0, 0, mapSize, mapSize);
    else {
      const amber = paint.createRadialGradient(108,118,4,128,128,164);
      amber.addColorStop(0,'#ffd061');amber.addColorStop(.47,'#c66b23');amber.addColorStop(1,'#291019');
      paint.fillStyle=amber;paint.fillRect(0,0,mapSize,mapSize);
    }
    const colors = paint.getImageData(0, 0, mapSize, mapSize).data;
    const inner = .955, irisX = .815, irisRadius = .56, pupilRadius = .197;
    const irisSize = 128, irisMap = new Uint8ClampedArray(irisSize * irisSize * 3);
    for (let y=0;y<irisSize;y++) for (let z=0;z<irisSize;z++) {
      const yy=2*y/(irisSize-1)-1,zz=2*z/(irisSize-1)-1;
      const r=Math.hypot(yy,zz),a=Math.atan2(zz,yy);
      const fiber=.52+.25*Math.sin(a*111+Math.sin(a*23)*2+r*15)+.13*Math.sin(a*57-r*30);
      const edge=Math.max(0,Math.min(1,(1-r)*11,(r-.33)*15));
      const index=(y*irisSize+z)*3;
      irisMap[index]=(115+fiber*110)*(.61+.39*edge);
      irisMap[index+1]=(118+fiber*107)*(.64+.36*edge);
      irisMap[index+2]=(56+fiber*56)*(.76+.24*edge);
    }

    let size=0,pixels,axis,frame=0,last=0,elapsed=0,visible=true;
    const pixelSpan=2.48;
    const square=x=>x*x;
    const indexOf=(coord,scale)=>Math.min(scale-1,Math.max(0,Math.round((coord+.5)*(scale-1))));
    function render() {
      const t=reduced.matches?0:elapsed;
      const pitch=-.08+.11*Math.sin(t*.19),yaw=-.60+.32*Math.sin(t*.24),roll=-.09+.05*Math.sin(t*.14);
      const a=Math.cos(pitch),b=Math.sin(pitch),c=Math.cos(yaw),d=Math.sin(yaw),e=Math.cos(roll),f=Math.sin(roll);
      // Columns of the rotation matrix; dot products apply its inverse to each ray.
      const xx=c*e,xy=c*f,xz=-d,yx=b*d*e-a*f,yy=b*d*f+a*e,yz=b*c,zx=a*d*e+b*f,zy=a*d*f-b*e,zz=a*c;
      const data=pixels.data;
      for (let row=0;row<size;row++) {
        const y=-axis[row],y2=y*y;
        for (let col=0;col<size;col++) {
          const x=axis[col],r2=x*x+y2,i=(row*size+col)*4;
          let depth=-2,red=0,green=0,blue=0,alpha=0;
          const baseX=xx*x+xy*y,baseY=yx*x+yy*y,baseZ=zx*x+zy*y;
          if (r2<1) {
            let z=Math.sqrt(1-r2);
            // Open the near shell while retaining the whole globe's far surface.
            if (baseZ+zz*z>0) z=-z;
            const shellLight=Math.max(0,-.32*x+.48*y+.82*z);
            const limb=Math.max(0,Math.min(1,(r2-.91)*12));
            red=37+92*shellLight+27*limb;green=61+96*shellLight+38*limb;blue=125+109*shellLight+66*limb;
            depth=z;alpha=255;
            if(r2<inner*inner){
              z=Math.sqrt(inner*inner-r2);
              if(baseZ+zz*z>0)z=-z;
              if(z>depth&&baseZ+zz*z<=0){
                const u=indexOf((baseX+xz*z)/(2*inner)+.13,mapSize),v=indexOf(-(baseY+yz*z)/(2*inner),mapSize);
                const texel=(v*mapSize+u)*4;
                const light=.77+.23*Math.max(0,(.32*x-.48*y-.82*z)/inner);
                red=colors[texel]*light;green=colors[texel+1]*light;blue=colors[texel+2]*light;
                depth=z;alpha=255;
              }
            }
            z=-baseZ/zz;
            if(z>depth&&r2+z*z<=1&&r2+z*z>=inner*inner){
              const light=Math.max(0,-.32*zx+.48*zy+.82*zz);
              red=55+55*light;green=91+58*light;blue=176+59*light;depth=z;alpha=255;
            }
          }
          const irisZ=(irisX-baseX)/xz;
          const irisY=baseY+yz*irisZ,irisSide=baseZ+zz*irisZ;
          if(irisZ>depth&&irisY*irisY+irisSide*irisSide<=irisRadius*irisRadius){
            if(irisY*irisY+irisSide*irisSide<pupilRadius*pupilRadius){red=7;green=5;blue=12;}
            else {
              const u=indexOf(irisSide/(2*irisRadius),irisSize),v=indexOf(irisY/(2*irisRadius),irisSize);
              const texel=(v*irisSize+u)*3;
              const light=.82+.18*Math.max(0,-.32*xx+.48*xy+.82*xz);
              red=irisMap[texel]*light;green=irisMap[texel+1]*light;blue=irisMap[texel+2]*light;
            }
            depth=irisZ;alpha=255;
          }
          // Intersect the curved, translucent cornea in front of the iris.
          if(r2<1&&x>.18){
            const u=(baseX-irisX)/.22,v=baseY/irisRadius,w=baseZ/irisRadius;
            const dx=xz/.22,dy=yz/irisRadius,dz=zz/irisRadius;
            const aa=dx*dx+dy*dy+dz*dz,bb=u*dx+v*dy+w*dz,cc=u*u+v*v+w*w-1;
            const disc=bb*bb-aa*cc;
            if(disc>=0){
              const z=(-bb+Math.sqrt(disc))/aa,nx=u+dx*z;
              if(z>depth&&nx>=0){
                const ny=v+dy*z,nz=w+dz*z;
                const viewNormal=(nx*xz/.22+(ny*yz+nz*zz)/irisRadius)/Math.hypot(nx/.22,ny/irisRadius,nz/irisRadius);
                const sheen=.045+.14*square(1-Math.max(0,viewNormal));
                const shine=.44*Math.exp(-140*(square(x-.58)+square(y-.18)));
                const amount=sheen+shine;
                if(alpha){red+=(181-red)*amount;green+=(220-green)*amount;blue+=(241-blue)*amount;}
                else {red=181;green=220;blue=241;alpha=255*amount;}
              }
            }
          }
          data[i]=red;data[i+1]=green;data[i+2]=blue;
          data[i+3]=alpha*Math.max(0,Math.min(1,(1-r2)*size/pixelSpan));
        }
      }
      ctx.putImageData(pixels,0,0);
    }
    function resize() {
      size=Math.min(208,Math.max(120,Math.round(root.clientWidth*Math.min(devicePixelRatio||1,1.45))));
      canvas.width=canvas.height=size;
      axis=Float32Array.from({length:size},(_,i)=>((i+.5)/size-.5)*pixelSpan);
      pixels=ctx.createImageData(size,size);
      render();
    }
    function tick(now) {
      frame=0;
      if(document.hidden||reduced.matches||!visible)return;
      if(!last||now-last>=1000/24){
        elapsed+=last?Math.min((now-last)/1000,.1):0;
        last=now;render();
      }
      frame=requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);frame=0;last=0;
      if(!document.hidden&&visible&&!reduced.matches)frame=requestAnimationFrame(tick);
      else if(!document.hidden&&visible)render();
    }
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener?.('change',sync);
    window.addEventListener('resize',resize,{passive:true});
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'100px'}).observe(root);
    }
    root.dataset.eyeReady='3d';
    resize();sync();
  }
})();
