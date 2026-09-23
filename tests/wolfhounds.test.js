const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),F=require('../dist/card-face'),I=require('../dist/i18n');
const get=key=>[...E.LIB.p,...E.LIB.soviet].find(c=>c.key===key);
function game(){const s=E.createGame(()=>.4);for(const who of ['p','e'])Object.assign(s[who],{hand:[],deck:[],front:[],support:[],graveyard:[],hqIndex:0,k:30,maxK:12,hp:20});return s;}
function add(s,key,side='p',zone='support',patch={}){const c=Object.assign(E.card(get(key)),patch);s[side][zone].push(c);return c;}
function play(s,key,side='p',targets=[]){const c=add(s,key,side,'hand'),r=E.act(s,side,{type:'play',id:c.id,targets});assert.equal(r.ok,true,r.error);return {c,r};}
test('Friendly fighter deployment creates a suppressed Wolfhounds copy from either line for either owner',()=>{
 for(const side of ['p','e'])for(const zone of ['front','support']){
  const s=game();s.turn=side;const wolf=add(s,'wolfhounds',side,zone,{a:12,h:1,max:15,o:0,kw:['blitz','guard']});
  const {c:air,r}=play(s,'sabre',side),copies=s[side].support.filter(c=>c.key==='wolfhounds'&&c.id!==wolf.id);assert.equal(copies.length,1);
  const copy=copies[0];assert.deepEqual([copy.a,copy.h,copy.max,copy.c,copy.o],[3,4,4,3,2]);assert.equal(copy.t,'infantry');assert.equal(copy.suppressed,true);assert.deepEqual(copy.kw,[]);assert.equal(copy.text,undefined);assert.equal(copy.fighterDeployCopy,undefined);assert.equal(copy.sleeping,true);
  assert.equal(air.key,'sabre');assert.equal(r.events.filter(e=>e.kind==='spawn').length,1);assert.equal(r.events.find(e=>e.kind==='spawn').sourceId,wolf.id);assert.match(F.statusMarkup(copy),/status-suppressed/);assert.doesNotMatch(F.statusMarkup(copy),/status-triggered/);
 }
});
test('Multiple Wolfhounds each trigger once, while their copies never reproduce',()=>{
 const s=game();add(s,'wolfhounds','p','front');add(s,'wolfhounds','p','front');play(s,'sabre');assert.equal(s.p.support.filter(c=>c.key==='wolfhounds').length,2);
 const {r}=play(s,'sabre');assert.equal(s.p.support.length,4);assert.equal(r.events.filter(e=>e.kind==='spawn').length,0);
 const alone=game(),source=add(alone,'wolfhounds');play(alone,'sabre');E.retreat(alone,'p',source.id);play(alone,'sabre');assert.equal(alone.p.support.filter(c=>c.key==='wolfhounds').length,1);
});
test('No trigger from enemy fighters, friendly bombers, ordinary units, or suppressed sources',()=>{
 for(const key of ['infantry28','canberra']){const s=game();add(s,'wolfhounds');const {r}=play(s,key);assert.equal(r.events.filter(e=>e.kind==='spawn').length,0);}
 const enemy=game();add(enemy,'wolfhounds');enemy.turn='e';play(enemy,'sabre','e');assert.equal(enemy.p.support.length,1);
 const suppressed=game(),wolf=add(suppressed,'wolfhounds');E.suppress(suppressed,'p',wolf);play(suppressed,'sabre');assert.equal(suppressed.p.support.length,2);
});
test('Adding a fighter without deployment does not trigger Wolfhounds',()=>{
 const s=game();add(s,'wolfhounds');const transport=add(s,'infantry28','p','hand',{deploySpawn:'sabre'});const r=E.act(s,'p',{type:'play',id:transport.id});assert.equal(r.ok,true);assert.equal(s.p.support.filter(c=>c.t==='fighter').length,1);assert.equal(s.p.support.filter(c=>c.key==='wolfhounds').length,1);
});
test('A full support line prevents a copy, and a deployment retreat can free room',()=>{
 const full=game();add(full,'wolfhounds');add(full,'m48');add(full,'m48');play(full,'sabre');assert.equal(full.p.support.length,4);assert.equal(full.p.support.filter(c=>c.key==='wolfhounds').length,1);
 const s=game();add(s,'wolfhounds','p','front');const target=add(s,'infantry28');add(s,'m48');add(s,'m48');play(s,'iroquois','p',[target.id]);assert.equal(s.p.support.length,4);assert.equal(s.p.support.filter(c=>c.key==='wolfhounds').length,1);
});
test('A suppressed copy returning to hand regains its printed ability and stats',()=>{
 const s=game(),source=add(s,'wolfhounds');play(s,'sabre');const copy=s.p.support.find(c=>c.key==='wolfhounds'&&c.id!==source.id);E.retreat(s,'p',copy.id);const hand=s.p.hand.find(c=>c.id===copy.id);assert.equal(hand.suppressed,undefined);assert.equal(hand.fighterDeployCopy,true);assert.deepEqual([hand.a,hand.h],[3,4]);
});
test('AI can use the deployment trigger without mutating the real game during planning',()=>{
 const s=game();s.turn='e';s.e.k=3;add(s,'wolfhounds','e');const air=add(s,'sabre','e','hand'),before=JSON.stringify(s),a=E.chooseAI(s,'e');assert.equal(JSON.stringify(s),before);assert.equal(a.id,air.id);assert.equal(E.act(s,'e',a).ok,true);assert.equal(s.e.support.filter(c=>c.key==='wolfhounds').length,2);
});
test('Bilingual card text identifies self-copy and the third-turn promotion without obsolete keywords',()=>{
 const wolf=get('wolfhounds'),rifles=get('rifles16');assert.deepEqual([rifles.c,rifles.o,rifles.a,rifles.h,rifles.veteranTurns],[3,1,2,5,3]);assert.deepEqual([rifles.veteranForm.a,rifles.veteranForm.h],[4,5]);
 I.setLanguage('zh');assert.equal(I.name(wolf),'猎狼犬团');assert.match(I.skillText(wolf),/本单位被抑制的复制/);assert.equal(I.skillText(rifles),'在场上的第3回合开始时，升为老兵。');assert.deepEqual(I.keywordLabels(wolf),[]);assert.equal(F.hasTriggeredAbility(wolf),true);
 I.setLanguage('en');assert.match(I.skillText(wolf),/copy of this unit/);assert.match(I.skillText(rifles),/third turn/);
});
