const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),F=require('../dist/card-face'),I=require('../dist/i18n');
const templates=Object.fromEntries([...E.LIB.soviet,...require('./fixtures/legacy-soviet.json'),...E.LIB.p,...Object.values(E.GENERATED_CARDS)].map(c=>[c.key,c]));
function game(){const s=E.createGame(()=>.4);for(const side of ['p','e'])Object.assign(s[side],{hand:[],deck:Array.from({length:20},()=>E.card(templates.rifles276)),support:[],front:[],graveyard:[],hqIndex:0,k:12,maxK:12});return s;}
function unit(s,key,side='p',zone='support',patch={}){const c=Object.assign(E.card(templates[key]),patch);s[side][zone].push(c);return c;}
function act(s,side,a){const r=E.act(s,side,a);assert.equal(r.ok,true,r.error);return r;}
function play(s,key,side='p',options={}){const c=E.card(templates[key]);s[side].hand.push(c);const r=act(s,side,{type:'play',id:c.id,...options});return {c,r};}
test('Reworked Soviet units have exact costs, stats, types and rarity caps; older full decks migrate legally',()=>{
 const stats={rifles16:[3,1,2,5,'elite'],guards6:[5,1,5,6,undefined],rifles17:[3,2,1,6,'limited'],guards68:[5,1,3,5,'special'],rifles92:[1,0,2,2,'standard'],cavalry11:[2,0,0,3,'elite'],rifles276:[1,1,2,3,'standard']};
 for(const [key,values] of Object.entries(stats)){const c=templates[key];assert.deepEqual([c.c,c.o,c.a,c.h,c.rarity],values);assert.equal(c.t,'infantry');if(!c.generated)assert.equal(c.elite,c.rarity==='elite');}
 const old=E.presetDeck('ussr');old.rulesVersion=4;old.counts['ussr:0']=3;old.counts['ussr:4']=4;
 while(Object.values(old.counts).reduce((a,b)=>a+b,0)>45){const id=Object.keys(old.counts).find(id=>!['ussr:0','ussr:4'].includes(id)&&old.counts[id]>0);old.counts[id]--;}
 const migrated=E.migrateDeck(old);assert.equal(E.deckIssue(migrated),'');assert.equal(migrated.counts['ussr:0'],1);assert.equal(migrated.counts['ussr:4'],1);
});
test('Bulldogs shows Veteran only on its promoted face while both forms remain available in hand and library',()=>{
 for(const card of [templates.bulldogs,E.card(templates.bulldogs)]){
  const forms=F.previewForms(card,{defaults:true});assert.equal(forms.length,2);assert.deepEqual(forms[0].kw,[]);assert.deepEqual(forms[1].kw,['veteran']);
 }
});
test('Regiment Destruction produces the generated 6th Guards only after promotion, once, and honors the hand limit',()=>{
 for(const promoted of [false,true])for(const full of [false,true]){
  const s=game(),u=unit(s,'rifles16');if(promoted)for(let i=0;i<3;i++)E.readyUnits(s,'p');
  if(full)s.p.hand=Array.from({length:9},()=>E.card(templates.rifles276));u.h=0;
  const r=act(s,'p',{type:'end'});assert.equal(s.p.hand.filter(c=>c.key==='guards6').length,promoted&&!full?1:0);
  assert.equal(r.events.filter(e=>e.kind==='generate').length,promoted&&!full?1:0);
  if(promoted&&full)assert.equal(r.events.filter(e=>e.kind==='burn').length,1);
 }
 assert.deepEqual(F.relatedCards(templates.rifles16).map(c=>c.key),['guards6']);
});
test('Shock prevents Ambush retaliation, expires only against units, and never returns next turn',()=>{
 for(const side of ['p','e']){
  const s=game();s.turn=side;const other=E.other(side),a=unit(s,'guards6',side,'front'),d=unit(s,'wolfhounds',other,'support',{a:9,h:20,max:20,kw:['ambush']});
  act(s,side,{type:'attack',id:a.id,target:'hq'});assert.ok(a.kw.includes('shock'));E.readyUnits(s,side);
  act(s,side,{type:'attack',id:a.id,target:d.id});assert.equal(a.h,6);assert.equal(d.h,15);assert.equal(a.kw.includes('shock'),false);assert.equal(a.shockUsed,true);
  E.readyUnits(s,side);assert.equal(a.kw.includes('shock'),false);act(s,side,{type:'attack',id:a.id,target:d.id});assert.equal(E.loc(s,side,a.id),null);
 }
});
test('Tank armor aura works on either line, never stacks or weakens stronger armor, and ends with its source',()=>{
 const s=game(),source=unit(s,'guards6'),tank=unit(s,'t54a','p','front'),enemy=unit(s,'t54a','e','front');
 assert.equal(E.armorValue(tank,s),1);assert.equal(E.armorValue(source,s),0);assert.equal(E.armorValue(enemy,s),0);
 unit(s,'guards6');assert.equal(E.armorValue(tank,s),1);assert.equal(E.combatDamage(3,tank,s),2);
 s.p.support.pop();tank.kw.push('heavyArmor');tank.armor=2;assert.equal(E.armorValue(tank,s),2);tank.kw=[];
 const forms=F.previewForms(tank,{defaults:true,state:s});assert.equal(forms.length,2);assert.deepEqual(forms[1].kw,['heavyArmor']);assert.equal(forms[1].armor,1);
 E.suppress(s,'p',source);assert.equal(E.armorValue(tank,s),0);assert.equal(F.previewForms(tank,{defaults:true,state:s}).length,1);
});
test('Tank aura reduces actual combat damage but not order damage',()=>{
 const s=game();unit(s,'guards6');const tank=unit(s,'t54a'),attacker=unit(s,'m48','e','front');s.turn='e';
 act(s,'e',{type:'attack',id:attacker.id,target:tank.id});assert.equal(tank.h,1);
 play(s,'airStrike','e',{target:tank.id});assert.equal(E.loc(s,'p',tank.id),null);
});
test('17th and 68th generate their own hidden orders on deployment, with bilingual references and no rarity',()=>{
 for(const [key,order] of [['rifles17','closedCity'],['guards68','fightingGirlfriend']]){
  const s=game();play(s,key);assert.equal(s.p.hand[0].key,order);assert.equal(s.p.hand[0].c,2);
  assert.equal(E.catalog('ussr').some(c=>c.key===order),false);assert.equal(E.copyLimit(templates[order]),0);assert.equal(templates[order].rarity,undefined);
  assert.deepEqual(F.relatedCards(templates[key]).map(c=>c.key),[order]);
  I.setLanguage('zh');assert.ok(I.skillText(templates[key]).includes('1张“'));I.setLanguage('en');assert.doesNotMatch(I.skillText(templates[key]),/[“”"]/);
 }
});
test('Closed City pins distinct frontline ground units, excluding support and air, preserving damage and abilities',()=>{
 const s=game(),a=unit(s,'rifles17','p','front',{a:9,h:2,max:12,o:0}),b=unit(s,'guards68','p','front'),air=unit(s,'sabre','p','front'),rear=unit(s,'guards6','e');
 play(s,'closedCity');assert.equal(a.pinned,true);assert.equal(b.pinned,true);assert.equal(air.pinned,undefined);assert.equal(rear.pinned,undefined);
 assert.deepEqual([a.a,a.h,a.max,a.o],[9,2,12,0]);assert.deepEqual(a.kw,['guard']);assert.equal(a.deployGenerate,'closedCity');assert.equal(b.deployGenerate,'fightingGirlfriend');
 const s2=game(),e=unit(s2,'guards6','e','front');play(s2,'closedCity');assert.equal(e.pinned,true);
 const empty=game();assert.doesNotThrow(()=>play(empty,'closedCity'));
});
test('Suppression stops promotion and Destruction; retreating to hand restores the original card',()=>{
 const s=game(),u=unit(s,'rifles16');for(let i=0;i<3;i++)E.readyUnits(s,'p');E.suppress(s,'p',u);u.h=0;act(s,'p',{type:'end'});assert.equal(s.p.hand.length,0);
 const s2=game(),base=unit(s2,'rifles16');E.suppress(s2,'p',base);for(let i=0;i<5;i++)E.readyUnits(s2,'p');assert.equal(base.veteran,undefined);
 E.retreat(s2,'p',base.id);const restored=s2.p.hand[0];assert.equal(restored.suppressed,undefined);assert.equal(restored.veteranTurns,3);assert.equal(restored.turnsOnBoard,undefined);
});
test('Fighting Girlfriend lasts through the enemy turn and expires at the next friendly start without erasing other buffs',()=>{
 for(const side of ['p','e']){
  const s=game();s.turn=side;const ground=unit(s,'rifles276',side),air=unit(s,'sabre',side);play(s,'fightingGirlfriend',side);play(s,'fightingGirlfriend',side);
  assert.deepEqual([ground.a,ground.h,ground.max],[6,7,7]);assert.equal(air.a,3);ground.a++;ground.max++;ground.h++;
  act(s,side,{type:'end'});assert.equal(ground.a,side==='p'?7:3);ground.h=2;
  act(s,E.other(side),{type:'end'});assert.deepEqual([ground.a,ground.h,ground.max],[3,2,4]);assert.equal(ground.untilNextTurn,undefined);
 }
});
test('92nd moves to the frontline on deployment only when there is room and no enemy there',()=>{
 const s=game(),{c}=play(s,'rifles92');assert.equal(E.loc(s,'p',c.id).zone,'front');assert.equal(c.sleeping,true);assert.equal(s.p.hqIndex,0);
 const blocked=game();unit(blocked,'rifles276','e','front');const b=play(blocked,'rifles92').c;assert.equal(E.loc(blocked,'p',b.id).zone,'support');
 const full=game();for(let i=0;i<5;i++)unit(full,'rifles276','p','front');const f=play(full,'rifles92').c;assert.equal(E.loc(full,'p',f.id).zone,'support');
});
test('Cavalry promotes once after another friendly death and restores the last ground unit without Deployment',()=>{
 for(const side of ['p','e']){
  const s=game();s.turn=side;const cavalry=unit(s,'cavalry11',side),fallen=unit(s,'rifles17',side);fallen.h=0;
  const r=act(s,side,{type:'end'});assert.equal(cavalry.veteran,true);assert.deepEqual([cavalry.a,cavalry.h],[4,3]);assert.equal(r.events.filter(e=>e.transition==='veteran').length,1);
  const returned=s[side].support.find(u=>u.key==='rifles17');assert.ok(returned);assert.notEqual(returned.id,fallen.id);assert.equal(returned.h,6);assert.equal(s[side].hand.length,0);
  returned.h=0;act(s,E.other(side),{type:'end'});assert.equal(s[side].support.filter(u=>u.key==='rifles17').length,0);
 }
});
test('Cavalry revives a prior ground casualty after an air casualty but cannot exceed support capacity or revive itself',()=>{
 const s=game();s.p.graveyard=[templates.rifles92];const c=unit(s,'cavalry11'),air=unit(s,'sabre');air.h=0;act(s,'p',{type:'end'});assert.equal(s.p.support.find(u=>u.key==='rifles92').sleeping,true);assert.equal(c.veteran,true);
 const full=game();const cav=unit(full,'cavalry11');for(let i=0;i<3;i++)unit(full,'rifles276');unit(full,'rifles17','p','front',{h:0});act(full,'p',{type:'end'});assert.equal(cav.veteran,true);assert.equal(full.p.support.length,4);
 const both=game();unit(both,'cavalry11','p','support',{h:0});unit(both,'rifles276','p','support',{h:0});act(both,'p',{type:'end'});assert.equal(both.p.support.length,0);
});
test('Smokescreen blocks unit attacks but not orders, and spent smoke never returns on promotion',()=>{
 const s=game(),c=unit(s,'cavalry11'),enemy=unit(s,'sabre','e');s.turn='e';assert.match(E.attackError(s,'e',enemy.id,c.id),/Smokescreen/);
 const strike=E.card(templates.airStrike);s.e.hand.push(strike);assert.equal(E.playActions(s,'e',strike).some(a=>a.target===c.id),true);s.e.hand=[];
 s.turn='p';act(s,'p',{type:'move',id:c.id});assert.equal(c.kw.includes('smokescreen'),false);unit(s,'rifles276','p','support',{h:0});act(s,'p',{type:'end'});
 assert.equal(c.veteran,true);assert.equal(c.kw.includes('smokescreen'),false);assert.equal(c.smokescreenUsed,true);assert.equal(E.attackError(s,'e',enemy.id,c.id),'');
});
test('Added keyword previews retain original costs and stats, combine grants, preserve Veteran pairs and never mutate live state',()=>{
 const s=game(),u=unit(s,'m48','p','front',{a:20,h:1,max:20,o:0,tempBlitz:true,kw:['ambush']});
 const before=JSON.stringify(u),forms=F.previewForms(u,{defaults:true,state:s});assert.equal(forms.length,2);assert.deepEqual(forms.map(c=>[c.c,c.o,c.a,c.h]),[[6,2,5,6],[6,2,5,6]]);assert.deepEqual(forms[1].kw,['ambush','blitz']);assert.equal(JSON.stringify(u),before);
 const v=unit(s,'rifles16');for(let i=0;i<3;i++)E.readyUnits(s,'p');v.kw.push('guard');v.h=1;
 const triple=F.previewForms(v,{defaults:true,state:s});assert.equal(triple.length,3);assert.deepEqual(triple.map(c=>[c.a,c.h]),[[2,5],[4,5],[4,5]]);assert.ok(triple[2].kw.includes('guard'));
});
test('Status icons coexist in one strip, show spent abilities and keep applied protection and suppression uncrossed',()=>{
 const c=E.card(templates.rifles16);Object.assign(c,{kw:['veteran','ambush','blitz','heavyArmor'],armor:2,ambushUsed:true,shockUsed:true,smokescreenUsed:true,destruction:'generate',suppressed:true,attacked:true});
 const html=F.statusMarkup(c,{protectedByGuard:true,intercepted:true});
 for(const key of ['veteran','ambush','blitz','heavyArmor','shock','smokescreen','destruction','suppressed','protected'])assert.ok(html.includes('data-status="'+key+'"'));
 for(const key of ['guard','intercepted'])assert.equal(html.includes('data-status="'+key+'"'),false);
 for(const key of ['ambush','blitz','shock','smokescreen'])assert.ok(html.includes('status-'+key+' status-spent'));
 for(const key of ['suppressed','protected','intercepted','veteran','heavyArmor','destruction'])assert.equal(html.includes('status-'+key+' status-spent'),false);
 assert.match(html,/<text[^>]*>2<\/text>/);
});
test('Expired temporary keywords remain crossed icons without appearing as active additions in previews',()=>{
 const s=game(),u=unit(s,'m48','p','support',{tempBlitz:true,fury:true});
 assert.equal(F.previewForms(u,{defaults:true}).length,2);act(s,'p',{type:'end'});
 assert.equal(F.previewForms(u,{defaults:true}).length,1);
 const html=F.statusMarkup(u);assert.match(html,/status-blitz status-spent/);assert.match(html,/status-fury status-spent/);
 E.suppress(s,'p',u);assert.match(F.statusMarkup(u),/status-blitz status-spent/);
});
