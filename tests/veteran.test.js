const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const E=require('../dist/engine'),I=require('../dist/i18n'),Face=require('../dist/card-face');
const regiment=E.LIB.soviet.find(c=>c.key==='rifles16');
function game(){
 const s=E.createGame(()=>.4);
 for(const side of ['p','e'])Object.assign(s[side],{hand:[],deck:Array.from({length:8},()=>E.card(E.LIB.p[0])),support:[],front:[],hqIndex:0,k:12,maxK:12});
 return s;
}
function act(s,side,action){const r=E.act(s,side,action);assert.equal(r.ok,true,r.error);return r;}
function veteran(s,side='p'){
 const c=E.card(regiment);s[side].support.push(c);for(let i=0;i<3;i++)E.readyUnits(s,side);return c;
}
test('Regiment upgrades at its third turn on the battlefield, on either line and for either owner',()=>{
 for(const owner of ['p','e'])for(const zone of ['support','front']){
  const s=game();s.turn=owner;const c=E.card(regiment);s[owner].hand=[c];
  act(s,owner,{type:'play',id:c.id});assert.equal(c.h,5);assert.equal(c.a,2);assert.equal(c.sleeping,true);
  assert.deepEqual(c.kw,[]);assert.equal(s[owner].k,9);
  if(zone==='front'){s[owner].support=[];s[owner].hqIndex=0;s[owner].front=[c];}
  const reserve=E.card(regiment);s[owner].hand=[reserve];
  for(let i=0;i<2;i++){act(s,owner,{type:'end'});act(s,E.other(owner),{type:'end'});assert.equal(c.veteran,undefined);assert.equal(c.a,2);}
  act(s,owner,{type:'end'});
  const result=act(s,E.other(owner),{type:'end'});
  assert.deepEqual([c.a,c.h,c.max,c.c,c.o],[4,5,5,3,1]);assert.deepEqual(c.kw,['veteran','ambush']);
  assert.equal(c.sleeping,false);assert.equal(c.veteran,true);assert.equal(reserve.veteran,undefined);
  assert.ok(result.events.some(e=>e.id===c.id&&e.transition==='veteran'));
  const snapshot=E.publicSnapshot(s)[owner][zone].find(u=>u.id===c.id);assert.equal(snapshot.n,'16TH GUARDS MOTORIZED RIFLES');assert.ok(!snapshot.status.includes('Veteran'));
  assert.deepEqual([c.veteranBase.a,c.veteranBase.h,c.veteranBase.kw.join(',')],[2,5,'']);
  c.h=3;act(s,owner,{type:'end'});act(s,E.other(owner),{type:'end'});
  assert.deepEqual([c.a,c.h,c.max],[4,3,5],'Already promoted units do not repeatedly heal or increase stats');
 }
});
test('Promotion restores the new form and carries permanent buffs without changing costs or template',()=>{
 const s=game(),c=E.card(regiment);s.p.support=[c];c.a++;c.h=1;c.max++;c.c=4;c.o=2;
 for(let i=0;i<3;i++)E.readyUnits(s,'p');assert.deepEqual([c.a,c.h,c.max,c.baseA,c.baseH,c.c,c.o],[5,6,6,4,5,4,2]);
 assert.deepEqual([regiment.a,regiment.h,(regiment.kw||[]).join(',')],[2,5,'']);
 assert.equal(c.printed.n,c.n);assert.deepEqual(c.printed.kw,['veteran','ambush']);
});
test('Killed recruits do not promote and neither form grants Guard',()=>{
 const s=game(),c=E.card(regiment);s.p.support=[c];s.p.hqIndex=1;
 assert.equal(E.guardSources(s,'p','support','hq').length,0);for(let i=0;i<3;i++)E.readyUnits(s,'p');assert.equal(E.guardSources(s,'p','support','hq').length,0);
 const dead=E.card(regiment);s.e.support=[dead];dead.h=0;act(s,'p',{type:'end'});
 assert.equal(s.e.support.length,0);assert.equal(s.e.graveyard[0].n,regiment.n);
});
test('First Ambush kills the attacker before it can deal damage; subsequent combat is simultaneous',()=>{
 const s=game(),v=veteran(s);s.turn='e';
 const first=E.card(E.LIB.p[3]),second=E.card(E.LIB.p[3]);first.h=4;second.h=4;first.kw=[];second.kw=[];first.a=5;second.a=5;s.e.front=[first,second];
 const r=act(s,'e',{type:'attack',id:first.id,target:v.id});
 assert.equal(v.h,5);assert.equal(v.ambushUsed,true);assert.equal(E.loc(s,'e',first.id),null);
 assert.equal(r.events.some(e=>e.kind==='damage'&&e.id===v.id),false);
 act(s,'e',{type:'attack',id:second.id,target:v.id});assert.equal(E.loc(s,'p',v.id),null);assert.equal(E.loc(s,'e',second.id),null);
});
test('Surviving attackers deal normal damage after Ambush and it refreshes next friendly turn',()=>{
 const s=game(),v=veteran(s);s.turn='e';const attacker=E.card(E.LIB.p[2]);attacker.a=3;attacker.h=6;attacker.max=6;s.e.front=[attacker];
 act(s,'e',{type:'attack',id:attacker.id,target:v.id});assert.deepEqual([v.h,attacker.h,v.ambushUsed],[2,2,true]);
 act(s,'e',{type:'end'});assert.equal(v.ambushUsed,false);assert.equal(v.h,2);
 act(s,'p',{type:'end'});act(s,'e',{type:'attack',id:attacker.id,target:v.id});assert.equal(v.h,2);assert.equal(E.loc(s,'e',attacker.id),null);
});
test('Artillery, bomber and protected attackers keep immunity to retaliation against Ambush',()=>{
 for(const template of [E.LIB.e[4],E.LIB.p[7],E.LIB.p[2]]){
  const s=game(),v=veteran(s);s.turn='e';const attacker=E.card(template);attacker.a=2;attacker.h=1;
  if(attacker.t==='tank'){attacker.noCounter=true;s.e.front=[attacker];}else s.e.support=[attacker];
  act(s,'e',{type:'attack',id:attacker.id,target:v.id});assert.equal(v.h,3);assert.equal(attacker.h,1);assert.equal(v.ambushUsed,true);
 }
});
test('Order damage does not trigger or spend Ambush and Ambush does not help when attacking',()=>{
 const s=game(),v=veteran(s);s.turn='e';const strike=E.card(E.LIB.p[10]);s.e.hand=[strike];
 act(s,'e',{type:'play',id:strike.id,target:v.id});assert.equal(v.h,1);assert.equal(v.ambushUsed,false);
 s.turn='p';s.p.support=[];s.p.front=[v];const defender=E.card(E.LIB.p[2]);defender.h=4;s.e.support=[defender];
 act(s,'p',{type:'attack',id:v.id,target:defender.id});assert.equal(E.loc(s,'p',v.id),null);assert.equal(E.loc(s,'e',defender.id),null);
});
test('AI sees the Ambush result and does not throw away its only attacker',()=>{
 const s=game(),v=veteran(s);s.turn='e';s.e.k=1;const attacker=E.card(E.LIB.p[2]);s.e.support=[attacker];

 s.p.support=[];s.p.front=[v];s.p.hqIndex=0;
 const before=JSON.stringify(s);assert.equal(E.chooseAI(s,'e').type,'end');assert.equal(JSON.stringify(s),before);
});
test('Both forms use renamed artwork, bilingual names and accurate keyword labels',()=>{
 const s=game(),v=veteran(s),context={window:{}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/card-assets'),'utf8'),context);
 const asset=context.window.LongTelegramAssets.cards[regiment.deckId];
 assert.equal(asset.art,'./assets/cards/16th-guards-motorized-rifles.png');assert.equal(asset.deploySfx,'./assets/audio/16th-guards-motorized-rifles.mp3');
 assert.ok(fs.statSync(path.join(__dirname,'../dist',asset.art)).size>1000);assert.equal(v.deckId,regiment.deckId);
 for(const lang of ['zh','en']){
  I.setLanguage(lang);assert.equal(I.name(regiment),lang==='zh'?'第16近卫机动步兵团':'16TH GUARDS MOTORIZED RIFLES');
  assert.equal(I.name(v),I.name(regiment));
  assert.deepEqual(I.keywordLabels(regiment),[]);assert.deepEqual(I.keywordLabels(v),[I.t('Veteran'),I.t('Ambush')]);
  assert.equal(I.skillText(regiment),lang==='zh'?regiment.zhText:regiment.text);assert.equal(I.skillText(v),lang==='zh'?regiment.veteranForm.zhText:regiment.veteranForm.text);
  assert.ok(Face.markup(v,{i18n:I}).includes(I.t('Ambush')));
 }
 const plan=E.presetDeck('ussr');assert.equal(E.migrateDeck(plan).counts['ussr:0'],plan.counts['ussr:0']);
});
