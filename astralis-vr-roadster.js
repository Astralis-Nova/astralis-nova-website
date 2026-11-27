// Use the exact red Roadster/Starman artwork from the homepage.
// This is a spatially placed transparent image, not a claimed full 3D car model.
export const ROADSTER_ART='/assets/starman-roadster.webp';

export function roadsterPose(seconds) {
  const t=Number.isFinite(seconds)?seconds:0;
  return {
    x:11.5+Math.sin(t*.075)*.9,
    y:2.4+Math.sin(t*.19+.6)*.45,
    z:5.0+Math.cos(t*.075)*2.6,
    roll:Math.sin(t*.12)*.12,
    width:4.2,height:4.2*315/720
  };
}

export function createDockRoadster(T,parent,loader) {
  const group=new T.Group();group.name='Red Roadster and Starman · starboard space dock';parent.add(group);
  const material=new T.SpriteMaterial({transparent:true,alphaTest:.035,depthWrite:false,color:0xffffff});
  const car=new T.Sprite(material);car.visible=false;car.userData.sourceAsset=ROADSTER_ART;group.add(car);
  let disposed=false;
  const texture=loader.load(ROADSTER_ART,loaded=>{
    if(disposed){loaded.dispose();return;}
    loaded.colorSpace=T.SRGBColorSpace;material.map=loaded;material.needsUpdate=true;car.visible=true;
  },undefined,error=>console.warn('Roadster artwork unavailable',error));
  function update(time){const p=roadsterPose(time);group.position.set(p.x,p.y,p.z);car.scale.set(p.width,p.height,1);material.rotation=p.roll;}
  update(0);
  return {group,car,update,dispose(){if(disposed)return;disposed=true;group.removeFromParent();texture.dispose();material.dispose();}};
}
