// Shared archive scenery is decorative, not a claim about a custom server.
const scenes = ['sho-roadside','portal-space-entrance','portal-gateway','four-towers','tree-portal','beachside','high-mountain','asherons-island','westward','simple-tower','north-direlands','eastham-beach'];
const sources = ['Sho_Roadside_Portal','Entrance_to_Portal_Space','File:Portal_Gateway_Live.jpg','Four_Towers_Entrance_Portal','Tree_Portal','Beachside_Portal','High_Mountain_Valley_Portal',"Asheron's_Island_Portal",'Westward_Portal','Simple_Tower_Portal','North_Direlands_Portal','Eastham_Beach_Portal'];
const serverArt = {
  derptide: {image:'/assets/ac-worlds/derptide.jpg',label:'Derptide welcome artwork',source:'https://derptidewiki.net/index.php/Welcome',associated:true,layout:'scene'},
  'asheron4fun.com': {image:'/assets/ac-worlds/asheron4fun.jpg',label:'Asheron4Fun homepage banner',source:'https://web.asheron4fun.com/',associated:true,layout:'banner'},
  drunkenfell: {image:'/assets/ac-worlds/drunkenfell.png',label:'Drunkenfell community logo',source:'https://www.drunkenfell.com/',associated:true,layout:'logo'}
};

export function worldArtwork(name) {
  const key = String(name || '').trim().toLowerCase();
  if (Object.hasOwn(serverArt, key)) return serverArt[key];
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const index = hash % scenes.length;
  return {
    image: '/assets/ac-portals/' + scenes[index] + '.jpg',
    label: 'Shared Dereth scenery',
    source: 'https://www.drunkenfell.com/index.php?title=' + encodeURIComponent(sources[index]),
    associated: false
  };
}
