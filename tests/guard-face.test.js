const assert=require('node:assert/strict'),{test}=require('node:test');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const E=require('../dist/engine'),I=require('../dist/i18n'),Face=require('../dist/card-face');
test('Live card faces retain damage and increased health limits instead of printed defense',()=>{
 I.setLanguage('zh');const card=E.card(E.LIB.p[2]);
 for(const [health,max,style] of [[2,6,'stat-damaged'],[7,7,'stat-buffed'],[4,4,'']]){
  card.h=health;card.max=max;const html=Face.markup(card,Face.liveStats(card,{i18n:I}));
  assert.ok(html.includes('face-defense'+(style?' '+style:'')+'" aria-label="防御"><b>'+health+'</b>'));
 }
});
test('Adjacent Guard units remain attackable on either side and either line',()=>{
 for(const side of ['p','e'])for(const zone of ['support','front']){
  const s=E.createGame(()=>.4),enemy=E.other(side);s.turn=enemy;s[enemy].k=20;s[side].support=[];s[side].front=[];
  const guards=[E.card(E.LIB.p[0]),E.card(E.LIB.p[0])];s[side][zone]=guards;s[side].hqIndex=2;
  const attacker=E.card(E.LIB.p[5]);s[enemy].support=[attacker];
  for(const guard of guards){assert.deepEqual(E.guardSources(s,side,zone,guard.id),[]);assert.equal(E.attackError(s,enemy,attacker.id,guard.id),'');}
  assert.equal(E.act(s,enemy,{type:'attack',id:attacker.id,target:guards[0].id}).ok,true);
 }
});
test('Non-Guard neighbors and HQ still receive protection; no protection across HQ or rows',()=>{
 const s=E.createGame(()=>.4);const a=E.card(E.LIB.p[0]),b=E.card(E.LIB.p[0]),normal=E.card(E.LIB.p[2]);
 s.e.support=[a,b,normal];s.e.hqIndex=0;
 assert.equal(E.guardSources(s,'e','support','hq').length,1);
 assert.deepEqual(E.guardSources(s,'e','support',normal.id).map(c=>c.id),[b.id]);
 s.p.k=10;const fighter=E.card(E.LIB.p[5]);s.p.support=[fighter];
 assert.match(E.attackError(s,'p',fighter.id,normal.id),/守卫/);
 s.e.hqIndex=2;assert.equal(E.guardSources(s,'e','support',normal.id).length,0);
 s.e.front=[normal];s.e.support=[a,b];assert.equal(E.guardSources(s,'e','front',normal.id).length,0);
});
test('Card face puts deployment and operation in the header, attack before defense, and omits order stats',()=>{
 I.setLanguage('zh');const tank=E.card(E.LIB.p[2]),markup=Face.markup(tank,{i18n:I,operation:0,attack:8,defense:2});
 assert.match(markup,/face-deploy">6</);assert.match(markup,/face-operation">0</);
 assert.ok(markup.indexOf('face-operation')<markup.indexOf('face-art'));
 assert.ok(markup.indexOf('face-attack')<markup.indexOf('face-defense'));
 assert.match(markup,/攻击"><b>8</);assert.match(markup,/防御"><b>2</);
 const aid=Face.markup(E.LIB.p[8],{i18n:I});assert.doesNotMatch(aid,/class="face-operation|class="face-stats/);
 assert.match(aid,/失去1个指挥点槽。抉择：抽3张牌或下个友方回合开始时，获得3个指挥点。/);
 assert.equal(Face.sizes.header+Face.sizes.artHeight+Face.sizes.body,Face.sizes.height);
});

test('Hand faces retain the same complete unit and order abilities as detailed faces',()=>{
 for(const language of ['en','zh']){
  I.setLanguage(language);
  for(const key of ['m60','cia','phantom']){
   const card=E.LIB.p.find(c=>c.key===key);
   const small=Face.markup(card,{i18n:I,short:true}),detail=Face.markup(card,{i18n:I});
   assert.equal(small,detail);assert.match(small,/face-skill/);assert.ok(I.skillText(card));
   assert.equal(small.includes('face-keywords'),['phantom','m60'].includes(key));
  }
 }
});
test('Aid illustration exists and is connected to the correct card; preview dependencies load first',()=>{
 const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/card-assets'),'utf8'),context);
 const asset=context.window.LongTelegramAssets.cards['usa:8'];assert.equal(E.LIB.p[8].n,'MARSHALL PLAN');assert.equal(asset.position,'50% 0%');
 assert.ok(fs.statSync(path.join(__dirname,'../dist',asset.art)).size>1000);
 const html=fs.readFileSync(require.resolve('../dist/index.html'),'utf8');assert.ok(html.indexOf('./card-face.js')<html.indexOf('./deck-builder.js'));
 assert.ok(html.indexOf('./card-media.js')<html.indexOf('./card-face.js'));
});

test('Every card has an icon slot and nation medal; only rear-line attackers have crosshairs',()=>{
 for(const card of [...Object.values(E.FACTIONS).flatMap(f=>E.LIB[f.library])]){
  const html=Face.markup(card,{i18n:I});assert.match(html,/face-type-badge/);assert.match(html,/face-medal/);
  assert.equal(html.includes('ranged-attack'),['artillery','fighter','bomber'].includes(card.t));
  if(card.t==='order'){
   assert.ok(html.indexOf('face-title')>html.indexOf('face-art'),'Order title belongs below its artwork');
   assert.doesNotMatch(html,/face-operation|face-stats|face-attack|face-defense/);
  }else assert.ok(html.indexOf('face-attack')<html.indexOf('face-type-badge')&&html.indexOf('face-type-badge')<html.indexOf('face-defense'));
 }
 const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/emblem-assets'),'utf8'),context);
 for(const type of ['infantry','tank','artillery','fighter','bomber','order'])assert.equal(context.window.LongTelegramEmblems.types[type],'./assets/emblems/'+type+'-icon.png');
 for(const [id,abbr] of Object.entries({usa:'usa',ussr:'ussr',france:'fra',drv:'drv'}))assert.equal(context.window.LongTelegramEmblems.nations[id],'./assets/emblems/'+(id==='usa'?'usa_emblem.svg':abbr+'-medal.png'));
});
