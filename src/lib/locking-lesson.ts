// Adapted from the supplied Episode 004 deterministic teaching simulator.
export type LockingMode = 'naive' | 'pessimistic' | 'optimistic' | 'atomic'
function state(stepNumber: number,text: string,a: string,b: string,available: number,held: number,promised: number,version: number,comment: string){return {stepNumber,text,a,b,available,held,promised,version,comment}}
export function sequenceFor(mode: LockingMode,initial: number){
  const one=initial>=1;
  const two=initial>=2;
  const afterA=one?initial-1:initial;
  const afterB=two?initial-2:afterA;
  const promises=two?2:one?1:0;
  const vA=one?6:5;
  const vB=two?7:vA;
  const first=state(0,'Ready to run','READY','READY',initial,0,0,5,'Both customers want one item. Click Next event to observe the race.');
  if(mode==='naive')return [first,
    state(1,'Both shoppers read stale stock',`READ ${initial}`,`READ ${initial}`,initial,0,0,5,'Both checkout pods read the same quantity before either makes a reservation.'),
    state(2,'Both validate independently','PASS STOCK CHECK','PASS STOCK CHECK',initial,0,0,5,'The business decision happens outside an atomic stock claim.'),
    state(3,'Buyer A creates a promise','RESERVED','STILL RUNNING',afterA,one?1:0,one?1:0,vA,'A reserves based on the earlier check.'),
    state(4,'Buyer B creates another stale promise','RESERVED','RESERVED',Math.max(0,initial-2),2,2,vA,'B also creates a reservation. If only one item existed, two promises were created against one unit.'),
    state(5,'RACE FINISHED','FINISHED','FINISHED',Math.max(0,initial-2),2,2,vA,initial===1?'OVERSOLD: two promises for one actual item.':'This particular run did not oversell because sufficient physical stock existed; the implementation is still unsafe under contention.')
  ];
  if(mode==='pessimistic')return [first,
    state(1,'Buyer A obtains FOR UPDATE','ROW LOCK HELD','WAITING',initial,0,0,5,'A owns the conflicting row lock. B requests it and cannot proceed yet.'),
    state(2,'Buyer B remains in lock queue','LOCK OWNER','BLOCKED',initial,0,0,5,'Lock contention queues writers. Keep the database transaction short.'),
    state(3,'Buyer A reserves and commits','COMMITTED','WAITING',afterA,one?1:0,one?1:0,vA,'A updates stock and commits; its lock is released.'),
    state(4,'Buyer B obtains the row and rereads','COMMITTED',two?'STOCK EXISTS':'STOCK 0',afterA,one?1:0,one?1:0,vA,'At READ COMMITTED B receives the updated row and checks availability again.'),
    state(5,'Correct outcome','RESERVED',two?'RESERVED':'SOLD OUT',afterB,promises,promises,vB,'Only requests with actual available stock succeed; no overselling.')
  ];
  if(mode==='optimistic')return [first,
    state(1,'Both read version 5','READ v5','READ v5',initial,0,0,5,'Optimistic locking does not take an upfront FOR UPDATE lock.'),
    state(2,'Both decide stock is available','READY TO SAVE','READY TO SAVE',initial,0,0,5,'Both plan to write using the version they originally read.'),
    state(3,'Buyer A updates version 5 to 6',one?'COMMITTED v6':'SOLD OUT','STILL v5',afterA,one?1:0,one?1:0,vA,'A wins and commits. The version changes to 6.'),
    state(4,'Buyer B tries stale version 5','COMMITTED v6','VERSION CONFLICT',afterA,one?1:0,one?1:0,vA,'B receives an optimistic-lock exception and must roll back its transaction.'),
    state(5,'New transaction reloads current stock','RESERVED',two?'RETRY SUCCEEDS':'SOLD OUT',afterB,promises,promises,vB,two?'Stock remains, so a bounded retry from a new transaction could succeed.':'No stock remains, so the correct result is sold out. Never retry blindly.')
  ];
  return [first,
    state(1,'Both request one guarded update','UPDATE REQUEST','UPDATE REQUEST',initial,0,0,5,'No separate stale business decision: both requests execute UPDATE ... WHERE available >= 1.'),
    state(2,'Buyer A runs atomic SQL',one?'1 ROW UPDATED':'0 ROWS','ROW LOCK WAITS',afterA,one?1:0,one?1:0,vA,'A gets the row and updates only if stock is sufficient.'),
    state(3,'Buyer B waits for conflicting update','COMMITTED','WAITING',afterA,one?1:0,one?1:0,vA,'PostgreSQL serializes the row updates. The second statement waits if necessary.'),
    state(4,'Buyer B reevaluates the WHERE condition','COMMITTED',two?'1 ROW UPDATED':'0 ROWS UPDATED',afterB,promises,promises,vB,'After the first commit, the WHERE predicate is reevaluated against the updated row.'),
    state(5,'Atomic outcome','RESERVED',two?'RESERVED':'SOLD OUT',afterB,promises,promises,vB,'One guarded statement is a concise and correct stock-claim primitive for this single-row invariant.')
  ];
}
