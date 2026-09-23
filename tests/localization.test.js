const assert=require('node:assert/strict');
const fs=require('node:fs');
const E=require('../dist/engine');
const I=require('../dist/i18n');
const han=/\p{Script=Han}/u;
const pool=[...Object.values(E.FACTIONS).flatMap(f=>E.LIB[f.library]),E.LIB.p.find(c=>c.key==='m60')];
for(const c of pool){
  assert.ok(I.cards[c.n],`Missing translated card: ${c.n}`);
  I.setLanguage('zh');
  assert.ok(I.name(c));assert.equal(I.short(c),I.keywordLabels(c).join(' · '),`Only keywords in short text: ${c.n}`);
  if(I.short(c))assert.ok(han.test(I.short(c)),`Missing Chinese keyword: ${c.n}`);
  if(c.text)assert.ok(han.test(I.text(c)),`Missing Chinese skill: ${c.n}`);
  I.setLanguage('en');
  assert.equal(c.d||'',I.keywordLabels(c).join(' · '),`Only keywords in d: ${c.n}`);
  assert.equal(I.skillShort(c),'',`No invented ability subtitle: ${c.n}`);
  assert.equal(han.test(I.name(c)+I.short(c)+I.text(c)),false,`Chinese left in English card: ${c.n}`);
  assert.doesNotMatch(I.text(c),/minimum of 1/);
}
const source=fs.readFileSync(require.resolve('../dist/engine'),'utf8');
const literalMessages=[...source.matchAll(/return '([^'\n]+)';/g)].map(m=>m[1]).filter(m=>m!=='结束回合');
const effectMessages=[...source.matchAll(/effect\([^;\n]*?'([^'\n]+)',events\)/g)].map(m=>m[1]);
for(const m of [...literalMessages,...effectMessages]){
  assert.ok(I.messages[m],`Missing engine message: ${m}`);
  I.setLanguage('en');assert.equal(han.test(I.message(m)),false,m);
  I.setLanguage('zh');assert.ok(han.test(I.message(m)),m);
}
I.setLanguage('en');
assert.equal(I.message('行动需要 2 K，当前仅剩 0 K'),'Operation costs 2 K; only 0 K available.');
I.setLanguage('zh');assert.equal(I.message('Next attack +2'),'下次攻击 +2');
assert.equal(I.message('Operations +1 this turn'),'本回合获得+1行动花费');
const s=E.createGame(()=>.42);s.p.k=12;
const unit=E.card([...E.LIB.soviet,...require('./fixtures/legacy-soviet.json')].find(c=>c.key==='pt76'));s.p.hand=[unit];s.p.deck=[E.card(E.LIB.soviet[0])];
assert.equal(E.act(s,'p',{type:'play',id:unit.id}).ok,true);
assert.equal(E.act(s,'p',{type:'move',id:unit.id}).ok,true);
const original=JSON.stringify(s);
for(const lang of ['zh','en','zh']){
  I.setLanguage(lang);
  for(const entry of s.history){
    const summary=I.summary(entry);
    assert.equal(han.test(summary),lang==='zh');
    for(const e of entry.events)if(e.text)I.message(e.text);
    for(const side of ['p','e'])for(const zone of ['support','front'])for(const c of entry.after[side][zone]){
      I.name(c);(c.status||[]).forEach(I.message);
    }
  }
  assert.equal(JSON.stringify(s),original,'Switching display language changed the game');
}
const html=fs.readFileSync(require.resolve('../dist/index.html'),'utf8');
const app=fs.readFileSync(require.resolve('../dist/app'),'utf8');
for(const content of [source,app,fs.readFileSync(require.resolve('../dist/i18n'),'utf8')])assert.doesNotMatch(content,/Gas Turbine Assault|燃气轮机突击/);
for(const [,key] of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g))assert.ok(I.messages[key],key);
for(const [,key] of app.matchAll(/T\('([^']+)'/g))assert.ok(I.messages[key],key);
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const [,id] of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.has(id),`Missing element ${id}`);
for(const [,src] of html.matchAll(/<script src="\.\/([^"]+)"/g))assert.ok(fs.existsSync(require('node:path').join(__dirname,'../dist',src.split('?')[0])));
console.log('PASS bilingual cards, messages, history, state preservation and static UI references');

for(const lang of ['zh','en']){
 I.setLanguage(lang);
 assert.deepEqual(I.keywordLabels(E.LIB.p[0]),[I.t('Guard')]);
 assert.deepEqual(I.keywordLabels(E.LIB.france[0]),[I.t('Blitz')]);
 assert.deepEqual(I.keywordLabels(E.LIB.p[5]),[],'Fighter type is not an extra keyword');
 assert.deepEqual(I.keywordLabels({...[...E.LIB.soviet,...require('./fixtures/legacy-soviet.json')].find(c=>c.key==='t80'),fury:true}),[I.t('Blitz'),I.t('Fury')]);
 assert.equal(I.skillText(E.LIB.p[0]),lang==='zh'?E.LIB.p[0].zhText:E.LIB.p[0].text);
 assert.equal(I.glossary.length,17);
 for(const entry of I.glossary){assert.ok(entry[lang]);assert.ok(I.messages[entry.title]);assert.match(entry.source,/^https:\/\/((support\.|www\.)kards\.com|store\.steampowered\.com)\//)}
 assert.equal(I.glossary.find(r=>r.id==='veteran').reference,false);
 assert.equal(I.glossary.find(r=>r.id==='ambush').reference,false);
 assert.equal(I.glossary.find(r=>r.id==='smokescreen').reference,false);
}
console.log('PASS concise keywords, temporary keyword grants and bilingual settings glossary');
