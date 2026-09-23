'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test'),vm=require('node:vm'),fs=require('node:fs');
const Radio=require('../dist/faction-radio');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('Common music persists during ordinary navigation and shuffles with only selected nations',async()=>{
 const rolls=[0,.99,0],{api,state}=harness({tracks:{common:'menu_bgm.mp3',usa:'usa_radio.mp3',ussr:'ussr_radio.mp3'},random:()=>rolls.shift()??0});
 await api.setNations();await tick();const intro=state.created[0];intro.currentTime=18;
 await api.setNations('usa');await tick();assert.equal(state.created.length,1);assert.equal(intro.currentTime,18);assert.equal(intro.paused,false);
 intro.onended();await tick();assert.equal(state.plays.at(-1),'usa_radio.mp3');
 await api.setNations('ussr');await tick();assert.equal(state.plays.at(-1),'menu_bgm.mp3');
 const common=state.created.at(-1);api.setEnabled(false);assert.equal(common.paused,true);api.setEnabled(true);await tick();api.setVolume(.2);assert.equal(common.volume,.2);
 await api.setNations();await tick();assert.equal(state.created.at(-1),common);
});
function harness(options={}){
 const state={created:[],plays:[],probes:[]};
 class Audio{
  constructor(src=''){this.src=src;this.paused=true;this.currentTime=0;state.created.push(this);}
  play(){this.paused=false;state.plays.push(this.src);return options.play?.(this)||Promise.resolve();}
  pause(){this.paused=true;}
  removeAttribute(name){if(name==='src')this.src='';}
  load(){if(!this.src)return;state.probes.push(this.src);if(options.pendingMetadata)return;
   queueMicrotask(()=>options.present?.has(this.src)?this.onloadedmetadata?.():this.onerror?.());}
 }
 const tracks={usa:'usa_radio.mp3',ussr:'ussr_radio.mp3',france:'fra_radio.mp3',drv:'drv_radio.mp3'};
 return {state,Audio,tracks,api:Radio.create({Audio,tracks,random:()=>0,...options})};
}

