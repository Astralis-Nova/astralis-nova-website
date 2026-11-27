// The normal pages remain the source of artwork, stories and character identity.
// Only worlds with a scene adapter belong here; a web-page capture is not a world.
export const HOLODECK_VERSION = '032.0';

function world(data) {
  return Object.freeze({...data, regions:Object.freeze(data.regions.map(region => Object.freeze(region)))});
}

export const vrWorlds = Object.freeze({
  emerald: world({
  "id": "emerald",
  "name": "Emerald Wisdom",
  "path": "/emerald-wisdom.html",
  "engine": "spatial",
  "color": 3168061,
  "aliases": [
    "emerald wisdom",
    "emerald",
    "living grove"
  ],
  "regions": [
    {
      "id": "grove",
      "name": "Living Grove",
      "art": "/assets/emerald-wisdom/grove-v1.webp",
      "color": 3168061,
      "spawn": [
        0,
        0,
        6
      ],
      "bounds": [
        -7,
        7,
        -5,
        9
      ],
      "description": "Walk through the forest to meet the deer and elephant. Select a reading stand to hear its teaching through Nova."
    }
  ]
}),
  first: world({
  "id": "first",
  "name": "First Orbit",
  "path": "/first-orbit.html",
  "engine": "spatial",
  "color": 1517382,
  "aliases": [
    "first orbit",
    "first orbit archive"
  ],
  "regions": [
    {
      "id": "archive",
      "name": "Echoes From the First Orbit",
      "art": "/assets/home-planets/first-orbit-384.webp",
      "color": 1517382,
      "spawn": [
        0,
        0,
        6
      ],
      "bounds": [
        -7,
        7,
        -5,
        9
      ],
      "description": "Explore the orbital archive. The exhibits recall the recovered MIDI collection and Sandy’s Angels."
    }
  ]
}),
  scripture: world({
  "id": "scripture",
  "name": "Scripture Nexus",
  "path": "/scripture-nexus.html",
  "engine": "spatial",
  "color": 5325911,
  "aliases": [
    "scripture nexus",
    "scripture",
    "reading hall"
  ],
  "regions": [
    {
      "id": "hall",
      "name": "Scripture Reading Hall",
      "art": "/scripture-nexus-bg.webp",
      "color": 5325911,
      "spawn": [
        0,
        0,
        6
      ],
      "bounds": [
        -7,
        7,
        -5,
        9
      ],
      "description": "Welcome to the reading hall. Select a lectern for a passage from the Scripture Nexus."
    }
  ]
}),
  toon: world({id:'toon', name:'Toon Planet', path:'/toon-planet.html', engine:'toon', color:0xca63f1, aliases:['toon','tune'], regions:[
    {id:'space', name:'Orbit', art:'/assets/our-new-star/deep-universe.webp', layers:[], color:0x061329, description:'We are in orbit above Cactus Forest. Ask for the next region to descend to the desert.'},
    {id:'surface', name:'Cactus Forest Moonlight', art:'/cover-3.jpg', layers:['.surface-brush-motion','.surface-desert-chase'], color:0x182334, description:'Welcome to Cactus Forest Moonlight. The original surface wildlife and wind animation share this landscape with the surrounding saguaros and mountains.'},
    {id:'underground', name:'Desert Burrows', art:'/assets/toon-planet/cactus-forest-burrow-empty.webp', layers:['.burrow-wildlife'], color:0x30241e, description:'We have reached the desert burrows. The original wildlife animation lives among tunnel walls and exposed roots.'},
    {id:'ocean', name:'Hidden Ocean', art:'/assets/toon-planet/bikini-bottom-ocean.webp', layers:['.ocean-water'], color:0x073d57, description:'Welcome to the hidden ocean. The original animated village remains here, with swimming fish and bubbles around you.'}
  ]}),
  rainbow: world({id:'rainbow', name:'Rainbow Promise', path:'/rainbow-promise.html', engine:'spatial', color:0x4bdb95, aliases:['rainbow','ark','noah'], regions:[
    {id:'flood', name:'After the Flood', art:'/assets/rainbow-promise/ancient-flood-landscape-clean.webp', color:0x7d8589, spawn:[0,0,10], bounds:[-17,17,2,18], description:'This is the Rainbow Promise scene from the webpage: the enclosed timber ark, receding slate-blue water, bare mountain shores, driftwood and clearing storm light. The original landscape and ark artwork are preserved in image relief alongside spatial scenery.'},
    {id:'shore', name:'The Covenant Shore', art:'/assets/rainbow-promise/ancient-flood-landscape-clean.webp', color:0x8a9397, spawn:[-4,0,8], bounds:[-17,17,2,18], description:'Walk the bare rocky shore from the original flood landscape. The ark floats nearby, with the same raven and dove artwork and a rainbow of renewal. This remains an artistic interpretation of the account in Genesis. Ask for the next region to board the ark.'},
    {id:'ark', name:'Aboard the Ark', art:'/assets/rainbow-promise/ancient-flood-landscape-clean.webp', color:0x7d8589, spawn:[0,0,11.5], bounds:[-3.85,3.85,-12.2,12.2], obstacles:[[-3.45,3.45,-11.6,10.9]], description:'You are aboard the enclosed timber ark, with continuous roofing, dark ventilation openings, wooden framing and a pitch-darkened hull based on the original webpage. The deck stays still for comfort while water moves around it. Ask for the next region to see the full ark from shore.'}

  ]}),
  fathers: world({id:'fathers', name:"Father's House", path:'/fathers-house.html', engine:'spatial', color:0xffdfae, aliases:["father's house",'fathers house','father house','lazarus','bethany'], regions:[
    {id:'garden', name:'Garden of Welcome', art:'/fathers-house-realistic.jpg', color:0x6c728e, spawn:[-4,0,9], bounds:[-17,17,-14,16], obstacles:[[1,5,-20,5.1],[1,5,8.9,20]], description:"Welcome to the Father's House. Follow the garden beside the flowing river, flowers and waterfalls, inspired by the original radiant city artwork. This is an artistic reflection about welcome and hope, rather than a claim about what heaven looks like."},
    {id:'bethany', name:'Lazarus at Bethany', art:'/assets/lazarus-bethany-v2.webp', color:0xa99f8c, spawn:[0,0,8], bounds:[-11,11,-3,14], description:'We are at the Bethany reflection from the original page. John 11 describes Jesus calling Lazarus from the tomb. The original artwork is set within this stone setting. Ask Nova for the next region to return to the garden.'}
  ]}),
  wild: world({id:'wild', name:'Wild Encounters', path:'/wild-encounters.html', engine:'spatial', color:0xd8b776, aliases:['wild encounters','wildlife','jimmitty','jimmity','ocotillo','ant trail'], regions:[
    {id:'wash', name:'The Ocotillo Harvest', color:0x8e9b9e, spawn:[0,0,8], bounds:[-16,16,-14,16], description:'Welcome to the Wild Encounters field log in Cactus Forest. Ocotillo and a leaf-carrying ant trail bring the original observation into a desert wash. The ants are an illustration: their species and any underground fungus garden remain unconfirmed.'},
    {id:'jimmitty', name:"Jimmitty's Garden", color:0x8e9b9e, spawn:[0,0,5], bounds:[-16,16,-14,16], description:'Meet Jimmitty the Cricket. His original photographic cutout now hops through the garden in space. The real cricket recovered, moved again outdoors and was released; the original field log keeps his story.'}
  ]})
});

export function worldForPath(path) {
  if(typeof path !== 'string') return null;
  try {
    const url=new URL(path,'https://astralis.invalid');
    if(url.origin!=='https://astralis.invalid') return null;
    const key=url.pathname.replace(/\.html$/,'').replace(/\/$/,'');
    return Object.values(vrWorlds).find(w=>w.path.replace(/\.html$/,'')===key)||null;
  } catch { return null; }
}

export function requestedWorld(search) {
  const params=new URLSearchParams(search),id=params.get('world');
  if(!Object.hasOwn(vrWorlds,id)) return null;
  const selected=vrWorlds[id];
  return {world:selected,region:Math.max(0,selected.regions.findIndex(r=>r.id===params.get('region')))};
}

export function regionFor(world,index=0) {
  return world.regions[Number.isInteger(index)&&index>=0&&index<world.regions.length?index:0];
}

export function canWalkRegion(region,x,z) {
  if(!Number.isFinite(x)||!Number.isFinite(z)) return false;
  const [left,right,back,front]=region.bounds;
  return x>left&&x<right&&z>back&&z<front&&!(region.obstacles||[]).some(([l,r,b,f])=>x>l&&x<r&&z>b&&z<f);
}
