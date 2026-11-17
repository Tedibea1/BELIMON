/* BELIMON — record reset ONLY when free progression starts at floor 1.
   The real game handlers are executed with a save-transaction mock.
   Run: node tests/tests/record_reset_on_free_advance.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const game=fs.readFileSync('js/game.js','utf8');
const shortcuts=fs.readFileSync('js/shortcuts.js','utf8');
function extract(start,end){
  const begin=game.indexOf(start);
  const finish=game.indexOf(end,begin+start.length);
  assert.ok(begin>=0&&finish>begin,'Missing real handler: '+start);
  return game.slice(begin,finish);
}
const handlers=[
  extract('  async function advanceInTower(){','  async function openChest(){'),
  extract('  async function finishCurrentEvent(){','  function requestQuitTower(){')
].join('\n');
assert.match(game,/Avancer gratuitement \(ou AUTO\) efface le record/,'Free reset must be clearly explained on floor 1');
assert.match(game,/tower\.record=Math\.max\(tower\.record,tower\.floor\)/,'Climbing still establishes new records');
assert.match(game,/else await advanceInTower\(\)/,'AUTO uses the same free reset path');
assert.match(game,/SHORTCUTS\.apply\(data,kind\)/,'Paid shortcuts keep their dedicated handler');

const window={};
vm.runInNewContext(shortcuts,{window});
const S=window.BellymonShortcuts;
let slot,commitEnabled=true,notices=[],events=[],successCount=0;
const STATE={currentId:'slot-1',slots:new Map()};
const fixture=(record,floor=1)=>({
  data:{
    food:{small:500,large:12},
    waifus:[{id:'waifu-1',rank:'A',hp:100,energy:65}],
    activeWaifuId:'waifu-1',bonuses:{force:7},hospital:{slots:[]},
    tower:{floor,record,room:'rest',event:null,combat:null,activeTraps:[],history:[]}
  }
});
const context={
  STATE,
  heroAvailable:hero=>hero.hp>0,
  chooseEvent:()=>({type:'chest',state:'pending'}),
  commitTower:async modify=>{
    // Mirror commitTower: mutate a copy; update the live slot only on success.
    const copy=JSON.parse(JSON.stringify(slot.data));
    modify(copy.tower);
    if(!commitEnabled)return false;
    slot.data=copy;successCount++;
    return true;
  },
  appendTowerHistory:(tower,msg)=>{
    tower.history=[msg,...(tower.history||[])].slice(0,4);
  },
  announceEvent:(...args)=>events.push(['combat',args]),
  announceChestThenOpen:()=>events.push(['chest']),
  TRAPS:{advance:()=>{}},
  showToast:m=>notices.push(m)
};
vm.runInNewContext(handlers+'\nthis.TEST_HANDLERS={advanceInTower,finishCurrentEvent};',context);
const {advanceInTower,finishCurrentEvent}=context.TEST_HANDLERS;
function prepare(record=100,floor=1){
  slot=fixture(record,floor);
  STATE.slots.set('slot-1',slot);
  events=[];notices=[];commitEnabled=true;
  return slot.data;
}
const snapshot=data=>JSON.parse(JSON.stringify({
  waifus:data.waifus,food:data.food,bonuses:data.bonuses,
  hospital:data.hospital,activeWaifuId:data.activeWaifuId
}));
async function completeFloor(){
  slot.data.tower.event={type:'chest',state:'opened'};
  slot.data.tower.room='event';
  await finishCurrentEvent();
}

(async()=>{
  let d=prepare(100),assets=snapshot(d);
  assert.equal(d.tower.record,100,'Returning to floor 1 alone keeps the record');
  assert.equal(S.plan(d.tower.record,'record').cost,100,'Old shortcut is still available before free restart');
  await advanceInTower();
  assert.equal(slot.data.tower.floor,1,'New run starts at floor 1');
  assert.equal(slot.data.tower.record,1,'Free Avancer discards historical record immediately');
  assert.equal(slot.data.tower.room,'event');
  assert.equal(events.length,1);
  assert.deepEqual(snapshot(slot.data),assets,'Free restart must preserve heroes, bonuses, food and hospital');
  assert.equal(S.plan(slot.data.tower.record,'record'),null,'Old paid shortcut no longer available');
  assert.equal(S.plan(slot.data.tower.record,'reduced'),null,'Old reduced shortcut no longer available');
  assert.ok(slot.data.tower.history.some(line=>line.includes('record 100 abandonné')));

  // After resuming manually from floor 1, the only record is the newly reached floor.
  for(let next=2;next<=65;next++){
    await completeFloor();
    assert.equal(slot.data.tower.floor,next);
    assert.equal(slot.data.tower.record,next,'Record must grow from scratch at floor '+next);
  }
  assert.equal(S.plan(slot.data.tower.record,'record').target,65);
  assert.equal(S.plan(slot.data.tower.record,'reduced').target,60);
  assert.deepEqual(snapshot(slot.data),assets,'Climbing must not change unrelated assets');

  // A paid return does NOT discard the saved record, including reduced shortcuts.
  d=prepare(100);
  const reduced=S.apply(d,'reduced');
  assert.equal(reduced.target,95);
  assert.equal(d.tower.record,100);
  assert.equal(d.food.small,452);
  await advanceInTower();
  assert.equal(slot.data.tower.record,100,'Exploring from paid floor 95 retains record 100');
  await completeFloor();
  assert.equal(slot.data.tower.floor,96);
  assert.equal(slot.data.tower.record,100,'Replaying older floors cannot lower record');

  d=prepare(100);
  S.apply(d,'record');
  assert.equal(d.tower.floor,100);
  assert.equal(d.tower.record,100);
  await advanceInTower();
  assert.equal(slot.data.tower.record,100);
  await completeFloor();
  assert.equal(slot.data.tower.floor,101);
  assert.equal(slot.data.tower.record,101,'Exceeding paid record grows naturally');

  // Fresh save has nothing to discard.
  d=prepare(1);
  await advanceInTower();
  assert.equal(slot.data.tower.record,1);
  assert.ok(!slot.data.tower.history.some(line=>line.includes('abandonné')));

  // A failed storage write must not erase the record.
  d=prepare(226);
  commitEnabled=false;
  await advanceInTower();
  assert.equal(slot.data.tower.record,226);
  assert.equal(slot.data.tower.room,'rest');
  assert.equal(slot.data.tower.event,null);
  assert.equal(events.length,0,'No announcement on a failed write');

  // Cannot initiate another run without an available heroine.
  d=prepare(226);
  d.waifus[0].hp=0;
  await advanceInTower();
  assert.equal(slot.data.tower.record,226);
  assert.equal(slot.data.tower.event,null);

  // Mid-run advancing cannot erase the record, even if the floor is below it.
  d=prepare(226,44);
  await advanceInTower();
  assert.equal(slot.data.tower.record,226);
  await completeFloor();
  assert.equal(slot.data.tower.record,226);

  console.log('PASS: free start resets record atomically; new highs grow; paid resumes preserve records; heroes/resources intact; failed saves safe; AUTO shared.');
})().catch(err=>{console.error(err);process.exitCode=1;});
