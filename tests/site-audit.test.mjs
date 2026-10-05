import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { Chess } from '../chess/vendor/chess.js';
const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const volume=home.slice(home.indexOf('const savedVolumeValue='),home.indexOf('audio.volume=Number(musicVolume.value)')+'audio.volume=Number(musicVolume.value)'.length);
for(const [saved,expected] of [[null,.35],['',.35],['0',0],['0.6',.6],['invalid',.35],['2',.35]]){
 test(`music volume with stored value ${saved}`,()=>{
  const ctx={readStorage:()=>saved,MUSIC_VOLUME_KEY:'volume',musicVolume:{value:'.35'},audio:{}};
  vm.runInNewContext(volume,ctx);assert.equal(ctx.audio.volume,expected);
 });
}
test('catalog and background audio pause each other',()=>{
 const source=fs.readFileSync(new URL('../site-fixes.js',import.meta.url),'utf8');
 const code=source.slice(source.indexOf('function installDirectPlayer()'),source.indexOf('function strengthenOriginalAudioPlayer()'));
 const media=()=>({paused:true,handlers:{},addEventListener(n,f){this.handlers[n]=f},pause(){this.paused=true;this.handlers.pause?.()},play(){this.paused=false;this.handlers.play?.();this.handlers.playing?.();return Promise.resolve()},load(){}});
 const player=media(),background=media(),list={addEventListener(n,f){this.click=f}};
 const nodes={deviceAudioPlayer:player,siteAudio:background,devicePlayerStatus:{},deviceAudioDirectLink:{style:{}},songList:list};
 vm.runInNewContext(code+';installDirectPlayer();',{document:{getElementById:id=>nodes[id],querySelectorAll:()=>[]},songs:[{audio:'/song.mp3',title:'Song'}],encodeAudioPath:x=>x,window:{location:{origin:'https://example.com'}},URL,localStorage:{setItem(){}},fetch:async()=>({ok:true,headers:{get:()=>null}})});
 background.play();
 list.click({target:{closest:()=>({dataset:{songIndex:'0'}})},preventDefault(){},stopImmediatePropagation(){}});
 assert.equal(background.paused,true);assert.equal(player.paused,false);
 background.play();assert.equal(player.paused,true);assert.equal(background.paused,false);
});
test('bundled chess engine starts and applies legal moves',()=>{
 const chess=new Chess();assert.equal(chess.board().flat().filter(Boolean).length,32);
 assert.equal(chess.moves().length,20);assert.equal(chess.move('e4').san,'e4');assert.equal(chess.move('e5').san,'e5');assert.equal(chess.turn(),'w');
});
