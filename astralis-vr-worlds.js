// Shared registry for normal-page links and immersive scene destinations.
export const vrWorlds = Object.freeze({
  toon: Object.freeze({id:'toon',name:'Toon Planet',path:'/toon-planet.html',regions:[
    {id:'space',name:'Orbit',art:'/assets/our-new-star/deep-universe.webp',layers:[],color:0x061329,description:'We are in orbit above Cactus Forest.'},
    {id:'surface',name:'Cactus Forest Moonlight',art:'/cover-3.jpg',layers:['.surface-brush-motion','.surface-desert-chase'],color:0x182334,description:'Explore the desert and its living scenery.'},
    {id:'underground',name:'Desert Burrows',art:'/assets/toon-planet/cactus-forest-burrow-empty.webp',layers:['.burrow-wildlife'],color:0x30241e,description:'Discover wildlife beneath the surface.'},
    {id:'ocean',name:'Hidden Ocean',art:'/assets/toon-planet/bikini-bottom-ocean.webp',layers:['.ocean-water'],color:0x073d57,description:'Welcome to the hidden ocean and animated underwater village.'}
  ]}),
  rainbow: Object.freeze({id:'rainbow',name:'Rainbow Promise',path:'/rainbow-promise.html',regions:[
    {id:'flood',name:'After the Flood',art:'/assets/rainbow-promise/ancient-flood-landscape-clean.webp',layers:[],color:0x91c9ef}
  ]})
});
export function worldForPath(path){return Object.values(vrWorlds).find(w=>w.path===path)||null;}
export function requestedWorld(search){const p=new URLSearchParams(search),world=vrWorlds[p.get('world')];if(!world||!Object.hasOwn(vrWorlds,p.get('world')))return null;return {world,region:Math.max(0,world.regions.findIndex(r=>r.id===p.get('region')))};}
