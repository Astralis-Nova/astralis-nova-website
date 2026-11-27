import {regionFor,canWalkRegion} from './astralis-vr-worlds.js?v=028.0';

// Scene adapters own content and GPU resources. Holodeck owns the XR session,
// camera, locomotion and Nova, so travel never replaces the document/session.
export function createSpatialWorld(T,world,loader=new T.TextureLoader()) {
  if(!['rainbow','fathers','wild'].includes(world.id)) throw new Error('No spatial adapter for '+world.id);
  const group=new T.Group(),regions=[],motions=[],textures=new Set(),assets=new Map();
  group.name=world.name;let current=0,disposed=false;
  const pose=new T.Object3D();
  function material(color,extra={}) {return new T.MeshStandardMaterial({color,roughness:.94,...extra});}
  function mesh(parent,geometry,mat,x=0,y=0,z=0) {
    const result=new T.Mesh(geometry,mat);result.position.set(x,y,z);parent.add(result);return result;
  }
  function box(parent,w,h,d,mat,x=0,y=0,z=0) {return mesh(parent,new T.BoxGeometry(w,h,d),mat,x,y,z);}
  function texture(url,onReady=()=>{}) {
    const existing=assets.get(url);
    if(existing){
      if(existing.ready)queueMicrotask(()=>{if(!disposed)onReady(existing.texture);});
      else existing.callbacks.push(onReady);
      return existing.texture;
    }
    const entry={ready:false,texture:null,callbacks:[onReady]};assets.set(url,entry);
    const tex=loader.load(url,loaded=>{
      if(disposed){loaded.dispose();return;}
      loaded.colorSpace=T.SRGBColorSpace;entry.ready=true;
      for(const callback of entry.callbacks)callback(loaded);entry.callbacks.length=0;
    },undefined,()=>console.warn('VR source asset unavailable',url));
    tex.colorSpace=T.SRGBColorSpace;entry.texture=tex;textures.add(tex);return tex;
  }
  function instances(parent,geometry,mat,count,place) {
    const batch=new T.InstancedMesh(geometry,mat,count);parent.add(batch);
    for(let i=0;i<count;i++) {
      pose.position.set(0,0,0);pose.rotation.set(0,0,0);pose.scale.set(1,1,1);
      place(pose,i);pose.updateMatrix();batch.setMatrixAt(i,pose.matrix);
    }
    batch.computeBoundingSphere();return batch;
  }
  function photo(parent,url,width,height,x,y,z) {
    const mat=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide});
    const picture=mesh(parent,new T.PlaneGeometry(width,height),mat,x,y,z);
    picture.visible=false;picture.userData.sourceAsset=url;
    mat.map=texture(url,()=>{mat.needsUpdate=true;picture.visible=true;});
    return picture;
  }
  function sky(parent,top,horizon) {
    const dome=mesh(parent,new T.SphereGeometry(140,24,16),new T.ShaderMaterial({
      side:T.BackSide,depthWrite:false,
      uniforms:{top:{value:new T.Color(top)},horizon:{value:new T.Color(horizon)}},
      vertexShader:'varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`uniform vec3 top;uniform vec3 horizon;varying vec3 vDirection;
        void main(){float h=max(0.,normalize(vDirection).y);vec3 color=mix(horizon,top,pow(h,.55));
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        }`
    }));
    dome.renderOrder=5;
  }
  function ground(parent,color,roughness=.2) {
    const geo=new T.PlaneGeometry(120,120,64,64);geo.rotateX(-Math.PI/2);
    const p=geo.attributes.position,colors=[];
    for(let i=0;i<p.count;i++) {
      const x=p.getX(i),z=p.getZ(i),edge=Math.min(1,Math.max(0,(Math.abs(x)-4)/7));
      p.setY(i,-.06+edge*roughness*(Math.sin(x*.7+z*.28)+.5*Math.cos(z*.8)));
      const value=.76+.14*Math.sin(x*3.17+z*4.1)*Math.cos(x*.71-z*2.3);
      colors.push(value,value,value);
    }
    geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
    mesh(parent,geo,material(color,{vertexColors:true}));
  }
  function mountains(parent,color) {
    instances(parent,new T.IcosahedronGeometry(1,2),material(color),24,(p,i)=>{
      const a=i*Math.PI/12,r=48+i%4*8;p.position.set(Math.cos(a)*r,-2,Math.sin(a)*r);
      p.rotation.set(.1*i,i*.9,.2);p.scale.set(9+i%4*2,5+i%5*2,7+i%3*2);
    });
  }
  function trees(parent) {
    const locations=Array.from({length:36},(_,i)=>{
      const a=i*2.39996,r=12+i%6*4;return [Math.cos(a)*r,Math.sin(a)*r,2.7+i%4*.65];
    });
    instances(parent,new T.CylinderGeometry(.12,.22,1,7),material(0x65513f),36,(p,i)=>{
      const [x,z,h]=locations[i];p.position.set(x,h*.5,z);p.scale.y=h;
    });
    instances(parent,new T.IcosahedronGeometry(1,2),material(0x517456),72,(p,i)=>{
      const [x,z,h]=locations[i>>1];p.position.set(x+(i%2?-.5:.5),h+.55,z);p.scale.set(1.6,1.4,1.4);
    });
  }
  function flowers(parent) {
    const flowers=instances(parent,new T.IcosahedronGeometry(.12,1),material(0xffffff),170,(p,i)=>{
      const x=Math.sin(i*6.18)*(8+i%7*1.3),z=Math.cos(i*4.16)*(8+i%5*1.5);
      p.position.set(x,.25+i%3*.08,z);p.scale.set(1,.55,1);
    });
    [0xffd3e5,0xddc1ff,0xffe2a4].forEach((color,k)=>{
      for(let i=k;i<170;i+=3)flowers.setColorAt(i,new T.Color(color));
    });
  }
  function water(parent,width,depth,x,y,z,color=0x16465a) {
    const geo=new T.PlaneGeometry(width,depth,48,48);geo.rotateX(-Math.PI/2);
    const mat=new T.ShaderMaterial({uniforms:{time:{value:0},base:{value:new T.Color(color)}},
      vertexShader:`uniform float time;varying vec3 vWorld;varying vec3 vSurfaceNormal;
      void main(){vec3 p=position;float a=p.x*.65+p.z*.24+time*.8,b=p.z*.91-p.x*.31-time*.62;
      p.y+=.08*sin(a)+.045*sin(b);vSurfaceNormal=normalize(vec3(-.052*cos(a)+.014*cos(b),1.,-.019*cos(a)-.041*cos(b)));
      vWorld=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
      fragmentShader:`uniform vec3 base;varying vec3 vWorld;varying vec3 vSurfaceNormal;
      void main(){vec3 view=normalize(cameraPosition-vWorld),n=normalize(vSurfaceNormal);
      float fresnel=pow(1.-max(0.,dot(n,view)),3.);vec3 halfLight=normalize(view+normalize(vec3(-.5,.8,-.3)));
      float glint=pow(max(0.,dot(n,halfLight)),100.);vec3 color=mix(base,vec3(.48,.65,.72),fresnel*.7)+glint*vec3(.9,.77,.53);
      gl_FragColor=vec4(color,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`
    });
    const result=mesh(parent,geo,mat,x,y,z);motions.push({parent,tick:t=>mat.uniforms.time.value=t});return result;
  }
  function rainbow(parent) {
    const colors=[0xf48e93,0xf4b581,0xf5dfa4,0xaad9af,0x94c7ec,0xada6de,0xd1b2df];
    for(let i=0;i<7;i++) {
      const arc=mesh(parent,new T.TorusGeometry(28-i*.55,.28,5,96,Math.PI),
        new T.MeshBasicMaterial({color:colors[i],transparent:true,opacity:.3,depthWrite:false}),0,1,-48);
      arc.rotation.z=.06;
    }
  }
  function birds(parent) {
    const birds=[];
    for(let i=0;i<5;i++) {
      const mat=new T.SpriteMaterial({color:0xffffff,transparent:true,depthWrite:false,alphaTest:.025});
      const bird=new T.Sprite(mat);bird.visible=false;parent.add(bird);
      const path='/assets/rainbow-promise/'+(i===0?'raven':'dove')+'-flight-cycle.webp';
      const source=texture(path,()=>{mat.map.repeat.set(1/3,1/2);mat.map.needsUpdate=true;mat.needsUpdate=true;bird.visible=true;});
      mat.map=source.clone();textures.add(mat.map);
      bird.userData.sourceAsset=path;birds.push(bird);
    }
    motions.push({parent,tick:t=>birds.forEach((bird,i)=>{
      const a=t*(.07+i*.009)+i*1.8,r=11+i*3;
      bird.position.set(Math.cos(a)*r,5+i*.7+Math.sin(a*2)*1.4,Math.sin(a)*r);
      bird.scale.set(1.7,1.7,1);bird.material.rotation=Math.sin(a)*.15;
      const frame=Math.floor(t*(i===0?7:9)+i)%6;
      const flip=Math.sin(a)>0?-1:1;
      bird.material.map.repeat.set(flip/3,1/2);
      bird.material.map.offset.set((frame%3+(flip<0?1:0))/3,1-(Math.floor(frame/3)+1)/2);
    })});
  }
  function wood() {
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#805736';ctx.fillRect(0,0,256,256);
    for(let i=0;i<256;i++) {
      ctx.strokeStyle=i%20===0?'#382719':i%3===0?'#996d46':'#705035';ctx.lineWidth=i%20===0?2:.5;
      ctx.beginPath();ctx.moveTo(0,i);for(let x=0;x<=256;x+=8)ctx.lineTo(x,i+Math.sin(x*.025+i*7)*.8);ctx.stroke();
    }
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
    tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(3,8);textures.add(tex);
    return material(0xffffff,{map:tex,bumpMap:tex,bumpScale:.025});
  }
  function ark(parent) {
    const timber=wood(),dark=material(0x4b3020);
    const shape=new T.Shape();shape.moveTo(-4.3,0);shape.lineTo(4.3,0);shape.lineTo(3.2,-2.4);
    shape.quadraticCurveTo(0,-4,-3.2,-2.4);shape.closePath();
    mesh(parent,new T.ExtrudeGeometry(shape,{depth:26,bevelEnabled:true,bevelThickness:.6,bevelSize:.35,bevelSegments:2,steps:1}),timber,0,0,-13);
    box(parent,8.3,.18,26.5,timber,0,-.09,0);
    box(parent,5.2,2.65,8.4,timber,0,1.3,-3);
    const roof=box(parent,5.7,.25,9,timber,0,2.8,-3);roof.rotation.z=.025;
    for(const side of [-1,1]) {
      box(parent,.12,.12,25.5,timber,side*4,1.05,0);
      box(parent,.12,.12,25.5,timber,side*4,.52,0);
      for(let j=0;j<5;j++)box(parent,.03,.4,.65,dark,side*2.62,1.8,-6.1+j*1.55);
    }
    for(const z of [-12.7,12.7])box(parent,8,.12,.12,timber,0,1.05,z);
    instances(parent,new T.BoxGeometry(.11,1.1,.11),timber,34,(p,i)=>{
      p.position.set(i<17?-4:4,.55,-12.5+i%17*1.56);
    });
  }
  function buildRainbow(parent,index) {
    sky(parent,index===0?0x263f58:0x5286ac,0xc1d4d7);mountains(parent,0x637b7c);
    photo(parent,world.regions[index].art,112,62,0,21,-92);
    rainbow(parent);birds(parent);
    if(index===0) {water(parent,240,240,0,-3.55,0);ark(parent);}
    else {
      ground(parent,0x7b9a6a);trees(parent);flowers(parent);
      water(parent,150,100,0,-.27,-67,0x285d6b);
      const distant=new T.Group();distant.position.set(27,-.6,-43);distant.scale.setScalar(.65);distant.rotation.y=-.4;parent.add(distant);ark(distant);
    }
  }
  function buildFathers(parent,index) {
    sky(parent,index===0?0x25274f:0x7b92a5,index===0?0xd6c0b1:0xdfcdae);
    ground(parent,index===0?0x60775c:0x9d8b70,.1);mountains(parent,index===0?0x657476:0x8e8777);
    if(index===0) {
      photo(parent,world.regions[index].art,100,66,0,26,-78);trees(parent);flowers(parent);
      water(parent,4,110,3,-.17,0,0x376b76);
      const bridgeWood=wood();box(parent,6,.14,3.5,bridgeWood,3,.015,7);
      for(const z of [5.3,8.7])box(parent,6,.09,.09,bridgeWood,3,.9,z);
      for(const x of [0,2,4,6])for(const z of [5.3,8.7])box(parent,.1,.9,.1,bridgeWood,x,.45,z);
      const cliff=material(0x8d9288);box(parent,6,9,4,cliff,3,4,-24);
      const fall=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0}},
        vertexShader:'varying vec2 vUV;void main(){vUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:`uniform float time;varying vec2 vUV;void main(){float lines=sin(vUV.x*145.+sin(vUV.y*20.+time*6.));
          float mist=sin(vUV.y*55.+time*9.+vUV.x*10.);gl_FragColor=vec4(.65,.84,.86,.38+.13*lines+.09*mist);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`});
      mesh(parent,new T.PlaneGeometry(4.5,8.8),fall,3,4.4,-21.9);
      motions.push({parent,tick:t=>fall.uniforms.time.value=t});
    } else {
      const rock=material(0x9c8b75,{flatShading:true});
      instances(parent,new T.IcosahedronGeometry(1,1),rock,13,(p,i)=>{
        const a=i*Math.PI/12;p.position.set(Math.cos(a)*4.7,Math.sin(a)*5,-7.8);
        p.scale.set(1.5,1.5,2);p.rotation.set(i*.3,i*.7,i*.13);
      });
      photo(parent,world.regions[index].art,7.5,5.5,0,2.7,-8.8);
      const stone=mesh(parent,new T.CylinderGeometry(2.1,2.1,.6,24),rock,7,1.7,-5);
      stone.rotation.z=Math.PI/2;stone.rotation.y=-.2;
      photo(parent,'/assets/lazarus-restored-v2.webp',3,4,-7,2.1,-4);
    }
  }
  function ocotillos(parent) {
    const stems=material(0x5c5941);
    instances(parent,new T.CylinderGeometry(.025,.07,1,6),stems,112,(p,i)=>{
      const plant=Math.floor(i/8),a=plant*2.39996,r=9+plant%4*4,b=i%8;
      const height=2.7+b%3*.5,angle=(b-3.5)*.12;
      p.position.set(Math.cos(a)*r+Math.sin(angle)*height*.5,height*.5,Math.sin(a)*r+(b%3-1)*.25);
      p.scale.y=height;p.rotation.z=-angle;p.rotation.x=(b%3-1)*.11;
    });
    instances(parent,new T.IcosahedronGeometry(.06,0),material(0x749054),160,(p,i)=>{
      const plant=Math.floor(i/12),a=plant*2.39996,r=9+plant%4*4;
      p.position.set(Math.cos(a)*r+Math.sin(i*2)*.7,.7+i%8*.32,Math.sin(a)*r+Math.cos(i*3)*.3);p.scale.set(.6,1.5,.6);
    });
  }
  function buildWild(parent,index) {
    sky(parent,0x4b7795,0xe1c69e);ground(parent,0xa48e6b,.23);mountains(parent,0x847d6b);ocotillos(parent);
    instances(parent,new T.DodecahedronGeometry(.35,0),material(0x84755f),55,(p,i)=>{
      const a=i*2.39996,r=5+i%9;p.position.set(Math.cos(a)*r,.06,Math.sin(a)*r);p.scale.set(1.5,.5,1);p.rotation.y=i;
    });
    if(index===0) {
      // Enlarged illustrative workers; the source log keeps species identification tentative.
      const antGroup=new T.Group();parent.add(antGroup);
      const ants=new T.InstancedMesh(new T.SphereGeometry(.065,7,5),material(0x342f29),36*3);
      const leaves=new T.InstancedMesh(new T.SphereGeometry(.12,6,4),material(0x78934f),36);
      ants.instanceMatrix.setUsage(T.DynamicDrawUsage);leaves.instanceMatrix.setUsage(T.DynamicDrawUsage);
      ants.frustumCulled=leaves.frustumCulled=false;antGroup.add(ants,leaves);
      motions.push({parent,tick:t=>{
        for(let i=0;i<36;i++) {
          const x=((i*.45+t*.23)%16)-8,z=-2+Math.sin(x*.7)*.65;
          for(let body=0;body<3;body++) {
            pose.position.set(x+body*.075,.08+Math.sin(t*14+i)*.008,z);pose.rotation.set(0,0,0);pose.scale.set(body===2?1.25:1,.75,1);
            pose.updateMatrix();ants.setMatrixAt(i*3+body,pose.matrix);
          }
          pose.position.set(x+.08,.23,z);pose.scale.set(.7,1,.16);pose.rotation.set(.3,0,.55);pose.updateMatrix();leaves.setMatrixAt(i,pose.matrix);
        }
        ants.instanceMatrix.needsUpdate=leaves.instanceMatrix.needsUpdate=true;
      }});
    } else {
      const mat=new T.SpriteMaterial({transparent:true,depthWrite:false,alphaTest:.02});
      const cricket=new T.Sprite(mat);cricket.visible=false;parent.add(cricket);
      mat.map=texture('/wild-media/jimmitty-cutout-v1.webp',()=>{mat.needsUpdate=true;cricket.visible=true;});
      cricket.scale.set(.6,.8,1);cricket.userData.sourceAsset='/wild-media/jimmitty-cutout-v1.webp';
      motions.push({parent,tick:t=>{
        const hop=Math.max(0,Math.sin(t*2.2));cricket.position.set(Math.sin(t*.2)*3,.42+hop*hop*.7,-2+Math.cos(t*.2));
        cricket.material.rotation=Math.sin(t*2.2)*.04;
      }});
    }
  }
  world.regions.forEach((region,index)=>{
    const child=new T.Group();child.name=region.name;child.visible=index===0;group.add(child);regions.push(child);
    if(world.id==='rainbow')buildRainbow(child,index);
    else if(world.id==='fathers')buildFathers(child,index);
    else buildWild(child,index);
  });
  return {
    group,world,
    get regionIndex(){return current;},
    get region(){return regionFor(world,current);},
    setRegion(index=0){const next=regionFor(world,index);current=world.regions.indexOf(next);regions.forEach((r,i)=>r.visible=i===current);return next;},
    canWalk(x,z){return canWalkRegion(regionFor(world,current),x,z);},
    update(time){if(!disposed)for(const motion of motions)if(motion.parent===regions[current])motion.tick(time);},
    dispose(){
      if(disposed)return;disposed=true;group.removeFromParent();
      const geometries=new Set(),materials=new Set();
      group.traverse(object=>{
        if(object.geometry)geometries.add(object.geometry);
        for(const mat of [object.material].flat().filter(Boolean))materials.add(mat);
        if(object.isInstancedMesh)object.dispose();
      });
      for(const geo of geometries)geo.dispose();for(const mat of materials)mat.dispose();for(const tex of textures)tex.dispose();
      group.clear();motions.length=0;assets.clear();
    }
  };
}
