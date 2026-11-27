// This adapter is inert on the public page. In a same-origin Holodeck source
// iframe, its existing canvas scripts are driven by the XR animation loop.
(() => {
  'use strict';
  if(new URLSearchParams(location.search).get('holodeck-source')!=='1'||window.parent===window)return;
  try {if(window.parent.location.origin!==location.origin)return;}catch{return;}
  const nativeRequest=window.requestAnimationFrame,nativeCancel=window.cancelAnimationFrame;
  const NativeObserver=window.IntersectionObserver,callbacks=new Map(),observers=new Set();
  let serial=0,disposed=false;
  window.requestAnimationFrame=callback=>{const id=++serial;callbacks.set(id,callback);return id;};
  window.cancelAnimationFrame=id=>callbacks.delete(id);
  // Browser intersection delivery can sleep with the hidden 2D document, too.
  // Keep the original scripts' offscreen pausing by computing source visibility.
  class SourceObserver {
    constructor(callback,options={}){this.callback=callback;this.targets=new Map();this.root=options.root||null;this.rootMargin=options.rootMargin||'0px';this.thresholds=[0];observers.add(this);}
    observe(target){this.targets.set(target,null);}
    unobserve(target){this.targets.delete(target);}
    disconnect(){this.targets.clear();observers.delete(this);}
    takeRecords(){return [];}
    update(now){
      const entries=[];
      for(const [target,last] of this.targets){
        const rect=target.getBoundingClientRect();
        const visible=rect.bottom>0&&rect.top<innerHeight&&rect.right>0&&rect.left<innerWidth&&rect.width>0&&rect.height>0;
        if(last===visible)continue;this.targets.set(target,visible);
        entries.push({target,isIntersecting:visible,intersectionRatio:visible?1:0,boundingClientRect:rect,time:now});
      }
      if(entries.length)this.callback(entries,this);
    }
  }
  window.IntersectionObserver=SourceObserver;
  const api={
    tick(){
      if(disposed)return;
      const now=performance.now();
      for(const observer of observers)observer.update(now);
      // Snapshot first: callbacks scheduled by this frame belong to the next one.
      for(const [id,callback] of [...callbacks]){
        if(!callbacks.has(id))continue;callbacks.delete(id);
        try{callback(now);}catch(error){console.warn('Original world animation',error);}
      }
    },
    setRegion(id){const region=document.getElementById(id);if(region)window.scrollTo({top:region.offsetTop,behavior:'instant'});},
    dispose(){
      if(disposed)return;disposed=true;callbacks.clear();observers.clear();
      window.requestAnimationFrame=nativeRequest;window.cancelAnimationFrame=nativeCancel;
      window.IntersectionObserver=NativeObserver;delete window.astralisVRSource;
    }
  };
  window.astralisVRSource=api;window.addEventListener('pagehide',api.dispose,{once:true});
})();
