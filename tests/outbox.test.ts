import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initialOutbox, transitionOutbox } from '../src/lib/outbox.ts'
test('naive crash cannot recover a missing event', () => {
 const state = transitionOutbox(initialOutbox(), 'naive')
 assert.equal(state.orders, 1); assert.equal(state.outbox, 0)
 assert.equal(transitionOutbox(state, 'restore').deliveries, 0)
})
test('outage preserves intent, restore processes once, repeated replay preserves effects', () => {
 const pending = transitionOutbox(initialOutbox(), 'outbox')
 assert.equal(pending.offline, true); assert.equal(pending.outbox, 1)
 assert.equal(transitionOutbox(pending, 'replay').deliveries, 0)
 const delivered = transitionOutbox(pending, 'restore')
 assert.equal(delivered.deliveries, 1); assert.equal(delivered.offline, false)
 assert.equal(transitionOutbox(delivered, 'restore').deliveries, 1)
 const replayed = transitionOutbox(transitionOutbox(delivered, 'replay'), 'replay')
 assert.deepEqual([replayed.deliveries, replayed.oms, replayed.email, replayed.analytics, replayed.duplicates], [3, 1, 1, 1, 6])
 assert.equal(pending.deliveries, 0)
})
test('rollback starts an isolated scenario and reset clears all state', () => {
 const delivered = transitionOutbox(transitionOutbox(initialOutbox(), 'outbox'), 'restore')
 const rolledBack = transitionOutbox(delivered, 'rollback')
 assert.deepEqual([rolledBack.orders, rolledBack.outbox, rolledBack.deliveries, rolledBack.oms], [0, 0, 0, 0])
 assert.deepEqual(transitionOutbox(rolledBack, 'reset'), initialOutbox())
})
