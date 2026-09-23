const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),I=require('../dist/i18n'),Face=require('../dist/card-face');
const get=key=>E.LIB.p.find(c=>c.key===key)||E.GENERATED_CARDS[key];
function game(){const s=E.createGame(()=>.4);for(const who of ['p','e'])Object.assign(s[who],{hand:[],deck:[],front:[],support:[],hqIndex:0,k:30,maxK:12,graveyard:[]});return s;}
function add(s,key,side='p',zone='support',patch={}){const u=Object.assign(E.card(get(key)),patch);s[side][zone].push(u);return u;}
function act(s,a,side='p'){const r=E.act(s,side,a);assert.equal(r.ok,true,r.error);return r;}
function play(s,key,targets=[]){const c=add(s,key,'p','hand');return act(s,{type:'play',id:c.id,targets});}

test('US pool exactly follows updated card balance; generated card stays outside construction',()=>{
 const expected={thunderchief:[5,2,4,3,'limited'],blackhorse:[3,1,3,4,'standard'],iroquois:[1,2,2,2,'limited'],searchAndDestroy:[8,undefined,undefined,undefined,'elite'],marines9:[1,3,2,4,'limited'],bobcats5:[1,1,2,3,'limited'],infantry28:[2,1,3,2,'standard'],wolfhounds:[3,2,3,4,'special'],bulldogs:[5,1,2,4,'special'],m48:[6,2,5,6,'limited'],m60:[8,2,6,7,'elite'],sabre:[3,1,3,3,'standard'],phantom:[5,2,4,5,'special'],canberra:[4,2,3,3,'standard'],b52:[10,4,8,8,'elite'],marshall:[2,undefined,undefined,undefined,'standard'],cia:[2,undefined,undefined,undefined,'limited'],interdiction:[4,undefined,undefined,undefined,'special'],airStrike:[3,undefined,undefined,undefined,'standard'],nato:[5,undefined,undefined,undefined,'special']};
 assert.equal(E.LIB.p.length,26);
 for(const [key,stats] of Object.entries(expected)){const c=get(key);assert.ok(c,key);assert.deepEqual([c.c,c.o,c.a,c.h,c.rarity],stats,key);}
 assert.equal(get('citation').c,3);assert.equal(E.copyLimit(get('citation')),0);
 assert.ok(!E.catalog('usa').includes(get('citation')));
 assert.equal(E.deckIssue({main:'usa',counts:{[get('citation').deckId]:1}},false),'deck.wrongNation');
});
test('Rarity limits apply to every main/ally combination and all saved plans',()=>{
 for(const main of E.MAIN_NATIONS)for(const ally of [null,'france','drv',E.FACTIONS[main].opponent]){
  const p=E.presetDeck(main,ally);assert.equal(E.deckIssue(p),E.mainReady(main)?'':'deck.mainUnavailable');
  for(const c of E.catalog(main,ally)){
   const cap=E.copyLimit(c);assert.ok(cap>0);assert.ok((p.counts[c.deckId]||0)<=cap);
   assert.equal(E.deckIssue({...p,counts:{[c.deckId]:cap}},false),'');
   assert.equal(E.deckIssue({...p,counts:{[c.deckId]:cap+1}},false),'deck.rarityLimit');
  }
 }
 assert.deepEqual(E.LIB.soviet.filter(c=>c.rarity==='elite').map(c=>c.key),['rifles16','cavalry11','t64a','obiekt279']);
 const old={main:'usa',ally:null,rulesVersion:2,counts:Object.fromEntries(Array.from({length:12},(_,i)=>['usa:'+i,i===11?1:4]))};
 const next=E.migrateDeck(old);assert.equal(E.deckIssue(next),'');assert.equal(next.rulesVersion,9);assert.deepEqual(E.migrateDeck(next),next);
 const invalid={...next,counts:{'usa:0':4}};assert.equal(E.migrateDeck(invalid),null);
 const partial=E.migrateDeck({...old,counts:{'usa:1':3,'usa:4':2,'usa:2':4}});assert.deepEqual(partial.counts,{'usa:2':3});
});
test('Bobcats draws the next tank on either turn; no tank does not fatigue, full hand burns once',()=>{
 for(const side of ['p','e']){
  const s=game(),bob=add(s,'bobcats5',side),tank=E.card(get('m48')),order=E.card(get('cia'));
  s[side].deck=[order,tank];const enemy=E.other(side);s.turn=enemy;
  const strike=add(s,'airStrike',enemy,'hand');const r=act(s,{type:'play',id:strike.id,target:bob.id},enemy);
  assert.equal(s[side].hand[0].id,tank.id);assert.equal(s[side].deck[0].id,order.id);assert.equal(r.events.filter(e=>e.kind==='draw').length,1);
 }
 for(const full of [false,true]){
  const s=game();s.e.deck=full?[E.card(get('m48'))]:[E.card(get('cia'))];
  if(full)s.e.hand=Array.from({length:9},()=>E.card(get('m48')));
  const bob=add(s,'bobcats5','e'),strike=add(s,'airStrike','p','hand');const r=act(s,{type:'play',id:strike.id,target:bob.id});
  assert.equal(s.e.hp,20);assert.equal(s.e.fatigue,0);assert.equal(r.events.filter(e=>e.kind==='burn').length,full?1:0);
 }
});
test('Wolfhounds has no Ambush or Destruction after its ability replacement',()=>{
 const c=get('wolfhounds');assert.deepEqual(c.kw||[],[]);assert.equal(c.destruction,undefined);assert.equal(c.fighterDeployCopy,true);
 const s=game(),wolf=add(s,'wolfhounds','e'),tank=add(s,'m60','p','front');
 const r=act(s,{type:'attack',id:tank.id,target:wolf.id});assert.ok(E.loc(s,'p',tank.id));assert.equal(E.loc(s,'e',wolf.id),null);assert.equal(r.events.filter(e=>e.kind==='destroy').length,1);
});
test('Simultaneous and chained Destruction resolve once without resurrecting casualties',()=>{
 const s=game(),wolf=add(s,'wolfhounds','p','front'),bob=add(s,'bobcats5','e','support',{a:5,h:3});s.e.deck=[E.card(get('m48'))];
 const r=act(s,{type:'attack',id:wolf.id,target:bob.id});assert.equal(r.events.filter(e=>e.kind==='destroy').length,2);assert.equal(s.e.hand.length,1);
});
test('Bulldogs requires another unit in the frontline, promotes once and produces its 3 K order',()=>{
 const s=game(),b=add(s,'bulldogs');E.readyUnits(s,'p');assert.ok(!b.veteran);
 act(s,{type:'move',id:b.id});assert.ok(!b.veteran);E.readyUnits(s,'p');assert.ok(!b.veteran);
 E.retreat(s,'p',b.id);add(s,'m48','p','front');const r=act(s,{type:'move',id:b.id});
 assert.deepEqual([b.c,b.o,b.a,b.h,b.n],[5,1,5,4,'BASTOGNE BULLDOGS']);assert.ok(b.veteran);assert.ok(b.moved);
 assert.equal(r.events.filter(e=>e.transition==='veteran').length,1);assert.equal(s.p.hand[0].key,'citation');assert.equal(s.p.hand[0].c,3);
 E.readyUnits(s,'p');E.retreat(s,'p',b.id);act(s,{type:'move',id:b.id});assert.equal(s.p.hand.length,1);
 assert.equal(Face.previewForms(b).length,2);
});
test('Veteran reward honors full hands and permanent buffs persist through promotion',()=>{
 const s=game(),b=add(s,'bulldogs');add(s,'m48','p','front');
 b.h+=4;b.max+=4;b.o=0;assert.deepEqual([b.h,b.max,b.o],[8,8,0]);
 s.p.hand=Array.from({length:9},()=>E.card(get('m48')));const r=act(s,{type:'move',id:b.id});
 assert.deepEqual([b.a,b.h,b.max,b.o],[5,8,8,0]);assert.equal(r.events.filter(e=>e.kind==='burn').length,1);assert.equal(s.p.hand.length,9);
});
test('Citation retreats every frontline unit, retaining damage/actions; full support destroys overflow and triggers Destruction',()=>{
 const s=game(),one=add(s,'m48','e','front',{h:1,attacked:true}),two=add(s,'bobcats5','e','front');
 for(let i=0;i<3;i++)add(s,'m48','e');s.e.deck=[E.card(get('m60'))];
 const r=play(s,'citation');assert.equal(s.e.front.length,0);assert.equal(s.e.support.length,4);assert.equal(one.h,1);assert.ok(one.attacked);
 assert.ok(s.e.graveyard.some(c=>c.key==='bobcats5'));assert.equal(s.e.hand[0].key,'m60');assert.equal(r.events.filter(e=>e.kind==='destroy').length,1);
});
test('Heavy Armor reduces incoming attack and retaliation, never order damage',()=>{
 const s=game(),p=add(s,'phantom'),enemy=add(s,'m48','e','support',{a:3,h:4});
 act(s,{type:'attack',id:p.id,target:enemy.id});assert.equal(p.h,3);assert.equal(s.e.support.length,0);
 const s2=game(),target=add(s2,'phantom','e'),attacker=add(s2,'sabre');act(s2,{type:'attack',id:attacker.id,target:target.id});assert.equal(target.h,3);
 const strike=add(s2,'airStrike','p','hand');act(s2,{type:'play',id:strike.id,target:target.id});assert.equal(s2.e.support.length,0);
});
test('New cards and rules are bilingual; all four tiny chess assets exist, generated cards have no rarity',()=>{
 const fs=require('node:fs'),path=require('node:path');
 for(const lang of ['zh','en']){I.setLanguage(lang);for(const c of [...E.LIB.p,get('citation')]){
  assert.equal(/\p{Script=Han}/u.test(I.name(c)),lang==='zh');if(c.text)assert.equal(/\p{Script=Han}/u.test(I.skillText(c)),lang==='zh');
 }}
 for(const rarity of Object.keys(E.RARITIES)){assert.ok(fs.existsSync(path.join(__dirname,'../dist/assets/emblems/rarity-'+rarity+'.svg')));assert.match(Face.markup({...get('m48'),rarity},{i18n:I}),new RegExp('data-rarity="'+rarity+'"'));}
 assert.doesNotMatch(Face.markup(get('citation'),{i18n:I}),/face-rarity/);assert.doesNotMatch(Face.markup(E.GENERATED_CARDS.guards6,{i18n:I}),/face-rarity/);
 for(const id of ['destruction','retreat','heavyArmor'])assert.equal(I.glossary.find(r=>r.id===id).reference,false);
});
test('AI values new effects in actual simulations: uses Citation against a lethal full-backline threat',()=>{
 const s=game();s.turn='e';s.e.hp=3;s.e.k=3;add(s,'citation','e','hand');add(s,'m60','p','front');for(let i=0;i<4;i++)add(s,'m48');
 const action=E.chooseAI(s,'e');assert.equal(action.type,'play');assert.equal(s.e.hand.find(c=>c.id===action.id).key,'citation');
});
test('Bobcats uses unquoted names in both languages',()=>{
 const c=get('bobcats5');I.setLanguage('zh');assert.equal(I.name(c),'第5山猫团');I.setLanguage('en');assert.equal(I.name(c),'5TH BOBCATS');
});
test('Board inspection uses default stats and keywords without modifying the live unit',()=>{
 const c=E.card(get('m48'));Object.assign(c,{a:9,h:1,max:8,o:0,c:2,tempAttack:3,tempBlitz:true,fury:true,kw:['ambush']});
 const before=JSON.stringify(c),[preview]=Face.previewForms(c,{defaults:true});
 assert.deepEqual([preview.c,preview.o,preview.a,preview.h],[6,2,5,6]);assert.deepEqual(preview.kw,[]);
 assert.deepEqual(I.keywordLabels(preview),[]);assert.equal(JSON.stringify(c),before);

 const recovered=E.card({...get('m48'),c:4});assert.equal(Face.defaultForm(recovered).c,6);
});
test('Veteran inspection retains its form but drops combat damage and all external bonuses',()=>{
 const s=game(),u=E.card(E.LIB.soviet[0]);s.p.support=[u];for(let i=0;i<4;i++)E.readyUnits(s,'p');
 Object.assign(u,{a:8,h:1,max:9,o:0});
 const forms=Face.previewForms(u,{defaults:true});assert.deepEqual(forms.map(c=>[c.a,c.h,c.o]),[[2,5,1],[4,5,1]]);
 assert.deepEqual(forms.map(c=>c.kw),[[],['veteran','ambush']]);assert.equal(u.h,1);
});
test('Generated-card references resolve on both forms and deduplicate declarative links',()=>{
 const b=get('bulldogs');assert.deepEqual(Face.relatedCards(b),[get('citation')]);
 const vet={...E.card(b),...b.veteranForm,veteran:true};assert.deepEqual(Face.relatedCards(vet),[get('citation')]);
 const custom={...get('m48'),relatedCards:['citation','generated:presidential-unit-citation','unknown']};assert.deepEqual(Face.relatedCards(custom),[get('citation')]);
 assert.equal(Face.relatedCards(get('citation')).length,0);assert.equal(E.catalog('usa').some(c=>c.generated),false);
 assert.equal(get('citation').rarity,undefined);
});
