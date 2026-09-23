const assert=require('node:assert/strict'),{test}=require('node:test'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../dist/card-media'),'utf8');
function harness(){
 const state={plays:[],pauses:0,storage:new Map()},context={module:{exports:{}},LongTelegramAssets:{cards:{'usa:2':{art:'./assets/cards/m48.webp',deploySfx:'./assets/audio/m48.mp3'},t80:{deploySfx:'./assets/audio/t80.mp3'}}},localStorage:{getItem:k=>state.storage.get(k)??null,setItem:(k,v)=>state.storage.set(k,v)},Audio:class{constructor(src){this.src=src}play(){state.plays.push(this);return Promise.reject(Error('Playback blocked'))}pause(){state.pauses++}},document:{createElement:()=>({style:{}})}};
 vm.createContext(context);vm.runInContext(source,context);return {api:context.module.exports,state};
}
test('Per-card media keys and missing image fallback leave the card usable',()=>{
 const {api}=harness();assert.equal(api.config({deckId:'usa:2'}).art,'./assets/cards/m48.webp');assert.equal(api.config({key:'t80'}).deploySfx,'./assets/audio/t80.mp3');
 const classes=new Set(),host={classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},replaceChildren(...nodes){this.children=nodes},textContent:''};
 api.mountArt(host,{deckId:'usa:2'},'▰');assert.equal(host.children[0].src,'./assets/cards/m48.webp');assert.equal(classes.has('has-art'),true);
 host.children[0].onerror();assert.equal(host.textContent,'▰');assert.equal(classes.has('has-art'),false);
});
test('Muted cards stay silent and blocked audio never rejects a game action',async()=>{
 const {api,state}=harness();api.setEnabled(false);api.deploy({deckId:'usa:2'});assert.equal(state.plays.length,0);
 api.setEnabled(true);api.setVolume(.3);assert.doesNotThrow(()=>api.deploy({deckId:'usa:2'}));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(state.plays.length,1);assert.equal(state.plays[0].volume,.3);assert.equal(state.storage.get('long-telegram.volume'),'0.3');
});
test('Every active card has unique drop-in PNG and MP3 paths independent of language',()=>{
 const E=require('../dist/engine'),I=require('../dist/i18n'),context={window:{}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/card-assets'),'utf8'),context);
 const entries=context.window.LongTelegramAssets.cards,cards=[...Object.values(E.FACTIONS).flatMap(f=>E.LIB[f.library]),...Object.values(E.GENERATED_CARDS)];
 assert.equal(cards.length,66);const art=new Set(),sound=new Set();
 for(const c of cards){const asset=entries[c.deckId];assert.ok(asset,c.n);assert.match(asset.art,/^\.\/assets\/cards\/[a-z0-9]+(?:-[a-z0-9]+)*\.png$/);assert.match(asset.deploySfx,/^\.\/assets\/audio\/[a-z0-9]+(?:-[a-z0-9]+)*\.mp3$/);art.add(asset.art);sound.add(asset.deploySfx);I.setLanguage('zh');const clone=E.card(c);assert.equal(entries[clone.deckId].art,asset.art);I.setLanguage('en');assert.equal(entries[clone.deckId].art,asset.art);}
 assert.equal(art.size,cards.length);assert.equal(sound.size,cards.length);
 for(const hq of Object.values(E.HEADQUARTERS))assert.equal(entries[hq.deckId].art,'./assets/hq/'+hq.id+'-map.png');
 assert.equal(entries['usa:2'].art,'./assets/cards/m48-patton.png');assert.equal(entries['usa:8'].art,'./assets/cards/marshall-plan.png');
});
test('Missing MP3 error plus rejected playback invokes its default only once',async()=>{
 const plays=[],context={module:{exports:{}},LongTelegramAssets:{defaults:{deploySfx:'default.mp3'},cards:{unit:{deploySfx:'missing.mp3'}}},Audio:class{constructor(src){this.src=src}play(){plays.push(this.src);if(this.src==='missing.mp3'){this.onerror();return Promise.reject(Error('missing'))}return Promise.resolve()}},localStorage:{getItem:()=>null,setItem:()=>{}}};
 vm.createContext(context);vm.runInContext(source,context);context.module.exports.deploy({key:'unit'});await new Promise(r=>setImmediate(r));assert.deepEqual(plays,['missing.mp3','default.mp3']);
});
test('Renaming preserves existing preferences without replacing newer saved choices',()=>{
 const data=new Map([['cold-front.deck','{"main":"usa"}'],['cold-front.language','zh'],['long-telegram.language','en']]);
 const context={localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/preferences'),'utf8'),context);
 assert.equal(data.get('long-telegram.deck'),'{"main":"usa"}');assert.equal(data.get('long-telegram.language'),'en');
});
