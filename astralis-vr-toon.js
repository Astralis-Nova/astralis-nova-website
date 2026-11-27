// Foreground refinements use the existing Cactus Forest, burrow and ocean scenes.
export function buildSaguaros(T,parent,sites,material) {
  const trunkGeometry=new T.CapsuleGeometry(1,1,5,20),p=trunkGeometry.attributes.position;
  for(let i=0;i<p.count;i++){
    const angle=Math.atan2(p.getZ(i),p.getX(i)),rib=.985+.035*Math.cos(angle*14);
    p.setX(i,p.getX(i)*rib);p.setZ(i,p.getZ(i)*rib);
  }
  trunkGeometry.computeVertexNormals();
  const armGeometry=new T.TubeGeometry(new T.CatmullRomCurve3([
    new T.Vector3(0,0,0),new T.Vector3(.17,.02,0),new T.Vector3(.27,.15,0),new T.Vector3(.27,.42,0)
  ]),20,.055,10,false);
  const trunks=new T.InstancedMesh(trunkGeometry,material,sites.length);
  const arms=new T.InstancedMesh(armGeometry,material,sites.length*2);
  const tips=new T.InstancedMesh(new T.SphereGeometry(.055,10,8),material,sites.length*2);
  const pose=new T.Object3D();parent.add(trunks,arms,tips);
  for(let i=0;i<sites.length;i++){
    const {x,z,h}=sites[i],radius=h*.078;pose.rotation.set(0,0,0);pose.position.set(x,h*.5,z);pose.scale.set(radius,h/3,radius);
    pose.updateMatrix();trunks.setMatrixAt(i,pose.matrix);
    for(let side=0;side<2;side++){
      const sign=side?1:-1,y=h*(side ? .53 : .39),height=h*(side ? .85 : .7),index=i*2+side;
      pose.position.set(x+sign*radius*.7,y,z);pose.rotation.set(0,side?0:Math.PI,0);pose.scale.setScalar(height);
      pose.updateMatrix();arms.setMatrixAt(index,pose.matrix);
      pose.position.set(x+sign*(radius*.7+.27*height),y+.42*height,z);pose.rotation.set(0,0,0);
      pose.updateMatrix();tips.setMatrixAt(index,pose.matrix);
    }
  }
  for(const object of [trunks,arms,tips])object.computeBoundingSphere();
  return {trunks,arms,tips};
}

export function toonSurfaceDetail(material,kind) {
  const time={value:0};
  material.onBeforeCompile=shader=>{
    shader.uniforms.toonTime=time;
    shader.vertexShader='varying vec3 vToonWorld;uniform float toonTime;\n'+shader.vertexShader;
    const bend=kind==='kelp'?'transformed.x+=sin(toonTime*1.1+position.z*.8)*pow(max(0.,position.y)/3.,2.)*.13;':'';
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',bend+`
      vec4 toonLocal=vec4(transformed,1.);
      #ifdef USE_INSTANCING
      toonLocal=instanceMatrix*toonLocal;
      #endif
      vToonWorld=(modelMatrix*toonLocal).xyz;
      #include <project_vertex>`);
    shader.fragmentShader='varying vec3 vToonWorld;uniform float toonTime;\n'+shader.fragmentShader;
    const color=kind==='ocean'?`
      float a=sin(vToonWorld.x*1.4+sin(vToonWorld.z*.7+toonTime*.3));
      float b=sin(vToonWorld.z*1.6+cos(vToonWorld.x*.8-toonTime*.28));
      float net=pow(1.-min(1.,abs(a*b)*3.),5.);
      diffuseColor.rgb*=.84+net*.22;diffuseColor.rgb+=net*vec3(.04,.055,.035);`
      :kind==='soil'?`
      float strata=.5+.5*sin(vToonWorld.y*7.+sin(vToonWorld.z*.6)*.9);
      float grit=sin(dot(vToonWorld,vec3(37.,43.,29.)))*cos(vToonWorld.z*53.);
      diffuseColor.rgb*=.83+strata*.15+grit*.045;`:'';
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+color);
  };
  material.customProgramCacheKey=()=> 'toon-029-'+kind;
  return seconds=>time.value=seconds;
}
