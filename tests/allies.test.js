const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const E=require('../dist/engine');
const I=require('../dist/i18n');
const pool=[...E.LIB.france,...E.LIB.drv];
const template=key=>pool.find(c=>c.key===key);
function game(){const s=E.createGame(()=>.42);for(const side of ['p','e'])Object.assign(s[side],{hand:[],deck:[],support:[],front:[],hqIndex:0,k:50,maxK:12,graveyard:[]});return s;}
function unit(s,key,zone='support',side='p',patch={}){const c=Object.assign(E.card(template(key)),patch);s[side][zone].push(c);return c;}
function ok(s,a,side='p'){const r=E.act(s,side,a);assert.equal(r.ok,true,r.error);return r;}
function play(s,key,targets=[]){const c=E.card(template(key));s.p.hand.push(c);ok(s,{type:'play',id:c.id,targets});return c;}
function drawPile(s){s.p.deck=Array.from({length:10},()=>E.card(E.LIB.p[0]));}

test('All nation combinations produce 39 chosen cards, with independent AI decks',()=>{
 for(const main of E.MAIN_NATIONS.filter(E.mainReady))for(const ally of [null,'france','drv',E.FACTIONS[main].opponent]){
  const plan=E.presetDeck(main,ally),enemy=E.opponentDeck(plan);
  assert.equal(E.deckIssue(plan),'');
  assert.equal(Object.values(plan.counts).reduce((a,b)=>a+b),39);
  assert.ok(Object.values(plan.counts).every(n=>n<=4));
  const s=E.createGame(()=>.41,main,plan,enemy);
  for(const [side,p] of [['p',plan],['e',enemy]]){
   const counts={};for(const c of [...s[side].hand,...s[side].deck])counts[c.deckId]=(counts[c.deckId]||0)+1;
   assert.deepEqual(counts,p.counts);assert.equal(s[side].ally,p.ally);
  }
  plan.counts={};assert.notDeepEqual(s.p.deckPlan.counts,plan.counts,'Running match must own its deck data');
 }
});
test('Deck constraints reject invalid counts, nations and incomplete decks; Elite allows one copy',()=>{
 const p=E.presetDeck('usa','ussr'),id=Object.keys(p.counts)[0];
 for(const n of [5,-1,1.5,'2'])assert.equal(E.deckIssue({...p,counts:{[id]:n}}),'deck.rarityLimit');
 assert.equal(E.deckIssue({...p,counts:{[id]:1}}),'deck.needComplete');
 assert.equal(E.deckIssue({...p,counts:{[id]:1}},false),'');
 const overflow={...p,counts:{...p.counts}};for(const c of E.catalog(p.main,p.ally))overflow.counts[c.deckId]=E.copyLimit(c);
 assert.equal(E.deckIssue(overflow),'deck.tooMany');
 assert.equal(E.deckIssue({...p,ally:'usa'}),'deck.invalidAlly');
 assert.equal(E.deckIssue({...p,counts:{'france:0':1}}),'deck.wrongNation');
 const t80=E.LIB.soviet.find(c=>c.key==='rifles16');assert.equal(E.deckIssue({...p,counts:{[t80.deckId]:4}},false),'deck.rarityLimit');
 const invalid={main:'usa',ally:'france',counts:Object.fromEntries(E.LIB.france.map(c=>[c.deckId,4]))};
 assert.equal(E.deckIssue(invalid),'deck.tooMany');
 assert.throws(()=>E.createGame(()=>.42,'usa',invalid),/deck.tooMany/);
});
test('France deployment and frontline skills operate on allies and expire correctly',()=>{
 const s=game();s.p.hp=20;play(s,'fr_marines');assert.equal(s.p.hp,22);
 const tank=unit(s,'vn_type59','front','p',{h:1});play(s,'fr_amx30');assert.equal(tank.h,3);
 drawPile(s);const gun=play(s,'fr_f3');assert.equal(s.p.hand.length,1);assert.equal(gun.a,3);
 const s2=game();drawPile(s2);const scout=play(s2,'fr_amx13');ok(s2,{type:'move',id:scout.id});assert.equal(s2.p.hand.length,1);
 const jet=unit(s2,'vn_mig17');const mirage=play(s2,'fr_mirage');
 assert.equal(E.attackValue(jet),4);assert.equal(E.attackValue(mirage),5);assert.equal(E.attackValue(scout),3);
 ok(s2,{type:'end'});assert.equal(E.attackValue(jet),3);
});
test('French orders validate targets atomically, repair, buff aircraft and grant a free ground move',()=>{
 const s=game();drawPile(s);const tank=unit(s,'vn_type59','support','p',{h:1,sleeping:true}),air=unit(s,'vn_mig17');
 const c=E.card(template('fr_workshop'));s.p.hand.push(c);const before=JSON.stringify(s);
 assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:['missing']}).ok,false);assert.equal(JSON.stringify(s),before);
 ok(s,{type:'play',id:c.id,targets:[tank.id]});assert.equal(tank.h,4);assert.equal(s.p.hand.length,1);
 play(s,'fr_air');assert.equal(air.a,4);assert.equal(air.h,4);assert.equal(tank.a,4);
 const rapid=E.card(template('fr_rapid'));s.p.hand.push(rapid);
 assert.equal(E.act(s,'p',{type:'play',id:rapid.id,targets:[air.id]}).ok,false);
 ok(s,{type:'play',id:rapid.id,targets:[tank.id]});assert.equal(tank.sleeping,false);assert.equal(E.operationCost(s,'p',tank,'move'),0);
 const k=s.p.k;ok(s,{type:'move',id:tank.id});assert.equal(s.p.k,k);assert.equal(E.operationCost(s,'p',tank,'attack'),2);
});
test('Vietnam deployment, first-entry, splash and draw effects are active',()=>{
 const s=game();play(s,'vn_308');assert.equal(s.p.hp,21);drawPile(s);
 play(s,'vn_mig17');assert.equal(s.p.hand.length,1);
 const enemy=unit(s,'vn_308','front','e');const counter=play(s,'vn_320');assert.equal(counter.sleeping,false);
 const s2=game();unit(s2,'fr_amx13','front','e');assert.equal(play(s2,'vn_type59').sleeping,false);
 const s3=game();drawPile(s3);const scout=play(s3,'vn_recon');ok(s3,{type:'move',id:scout.id});assert.equal(s3.p.hand.length,1);
 const infantry=unit(s3,'vn_312');ok(s3,{type:'move',id:infantry.id});assert.equal(E.attackValue(infantry),4);
 ok(s3,{type:'end'});assert.equal(E.attackValue(infantry),3);
 const s4=game(),gun=unit(s4,'vn_d74'),left=unit(s4,'vn_308','front','e'),middle=unit(s4,'vn_308','front','e'),right=unit(s4,'vn_308','front','e');
 ok(s4,{type:'attack',id:gun.id,target:middle.id});assert.deepEqual([left.h,middle.h,right.h],[4,2,4]);assert.equal(gun.h,3);
});
test('Vietnam orders draw two, heal beyond 20, and apply temporary ground-only attack buffs',()=>{
 const s=game();drawPile(s);play(s,'vn_trail');assert.equal(s.p.hand.length,2);
 const infantry=unit(s,'fr_marines','support','p',{h:2}),tank=unit(s,'fr_amx30','front','p',{h:2}),air=unit(s,'fr_mirage'),gun=unit(s,'vn_d74');
 play(s,'vn_relief');assert.equal(s.p.hp,24);assert.equal(infantry.h,3);assert.equal(tank.h,2);
 play(s,'vn_assault');assert.equal(E.attackValue(infantry),5);assert.equal(E.attackValue(tank),7);assert.equal(E.attackValue(gun),5);assert.equal(E.attackValue(air),4);
 ok(s,{type:'end'});assert.equal(E.attackValue(infantry),3);assert.equal(E.attackValue(tank),5);
});
test('USA retains Patton stats and applies the source-table Phantom II stats',()=>{
 assert.equal(E.LIB.p.find(c=>c.n==='M48 PATTON').o,2);
 assert.equal(E.LIB.p.find(c=>c.n==='M60 PATTON').h,7);
 assert.equal(E.LIB.p.find(c=>c.n==='F-4 PHANTOM II').h,5);
});
test('New cards, builder labels and DOM references are bilingual and complete',()=>{
 assert.equal(E.LIB.france.length,10);assert.equal(E.LIB.drv.length,10);
 for(const c of pool){assert.ok(I.cards[c.n]);I.setLanguage('zh');assert.equal(I.name(c),c.zh);if(c.text)assert.match(I.skillText(c),/\p{Script=Han}/u);I.setLanguage('en');assert.doesNotMatch(I.skillText(c)+I.name(c),/\p{Script=Han}/u);}
 const source=fs.readFileSync(require.resolve('../dist/deck-builder'),'utf8'),html=fs.readFileSync(require.resolve('../dist/index.html'),'utf8');
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const [,id]of source.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.has(id),id);
 for(const [,key]of source.matchAll(/T\('([^']+)'/g))assert.ok(I.messages[key],key);
});
test('AI completes legal games across every available main/ally configuration',()=>{
 for(const main of E.MAIN_NATIONS.filter(E.mainReady))for(const ally of [null,'france','drv',E.FACTIONS[main].opponent]){
  const plan=E.presetDeck(main,ally),enemy=E.opponentDeck(plan);
  const s=E.createGame(()=>.43,main,plan,enemy);
  for(let i=0;i<800&&!s.over;i++){
   const side=s.turn;ok(s,E.chooseAI(s,side),side);assert.ok(s[side].k>=0);assert.ok(s[side].support.length<=4);assert.ok(s[side].front.length<=5);
  }
  assert.equal(s.over,true,main+' / '+ally);
 }
});
