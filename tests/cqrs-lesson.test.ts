import { test } from 'node:test'
import assert from 'node:assert/strict'
import { customerMessage, initialCqrs, journey, project, scenarios, stateAt, transition, type Snapshot } from '../src/lib/cqrs-lesson.ts'
test('nine-step journey commits authority before projection and rejects stale replay',()=>{
  assert.equal(journey.length,9)
  const committed=stateAt(journey,2,'protected')
  assert.deepEqual(committed.write,{status:'PAID',version:2});assert.deepEqual(committed.read,{status:'PENDING',version:1})
  assert.equal(committed.confirmed,true);assert.match(committed.outbox,/Pending/)
  assert.match(customerMessage(stateAt(journey,5,'protected'),'protected'),/synchronizing/)
  const final=stateAt(journey,8,'protected')
  assert.deepEqual(final.read,final.write);assert.equal(final.applications,1)
  assert.match(stateAt(journey,7,'protected').decision,/Older version rejected/)
  assert.equal(stateAt(journey,8,'unsafe').read.status,'PENDING')
})
test('all eight protected scenarios converge without mutating authoritative payment',()=>{
  assert.equal(scenarios.length,8)
  for(const scenario of scenarios){
    const final=stateAt(scenario.frames,scenario.frames.length-1,'protected')
    assert.deepEqual(final.read,{status:'PAID',version:2},scenario.id);assert.equal(final.applications,1,scenario.id)
    for(let i=2;i<scenario.frames.length;i++)assert.deepEqual(stateAt(scenario.frames,i,'protected').write,final.write)
  }
})
test('guard handles permutations, duplicates and equal-version conflicts',()=>{
  const pending:Snapshot={status:'PENDING',version:1},paid:Snapshot={status:'PAID',version:2}
  for(const events of [[pending,paid,pending,paid],[paid,pending,paid,pending],[paid,paid,pending]]){
    let stored=pending
    for(const event of events){const result=project(stored,event,'protected');assert.ok(result.snapshot.version>=stored.version);stored=result.snapshot}
    assert.deepEqual(stored,paid)
  }
  const conflict=project(paid,{status:'PENDING',version:2},'protected')
  assert.equal(conflict.applied,false);assert.match(conflict.decision,/investigate/);assert.deepEqual(conflict.snapshot,paid)
})
test('unavailable view is not payment failure; unknown payment never appears confirmed',()=>{
  assert.doesNotMatch(customerMessage(initialCqrs(),'protected'),/Payment confirmed/)
  const down=transition(stateAt(journey,3,'protected'),'readDown','protected')
  assert.equal(down.readAvailable,false);assert.match(customerMessage(down,'protected'),/temporarily unavailable/)
  assert.equal(transition(down,'paid','protected').read.status,'PAID')
})
test('publisher failure retains event intent; Previous reconstructs earlier state',()=>{
  const scenario=scenarios.find(s=>s.id==='publisher')!
  const failed=stateAt(scenario.frames,3,'protected')
  assert.match(failed.outbox,/Pending/);assert.match(failed.kafka,/No broker acknowledgement/)
  const before=stateAt(journey,2,'protected');stateAt(journey,8,'protected')
  assert.deepEqual(stateAt(journey,2,'protected'),before);assert.deepEqual(stateAt(journey,-1,'protected'),initialCqrs())
})
