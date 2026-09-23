const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),F=require('../dist/card-face'),I=require('../dist/i18n');
const get=key=>[...E.LIB.p,...E.LIB.soviet].find(c=>c.key===key);
function game(){const s=E.createGame(()=>.4);for(const side of ['p','e'])Object.assign(s[side],{hand:[],deck:Array.from({length:12},()=>E.card(get('rifles276'))),front:[],support:[],hqIndex:0,k:30,maxK:12,graveyard:[],hp:20});return s;}
function add(s,key,side,zone='support',patch={}){const c=Object.assign(E.card(get(key)),patch);s[side][zone].push(c);return c;}
function end(s){const r=E.act(s,s.turn,{type:'end'});assert.equal(r.ok,true,r.error);}
test('Pin prevents actions through the target next turn and then expires, for either owner',()=>{
 for(const owner of ['p','e']){
  const s=game(),enemy=E.other(owner),u=add(s,'t54',owner);s.turn=enemy;E.pin(s,owner,u);
  end(s);assert.equal(s.turn,owner);s[owner].k=12;
  for(const a of [{type:'move',id:u.id},{type:'attack',id:u.id,target:'hq'}]){const before=JSON.stringify(s),r=E.act(s,owner,a);assert.equal(r.ok,false);assert.match(r.error,/Pinned/);assert.equal(JSON.stringify(s),before);}
  assert.equal(u.pinned,true);end(s);assert.equal(u.pinned,undefined);end(s);s[owner].k=12;assert.equal(E.moveError(s,owner,u.id),'');
 }
});
test('Pin applied during the owner turn remains through that owner following turn',()=>{
 const s=game(),u=add(s,'t54','p');E.pin(s,'p',u);end(s);assert.equal(u.pinned,true);end(s);assert.equal(u.pinned,true);end(s);assert.equal(u.pinned,undefined);
});
test('Pin preserves Guard, armor, retaliation and triggered abilities instead of suppressing them',()=>{
 const s=game(),defender=add(s,'rifles17','e','support',{a:4,h:12,max:12,kw:['guard','heavyArmor'],armor:2}),attacker=add(s,'m48','p','front',{a:3,h:4});E.pin(s,'e',defender);
 assert.ok(E.guardSources(s,'e','support','hq').some(c=>c.id===defender.id));assert.equal(defender.deployGenerate,'closedCity');
 const r=E.act(s,'p',{type:'attack',id:attacker.id,target:defender.id});assert.equal(r.ok,true);assert.equal(defender.h,11);assert.equal(attacker.h,0);assert.equal(defender.a,4);assert.deepEqual(defender.kw,['guard','heavyArmor']);
});
test('Pin and Suppress have independent simultaneous icons, and returning to hand clears both',()=>{
 const s=game(),u=add(s,'rifles17','p');E.pin(s,'p',u);E.suppress(s,'p',u);
 assert.equal(u.pinned,true);assert.equal(u.suppressed,true);const html=F.statusMarkup(u);assert.match(html,/status-pinned/);assert.match(html,/status-suppressed/);assert.doesNotMatch(html,/status-(?:pinned|suppressed) status-spent/);
 E.retreat(s,'p',u.id);const hand=s.p.hand.find(c=>c.id===u.id);assert.equal(hand.pinned,undefined);assert.equal(hand.suppressed,undefined);assert.deepEqual(hand.kw,['guard']);
});
test('Suppression alone leaves a unit able to act and still restores its printed stats',()=>{
 const s=game(),u=add(s,'t54','p','support',{a:9,h:1});E.suppress(s,'p',u);assert.deepEqual([u.a,u.h,u.o],[5,4,2]);assert.equal(E.act(s,'p',{type:'move',id:u.id}).ok,true);
});
test('Pin and Suppress remain separate rules and translated abilities, never combat keywords',()=>{
 I.setLanguage('zh');assert.equal(I.t('Pin'),'压制');assert.equal(I.t('Suppress'),'抑制');assert.equal(I.t('Pinned.'),'已被压制。');assert.equal(I.t('Suppressed.'),'已被抑制。');assert.match(I.skillText(get('wolfhounds')),/被抑制/);
 I.setLanguage('en');assert.match(I.skillText(get('czechHedgehog')),/^Pin /);assert.match(I.skillText(E.GENERATED_CARDS.closedCity),/^Pin /);assert.match(I.skillText(get('wolfhounds')),/Suppressed/);
 for(const id of ['pin','suppress']){assert.equal(I.glossary.find(r=>r.id===id).group,'effects');assert.ok(!E.COMBAT_KEYWORDS.includes(id));}
});
test('AI never spends an action moving or attacking with a pinned unit',()=>{
 const s=game();s.turn='e';s.e.k=12;const u=add(s,'t54','e','front');E.pin(s,'e',u);assert.equal(E.chooseAI(s,'e').type,'end');
});
