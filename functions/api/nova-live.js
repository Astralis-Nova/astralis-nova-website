const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'};

export async function onRequest({request}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...JSON_HEADERS,Allow:'GET, OPTIONS'}});
  if(request.method!=='GET')return json({error:'Use GET.'},405);
  const url=new URL(request.url);
  const type=(url.searchParams.get('type')||'').toLowerCase();
  try{
    if(type==='weather')return json(await weather(url));
    if(type==='onthisday')return json(await onThisDay(url));
    return json({error:'Unknown Nova live intelligence request.'},400);
  }catch(error){
    console.error('Nova live intelligence error',error);
    return json({error:'Nova could not reach that live source right now.'},502);
  }
}

async function weather(url){
  let lat=num(url.searchParams.get('lat'));
  let lon=num(url.searchParams.get('lon'));
  let label='your location';
  const city=clean(url.searchParams.get('city')).slice(0,100);
  if((lat==null||lon==null)&&city){
    const geoUrl=new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.searchParams.set('name',city);
    geoUrl.searchParams.set('count','1');
    geoUrl.searchParams.set('language','en');
    geoUrl.searchParams.set('format','json');
    const geo=await fetchJson(geoUrl);
    const place=geo?.results?.[0];
    if(!place)throw new Error('Location not found');
    lat=place.latitude;lon=place.longitude;
    label=[place.name,place.admin1,place.country].filter(Boolean).join(', ');
  }
  if(lat==null||lon==null)throw new Error('Missing coordinates');
  const api=new URL('https://api.open-meteo.com/v1/forecast');
  api.searchParams.set('latitude',String(lat));
  api.searchParams.set('longitude',String(lon));
  api.searchParams.set('current','temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m');
  api.searchParams.set('daily','weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset');
  api.searchParams.set('temperature_unit','fahrenheit');
  api.searchParams.set('wind_speed_unit','mph');
  api.searchParams.set('precipitation_unit','inch');
  api.searchParams.set('timezone','auto');
  api.searchParams.set('forecast_days','3');
  const data=await fetchJson(api);
  return {
    ok:true,
    source:'Open-Meteo',
    location:label,
    timezone:data.timezone,
    current:{
      time:data.current?.time,
      temperature_f:data.current?.temperature_2m,
      feels_like_f:data.current?.apparent_temperature,
      humidity:data.current?.relative_humidity_2m,
      precipitation_in:data.current?.precipitation,
      wind_mph:data.current?.wind_speed_10m,
      weather_code:data.current?.weather_code,
      condition:weatherLabel(data.current?.weather_code)
    },
    daily:(data.daily?.time||[]).map((date,i)=>({
      date,
      high_f:data.daily?.temperature_2m_max?.[i],
      low_f:data.daily?.temperature_2m_min?.[i],
      precip_probability:data.daily?.precipitation_probability_max?.[i],
      condition:weatherLabel(data.daily?.weather_code?.[i]),
      sunrise:data.daily?.sunrise?.[i],
      sunset:data.daily?.sunset?.[i]
    }))
  };
}

async function onThisDay(url){
  const now=new Date();
  const month=String(Number(url.searchParams.get('month'))||now.getMonth()+1).padStart(2,'0');
  const day=String(Number(url.searchParams.get('day'))||now.getDate()).padStart(2,'0');
  const endpoint=`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
  const data=await fetchJson(endpoint,{'Api-User-Agent':'AstralisNova/1.0'});
  const events=(data?.events||[]).map(e=>({year:e.year,text:clean(e.text).slice(0,600)})).filter(e=>e.text);
  return {ok:true,source:'Wikipedia On This Day',month:Number(month),day:Number(day),events:events.slice(0,30)};
}

async function fetchJson(url,headers={}){
  const response=await fetch(url,{headers:{Accept:'application/json',...headers}});
  if(!response.ok)throw new Error(`Upstream ${response.status}`);
  return response.json();
}

function weatherLabel(code){
  const c=Number(code);
  if(c===0)return'clear skies';
  if([1,2].includes(c))return'partly cloudy';
  if(c===3)return'overcast';
  if([45,48].includes(c))return'foggy';
  if([51,53,55,56,57].includes(c))return'drizzle';
  if([61,63,65,66,67].includes(c))return'rain';
  if([71,73,75,77].includes(c))return'snow';
  if([80,81,82].includes(c))return'rain showers';
  if([85,86].includes(c))return'snow showers';
  if([95,96,99].includes(c))return'thunderstorms';
  return'mixed conditions';
}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
function clean(v){return String(v||'').replace(/\s+/g,' ').trim()}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:JSON_HEADERS})}
