// Use the exact red Roadster/Starman artwork from the homepage.
// This is a spatially placed transparent image, not a claimed full 3D car model.
export const ROADSTER_ART='/assets/starman-roadster.webp';

export function roadsterPose(seconds) {
  const t=Number.isFinite(seconds)?seconds:0;
  const angle=.48+t*.027;
  return {
    x:22*Math.sin(angle),
    y:3.7+Math.sin(t*.075+.6)*.85,
    z:2-24*Math.cos(angle),
    dx:22*.027*Math.cos(angle),
    dy:.85*.075*Math.cos(t*.075+.6),
    dz:24*.027*Math.sin(angle),
    roll:Math.sin(t*.12)*.12,
    width:4.8,height:4.8*315/720
  };
}

export function createDockRoadster(T,parent,loader) {
  const group=new T.Group();group.name='Red Roadster and Starman · exterior orbit';parent.add(group);
  const material=new T.SpriteMaterial({transparent:true,alphaTest:.035,depthWrite:false,color:0xffffff});
  const car=new T.Sprite(material);car.visible=false;car.userData.sourceAsset=ROADSTER_ART;group.add(car);
  let disposed=false;
  const texture=loader.load(ROADSTER_ART,loaded=>{
    if(disposed){loaded.dispose();return;}
    loaded.colorSpace=T.SRGBColorSpace;material.map=loaded;material.needsUpdate=true;car.visible=true;
  },undefined,error=>console.warn('Roadster artwork unavailable',error));
  const velocity=new T.Vector3(),worldVelocity=new T.Vector3(),screenRight=new T.Vector3();
  // The artwork faces left. Mirror it when the orbit carries it right across the viewer's field of view.
  car.onBeforeRender=(_renderer,_scene,camera)=>{
    worldVelocity.copy(velocity).transformDirection(parent.matrixWorld);
    screenRight.setFromMatrixColumn(camera.matrixWorld,0).normalize();
    const lateral=worldVelocity.dot(screenRight);
    if(Math.abs(lateral)<.04)return;
    texture.repeat.x=lateral>0?-1:1;
    texture.offset.x=lateral>0?1:0;
    texture.updateMatrix();
  };
  function update(time){const p=roadsterPose(time);velocity.set(p.dx,p.dy,p.dz);group.position.set(p.x,p.y,p.z);car.scale.set(p.width,p.height,1);material.rotation=p.roll;}
  update(0);
  return {group,car,update,dispose(){if(disposed)return;disposed=true;group.removeFromParent();texture.dispose();material.dispose();}};
}
