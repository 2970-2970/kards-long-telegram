const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../dist/engine'),I=require('../dist/i18n'),HQ=require('../dist/headquarters');
test('Main nation chooses and saves its headquarters, and cross-nation choices are rejected',()=>{
 for(const [main,id] of [['usa','west-berlin'],['ussr','kaliningrad']]){
  const plan=E.presetDeck(main);assert.equal(plan.hqId,id);assert.equal(E.headquartersFor(main).length,1);
  if(!E.mainReady(main)){assert.throws(()=>E.createGame(()=>.4,main,plan),/deck.mainUnavailable/);assert.equal(E.migrateDeck(plan).hqId,id);continue;}
  const s=E.createGame(()=>.4,main,plan);assert.equal(s.p.hqId,id);assert.equal(s.p.deckPlan.hqId,id);assert.equal(s.p.hp,20);
  assert.equal(E.publicSnapshot(s).p.hqId,id);
  assert.ok(E.publicSnapshot(s).p.support.some(c=>c.t==='hq'&&c.n===E.HEADQUARTERS[id].city+'总部'));
  const old={...plan};delete old.hqId;assert.equal(E.migrateDeck(old).hqId,id);
  assert.equal(E.deckIssue({...plan,hqId:main==='usa'?'kaliningrad':'west-berlin'}),'deck.invalidHq');
 }
});
test('HQ uses only the artwork layer and health shield in both languages',()=>{
 for(const language of ['zh','en']){I.setLanguage(language);for(const hq of Object.values(E.HEADQUARTERS)){
  const html=HQ.markup(hq,{i18n:I,hp:14});assert.match(html,/hq-map/);assert.doesNotMatch(html,/hq-emblem|hq-top/);assert.match(html,/>14</);
  assert.ok(!html.includes(I.t(hq.city)));assert.doesNotMatch(html,/usa_emblem|☭/);
  assert.equal(I.name(hq.city+'总部'),I.t('hqName',{city:I.t(hq.city)}));
 }}
 assert.deepEqual(HQ.sizes,{width:720,height:1040,mapWidth:720,mapHeight:1040});
});
test('HQ health is red only at ten or below, cream through twenty, and green above twenty',()=>{
 for(const hq of Object.values(E.HEADQUARTERS))for(const [hp,style] of [[0,'critical'],[9,'critical'],[10,'critical'],[11,'normal'],[20,'normal'],[21,'boosted'],[30,'boosted'],[20,'normal']]){
  const html=HQ.markup(hq,{i18n:I,hp});assert.match(html,new RegExp('class="hp-'+style+'"'));assert.ok(html.includes('>'+hp+'</span>'));
 }
});
