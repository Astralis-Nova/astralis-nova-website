((root,factory)=>{
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.AstralisRadioPlaylist=api;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';

  const MAX_STATIONS=250;

  function secureUrl(value){
    try{
      const url=new URL(String(value||'').trim());
      return url.protocol==='https:'?url.href:null;
    }catch{return null;}
  }

  function cleanText(value,fallback='Imported station'){
    const text=String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();
    return (text||fallback).slice(0,120);
  }

  function frequencyFromText(value){
    const match=String(value||'').match(/(?:^|\s)(8[8-9]\.\d|9\d\.\d|10[0-7]\.\d)(?:\s|$)/);
    const frequency=match?Number(match[1]):null;
    return Number.isFinite(frequency)?frequency:null;
  }

  function extinfMetadata(line){
    const comma=line.indexOf(',');
    const attributes={};
    const head=comma>=0?line.slice(0,comma):line;
    for(const match of head.matchAll(/([\w-]+)="([^"]*)"/g))attributes[match[1].toLowerCase()]=match[2];
    const name=comma>=0?line.slice(comma+1):attributes['tvg-name'];
    return {name:cleanText(name||attributes['tvg-name']),genre:cleanText(attributes['group-title']||'My Playlist','My Playlist')};
  }

  function parseM3U(text,{sourceName='Imported playlist'}={}){
    const body=String(text||'').replace(/^\uFEFF/,'');
    if(/#EXT-X-(TARGETDURATION|STREAM-INF|MEDIA-SEQUENCE)/i.test(body)){
      return {stations:[],error:'This is an HLS broadcast manifest. Add its original HTTPS .m3u8 URL instead of importing the downloaded file.'};
    }
    const stations=[];
    let metadata={name:'',genre:'My Playlist'};
    for(const rawLine of body.split(/\r?\n/)){
      const line=rawLine.trim();
      if(!line)continue;
      if(/^#EXTINF:/i.test(line)){metadata=extinfMetadata(line);continue;}
      if(/^#EXTGRP:/i.test(line)){metadata.genre=cleanText(line.slice(line.indexOf(':')+1),'My Playlist');continue;}
      if(line.startsWith('#'))continue;
      const url=secureUrl(line);if(!url)continue;
      const fallback=(()=>{try{return new URL(url).hostname;}catch{return 'Imported station';}})();
      const name=cleanText(metadata.name,fallback);
      stations.push({name,url_resolved:url,_frequency:frequencyFromText(name),_source:'playlist',genre:metadata.genre,playlistSource:cleanText(sourceName,'Imported playlist')});
      metadata={name:'',genre:'My Playlist'};
      if(stations.length>=MAX_STATIONS)break;
    }
    return {stations:dedupe(stations),error:null};
  }

  function parsePLS(text,{sourceName='Imported playlist'}={}){
    const values={};
    for(const rawLine of String(text||'').split(/\r?\n/)){
      const match=rawLine.trim().match(/^(File|Title)(\d+)=(.*)$/i);if(!match)continue;
      const index=Number(match[2]);values[index]??={};values[index][match[1].toLowerCase()]=match[3].trim();
    }
    const stations=Object.keys(values).sort((a,b)=>Number(a)-Number(b)).map(index=>{
      const url=secureUrl(values[index].file);if(!url)return null;
      const name=cleanText(values[index].title,(()=>{try{return new URL(url).hostname;}catch{return 'Imported station';}})());
      return {name,url_resolved:url,_frequency:frequencyFromText(name),_source:'playlist',genre:'My Playlist',playlistSource:cleanText(sourceName,'Imported playlist')};
    }).filter(Boolean).slice(0,MAX_STATIONS);
    return {stations:dedupe(stations),error:null};
  }

  function parsePlaylist(text,options={}){
    return /^\s*\[playlist\]/i.test(String(text||''))?parsePLS(text,options):parseM3U(text,options);
  }

  function dedupe(stations){
    const seen=new Set();
    return stations.filter(station=>{const url=secureUrl(station?.url_resolved||station?.url);if(!url||seen.has(url))return false;seen.add(url);station.url_resolved=url;return true;});
  }

  return {MAX_STATIONS,secureUrl,frequencyFromText,parseM3U,parsePLS,parsePlaylist,dedupe};
});
