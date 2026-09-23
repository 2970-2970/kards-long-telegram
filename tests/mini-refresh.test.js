const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),F=require('../dist/card-face'),I=require('../dist/i18n');
test('Matches consist of 39 collectible cards and all cards obey the nine-card hand limit',()=>{
 const s=E.createGame(()=>.37);for(const side of ['p','e']){
  const q=s[side],pool=E.catalog(q.faction,q.ally);assert.equal(q.hand.length,5);assert.equal(q.deck.length,34);
  assert.ok([...q.hand,...q.deck].every(c=>pool.some(t=>t.deckId===c.deckId)));
  const events=[];E.draw(s,side,5,false,events);assert.equal(q.hand.length,9);assert.equal(events.filter(e=>e.kind==='burn').length,1);
 }
});
test('Sixth Guards is generated only; old saved selections are removed and full legal decks refill',()=>{
 const c=E.GENERATED_CARDS.guards6;assert.equal(c.generated,true);assert.equal(E.copyLimit(c),0);assert.equal(c.rarity,undefined);
 assert.ok(!E.catalog('usa','ussr').some(t=>t.key==='guards6'));
 assert.equal(F.relatedCards(E.LIB.soviet[0])[0],c);
 const old=E.presetDeck('usa','ussr');old.rulesVersion=6;old.counts['ussr:21']=1;old.counts['ussr:3']--;
 const next=E.migrateDeck(old);assert.equal(next.counts['ussr:21'],undefined);assert.equal(E.deckIssue(next),'');
 assert.equal(E.deckIssue({...next,counts:{'ussr:21':1}},false),'deck.wrongNation');
});
test('T-54 has armor and anti-tank attack without deployment Blitz',()=>{
 const t=E.LIB.soviet.find(c=>c.key==='t54');assert.deepEqual([t.c,t.o,t.a,t.h,t.t,t.rarity],[5,2,5,4,'tank','limited']);assert.deepEqual(t.kw,['heavyArmor']);
 const s=E.createGame(()=>.4),c=E.card(t);s.p.k=7;s.p.hand=[c];s.p.support=[];s.p.front=[];
 assert.equal(E.act(s,'p',{type:'play',id:c.id}).ok,true);assert.equal(c.sleeping,true);assert.ok(E.moveError(s,'p',c.id));assert.equal(E.operationCost(s,'p',c,'attack'),2);
});

test('Board headers contain only current operation cost; complete hand faces still show both costs and title',()=>{
 const c=E.LIB.p.find(c=>c.key==='m60');
 for(const lang of ['zh','en']){
  I.setLanguage(lang);const small=F.markup(c,{compact:true,operation:0,i18n:I}),full=F.markup(c,{i18n:I});
  assert.match(small,/face-operation">0</);assert.doesNotMatch(small,/face-deploy|face-title|face-cost-side|face-body/);
  assert.match(full,/face-deploy">8</);assert.match(full,/face-operation">2</);assert.match(full,/face-title/);
 }
});
test('On-board triggered effects have a separate gear while deployment-only and plain keyword units do not',()=>{
 for(const key of ['wolfhounds','m60','marines9','b52','canberra','bulldogs','rifles16','cavalry11','fr_amx13','vn_312','vn_d74']){
  const c=Object.values(E.FACTIONS).flatMap(f=>E.LIB[f.library]).find(c=>c.key===key);
  assert.equal(F.hasTriggeredAbility(c),true,key);assert.match(F.statusMarkup(c),/status-triggered/);
  assert.ok(!E.effectiveKeywords(c).includes('triggered'));assert.equal(F.hasTriggeredAbility({...c,suppressed:true}),false);
 }
 for(const key of ['m48','phantom','thunderchief','blackhorse','iroquois','t54']){
  const c=Object.values(E.FACTIONS).flatMap(f=>E.LIB[f.library]).find(c=>c.key===key);assert.equal(F.hasTriggeredAbility(c),false,key);
 }
 assert.equal(F.hasTriggeredAbility(E.GENERATED_CARDS.guards6),true);
});
test('Native Guard and received protection have distinct shields; Shock is a hollow thick outline',()=>{
 const guard=E.LIB.p.find(c=>c.key==='marines9'),own=F.statusMarkup(guard),protectedIcon=F.statusMarkup({t:'infantry',kw:[]},{protectedByGuard:true});
 assert.match(own,/data-status="guard"/);assert.doesNotMatch(own,/data-status="protected"/);
 assert.match(protectedIcon,/fill="none" stroke="currentColor" stroke-width="3"/);
 assert.doesNotMatch(protectedIcon,/status-spent/);
 assert.match(F.statusMarkup(E.GENERATED_CARDS.guards6),/fill="none" stroke="currentColor" stroke-width="2.8"/);
});
