import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const model=createRequire(import.meta.url)('../public/blog/episodes/015/webhook-model.js')

test('lost ACK retry compares repeated effects with one real success transition',()=>{
  const unsafe=model.stateAt('unsafe',5),safe=model.stateAt('safe',5)
  assert.equal(unsafe.chargeCount,1);assert.equal(safe.chargeCount,1)
  assert.equal(unsafe.deliveries,3);assert.equal(safe.deliveries,3)
  assert.equal(unsafe.transitions,1);assert.equal(unsafe.processingAttempts,3)
  assert.equal(unsafe.emailIntents,3);assert.equal(unsafe.shipmentIntents,3)
  assert.equal(safe.inbox.length,1);assert.equal(safe.outbox,1)
  assert.equal(safe.transitions,1);assert.equal(safe.emailIntents,1);assert.equal(safe.shipmentIntents,1)
})
test('different event ID cannot bypass the payment state guard',()=>{
  const state=model.stateAt('newid',3)
  assert.equal(state.inbox.length,2);assert.equal(state.outbox,1);assert.equal(state.transitions,1)
})
test('invalid signature and wrong merchant reject before mutation',()=>{
  for(const scenario of ['forged','merchant']){
    const state=model.stateAt(scenario,1)
    assert.equal(state.deliveries,1);assert.equal(state.status,'PENDING')
    assert.equal(state.inbox.length,0);assert.equal(state.outbox,0);assert.equal(state.emailIntents,0)
    assert.match(state.ack,/400/)
  }
})
test('late success cannot regress REFUNDED and requests reconciliation',()=>{
  const state=model.stateAt('refund',3)
  assert.equal(state.status,'REFUNDED');assert.equal(state.reconciliation,true)
  assert.equal(state.transitions,0);assert.equal(state.outbox,0);assert.equal(state.inbox.length,1)
})
test('send-then-crash retry keeps the same downstream identities',()=>{
  const crashed=model.stateAt('worker',2),recovered=model.stateAt('worker',3)
  assert.match(crashed.outboxState,/Pending/);assert.equal(crashed.emailEffects,1)
  assert.equal(recovered.dispatchAttempts,2);assert.equal(recovered.emailEffects,1);assert.equal(recovered.shipmentEffects,1)
  assert.equal(recovered.destinationKeys.length,2);assert.match(recovered.outboxState,/Published/)
})
test('Previous and Reset reconstruct state without leaking counters across runs',()=>{
  const before=model.stateAt('safe',1)
  model.stateAt('unsafe',5)
  assert.deepEqual(model.stateAt('safe',1),before)
  assert.deepEqual(model.stateAt('safe',-1),model.initial())
})
