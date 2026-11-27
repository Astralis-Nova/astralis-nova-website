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

export function createViewerPose(T,renderer,rig,camera) {
  const trackedHead=new T.Matrix4().makeTranslation(0,1.65,0);
  const worldCamera=new T.PerspectiveCamera();worldCamera.matrixAutoUpdate=false;
  return {
    capture(frame){
      const reference=renderer.xr.getReferenceSpace?.();
      if(!frame||!reference)return false;
      const pose=frame.getViewerPose(reference);
      if(!pose?.transform?.matrix)return false;
      trackedHead.fromArray(pose.transform.matrix);return true;
    },
    getView(){
      if(!renderer.xr.isPresenting)return camera;
      // ArrayCamera is detached from the rig. Calling getWorldPosition or
      // getWorldQuaternion on it recomputes its matrix without the rig parent.
      // Compose the canonical center-eye tracking pose with the rig explicitly.
      rig.updateWorldMatrix(true,false);
      worldCamera.matrix.multiplyMatrices(rig.matrixWorld,trackedHead);
      worldCamera.matrix.decompose(worldCamera.position,worldCamera.quaternion,worldCamera.scale);
      worldCamera.matrixWorld.copy(worldCamera.matrix);
      worldCamera.matrixWorldInverse.copy(worldCamera.matrixWorld).invert();
      const xrCamera=renderer.xr.getCamera();
      worldCamera.projectionMatrix.copy(xrCamera.projectionMatrix);
      worldCamera.projectionMatrixInverse.copy(worldCamera.projectionMatrix).invert();
      return worldCamera;
    },
    placeAt(spawn){
      rig.rotation.set(0,0,0);rig.position.fromArray(spawn);
      if(renderer.xr.isPresenting){
        const eye=this.getView().getWorldPosition(new T.Vector3());
        rig.position.x+=spawn[0]-eye.x;rig.position.z+=spawn[2]-eye.z;
      }
    },
    reset(){trackedHead.makeTranslation(0,1.65,0);}
  };
}
