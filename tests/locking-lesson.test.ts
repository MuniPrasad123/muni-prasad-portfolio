import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sequenceFor, type LockingMode } from '../src/lib/locking-lesson.ts'
test('Episode 004: protected stock claims conserve inventory for 1–3 units',()=>{
 for(const mode of ['naive','pessimistic','optimistic','atomic'] as LockingMode[]) for(const stock of [1,2,3]) {
  const frames=sequenceFor(mode,stock), end=frames.at(-1)!
  assert.equal(end.promised,mode==='naive'?2:Math.min(stock,2))
  if(mode!=='naive')for(const frame of frames){assert.equal(frame.available+frame.held,stock);assert.ok(frame.promised<=stock)}
 }
 assert.equal(sequenceFor('optimistic',1)[4].b,'VERSION CONFLICT')
 assert.equal(sequenceFor('pessimistic',1)[2].b,'BLOCKED')
 assert.equal(sequenceFor('atomic',1)[4].b,'0 ROWS UPDATED')
})
