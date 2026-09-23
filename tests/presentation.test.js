const assert=require('node:assert/strict'),{test}=require('node:test');
const {createSequencer}=require('../dist/battle-effects');
const E=require('../dist/engine');
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('An action waits for reveal, impact and HQ explosion; rejects overlapping actions',async()=>{
 const before=deferred(),after=deferred(),finale=deferred(),log=[];
 const s=E.createGame(()=>.4);s.e.hp=1;s.p.k=10;
 const c=E.card(E.LIB.france.find(c=>c.t==='artillery'));s.p.support=[c];
 const next=JSON.parse(JSON.stringify(s));assert.equal(E.act(next,'p',{type:'attack',id:c.id,target:'hq'}).ok,true);assert.equal(next.over,true);
 const player=createSequencer({lock:b=>log.push(b?'lock':'unlock'),before:async()=>{log.push('arrow');await before.promise},commit:()=>log.push('damage'),after:async()=>{log.push('impact');await after.promise},finale:async()=>{log.push('explosion');await finale.promise},cleanup:()=>log.push('cleanup'),done:()=>log.push('result')});
 const promise=player.play({next});assert.equal(player.busy,true);assert.equal(await player.play({next}),false);assert.deepEqual(log,['lock','arrow']);
 before.resolve();await tick();assert.deepEqual(log,['lock','arrow','damage','impact']);assert.equal(player.busy,true);
 after.resolve();await tick();assert.deepEqual(log,['lock','arrow','damage','impact','explosion']);assert.equal(player.busy,true);
 finale.resolve();await promise;assert.equal(player.busy,false);assert.deepEqual(log,['lock','arrow','damage','impact','explosion','cleanup','unlock','result']);
});
test('Presentation failure cannot skip the finale, duplicate game mutations or leave controls locked',async()=>{
 const log=[];let commits=0;
 const player=createSequencer({lock:b=>log.push(b),before:async()=>{throw Error('animation unavailable')},commit:()=>commits++,after:async()=>{throw Error('asset unavailable')},finale:async()=>log.push('finale'),cleanup:()=>log.push('cleanup'),done:()=>log.push('done'),error:()=>log.push('error')});
 await player.play({next:{over:true}});assert.equal(commits,1);assert.equal(player.busy,false);assert.deepEqual(log,[true,'error','error','finale','cleanup',false,'done']);
});
test('Nonfatal AI actions complete their landing before scheduling any next step',async()=>{
 const landing=deferred(),log=[];
 const player=createSequencer({lock:()=>{},before:async()=>log.push('reveal'),commit:()=>log.push('deploy'),after:()=>landing.promise,finale:()=>{throw Error('Not a final action')},cleanup:()=>{},done:()=>log.push('schedule next AI')});
 const promise=player.play({next:{over:false}});await tick();assert.deepEqual(log,['reveal','deploy']);
 landing.resolve();await promise;assert.deepEqual(log,['reveal','deploy','schedule next AI']);
});
test('All new scripts and asset controls are wired into the static page',()=>{
 const fs=require('node:fs'),path=require('node:path');const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
 const scripts=[...html.matchAll(/<script src="\.\/([^\"]+)"/g)].map(m=>m[1].split('?')[0]);
 for(const name of ['ai-planner.js','card-assets.js','emblem-assets.js','faction-radio.js','card-media.js','headquarters.js','hq-explosion.js','battle-effects.js'])assert.ok(scripts.indexOf(name)<scripts.indexOf('app.js')&&scripts.includes(name));
 assert.ok(scripts.indexOf('ai-planner.js')<scripts.indexOf('engine.js'));
 assert.ok(scripts.indexOf('headquarters.js')<scripts.indexOf('deck-builder.js'));
 assert.ok(scripts.indexOf('faction-radio.js')<scripts.indexOf('card-media.js'));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'No duplicate IDs');
 for(const id of ['battleEffects','battleCaption','soundEnabled','soundVolume'])assert.ok(ids.includes(id));
 assert.equal((app.match(/E\.act\(/g)||[]).length,1,'Every human and AI action uses the same animation pipeline');
});
test('The page versions scripts and styles using their current content to avoid stale game rules',()=>{
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
 for(const [,name,version] of html.matchAll(/(?:src|href)="\.\/([^"?]+\.(?:js|css))(?:\?v=([^"?]+))?"/g)){
  const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../dist',name))).digest('hex').slice(0,12);
  assert.equal(version,actual,name+' must load its current content');
 }
});
