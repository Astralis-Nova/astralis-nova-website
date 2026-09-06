const KMLE_STREAM='https://live.amperwave.net/direct/audacy-kmlefmaac-imc';

export async function onRequestGet(){
  try{
    const upstream=await fetch(KMLE_STREAM,{
      headers:{
        'Accept':'audio/aac,audio/aacp,audio/mpeg,*/*',
        'User-Agent':'Astralis-Nova-Legacy83-Radio/1.0'
      },
      cf:{cacheTtl:0,cacheEverything:false}
    });

    if(!upstream.ok || !upstream.body){
      return new Response('KMLE upstream unavailable',{status:502,headers:{'Cache-Control':'no-store'}});
    }

    const headers=new Headers();
    headers.set('Content-Type',upstream.headers.get('content-type')||'audio/aac');
    headers.set('Cache-Control','no-store, no-cache, must-revalidate');
    headers.set('Pragma','no-cache');
    headers.set('Access-Control-Allow-Origin','*');
    headers.set('X-Content-Type-Options','nosniff');

    const icyName=upstream.headers.get('icy-name');
    const icyGenre=upstream.headers.get('icy-genre');
    const icyBr=upstream.headers.get('icy-br');
    if(icyName)headers.set('icy-name',icyName);
    if(icyGenre)headers.set('icy-genre',icyGenre);
    if(icyBr)headers.set('icy-br',icyBr);

    return new Response(upstream.body,{status:200,headers});
  }catch(error){
    console.error('KMLE proxy error',error);
    return new Response('KMLE proxy error',{status:502,headers:{'Cache-Control':'no-store'}});
  }
}
