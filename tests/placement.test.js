const assert=require('node:assert/strict');
const P=require('../dist/placement.js');
const {CARD_WIDTH:W,STEP,SPACING}=P;
for(let count=0;count<=4;count++){
  for(let gap=0;gap<=count;gap++){
    const v=P.preview(count,532,gap),center=v.left+W/2;
    assert.equal(P.gapAt(count,532,center),gap,'preview must stay over its own drop region');
    assert.ok(v.left>=0&&v.left+W<=532,'preview fits row');
    const total=count?count*STEP-SPACING:0,start=(532-total)/2;
    for(let i=0;i<count;i++){
      const left=start+i*STEP+v.shifts[i];
      assert.ok(left+W<=v.left||left>=v.left+W,'cards cannot overlap the opened gap');
    }
    for(const scale of [.35,.75,1,1.4]){
      const rowLeft=83,clientX=rowLeft+center*scale;
      const local=(clientX-rowLeft)/scale;
      assert.equal(P.gapAt(count,532,local),gap,'scaled viewport preserves placement');
    }
  }
  assert.equal(P.gapAt(count,532,-40),0);
  assert.equal(P.gapAt(count,532,580),count);
}
console.log('Dynamic placement geometry tests passed');
