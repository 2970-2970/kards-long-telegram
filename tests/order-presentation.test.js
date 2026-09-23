const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function stage(width,height,options={},blast={play:()=>Promise.resolve()},timer=fn=>setImmediate(fn)){
 const made=[],animations=[],nodes={};
 class Element{
  constructor(tag='div'){this.tag=tag;this.style={};this.dataset={};this.attributes={};this.children=[];this.classes=new Set();this.classList={add:(...cs)=>cs.forEach(c=>this.classes.add(c)),remove:(...cs)=>cs.forEach(c=>this.classes.delete(c))};made.push(this);}
  setAttribute(k,v){this.attributes[k]=String(v);}
  removeAttribute(k){delete this.attributes[k];}
  querySelectorAll(){return [];}
  appendChild(el){this.children.push(el);return el;}
  replaceChildren(){this.children=[];}
  remove(){this.removed=true;}
  cloneNode(){const copy=new Element(this.tag);copy.rect=this.rect;return copy;}
  getBoundingClientRect(){return this.rect||{left:parseFloat(this.style.left)||0,top:parseFloat(this.style.top)||0,width:parseFloat(this.style.width)||0,height:parseFloat(this.style.height)||0};}
  animate(frames,options){animations.push({el:this,frames,options});return {finished:Promise.resolve(),cancel(){}};}
 }
 const doc={getElementById:id=>nodes[id]??=new Element(),querySelector:()=>null,createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag)};
 const root={document:doc,innerWidth:width,innerHeight:height,setTimeout:timer,matchMedia:()=>({matches:false}),LongTelegramBlast:blast};
 const context=vm.createContext(root);vm.runInContext(fs.readFileSync(require.resolve('../dist/battle-effects'),'utf8'),context);
 const effects=root.LongTelegramEffects.create({describe:()=>'',sound:()=>{},card:()=>new Element('button'),...options});
 return {effects,nodes,doc,animations,made,Element,createSequencer:root.LongTelegramEffects.createSequencer};
}
test('Result music starts one second before lethal damage, then explosion finishes before the result screen opens',async()=>{
 const log=[];let finishBlast,seenContext,finishLead,leadMs;
 const blast=new Promise(resolve=>finishBlast=resolve);
 const s=stage(1440,900,{destroyedLabel:()=>'',beginFinale:ctx=>{seenContext=ctx;log.push('result music');},blastSound:()=>log.push('explosion sound')},{play:()=>{log.push('explosion animation');return blast;}},(fn,ms)=>{if(ms===1000){finishLead=fn;leadMs=ms;}else setImmediate(fn);});
 const ctx={next:{over:true,winner:'p',p:{faction:'usa',hp:20},e:{hp:0}}};
 const sequence=s.createSequencer({lock:()=>{},before:async()=>{},prepareFinale:s.effects.prepareFinale,commit:()=>log.push('HQ reaches zero'),after:async()=>{},finale:s.effects.finale,cleanup:s.effects.cleanup,done:()=>log.push('result screen'),error:error=>{throw error;}});
 const pending=sequence.play(ctx);await new Promise(resolve=>setImmediate(resolve));
 assert.equal(seenContext,ctx);assert.equal(leadMs,1000);assert.deepEqual(log,['result music']);assert.equal(sequence.busy,true);
 finishLead();await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(log,['result music','HQ reaches zero','explosion sound','explosion animation']);
 finishBlast();await pending;assert.deepEqual(log,['result music','HQ reaches zero','explosion sound','explosion animation','result screen']);
});
for(const side of ['p','e'])for(const [width,height] of [[375,812],[1440,900]])test('Orders reveal centrally, aim within the viewport, then discard off-screen: '+side+' '+width,async()=>{
 const s=stage(width,height),hq=s.doc.getElementById(side==='p'?'enemyHq':'playerHq');hq.rect={left:-100,top:height+50,width:80,height:100};
 const ctx={side,card:{t:'order'},source:new s.Element(),sourceRect:{left:width/2,top:height-20,width:90,height:130},action:{type:'play',targets:['hq']},result:{events:[]},next:{p:{hand:[]},e:{hand:[]}}};
 await s.effects.before(ctx);const r=ctx.reveal.getBoundingClientRect();assert.equal(r.left+r.width/2,width/2);assert.equal(r.top+r.height/2,height/2);assert.equal(ctx.reveal.dataset.phase,'target');
 const line=s.made.find(e=>e.tag==='line');assert.ok(line);
 assert.equal(Number(line.attributes.x1),width/2);assert.equal(Number(line.attributes.y1),height/2);
 for(const key of ['x1','x2','y1','y2'])assert.ok(Number(line.attributes[key])>=22&&Number(line.attributes[key])<=(key[0]==='x'?width:height)-22);
 const reveal=ctx.reveal;await s.effects.after(ctx);assert.equal(reveal.dataset.phase,'discard');assert.ok(reveal.removed);
 const thrown=s.animations.find(a=>a.el===reveal&&a.frames.at(-1).transform?.includes('rotate(24deg)'));assert.ok(thrown);assert.ok(parseFloat(thrown.frames.at(-1).transform.match(/translate\(([^p]+)/)[1])>width-r.left);
 s.effects.cleanup();assert.equal(ctx.source.style.visibility,undefined);
});
