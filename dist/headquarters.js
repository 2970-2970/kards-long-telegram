
(function(root,factory){const api=factory(root);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LongTelegramHQ=api;})(typeof globalThis!=='undefined'?globalThis:this,root=>{
'use strict';
const sizes={width:720,height:1040,mapWidth:720,mapHeight:1040};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function markup(hq,{i18n=root.LongTelegramI18n,hp=hq.hp,hpId=''}={}){
 return '<div class="hq-face" data-faction="'+esc(hq.faction)+'">'+
  '<div class="hq-map" aria-hidden="true"></div>'+
  '<div class="hq-hp"><span class="'+(hp>20?'hp-boosted':hp<=10?'hp-critical':'hp-normal')+'"'+(hpId?' id="'+esc(hpId)+'"':'')+' aria-label="'+esc(i18n.t('生命'))+'">'+Math.max(0,hp)+'</span></div></div>';
}
function mount(host,hq,options={}){
 host.innerHTML=markup(hq,options);host.dataset.faction=hq.faction;
 root.LongTelegramMedia.mountArt(host.querySelector('.hq-map'),hq,'');
 return host;
}
return {sizes,markup,mount};
});
