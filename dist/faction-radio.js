
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LongTelegramRadio=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
function create({Audio,tracks={},enabled=true,volume=.55,random=Math.random,probeTimeoutMs=5000,repeat=true}={}){
 let pool=[],commonPaths=[],current=null,generation=0,discovering=false;
 const probes=new Set();
 function pause(){
  if(!current)return;
  current.attempt++;current.pending=false;current.running=false;current.audio.pause();
 }
 function dispose(audio){
  audio.onended=null;audio.onerror=null;audio.onloadedmetadata=null;
  audio.pause();audio.removeAttribute?.('src');

  if(audio.removeAttribute)audio.load?.();
 }
 function release(){if(current){pause();const audio=current.audio;current=null;dispose(audio);}}
 function probe(path,token){
  if(token!==generation||!Audio)return Promise.resolve(false);
  return new Promise(resolve=>{
   let audio,timer,settled=false;
   const job={cancel:()=>finish(false)};
   function finish(ok){
    if(settled)return;settled=true;clearTimeout(timer);probes.delete(job);
    if(audio)dispose(audio);resolve(ok&&token===generation);
   }
   probes.add(job);
   try{
    audio=new Audio();audio.preload='metadata';audio.muted=true;
    audio.onloadedmetadata=()=>finish(true);audio.onerror=()=>finish(false);
    timer=setTimeout(()=>finish(false),probeTimeoutMs);audio.src=path;
    if(typeof audio.load==='function')audio.load();else finish(false);
   }catch(_){finish(false);}
  });
 }
 function configFor(nation){
  const config=tracks[nation];
  const prefix=config&&!Array.isArray(config)&&typeof config==='object'?config.prefix:null;
  const configured=typeof config==='string'?[config]:Array.isArray(config)?config:config?.tracks||[];
  return {prefix:typeof prefix==='string'?prefix:null,paths:[...new Set((Array.isArray(configured)?configured:[]).filter(p=>typeof p==='string'&&p))]};
 }
 async function discover(config,token){
  const paths=config.paths.slice();if(!config.prefix)return paths;
  const base=config.prefix+'.mp3';
  if(await probe(base,token))paths.push(base);

  for(let n=1;token===generation;n++){
   const path=config.prefix+'_'+n+'.mp3';
   if(!await probe(path,token))break;paths.push(path);
  }
  return paths;
 }
 function unavailable(entry){
  if(current!==entry)return;
  pool=pool.filter(path=>path!==entry.path);release();play();
 }
 function play(){
  if(!enabled||!volume||discovering||!pool.length||!Audio)return;
  if(!current){
   const path=pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];
   try{current={audio:new Audio(path),path,attempt:0,pending:false,running:false};}
   catch(_){pool=pool.filter(p=>p!==path);play();return;}
   const entry=current;entry.audio.volume=volume;entry.audio.preload='auto';
   entry.audio.onended=()=>{if(current===entry){if(!repeat)pool=[];release();play();}};
   entry.audio.onerror=()=>unavailable(entry);
  }
  const entry=current;if(entry.pending||entry.running)return;
  const attempt=++entry.attempt;entry.pending=true;
  const rejected=error=>{
   if(current!==entry||entry.attempt!==attempt)return;
   entry.pending=false;entry.running=false;
   if(error?.name!=='NotAllowedError'&&error?.name!=='AbortError')unavailable(entry);
  };
  try{Promise.resolve(entry.audio.play()).then(()=>{
   if(current===entry&&entry.attempt===attempt){entry.pending=false;entry.running=true;}
  },rejected);}catch(error){rejected(error);}
 }
 async function setNations(main,ally){
  generation++;for(const job of [...probes])job.cancel();
  if(current&&!commonPaths.includes(current.path))release();
  pool=[];discovering=false;const token=generation;
  const names=[...new Set(['common',main,ally].filter(Boolean))],configs=names.map(configFor);
  if(configs.some(config=>config.prefix)){
   discovering=true;const lists=await Promise.all(configs.map(config=>discover(config,token)));
   if(token!==generation)return;pool=[...new Set(lists.flat())];commonPaths=lists[0];discovering=false;
  }else {pool=[...new Set(configs.flatMap(config=>config.paths))];commonPaths=configs[0].paths;}
  if(current&&!pool.includes(current.path))release();
  play();
 }
 function stop(){generation++;release();pool=[];discovering=false;for(const job of [...probes])job.cancel();}
 function setEnabled(value){enabled=!!value;if(enabled)play();else pause();}
 function setVolume(value){
  volume=Math.max(0,Math.min(1,Number(value)||0));if(current)current.audio.volume=volume;
  if(volume)play();else pause();
 }
 return {setNations,stop,unlock:play,setEnabled,setVolume};
}
return {create};
});
