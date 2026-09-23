const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),F=require('../dist/card-face'),I=require('../dist/i18n');
const get=key=>[...E.LIB.p,...E.LIB.soviet,...Object.values(E.GENERATED_CARDS)].find(c=>c.key===key);
function game(){const s=E.createGame(()=>.4);for(const side of ['p','e'])Object.assign(s[side],{hand:[],deck:Array.from({length:15},()=>E.card(get('infantry28'))),front:[],support:[],graveyard:[],hqIndex:0,k:30,maxK:12,hp:20});return s;}
function add(s,key,side='p',zone='support',patch={}){const c=Object.assign(E.card(get(key)),patch);s[side][zone].push(c);return c;}
function act(s,a,side=s.turn){const r=E.act(s,side,a);assert.equal(r.ok,true,r.error);return r;}
function play(s,key,targets=[],choice){const c=add(s,key,s.turn,'hand');return {c,r:act(s,{type:'play',id:c.id,targets,...(choice?{choice}:{})})};}
test('New stats and rarity caps match the September 23 balance',()=>{
 const stats={m48:[6,2,5,6,'limited'],m60:[8,2,6,7,'elite'],b52:[10,4,8,8,'elite'],azpS60:[2,2,3,1,'standard'],t54:[5,2,5,4,'limited'],t62Tank:[6,2,6,5,'special'],t64a:[7,2,7,5,'elite'],obiekt279:[8,3,7,7,'elite']};
 for(const [key,want] of Object.entries(stats)){const c=get(key);assert.deepEqual([c.c,c.o,c.a,c.h,c.rarity],want,key);}
 assert.equal(get('kadena').rarity,'limited');assert.equal(get('marshall').n,'MARSHALL PLAN');
 for(const main of E.MAIN_NATIONS)for(const ally of [null,'france','drv',E.FACTIONS[main].opponent])assert.equal(E.deckIssue(E.presetDeck(main,ally)),'');
});
test('M48 fully repairs infantry and grants Shock instead of an operation discount; M60 keeps its summon and Shock',()=>{
 const s=game(),inf=add(s,'marines9','p','front',{h:1});play(s,'m48',[inf.id]);assert.equal(inf.h,4);assert.equal(inf.o,3);assert.ok(inf.kw.includes('shock'));
 const other=game(),{c}=play(other,'m60');assert.deepEqual(c.kw,['heavyArmor','shock']);assert.equal(other.p.support.find(c=>c.key==='m48').h,6);
});
test('B52 deploy targets only enemy support or HQ and other bombers gain a live Guard aura',()=>{
 const s=game(),bomb=add(s,'canberra'),front=add(s,'rifles276','e','front'),rear=add(s,'m48','e'),c=add(s,'b52','p','hand');assert.deepEqual(E.targetCandidates(s,'p',c),[rear.id,'hq']);assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[front.id]}).ok,false);
 act(s,{type:'play',id:c.id,targets:['hq']});assert.equal(s.e.hp,16);assert.equal(E.attackValue(bomb,null,{},s),4);assert.ok(E.effectiveKeywords(bomb,s).includes('guard'));assert.ok(!E.effectiveKeywords(c,s).includes('guard'));
 assert.ok(E.guardSources(s,'p','support','hq').includes(bomb));assert.ok(F.previewForms(bomb,{defaults:true,state:s}).some(c=>c.kw.includes('guard')));
 act(s,{type:'end'});assert.ok(E.effectiveKeywords(bomb,s).includes('guard'));assert.ok(!bomb.spentKeywords?.includes('guard'));
 E.suppress(s,'p',c);assert.equal(E.attackValue(bomb,null,{},s),3);assert.ok(!E.effectiveKeywords(bomb,s).includes('guard'));
});
test('Marshall requires an explicit choice, draws three or banks Kredits without growing slots',()=>{
 const s=game(),c=add(s,'marshall','p','hand'),before=JSON.stringify(s);assert.equal(E.act(s,'p',{type:'play',id:c.id}).ok,false);assert.equal(JSON.stringify(s),before);assert.deepEqual(E.playActions(s,'p',c).map(a=>a.choice),['draw','kredits']);
 act(s,{type:'play',id:c.id,choice:'draw'});assert.equal(s.p.hand.length,3);assert.equal(s.p.maxK,11);
 const delayed=game();delayed.p.maxK=3;delayed.p.k=3;play(delayed,'marshall',[],'kredits');assert.equal(delayed.p.pendingKredits,3);assert.equal(delayed.p.k,1);assert.equal(delayed.p.maxK,2);act(delayed,{type:'end'});assert.equal(delayed.p.pendingKredits,3);act(delayed,{type:'end'});assert.equal(delayed.p.k,6);assert.equal(delayed.p.maxK,3);assert.equal(delayed.p.pendingKredits,0);
});
test('Bretton Woods delayed Kredits stack once, on the correct owner next turn',()=>{
 for(const who of ['p','e']){const s=game();s.turn=who;play(s,'brettonWoods');play(s,'brettonWoods');assert.equal(s[who].pendingKredits,4);act(s,{type:'end'});act(s,{type:'end'});assert.equal(s[who].k,16);assert.equal(s[who].maxK,12);act(s,{type:'end'});act(s,{type:'end'});assert.equal(s[who].k,12);}
});
test('Containment suppresses its target but damages only adjacent targets including HQ',()=>{
 const s=game(),a=add(s,'m48','e'),b=add(s,'rifles17','e','support',{h:1,a:10}),c=add(s,'phantom','e');s.e.hqIndex=1;play(s,'containment',[b.id]);assert.equal(b.suppressed,true);assert.equal(b.h,6);assert.equal(b.a,1);assert.equal(s.e.hp,18);assert.equal(c.h,3);assert.equal(a.h,6);assert.deepEqual(b.kw,[]);
});
test('Limited War affects both players ground attack and retaliation, includes later units, and expires',()=>{
 const s=game(),u=add(s,'rifles276','p','front'),enemy=add(s,'t54','e'),air=add(s,'sabre');play(s,'limitedWar');assert.equal(E.attackValue(u,null,{},s),0);assert.equal(E.attackValue(enemy,null,{},s),3);assert.equal(E.retaliation(u,enemy,s),3);assert.equal(E.attackValue(air,null,{},s),3);const later=add(s,'m48');assert.equal(E.attackValue(later,null,{},s),3);act(s,{type:'end'});assert.equal(E.attackValue(u,null,{},s),2);assert.equal(E.attackValue(enemy,null,{},s),5);
});
test('Those Days temporary discounts stack with a zero floor and restore unplayed and deployed cards correctly',()=>{
 const s=game(),tank=add(s,'m48','p','hand'),cheap=add(s,'rifles92','p','hand'),air=add(s,'sabre','p','hand');play(s,'thoseDays');play(s,'thoseDays');assert.deepEqual([tank.c,cheap.c,air.c,s.p.hp],[2,0,3,12]);act(s,{type:'end'});assert.deepEqual([tank.c,cheap.c],[6,1]);
 const deployed=game(),t=add(deployed,'m48','p','hand');play(deployed,'thoseDays');const k=deployed.p.k;act(deployed,{type:'play',id:t.id});assert.equal(deployed.p.k,k-4);assert.equal(t.c,6);assert.equal(t.handTurnDiscount,undefined);
});
test('AZP reacts to enemy aircraft moves and attacks, not deployments or ground actions, and suppression stops it',()=>{
 const s=game(),gun=add(s,'azpS60'),air=add(s,'sabre','e');s.turn='e';act(s,{type:'move',id:air.id});assert.equal(air.h,2);assert.equal(gun.h,1);
 const attacks=game();add(attacks,'azpS60');const bomber=add(attacks,'canberra','e');attacks.turn='e';act(attacks,{type:'attack',id:bomber.id,target:'hq'});assert.equal(bomber.h,2);assert.equal(attacks.p.hp,17);
 const deployment=game(),silent=add(deployment,'azpS60');deployment.turn='e';const {c}=play(deployment,'sabre');assert.equal(c.h,3);E.suppress(deployment,'p',silent);c.sleeping=false;act(deployment,{type:'move',id:c.id});assert.equal(c.h,3);
});
test('T54 anti-tank attack applies on attack and retaliation, but not to infantry or HQ',()=>{
 const s=game(),tank=add(s,'t54'),target=add(s,'m48','e');assert.deepEqual(tank.kw,['heavyArmor']);assert.equal(E.attackValue(tank,target,{},s),7);assert.equal(E.retaliation(target,tank,s),7);assert.equal(E.attackValue(tank,null,{},s),5);assert.equal(tank.deployTempOperation,undefined);
});
test('T64 loses intrinsic armor for each enemy kill, keeps Fury and never gains the old operation discount',()=>{
 const s=game(),t=add(s,'t64a','p','front'),a=add(s,'rifles276','e','support',{a:1}),b=add(s,'rifles276','e','support',{a:1});assert.ok(t.kw.includes('blitz'));
 act(s,{type:'attack',id:t.id,target:a.id});assert.equal(t.armor,1);assert.equal(t.h,5);assert.equal(E.operationCost(s,'p',t,'attack'),2);act(s,{type:'attack',id:t.id,target:b.id});assert.equal(t.armor,0);assert.ok(!t.kw.includes('heavyArmor'));assert.equal(t.h,5);assert.match(F.statusMarkup(t),/status-heavyArmor status-spent/);
});
test('Obiekt discards enemy orders after surviving attacks and defense, never units or on its own death',()=>{
 for(const defending of [false,true]){const s=game(),t=add(s,'obiekt279','p',defending?'support':'front'),enemy=add(s,'rifles276','e',defending?'front':'support',{h:20,max:20}),order=add(s,'cia','e','hand'),unit=add(s,'sabre','e','hand');s.turn=defending?'e':'p';const r=act(s,{type:'attack',id:defending?enemy.id:t.id,target:defending?t.id:enemy.id});assert.ok(!s.e.hand.includes(order));assert.ok(s.e.hand.includes(unit));assert.equal(r.events.filter(e=>e.kind==='discard').length,1);}
 const dead=game(),t=add(dead,'obiekt279','p','front',{h:1}),enemy=add(dead,'rifles276','e','support',{a:20,h:20,max:20});add(dead,'cia','e','hand');act(dead,{type:'attack',id:t.id,target:enemy.id});assert.equal(dead.e.hand.length,1);
});
