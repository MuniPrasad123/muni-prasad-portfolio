export type Snapshot = { status: 'PENDING' | 'PAID'; version: number }
export type Design = 'protected' | 'unsafe'
export type Action = 'place' | 'verify' | 'commit' | 'publish' | 'lag' | 'view' | 'paid' | 'stale' | 'duplicate' | 'done' | 'restart' | 'publisherDown' | 'readDown' | 'reconcile'
export type CqrsState = {
  write: Snapshot; read: Snapshot; confirmed: boolean; outbox: string; kafka: string;
  consumer: string; readAvailable: boolean; decision: string; applications: number
}
export type Frame = { title: string; action: Action; active: number[]; why: string }
export const components = [
  ['🧑', 'Customer', 'A shopper buys sneakers for ₹4,999. One order and one verified payment.'],
  ['🛒', 'Checkout UI', 'Uses the verified command response. An unknown provider outcome stays under verification.'],
  ['⚙', 'Order Service', 'Spring Boot verifies payment, locks the order and commits a state transition.'],
  ['🛢', 'Write PostgreSQL', 'Authoritative ORD-101 state. The order and outbox share one local transaction.'],
  ['▤', 'Transactional outbox', 'Durable event intent stored inside the write database, not another distributed commit.'],
  ['↗', 'Outbox publisher', 'Retries pending rows. Marks published only after broker acknowledgement; a crash can cause duplicates.'],
  ['✉', 'Kafka · order-events', 'Key: ORD-101. Partition order does not repair old snapshots introduced by replay paths.'],
  ['⚙', 'Projection consumer', 'Spring Boot applies snapshots in PostgreSQL, then allows the Kafka offset to commit.'],
  ['🛢', 'Read PostgreSQL', 'A separate optimized view. Atomic version guards prevent stale overwrites across replicas.'],
  ['🛍', 'My Orders UI', 'Shows read-model state and an honest synchronization indicator based on authoritative confirmation.'],
] as const
export const journey: Frame[] = [
  { title: 'Customer places order', action: 'place', active: [0,1,2], why: 'ORD-101 starts at PENDING v1. The shopper submits the ₹4,999 sneaker checkout once.' },
  { title: 'Payment is verified', action: 'verify', active: [1,2], why: 'The provider confirms success to the Order Service. Provider authorization is outside the PostgreSQL transaction. Until verification, checkout must not promise success.' },
  { title: 'Order and outbox commit', action: 'commit', active: [2,3,4], why: 'One local transaction stores PAID v2 and its OrderPaid outbox snapshot. Only after commit does checkout show “Payment Successful! Order Confirmed.”' },
  { title: 'Kafka publication', action: 'publish', active: [4,5,6], why: 'The publisher sends OrderPaid { orderId: ORD-101, status: PAID, version: 2 }. Broker acknowledgement permits marking the outbox row published.' },
  { title: 'Consumer is delayed', action: 'lag', active: [6,7], why: 'A backlog holds the projection at PENDING v1. Kafka contains the event; the read database has not applied it.' },
  { title: 'Customer sees old history', action: 'view', active: [0,8,9], why: 'The read API still returns PENDING v1. Verified command confirmation allows “Payment confirmed. Your order history is synchronizing.” No second payment is requested.' },
  { title: 'Consumer recovers', action: 'paid', active: [6,7,8], why: 'The consumer commits the complete PAID v2 snapshot. This is a read-model update, not another charge.' },
  { title: 'Older snapshot is replayed', action: 'stale', active: [6,7,8], why: 'A recovery/replay path republishes PENDING v1 after v2. This is not Kafka reordering one partition. The protected projection rejects the older version.' },
  { title: 'Customer sees correct status', action: 'done', active: [8,9,0], why: 'My Orders reads PAID v2. The protected projection caught up without creating another payment or another order.' },
]
const frame = (title: string, action: Action, why: string, active = [6,7,8]): Frame => ({title, action, why, active})
const start = journey.slice(0,4)
const finish = journey[8]
export const scenarios: { id: string; label: string; frames: Frame[] }[] = [
  {id:'normal',label:'Normal propagation',frames:[...start,journey[6],finish]},
  {id:'lag',label:'Kafka consumer delay',frames:journey},
  {id:'restart',label:'Consumer restart',frames:[...start,frame('Consumer restarts','restart','The process stops before its offset commits. A durable projection survives; Kafka can redeliver the record.'),journey[6],frame('Offset retry redelivers v2','duplicate','A crash after database commit but before offset commit redelivers the same snapshot. Equal versions do not reapply state.'),finish]},
  {id:'duplicate',label:'Duplicate delivery',frames:[...start,journey[6],frame('PAID v2 arrives again','duplicate','At-least-once delivery can repeat an event. The database guard preserves state across retries and replicas.'),finish]},
  {id:'ordering',label:'Out-of-order replay',frames:[...start,journey[6],journey[7],finish]},
  {id:'publisher',label:'Outbox publisher failure',frames:[...journey.slice(0,3),frame('Publisher cannot reach Kafka','publisherDown','The order remains PAID. The pending outbox row is retained and retried; the broker has not acknowledged publication.',[4,5,6]),journey[3],journey[6],finish]},
  {id:'read-down',label:'Read model unavailable',frames:[...start,frame('Read database unavailable','readDown','Projection transaction fails. Throw the error; do not acknowledge the offset. The customer sees history temporarily unavailable.',[7,8,9]),journey[6],finish]},
  {id:'reconcile',label:'Reconciliation and recovery',frames:[...start,journey[4],frame('Freshness alert triggers repair','reconcile','A reconciler retrieves the authorized authoritative PAID v2 snapshot and uses the same atomic guard. Kafka replay remains safe.',[2,3,7,8]),frame('Broker delivery resumes','duplicate','The repaired v2 projection ignores the later identical v2 Kafka snapshot.'),finish]},
]
export function initialCqrs(): CqrsState {
  return {write:{status:'PENDING',version:1},read:{status:'PENDING',version:1},confirmed:false,outbox:'Not yet created',kafka:'No paid event',consumer:'Ready',readAvailable:true,decision:'Ready: payment outcome not yet verified.',applications:0}
}
export function project(stored: Snapshot, incoming: Snapshot, design: Design): { snapshot: Snapshot; decision: string; applied: boolean } {
  if (design === 'unsafe') return {snapshot:{...incoming}, decision:'Unconditional overwrite accepted.',applied:true}
  if (incoming.version < stored.version) return {snapshot:stored,decision:'Older version rejected.',applied:false}
  if (incoming.version === stored.version) return {snapshot:stored,decision:incoming.status === stored.status ? 'Duplicate: no state change.' : 'Conflicting same-version payload: investigate.',applied:false}
  return {snapshot:{...incoming},decision:'Newer complete snapshot accepted.',applied:true}
}
export function transition(state: CqrsState, action: Action, design: Design): CqrsState {
  const next = {...state}
  switch(action) {
    case 'place': next.decision='Order created; payment verification pending.'; break
    case 'verify': next.decision='Provider success verified; order transaction still to commit.'; break
    case 'commit': next.write={status:'PAID',version:2};next.confirmed=true;next.outbox='Pending · OrderPaid v2';next.decision='Order + outbox committed atomically.';break
    case 'publish': next.outbox='Published · broker acknowledged';next.kafka='OrderPaid · ORD-101 · v2';next.decision='Event durable in Kafka; projection may still lag.';break
    case 'publisherDown': next.outbox='Pending · retry required';next.kafka='No broker acknowledgement';next.decision='Retain durable event intent; retry publication.';break
    case 'lag': next.consumer='Delayed · backlog';next.decision='PAID v2 awaits projection processing.';break
    case 'restart': next.consumer='Restarting · offsets retained';next.decision='Resume from last committed offset.';break
    case 'readDown': next.readAvailable=false;next.consumer='Retrying · DB unavailable';next.decision='No database commit; no offset acknowledgement.';break
    case 'paid': case 'stale': case 'duplicate': case 'reconcile': {
      const incoming: Snapshot = action==='stale' ? {status:'PENDING',version:1} : {...state.write}
      const result=project(state.read,incoming,design)
      next.read=result.snapshot;next.readAvailable=true;next.consumer=action==='reconcile'?'Reconciled from authority':'Running';next.decision=result.decision
      next.applications+=Number(result.applied)
      if(action!=='reconcile')next.kafka=`${incoming.status==='PAID'?'OrderPaid':'OrderPending'} · v${incoming.version} processed`
      break
    }
    case 'view': next.decision='History response is stale; compare with verified command confirmation.';break
    case 'done': next.decision=next.read.status==='PAID'?'History has caught up. One order; one payment.':'Unsafe overwrite left history stale. Repair from the authority.';break
  }
  return next
}
export function stateAt(frames: Frame[], step: number, design: Design) {
  return frames.slice(0,step+1).reduce((state,frame)=>transition(state,frame.action,design),initialCqrs())
}
export function customerMessage(state: CqrsState, design: Design) {
  if(!state.readAvailable)return state.confirmed?'Payment confirmed. Order history temporarily unavailable.':'Order history unavailable. Payment verification pending.'
  if(state.read.status==='PAID')return 'Paid · ORD-101 · ₹4,999'
  if(state.confirmed && design==='protected')return 'Payment confirmed. Your order history is synchronizing.'
  return state.confirmed?'Payment Pending · misleading stale history':'Payment verification pending. Do not resubmit.'
}
