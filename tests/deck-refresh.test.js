const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),I=require('../dist/i18n'),F=require('../dist/card-face');
const selected=plan=>E.catalog(plan.main,plan.ally).flatMap(c=>Array(plan.counts[c.deckId]||0).fill(c));
test('Soviet collectible cards retain stable IDs, with stable IDs and related generated orders',()=>{
 assert.deepEqual(E.catalog('ussr').map(c=>c.deckId),['ussr:0','ussr:1','ussr:2','ussr:3','ussr:4','ussr:5','ussr:22','ussr:23','ussr:24','ussr:25','ussr:26','ussr:27','ussr:28','ussr:29','ussr:30']);
 assert.equal(E.catalog('ussr').filter(c=>c.t==='infantry').length,6);
 assert.equal(E.catalog('ussr').reduce((n,c)=>n+E.copyLimit(c),0),39);
 for(const key of ['closedCity','fightingGirlfriend'])assert.ok(E.GENERATED_CARDS[key].generated);
 assert.equal(F.relatedCards(E.LIB.soviet[0])[0].key,'guards6');
});
test('Both main nations now start legal 39-card matches with every ally',()=>{
 for(const main of E.MAIN_NATIONS)for(const ally of [null,'france','drv',E.FACTIONS[main].opponent]){
  const plan=E.presetDeck(main,ally);assert.equal(E.deckIssue(plan),'');
  const s=E.createGame(()=>.4,main,plan);for(const side of ['p','e'])assert.equal(s[side].hand.length+s[side].deck.length,39);
 }
});
test('Saved decks lose deleted Soviet IDs without changing retained IDs or invalidating partial choices',()=>{
 const old={main:'ussr',ally:null,rulesVersion:5,counts:{'ussr:0':1,'ussr:6':3,'ussr:11':2,'ussr:21':1}};
 const next=E.migrateDeck(old);assert.deepEqual(next.counts,{'ussr:0':1});
 assert.deepEqual(E.migrateDeck(next),next);assert.equal(E.deckIssue(next),'deck.needComplete');
 const mixed=E.presetDeck('usa','ussr');mixed.rulesVersion=5;
 mixed.counts['ussr:3']-=2;mixed.counts['ussr:11']=2;
 const migrated=E.migrateDeck(mixed);assert.equal(E.deckIssue(migrated),'');assert.ok(!migrated.counts['ussr:11']);
 assert.equal(E.migrateDeck({...old,counts:{'ussr:99':1}}),null);
});
test('Recommended decks retain retreat, fighter and combined-arms packages',()=>{
 for(const ally of [null,'france','drv','ussr']){
  const plan=E.presetDeck('usa',ally),cards=selected(plan),count=key=>cards.filter(c=>c.key===key).length;
  assert.equal(E.deckIssue(plan),'');assert.equal(cards.length,39);
  for(const [key,n] of [['marines9',3],['iroquois',3],['wolfhounds',2],['sabre',4],['kadena',3],['antiwar',3],['m60',1],['searchAndDestroy',1]])assert.equal(count(key),n,key);
  assert.ok(cards.filter(c=>c.t!=='order'&&c.c<=3).length>=12);
  if(ally)assert.equal(cards.filter(c=>c.faction===ally).length,12);
 }
 const soviet=selected(E.presetDeck('ussr','drv'));
 for(const key of ['t54','t62Tank','t64a','thoseDays'])assert.ok(soviet.some(c=>c.key===key));
});
test('M60 no longer says copy and cavalry hides promotion aftermath only on its base form',()=>{
 const m60=E.LIB.p.find(c=>c.key==='m60'),cavalry=E.LIB.soviet.find(c=>c.key==='cavalry11');
 for(const lang of ['zh','en']){
  I.setLanguage(lang);assert.doesNotMatch(I.skillText(m60),/复制|copy/i);
  const forms=F.previewForms(cavalry);assert.equal(forms.length,2);
  assert.doesNotMatch(I.skillText(forms[0]),/升为老兵时|When this unit becomes Veteran|支援阵线|support line/);
  assert.match(I.skillText(forms[1]),lang==='zh'?/将上1个被消灭的友方陆军单位加入支援阵线/:/last friendly ground unit destroyed/);
 }
});
