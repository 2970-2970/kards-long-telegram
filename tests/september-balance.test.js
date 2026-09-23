const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),F=require('../dist/card-face'),I=require('../dist/i18n');
const pool=[...E.LIB.p,...E.LIB.soviet,...Object.values(E.GENERATED_CARDS)],get=key=>pool.find(c=>c.key===key);
function game(){const s=E.createGame(()=>.31);for(const side of ['p','e'])Object.assign(s[side],{hand:[],deck:Array.from({length:12},()=>E.card(get('infantry28'))),front:[],support:[],hqIndex:0,k:30,maxK:12,graveyard:[],hp:20});return s;}
function add(s,key,side='p',zone='support',patch={}){const c=Object.assign(E.card(get(key)),patch);s[side][zone].push(c);return c;}
function act(s,a,side=s.turn){const r=E.act(s,side,a);assert.equal(r.ok,true,r.error);return r;}
function play(s,key,targets=[],side=s.turn){const c=add(s,key,side,'hand');return {c,r:act(s,{type:'play',id:c.id,targets},side)};}
test('Classic construction includes one HQ, caps allies and migrates an old full deck',()=>{
 assert.equal(E.DECK_SIZE,40);assert.equal(E.NORMAL_DECK_SIZE,39);
 const old={main:'usa',ally:null,rulesVersion:7,counts:{}};let remaining=45;
 for(const c of E.catalog('usa')){const take=Math.min(remaining,E.copyLimit(c));if(take)old.counts[c.deckId]=take;remaining-=take;}
 const next=E.migrateDeck(old);assert.equal(E.deckIssue(next),'');assert.equal(Object.values(next.counts).reduce((a,b)=>a+b,0),39);assert.equal(next.rulesVersion,9);
 const allies={main:'usa',ally:'ussr',counts:Object.fromEntries(E.LIB.soviet.slice(0,6).map(c=>[c.deckId,E.copyLimit(c)]))};assert.equal(E.deckIssue(allies,false),'deck.allyLimit');
});
test('M60 uses Shock only against units, gains Smoke afterward and preserves its M48 deployment',()=>{
 const s=game(),m=add(s,'m60','p','front'),enemy=add(s,'rifles276','e','support',{kw:['ambush'],a:20,h:20,max:20});
 act(s,{type:'attack',id:m.id,target:enemy.id});assert.equal(m.h,7);assert.equal(enemy.h,14);assert.ok(m.kw.includes('smokescreen'));assert.ok(!m.kw.includes('shock'));assert.equal(m.shockUsed,true);
 assert.ok(F.previewForms(m,{defaults:true}).some(c=>c.kw?.includes('smokescreen')));
 const hq=game(),tank=add(hq,'m60','p','front');act(hq,{type:'attack',id:tank.id,target:'hq'});assert.ok(tank.kw.includes('shock'));assert.ok(!tank.kw.includes('smokescreen'));
 I.setLanguage('zh');assert.match(I.skillText(get('m60')),/“M48巴顿”/);
});
test('Antiwar retreats distinct friendly or enemy targets and grows Marines by two each time',()=>{
 const s=game(),m=add(s,'marines9'),a=add(s,'rifles276','p','front'),b=add(s,'rifles276','e'),order=add(s,'antiwar','p','hand');
 const before=JSON.stringify(s);assert.equal(E.act(s,'p',{type:'play',id:order.id,targets:[a.id,a.id]}).ok,false);assert.equal(JSON.stringify(s),before);
 act(s,{type:'play',id:order.id,targets:[a.id,b.id]});assert.deepEqual([m.a,m.h],[6,8]);assert.ok(s.p.support.includes(a));assert.ok(s.e.hand.some(c=>c.id===b.id));
});
test('Kadena draws an aircraft only and handles an empty pool and full hand',()=>{
 const s=game(),air=E.card(get('mig21'));s.p.deck.splice(4,0,air);play(s,'kadena');assert.equal(s.p.hand[0],air);assert.equal(s.p.deck.length,12);
 const empty=game();play(empty,'kadena');assert.equal(empty.p.hp,20);assert.equal(empty.p.hand.length,0);
 const full=game();for(let i=0;i<9;i++)add(full,'m48','p','hand');full.p.deck=[E.card(get('sabre'))];const {r}=play(full,'kadena');assert.equal(full.p.hand.length,9);assert.ok(r.events.some(e=>e.kind==='burn'));
});
test('Long Telegram draws and sets current infantry attack to current defense without changing the preview',()=>{
 const s=game(),u=add(s,'rifles17','p','front',{h:4,tempAttack:2}),tank=add(s,'m48'),c=add(s,'longTelegram','p','hand');assert.deepEqual(E.targetCandidates(s,'p',c),[u.id]);
 assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[tank.id]}).ok,false);act(s,{type:'play',id:c.id,targets:[u.id]});assert.equal(E.attackValue(u),4);assert.equal(u.h,4);assert.equal(s.p.hand.length,1);assert.equal(F.defaultForm(u).a,1);
});
test('Victorious February draws and increases two distinct enemies operation costs permanently',()=>{
 const s=game(),a=add(s,'m48','e'),b=add(s,'sabre','e'),c=add(s,'victoriousFebruary','p','hand');assert.equal(E.targetSteps(s,'p',c).length,2);
 assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[a.id,a.id]}).ok,false);act(s,{type:'play',id:c.id,targets:[a.id,b.id]});assert.equal(a.o,4);assert.equal(b.o,3);assert.equal(s.p.hand.length,2);
 act(s,{type:'end'});act(s,{type:'end'});assert.equal(a.o,4);
});
test('Czech Hedgehog pins without resetting stats and still triggers cheap tanks Destruction',()=>{
 for(const [key,dead] of [['t54',true],['m60',false],['rifles17',false]]){
  const s=game(),u=add(s,key,'e','front',{c:key==='t54'?3:get(key).c,h:1,a:20,destruction:'damageHQ',destructionDamage:9});play(s,'czechHedgehog',[u.id]);assert.equal(s.p.hp,dead?11:20);
  assert.equal(!E.loc(s,'e',u.id),dead);if(!dead){assert.equal(u.h,1);assert.equal(u.a,20);assert.ok(u.kw.length);assert.ok(u.pinned);assert.equal(u.suppressed,undefined);assert.equal(u.destruction,'damageHQ');assert.match(F.statusMarkup(u),/status-pinned/);}
 }
 const s=game(),air=add(s,'sabre','e'),c=add(s,'czechHedgehog','p','hand');assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[air.id]}).ok,false);
});
test('MiG checks another air unit on either side',()=>{
 for(const who of [null,'p','e']){const s=game();if(who)add(s,'sabre',who);const {c}=play(s,'mig21');assert.equal(c.o,who?1:2);assert.equal(c.sleeping,false);}
});
test('Those Days discounts only ground cards already in hand, floors at zero and can lose the game',()=>{
 const s=game(),ground=add(s,'rifles92','p','hand'),tank=add(s,'m60','p','hand'),air=add(s,'sabre','p','hand'),order=add(s,'nato','p','hand');play(s,'thoseDays');assert.deepEqual([s.p.hp,ground.c,tank.c,air.c,order.c],[16,0,6,3,5]);play(s,'thoseDays');assert.equal(ground.c,0);assert.equal(tank.c,4);
 const lethal=game();lethal.p.hp=4;play(lethal,'thoseDays');assert.equal(lethal.winner,'e');
});
test('Card abilities and buff feedback use signed attack-defense pairs without slashes and explicit operation-cost grants',()=>{
 const fs=require('node:fs');
 for(const file of ['engine','i18n','battle-effects']){
  const source=fs.readFileSync(require.resolve('../dist/'+file+'.js'),'utf8');
  assert.doesNotMatch(source,/[+-](?:\d+|\{amount\})\/[+-](?:\d+|\{amount\})/);
  assert.doesNotMatch(source,/行动(?:花费|费用|费)\s*[+-]/);
 }
 assert.match(get('marines9').zhText,/获得\+2\+2/);assert.match(get('blackhorse').text,/\+1\+1/);
 I.setLanguage('zh');assert.equal(I.skillText(get('t64a')),'本单位消灭1个敌方单位时，获得-1重甲。');
 for(const key of ['mig21','searchAndDestroy'])assert.match(I.skillText(get(key)),/获得-1行动花费/);
 assert.equal(I.message('Gain -1 operation cost this turn.'),'本回合获得-1行动花费。');
});
test('T62 death reaction fights through targeting restrictions without paying or consuming an attack',()=>{
 const s=game(),tank=add(s,'t62Tank','p','support',{sleeping:true}),ally=add(s,'t54','p','front',{h:1}),enemy=add(s,'rifles276','e','front',{kw:['smokescreen'],h:8,max:8,a:2});s.turn='e';s.p.k=0;
 const strike=add(s,'airStrike','e','hand');const r=act(s,{type:'play',id:strike.id,target:ally.id});assert.equal(enemy.h,2);assert.equal(tank.h,4);assert.equal(tank.attacks,0);assert.equal(tank.sleeping,true);assert.equal(s.p.k,0);assert.ok(r.events.some(e=>e.kind==='battle'));
});
test('T62 chains stop when participants die and ignores infantry deaths or an empty front',()=>{
 const s=game(),a=add(s,'t62Tank','p','support',{h:1}),b=add(s,'t62Tank','p','support',{h:1});add(s,'t54','p','support',{h:0});add(s,'rifles276','e','front',{a:3,h:20,max:20});const r=act(s,{type:'end'});assert.equal(s.p.support.length,0);assert.equal(r.events.filter(e=>e.kind==='battle').length,2);
 const empty=game(),tank=add(empty,'t62Tank');add(empty,'rifles276','p','front',{h:0});const clean=act(empty,{type:'end'});assert.equal(tank.h,5);assert.equal(clean.events.some(e=>e.kind==='battle'),false);
});
test('Round-end ground buffs expire after the second player finishes, including on that player cards',()=>{
 for(const side of ['p','e']){const s=game();s.turn=side;const u=add(s,'rifles276',side);play(s,'fightingGirlfriend',[],side);act(s,{type:'end'});assert.equal(u.a,side==='p'?4:2);if(side==='p')act(s,{type:'end'});assert.equal(u.a,2);assert.equal(u.max,3);}
});
