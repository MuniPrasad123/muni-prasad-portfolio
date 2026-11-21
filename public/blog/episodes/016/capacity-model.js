/* Deterministic teaching model. Browser and tests share this implementation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CapacityLesson=api;})(globalThis,function(){
  const nodes=[
    ['👤','Asha','One representative checkout. A browser timeout does not establish whether payment succeeded.'],
    ['⇢','Gateway','Authenticate, rate-limit and bound incoming work; preserve the original operation identity.'],
    ['⚙','Java 21 virtual threads','Make blocking waits cheaper. They do not speed CPU work or enlarge dependencies.'],
    ['▤','Durable attempt','Customer + operation key + matching payload bind one stable provider reference across retries and restarts.'],
    ['🛢','Database pool','Finite connections; keep transactions short and release connections before provider network I/O.'],
    ['⛩','Payment bulkhead','Bound active calls AND waiting tasks; reject new execution when the waiting room is full.'],
    ['🏦','Payment provider','Actual provider capacity is independent of Java threads. Remote work may continue after local timeout.'],
    ['↻','Reconciliation','Query the existing provider reference, then persist an authoritative result and appropriate outbox event.'],
  ];
  const frame=(title,action,active,why)=>({title,action,active,why});
  const arrive=frame('Asha places her order','arrive',[0,1,2],'Checkout has a stable attempt reference. Capacity counters cover the burst; the payment panel follows only Asha.');
  const claim=frame('Persist the operation identity','claim',[3,4],'A unique customer/operation key and payload hash reserve one attempt. No provider call is made inside this short database transaction.');
  const call=frame('Start one provider operation','call',[5,6],'The admitted caller sends the original stable provider reference. This model tracks one representative payment, not a charge for every burst counter.');
  const accepted=frame('Provider accepts; response is delayed','authorize',[6],'The constructed provider has accepted one authorization. Checkout cannot yet confirm it to Asha because the result has not arrived.');
  const timeout=frame('The browser deadline expires','timeout',[0,6],'Show payment checking, not payment failed. A waiting timeout does not cancel remote work. If the local task is still running, its permit stays held.');
  const settle=frame('Local HTTP call finally settles','settle',[5,6],'Release local execution capacity only when that task exits. The remote payment may still be unknown; a local limit is not a global provider guarantee.');
  const repeat=frame('Asha presses Place Order again','repeat',[0,3],'Same customer, key and payload return the existing attempt. There is no second provider authorization.');
  const reconcile=frame('Reconcile the original reference','reconcile',[7,3,4,0],'The authoritative lookup confirms the existing authorization. Persist CONFIRMED and its confirmation outbox once; no second charge.');
  const scenarios={
    unsafe:{label:'Unbounded virtual threads',steps:[arrive,frame('Admit the whole burst','unsafe',[2,6],'All callers may wait cheaply in Java, but the provider has only its configured processing slots. Excess work queues downstream.'),frame('The customer keeps waiting','inspect',[0,4,6],'A different thread model cannot create more database connections or make a slow provider finish faster.')]},
    safe:{label:'Bounded calls + waiting room',steps:[arrive,claim,frame('Apply bounded admission','bounded',[5],'Admit at most the active limit plus a fixed waiting room. New execution beyond that gets fast busy guidance, not an unbounded queue.'),call,accepted,frame('Confirmed response arrives','confirm',[6,3,4,0],'Commit confirmed state and one confirmation outbox intent. The local call exits and returns its permit.')]},
    database:{label:'Database pool exhaustion',steps:[arrive,frame('Queries reach a finite pool','database',[2,4],'The database can lend only the configured connections. Virtual threads beyond that wait; they do not execute all queries simultaneously.'),frame('Bound database work separately','databaseBounded',[4,5],'Use a separate measured DB-work budget, short transactions and acquisition timeouts. Never hold a connection across the payment call.')]},
    unknown:{label:'Timeout + payment-safe recovery',steps:[arrive,claim,call,accepted,timeout,repeat,settle,reconcile]},
    busy:{label:'Busy before provider start',steps:[arrive,claim,frame('No active or waiting space remains','busy',[5,0],'Only an attempt not started at the provider may receive 503/429-style busy guidance. Preserve its identity; do not use this response for an uncertain payment.'),frame('Capacity frees; retry same identity','retry',[3,5,6],'Retry the not-started operation with its same key and provider reference after capacity is available.'),accepted,frame('Confirmed response arrives','confirm',[6,3,0],'The one accepted provider operation is confirmed. No second identity was created.')]},
    restart:{label:'Crash after provider acceptance',steps:[arrive,claim,call,accepted,frame('Process restarts before result persists','restart',[3,7],'The durable claim/reference survives. A stale IN_FLIGHT attempt must be treated as uncertain and reconciled, not blindly resubmitted.'),repeat,reconcile]},
    conflict:{label:'Same key, changed payload',steps:[arrive,claim,call,frame('The key returns with another amount','conflict',[0,3],'Reject the conflicting payload with 409 before another provider call. Resolve the original attempt separately.')]},
    replicas:{label:'Per-pod limit is not global',steps:[arrive,frame('Three pods each allow the local limit','replicas',[2,5,6],'A local semaphore multiplies across replicas. Provider quotas, coordinated admission or partitioned budgets are additional design work.'),frame('Honor a shared capacity budget','global',[5,6],'This branch illustrates a global budget, not an implemented distributed limiter. Its capacity must be coordinated outside a JVM-local semaphore.')]},
  };
  function capacity(input,mode){
    const {demand,provider,queue,db}=input;
    if(![demand,provider,queue,db].every(Number.isInteger)||demand<1||provider<1||queue<0||db<1)throw Error('Invalid capacity inputs');
    const active=Math.min(demand,provider),waiting=Math.min(Math.max(0,demand-active),queue),rejected=Math.max(0,demand-active-waiting);
    return {demand,provider,queue,db,active,waiting,rejected,remoteWaiting:Math.max(0,demand-provider),dbActive:Math.min(demand,db),dbWaiting:Math.max(0,demand-db),clientCalls:mode==='unsafe'?demand:active};
  }
  function initial(){return {status:'CREATED',attempts:1,providerCalls:0,providerEffects:0,outbox:0,permitHeld:false,reference:'attempt-ASHA-101',response:'Not yet started',decision:'Ready',restarts:0};}
  function transition(previous,action){
    const state={...previous};
    switch(action){
      case 'arrive':state.decision='Asha needs an accurate result, not another payment identity.';break;
      case 'claim':state.decision='Durable unique key and payload binding saved; no provider side effect yet.';break;
      case 'unsafe':state.response='Spinner · downstream backlog';state.decision='Cheap waiting moved the queue; dependency capacity did not grow.';break;
      case 'bounded':state.decision='Hard bounds on running and waiting work; excess new execution rejected.';break;
      case 'call':case 'retry':state.providerCalls=1;state.status='IN_FLIGHT';state.permitHeld=true;state.response='Payment processing';state.decision='One provider call uses the existing attempt reference.';break;
      case 'authorize':state.providerEffects=1;state.decision='Provider accepted once; local outcome still unconfirmed.';break;
      case 'timeout':state.status='UNKNOWN';state.response='202 · We are checking your payment';state.decision='Do not equate timeout with rollback or release a still-running task permit.';break;
      case 'repeat':state.response='202 · Existing attempt status';state.decision='Identical retry reuses the saved reference; no new provider call.';break;
      case 'settle':state.permitHeld=false;state.decision='Local call ended; remote outcome still needs reconciliation.';break;
      case 'reconcile':case 'confirm':state.status='CONFIRMED';state.outbox=1;state.permitHeld=false;state.response='Order confirmed · original payment';state.decision='Authoritative outcome stored; one confirmation intent, no second payment.';break;
      case 'busy':state.response='503 · Busy; payment not started';state.decision='Retry guidance applies only before provider execution.';break;
      case 'restart':state.status='UNKNOWN';state.permitHeld=false;state.restarts++;state.response='Checking saved attempt after restart';state.decision='Local semaphore was lost, durable attempt identity was not.';break;
      case 'conflict':state.response='409 · Key/payload conflict';state.decision='Reject changed payload before any second call.';break;
      case 'database':state.response='Waiting for a database connection';state.decision='Queries beyond the pool wait; they are not all running at once.';break;
      case 'databaseBounded':state.response='Bounded database work';state.decision='Separate DB budget, acquisition timeout and short transactions.';break;
      case 'replicas':state.decision='Three local limits can admit three times the configured local calls.';break;
      case 'global':state.decision='A shared budget requires explicit coordination beyond this local model.';break;
      case 'inspect':state.decision='The customer still lacks a reliable checkout result.';break;
    }
    return state;
  }
  function stateAt(mode,cursor){const scenario=scenarios[mode];if(!scenario)throw Error('Unknown scenario');return scenario.steps.slice(0,Math.max(0,cursor+1)).reduce((state,step)=>transition(state,step.action),initial());}
  return {nodes,scenarios,capacity,initial,transition,stateAt};
});
