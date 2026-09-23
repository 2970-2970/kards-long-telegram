(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LongTelegramBlast=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const duration=3100,clamp=x=>Math.max(0,Math.min(1,x));
function scene(random=Math.random){
 const range=(a,b)=>a+(b-a)*random();
 const smoke=Array.from({length:28},(_,i)=>{const angle=range(0,Math.PI*2),speed=range(32,100);return {x:Math.cos(angle)*speed,y:Math.sin(angle)*speed*.5-35,size:range(18,42),delay:range(40,280),life:range(1900,2700),rotation:range(-1,1),texture:i%4};});
 const fire=Array.from({length:15},(_,i)=>({x:range(-58,58),y:range(-40,30),size:range(17,35),delay:range(0,170),life:range(320,750),texture:4+i%4}));
 const sparks=Array.from({length:78},()=>{const a=range(0,Math.PI*2),v=range(75,240);return {vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,life:range(350,1450),size:range(.6,1.9)};});
 const debris=Array.from({length:24},()=>{const a=range(0,Math.PI*2),v=range(35,160);return {vx:Math.cos(a)*v,vy:Math.sin(a)*v-75,size:range(1,4.5),rotation:range(-8,8),life:range(900,1900)};});
 return {smoke,fire,sparks,debris};
}
function texture(doc,index){
 const canvas=doc.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d'),data=ctx.createImageData(128,128);
 const hash=(x,y)=>{const v=Math.sin(x*127.1+y*311.7+index*97.3)*43758.5453;return v-Math.floor(v);};
 const noise=(x,y)=>{const a=Math.floor(x),b=Math.floor(y),fx=x-a,fy=y-b,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return (hash(a,b)*(1-u)+hash(a+1,b)*u)*(1-v)+(hash(a,b+1)*(1-u)+hash(a+1,b+1)*u)*v;};
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const dx=(x-64)/62,dy=(y-64)/62,r=Math.hypot(dx,dy),n=noise(x/22,y/22)*.6+noise(x/9,y/9)*.28+noise(x/4,y/4)*.12;
  const alpha=clamp((1-r)*2.8+(n-.5)*1.5)*clamp((1-r)*7),shade=36+n*43+(1-dy)*7,i=(y*128+x)*4;
  data.data[i]=index<4?shade+5:245;data.data[i+1]=index<4?shade+2:75+n*150;data.data[i+2]=index<4?shade:12+n*75;data.data[i+3]=alpha*210;
 }
 ctx.putImageData(data,0,0);return canvas;
}
function glow(ctx,x,y,r,stops){
 const g=ctx.createRadialGradient(x,y,0,x,y,r);for(const [p,color] of stops)g.addColorStop(p,color);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
function frame(ctx,particles,textures,time){
 const t=time/1000;
 ctx.save();ctx.globalCompositeOperation='source-over';
 if(time<1000){const k=clamp(time/1000),r=20+k*200;ctx.save();ctx.translate(0,16);ctx.scale(1,.3);ctx.globalAlpha=(1-k)*.22;glow(ctx,0,0,r,[[0,'#9c948000'],[.55,'#9c948000'],[.76,'#ada48d'],[.9,'#9c948038'],[1,'#9c948000']]);ctx.restore();}
 for(const p of particles.smoke){
  const age=time-p.delay;if(age<0||age>p.life)continue;const k=age/p.life,spread=1-Math.exp(-k*5),size=p.size*(.35+spread*1.8);
  ctx.save();ctx.translate(p.x*spread,p.y*spread-k*68);ctx.rotate(p.rotation*k);ctx.globalAlpha=Math.min(1,k*12)*Math.pow(1-k,.9)*.82;
  ctx.drawImage(textures[p.texture],-size,-size,size*2,size*2);ctx.restore();
 }
 ctx.globalCompositeOperation='lighter';
 for(const p of particles.fire){
  const age=time-p.delay;if(age<0||age>p.life)continue;const k=age/p.life,r=p.size*(.3+Math.sin(k*Math.PI)*1.3);ctx.globalAlpha=Math.pow(1-k,1.4)*.9;
  glow(ctx,p.x*k,p.y*k-k*22,r,[[0,'#fff9cf'],[.17,'#ffce63'],[.48,'#f46a16'],[.74,'#b82e0800'],[1,'#67110000']]);
  if(textures[p.texture]){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.pow(1-k,1.2)*.75;ctx.drawImage(textures[p.texture],p.x*k-r,p.y*k-k*22-r,r*2,r*2);ctx.globalCompositeOperation='lighter';}
 }
 if(time<240){ctx.globalAlpha=Math.pow(1-time/240,2);glow(ctx,0,0,90+time*.1,[[0,'#fffbe9'],[.13,'#fff4b5'],[.38,'#e9963044'],[1,'#d8660000']]);}
 for(const p of particles.sparks){if(time>p.life)continue;const k=time/p.life,drag=(1-Math.exp(-t*2))/2,x=p.vx*drag,y=p.vy*drag+85*t*t;ctx.globalAlpha=Math.pow(1-k,1.6);ctx.strokeStyle=k<.3?'#ffe9b5':'#e27832';ctx.lineWidth=p.size*(1-k*.7);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-p.vx*.022*(1-k),y-p.vy*.022*(1-k));ctx.stroke();}
 ctx.globalCompositeOperation='source-over';
 for(const p of particles.debris){if(time>p.life)continue;const k=time/p.life,drag=(1-Math.exp(-t*1.3))/1.3;ctx.save();ctx.translate(p.vx*drag,p.vy*drag+110*t*t);ctx.rotate(p.rotation*t);ctx.globalAlpha=1-k;ctx.fillStyle='#282622';ctx.strokeStyle='#756651';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-p.size,-p.size*.3);ctx.lineTo(p.size*.7,-p.size*.7);ctx.lineTo(p.size,p.size*.5);ctx.lineTo(-p.size*.5,p.size);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
 ctx.restore();
}
function play(root,layer,rect){
 const canvas=root.document.createElement('canvas'),width=root.innerWidth,height=root.innerHeight,dpr=Math.min(2,root.devicePixelRatio||1);
 canvas.className='fx-explosion-canvas';canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.setAttribute('aria-hidden','true');layer.appendChild(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return Promise.resolve();}
 const particles=scene(),textures=Array.from({length:8},(_,i)=>texture(root.document,i)),scale=Math.max(.6,Math.min(1.3,rect.width/88));
 return new Promise(resolve=>{let start=null;const draw=now=>{
  start??=now;const elapsed=now-start;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.translate(rect.left+rect.width/2,rect.top+rect.height/2);ctx.scale(scale,scale);frame(ctx,particles,textures,elapsed);
  if(elapsed<duration&&canvas.isConnected)root.requestAnimationFrame(draw);else {canvas.remove();resolve();}
 };root.requestAnimationFrame(draw);});
}
function ruins(host){
 const doc=host.ownerDocument,canvas=doc.createElement('canvas');canvas.className='hq-ruin-canvas';canvas.width=460;canvas.height=660;canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
 const ctx=canvas.getContext('2d');if(!ctx)return;
 let seed=7927;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},range=(a,b)=>a+(b-a)*random();
 const rubble=Array.from({length:72},()=>({x:range(-66,66),y:range(-21,23),w:range(2,14),h:range(2,8),r:range(-3,3),light:range(18,47),hot:random()<.15})).sort((a,b)=>a.y-b.y);
 const beams=Array.from({length:8},()=>({x:range(-40,40),y:range(-16,15),w:range(16,43),r:range(-2,2)}));
 const fires=Array.from({length:11},(_,i)=>({x:range(-46,46),y:range(-9,16),size:range(7,15),phase:range(0,6.3),texture:4+i%4}));
 const smoke=Array.from({length:15},(_,i)=>({x:range(-36,36),phase:range(0,1),drift:range(-22,12),texture:i%4}));
 const textures=Array.from({length:8},(_,i)=>texture(doc,i)),reduced=doc.defaultView.matchMedia?.('(prefers-reduced-motion: reduce)').matches,start=doc.defaultView.performance.now();
 function draw(now){
  if(!canvas.isConnected)return;const t=reduced?1.7:(now-start)/1000;
  ctx.setTransform(2,0,0,2,230,360);ctx.clearRect(-115,-180,230,330);
  ctx.save();ctx.scale(1,.45);glow(ctx,0,10,91,[[0,'#060604f5'],[.5,'#0e0b07cb'],[.8,'#17120c75'],[1,'#17120c00']]);ctx.restore();
  glow(ctx,0,2,60,[[0,'#b1360940'],[.45,'#9d260f26'],[1,'#ab260000']]);
  for(const b of beams){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.r);const g=ctx.createLinearGradient(0,-3,0,4);g.addColorStop(0,'#66604b');g.addColorStop(.3,'#292720');g.addColorStop(1,'#0b0b08');ctx.fillStyle=g;ctx.fillRect(-b.w/2,-3,b.w,6);ctx.fillStyle='#050605';ctx.fillRect(-b.w/2+3,-1,b.w-6,2);ctx.restore();}
  for(const p of rubble){
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);const g=ctx.createLinearGradient(-p.w,-p.h,p.w,p.h);g.addColorStop(0,'rgb('+[p.light+14,p.light+10,p.light+3].join(',')+')');g.addColorStop(1,'#0c0c0a');ctx.fillStyle=g;ctx.shadowColor='#000b';ctx.shadowBlur=3;ctx.shadowOffsetY=2;
   ctx.beginPath();ctx.moveTo(-p.w,-p.h*.3);ctx.lineTo(-p.w*.5,-p.h);ctx.lineTo(p.w*.6,-p.h*.7);ctx.lineTo(p.w,p.h*.5);ctx.lineTo(-p.w*.4,p.h);ctx.closePath();ctx.fill();
   if(p.hot){ctx.shadowBlur=0;ctx.strokeStyle='rgba(230,83,18,'+(.25+.2*Math.sin(t*2+p.x))+')';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-p.w*.5,-p.h*.7);ctx.lineTo(p.w*.6,-p.h*.6);ctx.stroke();}ctx.restore();
  }
  for(const p of fires){
   const flicker=.8+.15*Math.sin(t*8+p.phase)+.1*Math.sin(t*13+p.x),height=p.size*(1.7+flicker),x=p.x+Math.sin(t*5+p.phase)*2;
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.45*flicker;glow(ctx,p.x,p.y,24,[[0,'#ff7b24'],[.3,'#ec491630'],[1,'#c7280000']]);ctx.restore();
   ctx.save();ctx.translate(x,p.y);ctx.rotate(Math.sin(t*4+p.phase)*.12);ctx.globalAlpha=.85;ctx.drawImage(textures[p.texture],-p.size*.65,-height,p.size*1.3,height);
   ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.65;glow(ctx,0,-4,p.size*.65,[[0,'#ffde8c'],[.25,'#ff8b35'],[.6,'#d7420618'],[1,'#d7420600']]);ctx.restore();
  }
  for(const p of smoke){const k=(t*.15+p.phase)%1,size=10+k*23;ctx.save();ctx.globalAlpha=Math.sin(k*Math.PI)*.22;ctx.translate(p.x+p.drift*k,-15-k*107);ctx.rotate(k*.9);ctx.drawImage(textures[p.texture],-size,-size,size*2,size*2);ctx.restore();}
  ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const k=(t*(.31+i*.01)+i*.137)%1;ctx.globalAlpha=(1-k)*.65;ctx.fillStyle='#e38a34';ctx.fillRect(Math.sin(i*23)*34+Math.sin(k*4+i)*8,-8-k*74,1,1.8);}ctx.restore();
  if(!reduced)doc.defaultView.requestAnimationFrame(draw);
 }
 doc.defaultView.requestAnimationFrame(draw);
}
return {duration,scene,texture,frame,play,ruins};
});
