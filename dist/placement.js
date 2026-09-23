
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LongTelegramPlacement=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const CARD_WIDTH=80,SPACING=24,STEP=CARD_WIDTH+SPACING;
  function geometry(count,width){return {start:(width-(count?count*STEP-SPACING:-SPACING))/2};}
  function gapAt(count,width,x){
    const {start}=geometry(count,width);
    let gap=0;while(gap<count&&x>start+gap*STEP+CARD_WIDTH/2)gap++;
    return gap;
  }
  function preview(count,width,gap){
    gap=Math.max(0,Math.min(count,gap));
    const {start}=geometry(count,width);
    return {gap,left:start+gap*STEP-SPACING/2-CARD_WIDTH/2,
      shifts:Array.from({length:count},(_,i)=>i<gap?-STEP/2:STEP/2)};
  }
  return {gapAt,preview,CARD_WIDTH,SPACING,STEP};
});
