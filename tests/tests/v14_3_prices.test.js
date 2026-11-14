const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const ctx={window:{},Math};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/shop.js'),'utf8'),ctx);
const shop=ctx.window.BellymonShop;
let checks=0;
for(const [type,percent,steaks,gigots] of [['petite',30,9,3],['grande',60,15,5],['supreme',90,21,7]]){
  const p=shop.POTIONS[type];
  assert.deepEqual([p.percent,p.small,p.large],[percent,steaks,gigots]);checks++;
  assert.equal(steaks%3,0);assert.equal(steaks/3,gigots);checks+=2;
  for(const [food,cost] of [['small',steaks],['large',gigots]]){
    const data={tower:{floor:1,event:null},food:{small:100,large:100},potions:shop.empty(),waifus:[],hospital:{slots:[]}};
    const result=shop.buy(data,type,food);
    assert.equal(result.price,cost);assert.equal(data.food[food],100-cost);assert.equal(data.potions[type],1);checks+=3;
    data.food[food]=cost-1;
    assert.throws(()=>shop.buy(data,type,food),/assez/);
    assert.equal(data.food[food],cost-1);assert.equal(data.potions[type],1);checks+=3;
  }
}
assert.ok(9/0.3 >15/0.6 &&15/0.6>21/0.9);checks++;
console.log(`PASS: ${checks} contrôles des nouveaux tarifs V14.3`);
