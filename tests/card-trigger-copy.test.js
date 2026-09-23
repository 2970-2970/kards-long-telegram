const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),I=require('../dist/i18n'),F=require('../dist/card-face');
test('F105 prints both triggers in hand and full previews, never as standalone keywords',()=>{
 const c=E.LIB.p.find(c=>c.key==='thunderchief');
 for(const lang of ['zh','en']){
  I.setLanguage(lang);
  for(const options of [{},{short:true}]){
   const html=F.markup(c,{...options,i18n:I});assert.doesNotMatch(html,/class="face-keywords"|face-effect-marker/);
   for(const trigger of ['Deployment','Destruction'])assert.equal(html.split(I.t(trigger)+(lang==='zh'?'：':':')).length-1,1);
  }
  const board=F.markup(c,{compact:true,i18n:I});assert.doesNotMatch(board,/face-body|face-effect-marker/);assert.ok(!board.includes(I.t('Destruction')));
 }
});
test('Every collectible, generated and Veteran face preserves its complete bilingual card text',()=>{
 const pool=[...Object.values(E.FACTIONS).flatMap(f=>E.LIB[f.library]),...Object.values(E.GENERATED_CARDS)];
 const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
 for(const lang of ['zh','en']){
  I.setLanguage(lang);
  for(const c of pool)for(const form of F.previewForms(c)){
   const expected=form.text?I.text(form):'';
   for(const options of [{},{short:true}]){
    const html=F.markup(form,{...options,i18n:I}),skill=html.match(/<div class="face-skill"[^>]*>([^<]*)<\/div>/);
    assert.equal(decode(skill?.[1]||''),expected,lang+' '+c.deckId+(form.veteran?' Veteran':''));
   }
   assert.doesNotMatch(expected,/^(?:Guard|Blitz|Artillery)\.|^(?:守卫|闪击|炮兵)。|部署时：|On deployment|Fury allows|狂怒允许/);
  }
 }
 I.setLanguage('en');assert.equal(I.skillText({n:'UNLISTED UNIT',t:'infantry',text:'Deployment: Draw a card.'}),'Deployment: Draw a card.');
});
test('All printed keywords match the audited card list, with no internal type flags or unconditional granted abilities',()=>{
 const expected={
  'usa:3':['heavyArmor','shock'],'usa:7':['heavyArmor'],'usa:0':['guard'],'usa:6':['heavyArmor'],
  'ussr:1':['shock'],'ussr:2':['guard'],'ussr:4':['smokescreen'],'ussr:21':['shock'],'ussr:22':['heavyArmor'],'ussr:25':['blitz'],'ussr:27':['blitz','fury','heavyArmor'],'ussr:28':['guard','heavyArmor'],'ussr:30':['blitz','heavyArmor'],
  'france:0':['blitz'],'france:1':['guard'],'france:2':['blitz'],'drv:0':['guard'],'drv:3':['blitz']
 };
 const labels={fury:['狂怒','Fury'],shock:['冲击','Shock'],smokescreen:['烟幕','Smokescreen'],guard:['守卫','Guard'],blitz:['闪击','Blitz'],veteran:['老兵','Veteran'],ambush:['伏击','Ambush'],heavyArmor:['重甲 1','Heavy Armor 1']};
 const pool=[...Object.values(E.FACTIONS).flatMap(f=>E.LIB[f.library]),...Object.values(E.GENERATED_CARDS)];
 for(const c of pool)for(const form of F.previewForms(c)){
  const keys=form.veteran?(c.deckId==='ussr:0'?['veteran','ambush']:c.deckId==='ussr:4'?['smokescreen','veteran']:['veteran']):expected[c.deckId]||[];
  assert.deepEqual([...(form.kw||[])].sort(),[...keys].sort(),c.deckId);
  for(const [i,lang] of ['zh','en'].entries()){
   I.setLanguage(lang);assert.deepEqual(I.keywordLabels(form),keys.map(key=>key==='heavyArmor'?labels[key][i].replace('1',form.armor||1):labels[key][i]),lang+' '+c.deckId);
  }
  assert.equal(form.d||'',(form.kw||[]).map(key=>key==='heavyArmor'?labels[key][1].replace('1',form.armor||1):labels[key][1]).join(' · '),c.deckId);
 }
 for(const c of E.LIB.e)assert.ok((c.kw||[]).every(key=>key==='guard'||key==='blitz'));
});
test('Hand units retain real keywords; board units have no text area',()=>{
 const units=Object.values(E.FACTIONS).flatMap(f=>E.LIB[f.library]).filter(c=>c.t!=='order');
 for(const lang of ['zh','en']){
  I.setLanguage(lang);
  for(const c of units){
   const expected=I.keywordLabels(c).join(' · ');
   for(const options of [{short:true},{compact:true}]){
    const html=F.markup(c,{...options,i18n:I}),match=html.match(/<span class="face-keywords">([^<]*)<\/span>/);
    assert.equal(match?.[1]||'',options.compact?'':expected,c.n);assert.ok(!expected.includes(I.t('Deployment')));assert.ok(!expected.includes(I.t('Destruction')));
    if(options.compact)assert.doesNotMatch(html,/face-body|face-traits|face-skill/,c.n);
    else assert.match(html,/class="face-body"/,c.n);
   }
  }
  assert.deepEqual(I.keywordLabels({t:'infantry',kw:['deployment','destruction','draw','repair','retreat'],text:'Deployment: Draw a card.',destruction:'drawTank'}),[]);
  assert.deepEqual(I.keywordLabels({...units.find(c=>c.key==='phantom')}),[I.t('Heavy Armor')+' 1']);
 }
 for(const id of ['destruction','retreat'])assert.equal(I.glossary.find(r=>r.id===id).group,'effects');
});
test('All existing named hand-generation references use Chinese quotes and no English quotes',()=>{
 const b52=E.LIB.p.find(c=>c.key==='thunderchief'),bulldogs=E.LIB.p.find(c=>c.key==='bulldogs');
 for(const [c,name] of [[b52,'滚雷行动'],[{...bulldogs,...bulldogs.veteranForm,veteran:true},'总统部队嘉奖']]){
  I.setLanguage('zh');assert.ok(I.skillText(c).includes('“'+name+'”加入手中'));
  I.setLanguage('en');assert.doesNotMatch(I.skillText(c),/[“”"]/);
 }
 I.setLanguage('zh');assert.equal(I.name(E.LIB.p.find(c=>c.key==='bobcats5')),'第5山猫团');
});
