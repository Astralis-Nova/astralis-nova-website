(()=>{
  if(window.__astralisNovaDailyV1)return;
  window.__astralisNovaDailyV1=true;
  const root=document.getElementById('novaGuide');
  if(!root)return;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini');
  const speak=text=>{try{if(localStorage.getItem('astralisNovaMuted')==='true'||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);speechSynthesis.cancel();speechSynthesis.speak(u)}catch{}};
  const say=(text,emoji='🌌')=>{if(msg)msg.textContent=text;if(status)status.textContent=text;if(face)face.textContent=emoji;if(mini)mini.textContent=emoji;speak(text)};

  const universeFacts=[
    'A day on Venus is longer than a Venusian year: the planet rotates so slowly that one spin takes longer than one trip around the Sun.',
    'Neutron stars can pack more mass than the Sun into a sphere roughly the size of a city.',
    'The observable universe is about 93 billion light-years across, even though the universe is about 13.8 billion years old, because space itself has expanded.',
    'A teaspoon of neutron-star material would weigh billions of tons on Earth.',
    'Saturn is the least dense planet in our solar system. Its average density is lower than liquid water.',
    'There are rogue planets that wander through interstellar space without orbiting a star.',
    'The Milky Way and Andromeda are moving toward each other and are expected to merge billions of years from now.',
    'Light from the Sun takes about eight minutes and twenty seconds to reach Earth.',
    'Jupiter is so massive that the solar system’s center of mass can sometimes lie outside the Sun’s surface.',
    'Black holes are not cosmic vacuum cleaners. From far away, an object orbiting a black hole responds to gravity much as it would to any object of the same mass.',
    'Mars has the largest known volcano in the solar system, Olympus Mons, which rises roughly 22 kilometers above the surrounding terrain.',
    'Some exoplanets orbit two stars, creating real worlds with double sunsets.',
    'The Moon is slowly moving away from Earth by about 3.8 centimeters per year.',
    'Mercury has water ice in permanently shadowed craters near its poles despite being the planet closest to the Sun.',
    'Uranus rotates almost on its side, with an axial tilt of about 98 degrees.',
    'Most of the atoms heavier than helium in your body were forged inside stars or in violent stellar events.',
    'A year on Neptune lasts about 165 Earth years.',
    'The largest structures in the universe are vast filaments and walls of galaxies separated by enormous cosmic voids.',
    'The Sun contains more than 99 percent of the mass in our solar system.',
    'A photon created in the Sun’s core can take thousands of years to random-walk outward before finally escaping into space.'
  ];

  const astrologyFacts=[
    'The zodiac used in Western astrology divides the ecliptic into twelve equal signs. Astronomical constellations themselves are not equal in size.',
    'The word zodiac comes from a Greek phrase meaning roughly “circle of animals.”',
    'Western astrology usually uses a tropical zodiac tied to the seasons, while sidereal traditions align more closely with stellar positions.',
    'Because of Earth’s axial precession, the constellations behind the Sun have shifted over millennia compared with ancient sky maps.',
    'Astrology has played an important cultural role in Babylonian, Greek, Indian, Persian, Islamic, and European history, even though it is not considered a scientific method today.',
    'The signs Aries, Cancer, Libra, and Capricorn are traditionally called cardinal signs because they correspond to seasonal turning points in the tropical zodiac.',
    'In astrology, the Sun sign is only one part of a birth chart. Traditional systems also consider the Moon, planets, houses, and angles.'
  ];

  const scienceFacts=[
    'Octopuses have three hearts and blue blood because they use a copper-based oxygen carrier called hemocyanin.',
    'Honey can remain edible for extremely long periods when sealed from moisture because its low water activity and acidity inhibit many microbes.',
    'Bananas are berries in botanical terms, while strawberries are not true botanical berries.',
    'A bolt of lightning can heat the air around it to temperatures hotter than the surface of the Sun for a brief instant.',
    'Your brain uses roughly one-fifth of the body’s energy despite representing only a small fraction of total body mass.',
    'Sharks existed hundreds of millions of years before trees evolved.',
    'The DNA in one human cell would stretch to around two meters if fully extended.',
    'Water can exist as solid, liquid, and gas at the same time at a specific pressure and temperature called the triple point.'
  ];

  const zodiacForDate=d=>{
    const m=d.getMonth()+1,day=d.getDate();
    const cut=[[1,20,'Capricorn','Aquarius'],[2,19,'Aquarius','Pisces'],[3,21,'Pisces','Aries'],[4,20,'Aries','Taurus'],[5,21,'Taurus','Gemini'],[6,21,'Gemini','Cancer'],[7,23,'Cancer','Leo'],[8,23,'Leo','Virgo'],[9,23,'Virgo','Libra'],[10,23,'Libra','Scorpio'],[11,22,'Scorpio','Sagittarius'],[12,22,'Sagittarius','Capricorn']][m-1];
    return day<cut[1]?cut[2]:cut[3];
  };

  const weather=async question=>{
    const cityMatch=question.match(/weather(?:\s+(?:in|for))\s+(.+?)(?:[?.!]|$)/i);
    if(cityMatch){
      const city=clean(cityMatch[1]);
      say(`Checking live weather for ${city}...`,'☀️');
      try{const r=await fetch(`/api/nova-live?type=weather&city=${encodeURIComponent(city)}`);const d=await r.json();if(!r.ok)throw new Error(d.error);return reportWeather(d)}catch{say(`I could not reach live weather for ${city} just now.`,'🛰️');return true}
    }
    if(!navigator.geolocation){say('This browser does not expose location services. Try asking “weather in Phoenix” or another city.','☀️');return true}
    say('I can check your local weather. I need the browser’s location permission for this request.','☀️');
    return new Promise(resolve=>navigator.geolocation.getCurrentPosition(async pos=>{
      try{const r=await fetch(`/api/nova-live?type=weather&lat=${encodeURIComponent(pos.coords.latitude)}&lon=${encodeURIComponent(pos.coords.longitude)}`);const d=await r.json();if(!r.ok)throw new Error(d.error);reportWeather(d)}catch{say('I found your location, but the live weather link did not answer.','🛰️')}resolve(true);
    },()=>{say('Location permission was not available. Ask me “weather in Phoenix” or name another city instead.','☀️');resolve(true)},{timeout:8000,maximumAge:600000}));
  };

  const reportWeather=d=>{
    const c=d.current||{},today=d.daily?.[0]||{};
    const where=d.location==='your location'?'your area':d.location;
    const text=`Live weather for ${where}: ${Math.round(c.temperature_f)}°F, ${c.condition}, feels like ${Math.round(c.feels_like_f)}°F. Humidity ${Math.round(c.humidity)} percent, wind about ${Math.round(c.wind_mph)} miles per hour. Today’s high is about ${Math.round(today.high_f)}°F with a low near ${Math.round(today.low_f)}°F and up to ${Math.round(today.precip_probability||0)} percent chance of precipitation.`;
    say(text,'☀️');return true;
  };

  const onThisDay=async()=>{
    say('Opening the calendar archives...','📜');
    try{
      const d=new Date();const r=await fetch(`/api/nova-live?type=onthisday&month=${d.getMonth()+1}&day=${d.getDate()}`);const data=await r.json();if(!r.ok||!data.events?.length)throw new Error(data.error||'No events');
      const e=pick(data.events.slice(0,18));
      say(`On this day in ${e.year}: ${e.text}`,'📜');
    }catch{say(`Today is ${new Date().toLocaleDateString(undefined,{month:'long',day:'numeric'})}. My live history source is being unusually mysterious right now.`,'📜')}
    return true;
  };

  const handle=async raw=>{
    const q=clean(raw).toLowerCase();if(!q)return false;
    if(/\b(weather|temperature|forecast)\b/.test(q))return weather(raw);
    if(/\b(on this day|today in history|history today)\b/.test(q))return onThisDay();
    if(/\b(astronomy fact|universe fact|space fact|cosmic fact)\b/.test(q)){say(pick(universeFacts),'🔭');return true}
    if(/\b(astrology fact|zodiac fact)\b/.test(q)){const sign=zodiacForDate(new Date());say(`${pick(astrologyFacts)} Today falls in ${sign} season in the tropical zodiac. Astrology is cultural and entertainment material, not scientific prediction.`,'♈');return true}
    if(/\b(science fact|amaze me|amazing fact|wow fact)\b/.test(q)){say(pick([...universeFacts,...scienceFacts]),'✨');return true}
    return false;
  };

  const addControls=()=>{
    const actions=root.querySelector('.nova-actions');if(!actions||root.querySelector('[data-nova-daily]'))return;
    const make=(html,fn)=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaDaily='true';b.innerHTML=html;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fn()});actions.appendChild(b)};
    make('☀️ Weather<small>Live local or city forecast</small>',()=>weather('weather'));
    make('📜 On This Day<small>A moment from history</small>',onThisDay);
    make('🔭 Universe Fact<small>Something cosmic</small>',()=>say(pick(universeFacts),'🔭'));
    make('♈ Astrology Fact<small>Culture & symbolism for fun</small>',()=>handle('astrology fact'));
  };
  addControls();

  window.AstralisNovaDaily={handle,weather,onThisDay,universeFact:()=>pick(universeFacts),astrologyFact:()=>pick(astrologyFacts)};
})();
