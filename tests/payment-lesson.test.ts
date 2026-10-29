import { test } from 'node:test'
import assert from 'node:assert/strict'
import { paymentScenarios } from '../src/lib/payment-lesson.ts'
test('payment walkthroughs preserve the four scenario outcomes', () => {
 for (const [name, scenario] of Object.entries(paymentScenarios)) {
  const final = scenario.frames.at(-1)!
  assert.equal(final.requests, 2)
  assert.equal(final.authorizations, name === 'naive' ? 2 : 1)
  assert.equal(final.rows, name === 'naive' ? 0 : 1)
  assert.ok(scenario.frames.every(f => f.explanation && f.node >= 0 && f.node <= 4))
 }
 assert.equal(paymentScenarios.changed.frames.at(-1)!.response, '409 Conflict')
})
test('protected retry stays unknown until reconciliation without another authorization', () => {
 const frames = paymentScenarios.protected.frames
 assert.equal(frames[1].state, 'UNKNOWN'); assert.equal(frames[2].response, '202 Pending')
 assert.equal(frames[3].state, 'AUTHORIZED'); assert.equal(frames[3].node, 4)
 assert.ok(frames.every(f => f.key === 'attempt-A' && f.authorizations <= 1))
})
