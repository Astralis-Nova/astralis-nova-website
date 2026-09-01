// Fixed per-world assignments: sorting or population changes never reshuffle artwork.
// Archival images illustrate AC; only associated:true identifies community branding.
const serverArt = {
  "derptide": {
    "image": "/assets/ac-worlds/derptide.jpg",
    "label": "Derptide welcome artwork",
    "source": "https://derptidewiki.net/index.php/Welcome",
    "associated": true,
    "layout": "scene"
  },
  "asheron4fun.com": {
    "image": "/assets/ac-worlds/asheron4fun.jpg",
    "label": "Asheron4Fun homepage banner",
    "source": "https://web.asheron4fun.com/",
    "associated": true,
    "layout": "banner"
  },
  "drunkenfell": {
    "image": "/assets/ac-worlds/drunkenfell.png",
    "label": "Drunkenfell community logo",
    "source": "https://www.drunkenfell.com/",
    "associated": true,
    "layout": "logo"
  },
  "coldeve": {
    "image": "/assets/ac-worlds/coldeve.jpg",
    "label": "Frozen Valley ice citadel",
    "source": "https://www.drunkenfell.com/index.php?title=File:Frozen_Valley_Overhaul_3_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "infiniteleaftide": {
    "image": "/assets/ac-worlds/infiniteleaftide.jpg",
    "label": "Oolutanga’s Refuge jungle village",
    "source": "https://www.drunkenfell.com/index.php?title=File:Oolutanga%27s_Refuge_2_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "frostface": {
    "image": "/assets/ac-worlds/frostface.jpg",
    "label": "Frore crystal-lit stone face",
    "source": "https://www.drunkenfell.com/index.php?title=File:Frore_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "conquest": {
    "image": "/assets/ac-worlds/conquest.jpg",
    "label": "Mount Esper volcanic caldera",
    "source": "https://www.drunkenfell.com/index.php?title=File:Mount_Esper_Caldera_2_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "reefcull": {
    "image": "/assets/ac-worlds/reefcull.jpg",
    "label": "Asheron’s coastal tower",
    "source": "https://www.drunkenfell.com/index.php?title=File:Asheron%27s_Castle_1_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "portalstorm": {
    "image": "/assets/ac-worlds/portalstorm.jpg",
    "label": "Tou-Tou under magical bombardment",
    "source": "https://www.drunkenfell.com/index.php?title=File:Teaser_20110904.jpg",
    "associated": false,
    "layout": "scene"
  },
  "sundering": {
    "image": "/assets/ac-worlds/sundering.jpg",
    "label": "Mountain beneath an otherworldly green sky",
    "source": "https://www.drunkenfell.com/index.php?title=File:Teaser_20110304.jpg",
    "associated": false,
    "layout": "scene"
  },
  "leafdawn": {
    "image": "/assets/ac-worlds/leafdawn.jpg",
    "label": "Yanshi refugee camp at sunrise",
    "source": "https://www.drunkenfell.com/index.php?title=File:Yanshi_Refugee_Camp_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "dreamweave": {
    "image": "/assets/ac-worlds/dreamweave.jpg",
    "label": "Swamp Gardens with violet light",
    "source": "https://www.drunkenfell.com/index.php?title=File:Swamp_Gardens_Live_2.jpg",
    "associated": false,
    "layout": "scene"
  },
  "eversong": {
    "image": "/assets/ac-worlds/eversong.jpg",
    "label": "Black Water Temple pagoda",
    "source": "https://www.drunkenfell.com/index.php?title=File:Black_Water_Temple_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "frostcull": {
    "image": "/assets/ac-worlds/frostcull.jpg",
    "label": "Mountain Cavern Frigid Halls crystals",
    "source": "https://www.drunkenfell.com/index.php?title=File:Mountain_Cavern_Frigid_Halls_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "leafdawning": {
    "image": "/assets/ac-worlds/leafdawning.jpg",
    "label": "Colier woodland village",
    "source": "https://www.drunkenfell.com/index.php?title=File:Colier_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "seedsow": {
    "image": "/assets/ac-worlds/seedsow.jpg",
    "label": "Rebuilt Arwic beside open grassland",
    "source": "https://www.drunkenfell.com/index.php?title=File:Arwic_Rebuilt_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "infinite frosthaven": {
    "image": "/assets/ac-worlds/infinite-frosthaven.jpg",
    "label": "Mountain Retreat castle in snow",
    "source": "https://www.drunkenfell.com/index.php?title=File:Mountain_Retreat_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "levistras": {
    "image": "/assets/ac-worlds/levistras.jpg",
    "label": "Glowing runes of the Yanshi Swamp Temple",
    "source": "https://www.drunkenfell.com/index.php?title=File:Swamp_Temple_(Yanshi)_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "thistlecrown": {
    "image": "/assets/ac-worlds/thistlecrown.jpg",
    "label": "Candeth Keep tree platform",
    "source": "https://www.drunkenfell.com/index.php?title=File:Candeth_Keep_Tree_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "snowreap": {
    "image": "/assets/ac-worlds/snowreap.jpg",
    "label": "Nanto Sho buildings in winter",
    "source": "https://www.drunkenfell.com/index.php?title=File:Nanto_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "shadowgain": {
    "image": "/assets/ac-worlds/shadowgain.jpg",
    "label": "Undead guardian in the Mountain Cavern city",
    "source": "https://www.drunkenfell.com/index.php?title=File:Mountain_Cavern_City_Entrance_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "harvestbud": {
    "image": "/assets/ac-worlds/harvestbud.jpg",
    "label": "Old Yanshi at sunset",
    "source": "https://www.drunkenfell.com/index.php?title=File:Yanshi_(Before)_1_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "harvestagain": {
    "image": "/assets/ac-worlds/harvestagain.jpg",
    "label": "Mountain Cavern candlelit memorial",
    "source": "https://www.drunkenfell.com/index.php?title=File:Mountain_Cavern_Memorial_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "mistwood": {
    "image": "/assets/ac-worlds/mistwood.jpg",
    "label": "Burun Ruuk Village torches and mountains",
    "source": "https://www.drunkenfell.com/index.php?title=File:Burun_Ruuk_Village_Live_4.jpg",
    "associated": false,
    "layout": "scene"
  },
  "the tower": {
    "image": "/assets/ac-worlds/the-tower.jpg",
    "label": "AC archival image: Fort Tethana stone fortress",
    "source": "https://www.drunkenfell.com/index.php?title=File:Fort_Tethana_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "jellocull": {
    "image": "/assets/ac-worlds/jellocull.jpg",
    "label": "AC archival image: Very Mad Cow",
    "source": "https://www.drunkenfell.com/index.php?title=File:Very_Mad_Cow_Live.jpg",
    "associated": false,
    "layout": "portrait"
  },
  "soulclaim": {
    "image": "/assets/ac-worlds/soulclaim.jpg",
    "label": "AC archival image: Virindi Master",
    "source": "https://www.drunkenfell.com/index.php?title=File:Virindi_Master_Live.jpg",
    "associated": false,
    "layout": "portrait"
  },
  "funkytown 2.0": {
    "image": "/assets/ac-worlds/funkytown-2-0.jpg",
    "label": "AC archival image: Ayan Baqur desert town",
    "source": "https://www.drunkenfell.com/index.php?title=File:Ayan_Baqur_1_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "achard": {
    "image": "/assets/ac-worlds/achard.jpg",
    "label": "AC archival image: Olthoi Queen in the Royal Hive",
    "source": "https://www.drunkenfell.com/index.php?title=File:Olthoi_Queen_(Royal_Hive)_Live.jpg",
    "associated": false,
    "layout": "portrait"
  },
  "acprime": {
    "image": "/assets/ac-worlds/acprime.jpg",
    "label": "AC archival image: Candeth Keep",
    "source": "https://www.drunkenfell.com/index.php?title=File:Candeth_Keep_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "buadren ac": {
    "image": "/assets/ac-worlds/buadren-ac.jpg",
    "label": "AC archival image: Tumerok Warrior",
    "source": "https://www.drunkenfell.com/index.php?title=File:Tumerok_Warrior_Live.jpg",
    "associated": false,
    "layout": "portrait"
  },
  "caba": {
    "image": "/assets/ac-worlds/caba.jpg",
    "label": "AC archival image: Lugian Miner",
    "source": "https://www.drunkenfell.com/index.php?title=File:Lugian_Miner_Live.jpg",
    "associated": false,
    "layout": "portrait"
  },
  "dekarutide": {
    "image": "/assets/ac-worlds/dekarutide.jpg",
    "label": "AC archival image: Mount Lethe volcanic entrance",
    "source": "https://www.drunkenfell.com/index.php?title=File:Mount_Lethe_Live_3.jpg",
    "associated": false,
    "layout": "scene"
  },
  "doctide": {
    "image": "/assets/ac-worlds/doctide.jpg",
    "label": "AC archival image: Black Dominion dungeon hall",
    "source": "https://www.drunkenfell.com/index.php?title=File:Black_Dominion_Live_2.jpg",
    "associated": false,
    "layout": "portrait"
  },
  "dragonmoon": {
    "image": "/assets/ac-worlds/dragonmoon.jpg",
    "label": "AC archival image: Olthoi Warrior",
    "source": "https://www.drunkenfell.com/index.php?title=File:Olthoi_Warrior_Live.jpg",
    "associated": false,
    "layout": "portrait"
  },
  "ebontide": {
    "image": "/assets/ac-worlds/ebontide.jpg",
    "label": "AC archival image: Dark Isle statues",
    "source": "https://www.drunkenfell.com/index.php?title=File:Dark_Isle_Statues_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "funkytown pk": {
    "image": "/assets/ac-worlds/funkytown-pk.jpg",
    "label": "AC archival image: Ayan Baqur live-event battle",
    "source": "https://www.drunkenfell.com/index.php?title=File:Live_Event_200410_SC_Ayan_Baqur_Obliterators_1_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "modclaim": {
    "image": "/assets/ac-worlds/modclaim.jpg",
    "label": "AC archival image: Olthoi Koujia armor",
    "source": "https://www.drunkenfell.com/index.php?title=File:Olthoi_Koujia_Armor_Berimphur_Live.jpg",
    "associated": false,
    "layout": "portrait"
  },
  "morgentau": {
    "image": "/assets/ac-worlds/morgentau.jpg",
    "label": "AC archival image: July 2003 dining hall",
    "source": "https://www.drunkenfell.com/index.php?title=File:Teaser_200307_C.jpg",
    "associated": false,
    "layout": "scene"
  },
  "morningstorm": {
    "image": "/assets/ac-worlds/morningstorm.jpg",
    "label": "AC archival image: waterfall at the Ruins of Tufa",
    "source": "https://www.drunkenfell.com/index.php?title=File:Ruins_of_Tufa_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "newfoundland": {
    "image": "/assets/ac-worlds/newfoundland.jpg",
    "label": "AC archival image: Mount Lethe Hellfire creature",
    "source": "https://www.drunkenfell.com/index.php?title=File:Mount_Lethe_Hellfire_Live.jpg",
    "associated": false,
    "layout": "portrait"
  },
  "nexus": {
    "image": "/assets/ac-worlds/nexus.jpg",
    "label": "AC archival image: Colosseum crest",
    "source": "https://www.drunkenfell.com/index.php?title=File:Colosseum_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "noescapegames": {
    "image": "/assets/ac-worlds/noescapegames.jpg",
    "label": "AC archival image: Olthoi Brood Hive interior",
    "source": "https://www.drunkenfell.com/index.php?title=File:Olthoi_Brood_Hive_(20%2B)_2_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "shadowland": {
    "image": "/assets/ac-worlds/shadowland.jpg",
    "label": "AC archival image: Shadow Spire over Tufa",
    "source": "https://www.drunkenfell.com/index.php?title=File:Tufa_Destroyed_by_a_Shadow_Spire_Live.jpg",
    "associated": false,
    "layout": "scene"
  },
  "unfamiliar shores": {
    "image": "/assets/ac-worlds/unfamiliar-shores.jpg",
    "label": "AC archival image: Qalaba'r settlement",
    "source": "https://www.drunkenfell.com/index.php?title=File:Qalaba%27r_Live.jpg",
    "associated": false,
    "layout": "scene"
  }
};

export function worldArtwork(name) {
  const key = String(name || '').trim().toLowerCase();
  // New worlds remain unillustrated until assigned their own image. Never recycle art.
  return Object.hasOwn(serverArt, key) ? serverArt[key] : null;
}
