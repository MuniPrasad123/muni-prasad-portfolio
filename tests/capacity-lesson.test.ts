import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const model=createRequire(import.meta.url)('../public/blog/episodes/016/capacity-model.js')
test('bounded admission partitions demand and respects both resource limits',()=>{
  for(const demand of [1,20,100,500])for(const provider of [1,20,80])for(const queue of [0,10,40])for(const db of [1,20,40]){
    const c=model.capacity({demand,provider,queue,db},'safe')
    assert.equal(c.active+c.waiting+c.rejected,demand);assert.ok(c.active<=provider);assert.ok(c.waiting<=queue);assert.ok(c.dbActive<=db)
    const unsafe=model.capacity({demand,provider,queue,db},'unsafe');assert.equal(unsafe.clientCalls,demand);assert.equal(unsafe.remoteWaiting,Math.max(0,demand-provider))
  }
})
test('timeouts preserve a running local permit and the original payment identity',()=>{
  const timeout=model.stateAt('unknown',4),repeat=model.stateAt('unknown',5),settled=model.stateAt('unknown',6),final=model.stateAt('unknown',7)
  assert.equal(timeout.status,'UNKNOWN');assert.equal(timeout.permitHeld,true)
  assert.equal(repeat.providerCalls,1);assert.equal(repeat.providerEffects,1)
  assert.equal(settled.permitHeld,false);assert.equal(settled.status,'UNKNOWN')
  assert.equal(final.status,'CONFIRMED');assert.equal(final.outbox,1)
  for(const s of [timeout,repeat,settled,final])assert.equal(s.reference,'attempt-ASHA-101')
})
test('busy before provider start is distinct from an uncertain payment',()=>{
  const busy=model.stateAt('busy',2);assert.equal(busy.providerCalls,0);assert.equal(busy.status,'CREATED');assert.match(busy.response,/503/)
  const final=model.stateAt('busy',5);assert.equal(final.providerCalls,1);assert.equal(final.providerEffects,1);assert.equal(final.status,'CONFIRMED')
})
test('process restart and changed payload do not start another provider operation',()=>{
  const recovered=model.stateAt('restart',6);assert.equal(recovered.status,'CONFIRMED');assert.equal(recovered.providerCalls,1);assert.equal(recovered.providerEffects,1)
  const conflict=model.stateAt('conflict',3);assert.match(conflict.response,/409/);assert.equal(conflict.providerCalls,1)
})
test('nine scenarios reconstruct deterministically and reject invalid inputs',()=>{
  assert.equal(Object.keys(model.scenarios).length,9)
  const earlier=model.stateAt('safe',1);model.stateAt('unsafe',2);assert.deepEqual(model.stateAt('safe',1),earlier)
  assert.deepEqual(model.stateAt('safe',-1),model.initial())
  assert.throws(()=>model.capacity({demand:0,provider:1,queue:0,db:1},'safe'))
})
test('beginner walkthrough explains the benefit without fabricating payment or performance effects',()=>{
  assert.match(model.stateAt('threads',1).response,/queue/)
  assert.match(model.stateAt('threads',2).decision,/frees the carrier/)
  assert.match(model.stateAt('threads',3).decision,/dependencies have spare capacity/)
  const final=model.stateAt('threads',4);assert.equal(final.providerCalls,0);assert.equal(final.outbox,0)
})
