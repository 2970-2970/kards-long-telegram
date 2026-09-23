const assert=require('node:assert/strict');
const E=require('../dist/engine');
const I=require('../dist/i18n');
function fresh(side='p'){
 const s=E.createGame(()=>.42);s.turn=side;
 for(const who of ['p','e'])Object.assign(s[who],{hand:[],deck:[],support:[],front:[],k:10,hqIndex:0});
 return s;
}
for(const side of ['p','e'])for(const type of ['fighter','bomber']){
 const s=fresh(side),u=E.card(E.LIB.p.find(c=>c.t===type));s[side].support=[u];
 const before=s[side].k;
 assert.equal(E.moveError(s,side,u.id),'');
 assert.equal(E.act(s,side,{type:'move',id:u.id,gap:0}).ok,true);
 assert.equal(s[side].support.length,0);assert.equal(s[side].front[0].id,u.id);
 assert.equal(s[side].k,before-u.o);
 assert.ok(E.attackError(s,side,u.id,'hq'),'Moving normally consumes the aircraft action');
 assert.ok(E.moveError(s,side,u.id),'Cannot move twice');
 assert.equal(s.history.at(-1).after[side].front[0].t,type);
 u.moved=false;
 assert.equal(E.attackError(s,side,u.id,'hq'),'','Aircraft keep full range in the frontline');
}
for(const type of ['fighter','bomber']){
 const s=fresh(),u=E.card(E.LIB.p.find(c=>c.t===type));s.p.support=[u];
 u.sleeping=true;assert.ok(E.moveError(s,'p',u.id));u.sleeping=false;
 s.p.k=0;assert.ok(E.moveError(s,'p',u.id));s.p.k=10;
 s.e.front=[E.card(E.LIB.p[0])];assert.ok(E.moveError(s,'p',u.id));s.e.front=[];
 s.p.front=Array.from({length:5},()=>E.card(E.LIB.p[0]));assert.ok(E.moveError(s,'p',u.id));
}
{
 const s=fresh('e'),f=E.card(E.LIB.p.find(c=>c.t==='fighter')),b=E.card(E.LIB.p.find(c=>c.t==='bomber'));
 s.e.support=[f];s.p.support=[b];s.turn='p';assert.match(E.attackError(s,'p',b.id,'hq'),/战斗机拦截/);
 s.turn='e';assert.equal(E.act(s,'e',{type:'move',id:f.id}).ok,true);
 s.turn='p';assert.equal(E.attackError(s,'p',b.id,'hq'),'','A fighter in frontline no longer covers support HQ');
 s.e.front.push(E.card(E.LIB.p[0]));assert.match(E.attackError(s,'p',b.id,s.e.front[1].id),/战斗机拦截/);
}
{
 const s=fresh('e'),f=E.card(E.LIB.p.find(c=>c.t==='fighter'));f.a=0;s.e.support=[f];
 assert.equal(E.chooseAI(s,'e').type,'end','AI keeps a harmless fighter covering HQ rather than spending on an idle move');
}
for(const lang of ['zh','en']){
 I.setLanguage(lang);
 for(const c of [...E.LIB.p,...E.LIB.soviet].filter(c=>c.t!=='order'&&(!c.key||c.key==='pion'))){
   assert.equal(I.skillText(c),'');assert.equal(I.skillShort(c),'');
 }
 for(const key of ['rifles16','grad','pt76','t80']){
   const c=[...E.LIB.soviet,...require('./fixtures/legacy-soviet.json')].find(c=>c.key===key),txt=I.skillText(c);
   assert.ok(txt);assert.doesNotMatch(txt,/^(Guard|Blitz|Artillery)\.|^(守卫|闪击|炮兵)。/);
   assert.doesNotMatch(txt,/Fury allows|狂怒允许/);
 }
 assert.ok(I.skillText(E.LIB.e.find(c=>c.fx==='heal')));
}
console.log('PASS aircraft movement, limits, interception relocation, AI movement and skill-only bilingual copy');