test('All four national results replace radio, honor mute and volume, and stop on a new match',async()=>{
 const {Audio,state}=harness(),results={usa:{victory:'usa_victory.mp3',defeat:'usa_defeat.mp3'},ussr:{victory:'ussr_victory.mp3',defeat:'ussr_defeat.mp3'}};
 const context={module:{exports:{}},Audio,LongTelegramRadio:Radio,LongTelegramAssets:{radio:{usa:'usa_radio.mp3'},battle:{explosion:'hq-explosion.mp3',results}},localStorage:{getItem:()=>null,setItem:()=>{}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/card-media'),'utf8'),context);const media=context.module.exports;
 for(const nation of ['usa','ussr'])for(const result of ['victory','defeat']){
  await media.startRadio('usa',null,{restart:true});await tick();const battle=state.created.at(-1);
  media.playResult(nation,result);const music=state.created.at(-1);media.explosion();const blast=state.created.at(-1);
  assert.equal(blast.src,'hq-explosion.mp3');assert.equal(battle.paused,true);assert.equal(music.src,results[nation][result]);assert.equal(state.created.filter(a=>!a.paused).length,2);
  blast.onended();await tick();assert.equal(state.created.filter(a=>!a.paused).length,1);
  media.setVolume(.2);assert.equal(music.volume,.2);music.currentTime=12;media.setEnabled(false);assert.equal(music.paused,true);media.setEnabled(true);await tick();assert.equal(music.currentTime,12);
  await media.startRadio('usa',null,{restart:true});await tick();assert.equal(music.paused,true);assert.equal(state.created.at(-1).src,'usa_radio.mp3');
 }
 media.setEnabled(false);const before=state.plays.length;media.explosion();await media.playResult('ussr','defeat');assert.equal(state.plays.length,before);
 media.setEnabled(true);await tick();assert.equal(state.plays.at(-1),'ussr_defeat.mp3');
 await media.playResult('usa',null);assert.equal(state.created.filter(a=>!a.paused).length,0);
});

test('Result music ends once and cannot replay through gestures, settings or result navigation until a new match',async()=>{
 const {Audio,state}=harness();
 const context={module:{exports:{}},Audio,LongTelegramRadio:Radio,LongTelegramAssets:{radio:{common:'menu.mp3'},battle:{results:{usa:{victory:'victory.mp3'}}}},localStorage:{getItem:()=>null,setItem:()=>{}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/card-media'),'utf8'),context);const media=context.module.exports;
 await media.startRadio('usa',null,{restart:true});await media.playResult('usa','victory');await tick();
 const music=state.created.at(-1);music.currentTime=7;const before=state.plays.length;
 await media.playResult('usa','victory');assert.equal(state.created.at(-1),music);assert.equal(music.currentTime,7);assert.equal(state.plays.length,before);
 const staleEnd=music.onended;music.onended();await tick();
 media.unlock();media.setEnabled(false);media.setEnabled(true);media.setVolume(0);media.setVolume(.5);await media.playResult('usa','victory');await tick();
 assert.equal(state.plays.length,before);assert.ok(state.created.every(a=>a.paused));
 await media.startRadio();await media.playResult('usa','victory');await tick();assert.equal(state.plays.length,before+1);assert.ok(state.created.every(a=>a.paused));
 await media.startRadio('usa',null,{restart:true});await media.playResult('usa','victory');await tick();
 assert.equal(state.plays.filter(p=>p==='victory.mp3').length,2);assert.notEqual(state.created.at(-1),music);
 staleEnd();await tick();assert.equal(state.created.at(-1).paused,false);
 await media.startRadio();await media.playResult('usa','victory');media.unlock();await tick();
 assert.equal(state.plays.filter(p=>p==='victory.mp3').length,2);assert.ok(state.created.every(a=>a.paused));
});

test('Missing result music and explosion files fail silently without resuming radio or repeated retries',async()=>{
 const {Audio,state}=harness({play:()=>Promise.reject(Error('missing'))});
 const context={module:{exports:{}},Audio,LongTelegramRadio:Radio,LongTelegramAssets:{battle:{explosion:'hq-explosion.mp3',results:{usa:{victory:'usa_victory.mp3'}}}},localStorage:{getItem:()=>null,setItem:()=>{}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/card-media'),'utf8'),context);const media=context.module.exports;
 media.explosion();await media.playResult('usa','victory');await tick();for(let i=0;i<4;i++)media.unlock();await tick();
 assert.deepEqual(state.plays,['hq-explosion.mp3','usa_victory.mp3']);assert.ok(state.created.every(a=>a.paused));
});

test('Starting each match rerolls the whole selected pool and restarts even a repeated lobby song',async()=>{
 const {Audio,state}=harness(),rolls=[0,0,.99,0];
 const context={module:{exports:{}},Audio,LongTelegramRadio:{create:options=>Radio.create({...options,random:()=>rolls.shift()??0})},LongTelegramAssets:{radio:{common:'menu.mp3',usa:'usa.mp3',france:'fra.mp3',ussr:'ussr.mp3'}},localStorage:{getItem:()=>null,setItem:()=>{}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/card-media'),'utf8'),context);
 const media=context.module.exports;
 await media.startRadio();await tick();const lobby=state.created.at(-1);lobby.currentTime=18;const staleEnd=lobby.onended;
 await media.startRadio('usa','france',{restart:true});await tick();const first=state.created.at(-1);
 assert.notEqual(first,lobby);assert.equal(lobby.paused,true);assert.equal(first.currentTime,0);assert.equal(first.src,'menu.mp3');
 staleEnd();await tick();assert.equal(state.plays.length,2);
 first.currentTime=24;await media.startRadio('usa','france',{restart:true});await tick();
 assert.equal(first.paused,true);assert.equal(state.created.at(-1).src,'fra.mp3');assert.equal(state.created.at(-1).currentTime,0);
 assert.equal(state.created.filter(a=>!a.paused).length,1);
 media.setEnabled(false);await media.startRadio('usa','france',{restart:true});await tick();assert.equal(state.plays.length,3);
 media.setEnabled(true);await tick();assert.equal(state.plays.at(-1),'menu.mp3');assert.equal(state.created.at(-1).currentTime,0);assert.equal(state.created.filter(a=>!a.paused).length,1);
});
test('Selected nations form one pool: first and subsequent songs are independently random',async()=>{
 for(const main of ['usa','ussr'])for(const ally of ['france','drv',main==='usa'?'ussr':'usa']){
  const rolls=[.99,.99,0,.99];
  const {api,state,tracks}=harness({random:()=>rolls.shift()});await api.setNations(main,ally);await tick();
  for(let i=0;i<3;i++){state.created.at(-1).onended();await tick();}
  assert.deepEqual(state.plays,[tracks[ally],tracks[ally],tracks[main],tracks[ally]]);
  assert.equal(state.created.filter(a=>!a.paused).length,1);
 }
});
test('No ally loops the main track; repeated gestures never overlap playback',async()=>{
 const {api,state}=harness();await api.setNations('ussr',null);api.unlock();api.unlock();await tick();api.unlock();
 assert.equal(state.plays.length,1);
 state.created[0].onended();await tick();assert.deepEqual(state.plays,['ussr_radio.mp3','ussr_radio.mp3']);
});
test('Changing nations and stopping discard stale playback events and promises',async()=>{
 let rejectOld;
 const {api,state}=harness({play:audio=>audio.src==='usa_radio.mp3'?new Promise((_,reject)=>{rejectOld=reject;}):Promise.resolve()});
 api.setNations('usa','france');const old=state.created[0],staleEnd=old.onended,staleError=old.onerror;
 api.setNations('ussr','drv');staleEnd();staleError();rejectOld(Error('late failure'));await tick();
 assert.deepEqual(state.plays,['usa_radio.mp3','ussr_radio.mp3']);assert.equal(old.paused,true);
 api.stop();api.unlock();await tick();assert.equal(state.plays.length,2);assert.ok(state.created.every(a=>a.paused));
});
test('Missing playback is removed once; all missing stays silent without retry loops',async()=>{
 const {api,state}=harness({play:audio=>{
  if(audio.src==='usa_radio.mp3'){audio.onerror();return Promise.reject(Error('missing'));}
  return Promise.resolve();
 }});
 await api.setNations('usa','france');await tick();assert.deepEqual(state.plays,['usa_radio.mp3','fra_radio.mp3']);
 state.created.at(-1).onended();await tick();assert.deepEqual(state.plays,['usa_radio.mp3','fra_radio.mp3','fra_radio.mp3']);
 const missing=harness({play:()=>Promise.reject(Error('missing'))});await missing.api.setNations('ussr','drv');await tick();
 for(let i=0;i<5;i++)missing.api.unlock();await tick();assert.deepEqual(missing.state.plays,['ussr_radio.mp3','drv_radio.mp3']);
});
test('Autoplay denial retries the same random song; mute and zero volume preserve its position',async()=>{
 let blocked=true;
 const {api,state}=harness({random:()=>.99,play:()=>blocked?Promise.reject(Object.assign(Error('gesture needed'),{name:'NotAllowedError'})):Promise.resolve()});
 await api.setNations('usa','france');await tick();assert.deepEqual(state.plays,['fra_radio.mp3']);
 blocked=false;api.unlock();await tick();assert.equal(state.created.length,1);assert.deepEqual(state.plays,['fra_radio.mp3','fra_radio.mp3']);
 const audio=state.created[0];audio.currentTime=23;api.setEnabled(false);assert.equal(audio.paused,true);
 api.unlock();assert.equal(state.plays.length,2);api.setEnabled(true);await tick();
 assert.equal(audio.paused,false);assert.equal(audio.currentTime,23);assert.equal(state.created.length,1);
 api.setVolume(.2);assert.equal(audio.volume,.2);
 api.setVolume(0);assert.equal(audio.volume,0);assert.equal(audio.paused,true);
 api.setVolume(.7);await tick();assert.equal(audio.volume,.7);assert.equal(audio.paused,false);
});
test('Saved sound settings control radio and deployment audio together',async()=>{
 const {Audio,state,tracks}=harness(),storage=new Map([['long-telegram.sound','off'],['long-telegram.volume','0.25']]);
 const context={module:{exports:{}},Audio,LongTelegramRadio:{create:options=>Radio.create({...options,random:()=>0})},LongTelegramAssets:{radio:tracks,cards:{unit:{deploySfx:'unit.mp3'}}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/card-media'),'utf8'),context);
 const media=context.module.exports;media.startRadio('usa','drv');media.deploy({key:'unit'});assert.equal(state.plays.length,0);
 media.setEnabled(true);media.deploy({key:'unit'});await tick();
 assert.deepEqual(state.plays,['usa_radio.mp3','unit.mp3']);assert.ok(state.created.every(a=>a.volume===.25));
 media.setVolume(.4);assert.ok(state.created.every(a=>a.volume===.4));assert.equal(storage.get('long-telegram.volume'),'0.4');
 media.setEnabled(false);assert.ok(state.created.every(a=>a.paused));assert.equal(storage.get('long-telegram.sound'),'off');
 media.stopRadio();media.setEnabled(true);await tick();assert.equal(state.plays.length,2);
});
test('Zero saved volume waits until raised, and faction placeholders retain their names',async()=>{
 const {api,state}=harness({volume:0});await api.setNations('usa','france');assert.equal(state.plays.length,0);
 api.setVolume(.3);await tick();assert.equal(state.plays[0],'usa_radio.mp3');
 const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/card-assets'),'utf8'),context);
 for(const [nation,abbr] of Object.entries({usa:'usa',ussr:'ussr',france:'fra',drv:'drv'}))assert.equal(context.window.LongTelegramAssets.radio[nation].prefix,'./assets/audio/'+abbr+'_radio');
});
test('Numbered discovery is silent and complete before the first random choice',async()=>{
 const present=new Set(['usa_radio.mp3','usa_radio_1.mp3','usa_radio_2.mp3','usa_radio_3.mp3','drv_radio_1.mp3']);
 const rolls=[.99,.65,0,.4];
 const {api,state}=harness({present,random:()=>rolls.shift(),tracks:{usa:{prefix:'usa_radio'},drv:{prefix:'drv_radio'}}});
 await api.setNations('usa','drv');await tick();
 for(let i=0;i<3;i++){state.created.at(-1).onended();await tick();}
 assert.deepEqual(state.plays,['drv_radio_1.mp3','usa_radio_3.mp3','usa_radio.mp3','usa_radio_2.mp3']);
 assert.equal(state.probes.filter(p=>p==='usa_radio_4.mp3').length,1);
 assert.equal(state.probes.filter(p=>p==='drv_radio_2.mp3').length,1);
 assert.equal(state.probes.includes('usa_radio_5.mp3'),false);
 assert.equal(state.created.filter(a=>!a.paused).length,1);
});
test('Explicit arrays and extras join the random pool; unselected factions stay excluded',async()=>{
 const rolls=[.99,.5,0,.75];
 const {api,state}=harness({random:()=>rolls.shift(),tracks:{usa:['a.mp3','b.mp3'],france:{tracks:['paris.mp3','a.mp3']},drv:['excluded.mp3']}});
 await api.setNations('usa','france');await tick();
 for(let i=0;i<3;i++){state.created.at(-1).onended();await tick();}
 assert.deepEqual(state.plays,['paris.mp3','b.mp3','a.mp3','paris.mp3']);
 const hybrid=harness({random:()=>.99,present:new Set(['usa_radio_1.mp3']),tracks:{usa:{prefix:'usa_radio',tracks:['custom.mp3']}}});
 await hybrid.api.setNations('usa');assert.deepEqual(hybrid.state.plays,['usa_radio_1.mp3']);
});
test('Absent numbered libraries settle after base and first number, then retry on a new match',async()=>{
 const {api,state}=harness({tracks:{usa:{prefix:'usa_radio'}}});await api.setNations('usa');
 for(let i=0;i<4;i++)api.unlock();await tick();assert.deepEqual(state.plays,[]);assert.deepEqual(state.probes,['usa_radio.mp3','usa_radio_1.mp3']);
 api.stop();await api.setNations('usa');assert.equal(state.probes.length,4);
});
test('Changing nations cancels pending metadata and prevents old libraries from starting',async()=>{
 const {api,state}=harness({pendingMetadata:true,tracks:{usa:{prefix:'usa_radio'},drv:['drv.mp3']}});
 const pending=api.setNations('usa');const old=state.created[0],late=old.onloadedmetadata;
 await api.setNations('drv');late();await pending;await tick();
 assert.deepEqual(state.plays,['drv.mp3']);assert.equal(old.paused,true);assert.equal(old.src,'');
});
test('Metadata timeouts are finite and leave no playback or retry timer',async()=>{
 const {api,state}=harness({pendingMetadata:true,probeTimeoutMs:5,tracks:{usa:{prefix:'usa_radio'}}});
 await api.setNations('usa');assert.deepEqual(state.probes,['usa_radio.mp3','usa_radio_1.mp3']);assert.deepEqual(state.plays,[]);
 assert.ok(state.created.every(a=>a.paused&&a.src===''));api.unlock();assert.deepEqual(state.plays,[]);
});
