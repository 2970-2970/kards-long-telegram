
(()=>{try{for(const name of ['deck','language','sound','volume']){
  const current='long-telegram.'+name,legacy='cold-front.'+name;
  if(localStorage.getItem(current)===null&&localStorage.getItem(legacy)!==null)localStorage.setItem(current,localStorage.getItem(legacy));
}}catch(_){}})();
