// WebXR gamepad axes: up/forward is negative Y; right is positive X.
// Keep the same convention on the ship and in every planet scene.
export function readStick(gamepad) {
  const axes=gamepad?.axes;if(!axes||axes.length<2)return [0,0];
  const offset=axes.length>=4?2:0;
  const value=i=>Number.isFinite(axes[i])?Math.max(-1,Math.min(1,axes[i])):0;
  return [value(offset),value(offset+1)];
}

export function walkDisplacement(x,y,forwardX,forwardZ,speed,seconds) {
  const magnitude=Math.hypot(x,y),heading=Math.hypot(forwardX,forwardZ);
  if(![x,y,forwardX,forwardZ,speed,seconds].every(Number.isFinite)||magnitude<=.22||heading<.001||seconds<=0)return [0,0];
  const distance=Math.max(0,speed)*Math.min(.05,seconds)*Math.min(1,(magnitude-.22)/.78);
  const fx=forwardX/heading,fz=forwardZ/heading;
  return [(-fz*x-fx*y)/magnitude*distance,(fx*x-fz*y)/magnitude*distance];
}
