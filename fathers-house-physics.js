/* Object state is simulated first; renderers consume positions and surface normals. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FathersHousePhysics=api;})(typeof window!=='undefined'?window:globalThis,()=>{
  'use strict';
  class Stem {
    constructor(x,y,height,seed=0){this.x=x;this.y=y;this.height=height;this.seed=seed;this.count=6;this.angle=new Float64Array(6);this.velocity=new Float64Array(6);}
    step(dt,wind){
      const steps=Math.max(1,Math.ceil(dt/(1/120))),h=Math.min(dt,.1)/steps;
      for(let step=0;step<steps;step++)for(let j=0;j<this.count;j++){
        const t=(j+1)/this.count,k=100-65*t;
        const torque=wind*(1.1+2*t*t);
        this.velocity[j]+=(torque-k*this.angle[j]-8*this.velocity[j])*h;
        this.angle[j]+=this.velocity[j]*h;
        this.angle[j]=Math.max(-.075,Math.min(.075,this.angle[j]));
      }
    }
    points(){const points=[{x:this.x,y:this.y,angle:0}];let x=this.x,y=this.y,angle=0;const length=this.height/this.count;
      for(let j=0;j<this.count;j++){angle+=this.angle[j];x+=Math.sin(angle)*length;y-=Math.cos(angle)*length;points.push({x,y,angle});}return points;}
  }
  class WaterSurface {
    constructor(width=72,height=44){this.width=width;this.height=height;this.h=new Float32Array(width*height);this.v=new Float32Array(width*height);this.next=new Float32Array(width*height);}
    disturb(x,y,amount){const ix=Math.round(x*(this.width-1)),iy=Math.round(y*(this.height-1));
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const px=ix+dx,py=iy+dy;if(px>0&&px<this.width-1&&py>0&&py<this.height-1)this.v[py*this.width+px]+=amount*Math.exp(-(dx*dx+dy*dy)*.5);}}
    step(dt){const steps=Math.max(1,Math.ceil(Math.min(dt,.1)*120)),h=Math.min(dt,.1)/steps,w=this.width,damping=Math.exp(-1.3*h);
      for(let s=0;s<steps;s++){
        for(let y=1;y<this.height-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,lap=this.h[i-1]+this.h[i+1]+this.h[i-w]+this.h[i+w]-4*this.h[i];this.next[i]=(this.v[i]+lap*90*h)*damping;}
        for(let y=1;y<this.height-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;this.v[i]=this.next[i];this.h[i]+=this.v[i]*h;}
      }
    }
    energy(){let total=0;for(let i=0;i<this.h.length;i++)total+=this.h[i]*this.h[i]+this.v[i]*this.v[i];return total;}
  }
  function wind(time,x,seed=0){return .5*Math.sin(time*.83+x*.006+seed)+.28*Math.sin(time*1.39+seed*2.1)+.2*Math.sin(time*.27+x*.013);}
  return {Stem,WaterSurface,wind};
});
