
(function(root,factory){const api=factory(root);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LongTelegramMedia=api;})(typeof globalThis!=='undefined'?globalThis:this,root=>{
'use strict';
let context=null,enabled=true,volume=.55,resultStarted=false;const playing=new Set(),missingArt=new Set();
try{enabled=root.localStorage.getItem('long-telegram.sound')!=='off';volume=Number(root.localStorage.getItem('long-telegram.volume')??root.LongTelegramAssets?.volume??.55)}catch(_){}
volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.55;
const radio=root.LongTelegramRadio?.create({Audio:root.Audio,tracks:root.LongTelegramAssets?.radio,enabled,volume});
const resultTracks=Object.fromEntries(Object.entries(root.LongTelegramAssets?.battle?.results||{}).flatMap(([nation,results])=>Object.entries(results).map(([result,path])=>[nation+'_'+result,path])));
const resultRadio=root.LongTelegramRadio?.create({Audio:root.Audio,tracks:resultTracks,enabled,volume,repeat:false});
function config(c){const assets=root.LongTelegramAssets||{};return {...assets.defaults,...assets.cards?.[c.deckId],...assets.cards?.[c.key],...(c.art?{art:c.art}:{}),...(c.deploySfx?{deploySfx:c.deploySfx}:{})};}
function mountArt(host,c,fallback=''){
 if(!host)return;const data=config(c);const reset=()=>{host.replaceChildren();host.textContent=fallback;host.classList.remove('has-art')};
 if(!data.art||missingArt.has(data.art)){reset();return;}
 const img=root.document.createElement('img');img.className='card-illustration';img.alt='';img.draggable=false;img.decoding='async';img.style.objectPosition=data.position||'50% 50%';
 img.onerror=()=>{missingArt.add(data.art);if(host.firstChild===img||host.children?.[0]===img)reset()};host.classList.add('has-art');host.replaceChildren(img);img.src=data.art;
}
function unlock(){
 if(!enabled)return;
  radio?.unlock();
  resultRadio?.unlock();
 try{const AC=root.AudioContext||root.webkitAudioContext;if(AC){context??=new AC();if(context.state==='suspended')context.resume().catch(()=>{});}}catch(_){}
}
function tone(){
 if(!enabled||!context||context.state!=='running'||!volume)return;
 try{const o=context.createOscillator(),g=context.createGain(),now=context.currentTime;o.type='triangle';o.frequency.setValueAtTime(180,now);o.frequency.exponentialRampToValueAtTime(70,now+.15);g.gain.setValueAtTime(volume*.15,now);g.gain.exponentialRampToValueAtTime(.001,now+.19);o.connect(g);g.connect(context.destination);o.start(now);o.stop(now+.2);}catch(_){}
}
function deploy(c){
 if(!enabled||!volume)return;
 const paths=[...new Set([config(c).deploySfx,root.LongTelegramAssets?.defaults?.deploySfx].filter(Boolean))];
 const attempt=()=>{
  if(!enabled||!volume)return;const path=paths.shift();if(!path){tone();return;}
  let audio,settled=false;const fallback=()=>{if(settled)return;settled=true;if(audio)playing.delete(audio);attempt()};
  try{audio=new root.Audio(path);audio.volume=volume;playing.add(audio);audio.onended=()=>{settled=true;playing.delete(audio)};audio.onerror=fallback;audio.play()?.catch(fallback);}catch(_){fallback();}
 };attempt();
}
function explosion(){
 if(!enabled||!volume)return;
 const path=root.LongTelegramAssets?.battle?.explosion;if(!path)return;
 let audio,settled=false;
 const finish=()=>{if(settled)return;settled=true;if(audio){audio.pause();playing.delete(audio);audio.onended=null;audio.onerror=null;}};
 try{audio=new root.Audio(path);audio.volume=volume;playing.add(audio);audio.onended=finish;audio.onerror=finish;audio.play()?.catch(finish);}catch(_){finish();}
}
function playResult(nation,result){
 radio?.stop();if(!resultTracks[nation+'_'+result]){resultRadio?.stop();return;}
 if(resultStarted)return;resultStarted=true;return resultRadio?.setNations(nation+'_'+result);
}
function setEnabled(value){enabled=!!value;radio?.setEnabled(enabled);resultRadio?.setEnabled(enabled);if(!enabled)for(const audio of playing){audio.pause();playing.delete(audio)}else unlock();try{root.localStorage.setItem('long-telegram.sound',enabled?'on':'off')}catch(_){}return enabled;}
function setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));for(const audio of playing)audio.volume=volume;radio?.setVolume(volume);resultRadio?.setVolume(volume);try{root.localStorage.setItem('long-telegram.volume',String(volume))}catch(_){}return volume;}
function startRadio(main,ally,{restart=false}={}){resultRadio?.stop();if(restart){resultStarted=false;radio?.stop();}return radio?.setNations(main,ally);}
function stopRadio(){radio?.stop();resultRadio?.stop();}
return {config,mountArt,unlock,deploy,explosion,playResult,setEnabled,setVolume,startRadio,stopRadio,get enabled(){return enabled},get volume(){return volume}};
});
