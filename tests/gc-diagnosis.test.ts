import assert from 'node:assert/strict'
import test from 'node:test'
import {createRequire} from 'node:module'
const model=createRequire(import.meta.url)('../public/blog/episodes/017/diagnosis-model.js')

test('a 300 ms pause never becomes the entire two-second request',()=>{
 const e=model.evidence('pause');assert.equal(e.request,2000);assert.equal(e.gc,300);assert.equal(e.provider,900);assert.equal(e.covered,1200)
})
test('overlapping pause and provider spans are counted once',()=>{
 const e=model.evidence('overlap');assert.equal(e.gc,300);assert.equal(e.provider,1700);assert.equal(e.covered,1700)
 assert.equal(model.union([[0,10],[5,20],[20,30],[50,60]]),40)
 assert.equal(model.union([[0,20],[5,10],[6,9]]),20)
 assert.equal(model.union([]),0)
})
test('a different JVM is not attributed to the request',()=>{
 const e=model.evidence('wrongServer');assert.equal(e.sameInstance,false);assert.equal(e.gc,0);assert.equal(e.covered,1800)
})
test('slow provider and healthy control remain separate evidence',()=>{
 assert.equal(model.evidence('provider').gc,0);assert.equal(model.evidence('provider').provider,1800)
 assert.equal(model.evidence('healthy').request,200);assert.equal(model.evidence('healthy').provider,70)
 for(const id of Object.keys(model.cases)){const e=model.evidence(id);assert.ok(e.covered<=e.request);assert.ok(e.gc<=e.covered)}
 assert.throws(()=>model.evidence('unknown'))
})
test('nearest-rank p99 exposes the constructed tail',()=>{
 const values=[...Array(98).fill(200),2000,2000];assert.equal(values.reduce((a,b)=>a+b,0)/100,236);assert.equal(model.percentile(values,.99),2000);assert.equal(model.percentile(values,.5),200);assert.equal(values[0],200)
 assert.throws(()=>model.percentile([],1));assert.throws(()=>model.percentile([1],0))
})
test('allocation illustration counts objects and does not mutate pause evidence',()=>{
 const before=model.evidence('pause');assert.equal(model.allocations(200,10),2000);assert.equal(model.allocations(1000,100),100000);assert.deepEqual(model.evidence('pause'),before);assert.throws(()=>model.allocations(-1,10))
})
