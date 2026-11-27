// NASA VTAD Bennu/Eros meshes, with an artistic, accelerated galaxy visualization.
// Sources and the distinction between observations and animation: assets/deep-space/NASA-SOURCES.md.
export function seededRandom(seed) {
  return ()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
}

export function starCatalogue(count,seed=29471) {
  const random=seededRandom(seed),positions=[],colors=[],sizes=[],brightness=[];
  for(let i=0;i<count;i++) {
    const angle=random()*Math.PI*2;
    // A dense galactic band among a sparser, almost spherical field.
    const latitude=i%4===0?(random()+random()+random()-1.5)*.16:random()*2-1;
    const radius=180+random()*90,plane=Math.sqrt(1-latitude*latitude);
    const x=radius*plane*Math.cos(angle),y=radius*latitude,z=radius*plane*Math.sin(angle);
    positions.push(x,y*.88-z*.48,y*.48+z*.88);
    const spectral=random(),color=spectral<.14?[.75,.83,1]:spectral>.78?[1,.83,.65]:[.97,.97,1];
    colors.push(...color);sizes.push(.85+Math.pow(random(),7)*3.5);
    brightness.push(.22+Math.pow(random(),2)*.78);
  }
  return {positions,colors,sizes,brightness};
}

function points(T,data) {
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));
  geometry.setAttribute('starColor',new T.Float32BufferAttribute(data.colors,3));
  geometry.setAttribute('starSize',new T.Float32BufferAttribute(data.sizes,1));
  geometry.setAttribute('brightness',new T.Float32BufferAttribute(data.brightness,1));
  const tint=new T.Color(0xffffff);
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,
    uniforms:{tint:{value:tint}},
    vertexShader:`attribute vec3 starColor;attribute float starSize;attribute float brightness;
      varying vec3 vColor;varying float vBrightness;
      void main(){vec4 p=modelViewMatrix*vec4(position,1.);vColor=starColor;vBrightness=brightness;
      gl_Position=projectionMatrix*p;gl_PointSize=clamp(starSize*200./max(1.,-p.z),.75,5.5);}`,
    fragmentShader:`uniform vec3 tint;varying vec3 vColor;varying float vBrightness;
      void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
      float core=exp(-r*r*7.);gl_FragColor=vec4(vColor*tint,(core*.85+(1.-smoothstep(.05,1.,r))*.15)*vBrightness);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`
  });
  material.color=tint;return new T.Points(geometry,material);
}

export function createStarField(T,count=6800,seed=29471) {
  const stars=points(T,starCatalogue(count,seed));stars.name='Fixed distant star field';return stars;
}

export function galaxyCatalogue(count,seed=29112) {
  const random=seededRandom(seed),positions=[],colors=[],sizes=[],brightness=[];
  for(let i=0;i<count;i++) {
    const bulge=i<count*.15,r=bulge?Math.pow(random(),1.4)*11:8+Math.pow(random(),.62)*55;
    const arm=i%2*Math.PI,scatter=(random()+random()-1)*(.23+r*.002);
    const angle=bulge?random()*Math.PI*2:arm+Math.log((r+10)/18)*2.5+scatter+.08*Math.sin(r*.18+arm);
    const thickness=(random()+random()+random()-1.5)*(bulge?6:1.6);
    positions.push(Math.cos(angle)*r,thickness,Math.sin(angle)*r);
    const warmth=bulge||r<11;
    colors.push(...(warmth?[1,.78+random()*.13,.51+random()*.17]:random()<.1?[.93,.56,.72]:[.55+random()*.23,.74+random()*.18,1]));
    sizes.push(warmth?1.2+random()*1.5:.85+Math.pow(random(),4)*2.2);
    brightness.push(warmth?.38+random()*.45:.15+random()*.7);
  }
  return {positions,colors,sizes,brightness};
}

export function createDeepSpace(T,parent,modelLoader,onStatus=()=>{}) {
  const rotor=new T.Group(),galaxy=new T.Group(),batches=[],resources=[];
  galaxy.name='Rotating stellar spiral';galaxy.position.set(12,19,-146);galaxy.rotation.set(.92,0,.16);
  rotor.add(points(T,galaxyCatalogue(7600)));galaxy.add(rotor);parent.add(galaxy);
  const pose=new T.Object3D();let disposed=false,loaded=0;
  const models=[['Bennu','/assets/deep-space/nasa-bennu.glb',28],['Eros','/assets/deep-space/nasa-eros.glb',20]];
  const ready=Promise.all(models.map(([name,url,count],family)=>new Promise(resolve=>{
    modelLoader.load(url,gltf=>{
      if(disposed){gltf.scene.traverse(o=>{o.geometry?.dispose();for(const m of [o.material].flat().filter(Boolean)){m.map?.dispose();m.normalMap?.dispose();m.dispose();}});resolve(false);return;}
      gltf.scene.updateMatrixWorld(true);
      const bounds=new T.Box3().setFromObject(gltf.scene),center=bounds.getCenter(new T.Vector3());
      const radius=bounds.getBoundingSphere(new T.Sphere()).radius;
      gltf.scene.traverse(object=>{
        if(!object.isMesh)return;
        const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
        geometry.translate(-center.x,-center.y,-center.z).scale(1/radius,1/radius,1/radius);
        const material=(Array.isArray(object.material)?object.material[0]:object.material).clone();
        material.metalness=0;material.roughness=1;material.emissive?.setHex(0);
        material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <aomap_fragment>',
          '#include <aomap_fragment>\nreflectedLight.indirectDiffuse*=0.08;reflectedLight.directDiffuse*=0.55;');};
        material.customProgramCacheKey=()=> 'nasa-regolith-029';
        const mesh=new T.InstancedMesh(geometry,material,count);mesh.name='NASA '+name+' asteroid field';
        mesh.frustumCulled=false;mesh.visible=false;mesh.userData={source:url,asteroid:name};parent.add(mesh);
        batches.push({mesh,family,count});resources.push(geometry,material);
        if(material.map)resources.push(material.map);if(material.normalMap)resources.push(material.normalMap);
        object.geometry.dispose();object.material.dispose();
      });
      loaded++;onStatus({loaded,total:models.length});resolve(true);
    },undefined,error=>{console.warn('NASA asteroid model',name,error);onStatus({loaded,total:models.length,error:name});resolve(false);});
  })));
  function update(time) {
    // Deliberately accelerated for exploration; not the physical rotation rate of a galaxy.
    rotor.rotation.y=time*.017;
    for(const {mesh,family,count} of batches) {
      for(let j=0;j<count;j++) {
        const i=j+family*29;
        // Evenly sample latitude in each family; stagger the two sets in longitude.
        const latitude=Math.asin(2*(j+.5)/count-1);
        const angle=i*2.399963+time*(.009+family*.002);
        const distance=48+(i%8)*4;
        const horizontal=distance*Math.cos(latitude);
        pose.position.set(horizontal*Math.cos(angle),distance*Math.sin(latitude),horizontal*Math.sin(angle));
        pose.rotation.set(i*.53+time*.055,i*.39+time*.07,i*.73-time*.035);
        pose.scale.setScalar(1.15+(i%6)*.48);
        pose.updateMatrix();mesh.setMatrixAt(j,pose.matrix);
      }
      mesh.instanceMatrix.needsUpdate=true;mesh.visible=true;
    }
  }
  return {galaxy,batches,ready,update,
    dispose(){if(disposed)return;disposed=true;galaxy.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});galaxy.removeFromParent();
      for(const {mesh} of batches){mesh.dispose();mesh.removeFromParent();}for(const resource of new Set(resources))resource.dispose();}
  };
}
