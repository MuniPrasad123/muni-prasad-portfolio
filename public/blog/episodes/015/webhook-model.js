/* Shared by the browser lab and Node tests. No network or payment operation is performed. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WebhookLesson = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  const nodes = [
    ['👤', 'Maya', 'One $120 payment. Repeated emails do not prove additional charges.'],
    ['🏦', 'Payment provider', 'Reports the existing pay_100 outcome; retries when an acknowledgement is missing.'],
    ['🛡', 'Merchant API', 'Authenticates original raw bytes, timestamp and trusted merchant mapping before database writes.'],
    ['▤', 'PostgreSQL transaction', 'Inbox uniqueness, guarded payment update and outbox intent commit or roll back together.'],
    ['⚙', 'Outbox worker', 'Retries downstream dispatch using stable business keys, including after an ambiguous send.'],
    ['✉', 'Email + warehouse', 'Each destination deduplicates its own stable key where supported; otherwise reconcile ambiguous results.'],
  ];
  const step = (title, action, active, why) => ({ title, action, active, why });
  const paid = step('Maya pays once', 'start', [0,1], 'The provider has already completed pay_100 for $120. The webhook reports that result; it is not another payment command.');
  const first = step('Signed evt_501 arrives', 'first', [1,2,3], 'Verify the original bytes, timestamp and merchant. Protected handling commits inbox + one PENDING → SUCCEEDED transition + one outbox intent before ACK.');
  const lost = step('The ACK is lost after commit', 'lost', [1,2], 'The provider cannot see the successful database commit. A missing HTTP response can legitimately cause redelivery.');
  const retry = step('The same event is delivered again', 'retry', [1,2,3], 'Inbox uniqueness recognizes evt_501. Return a safe 2xx after durable acceptance, without another transition or business intent.');
  const third = step('A third copy is delivered', 'retry', [1,2,3], 'Repeat delivery remains harmless with persistent guards. The unsafe handler schedules the email and shipment again.');
  const dispatch = step('Dispatch the saved business intent', 'dispatch', [3,4,5], 'One PaymentSucceeded outbox intent fans out to one logical email and one fulfillment intent. Each destination uses a separate stable deduplication key.');
  const scenarios = {
    unsafe: { label:'Unsafe: lost ACK + retries', design:'unsafe', steps:[paid,first,lost,retry,third,step('Maya sees repeated business effects','impact',[0,5],'Three deliveries produced three email and shipment intents in the unsafe handler. There is no durable outbox here. Support checks pay_100 to distinguish repeated notifications from charges.')] },
    safe: { label:'Protected: lost ACK + retries', design:'protected', steps:[paid,first,lost,retry,third,dispatch] },
    forged: { label:'Invalid signature', design:'protected', steps:[paid,step('Forged notification arrives','forged',[1,2],'Signature verification fails before parsing trusted business fields. Reject it without inbox, state or outbox writes.')] },
    newid: { label:'Different event ID, same payment', design:'protected', steps:[paid,first,step('Valid evt_502 reports the same payment','newid',[1,2,3],'The inbox accepts a distinct ID, but SUCCEEDED cannot transition to SUCCEEDED again. No second business event is created.'),dispatch] },
    refund: { label:'State guard: refund before late success', design:'protected', steps:[paid,step('Authoritative refund is reconciled','refund',[1,2,3],'The example begins this branch with the authority already confirming REFUNDED. This is not a claim that every provider refund webhook may bypass validation.'),first,step('Inspect the terminal state','inspect',[0,3],'Late success must not regress REFUNDED. Persist the accepted notification, flag reconciliation and create no success outbox intent.')] },
    worker: { label:'Outbox crash after send', design:'protected', steps:[paid,first,step('Worker sends; its reply is lost','workerCrash',[4,5],'Downstream accepts the stable email/fulfillment keys, but the worker crashes before marking the outbox published. The row remains pending.'),step('Worker retries with the same keys','dispatch',[3,4,5],'The endpoints recognize the keys. There are two send attempts but one logical effect at each destination. An endpoint without idempotency requires reconciliation.')] },
    merchant: { label:'Wrong merchant', design:'protected', steps:[paid,step('Valid signature, wrong account','wrongMerchant',[2],'A valid signature alone does not authorize a different merchant or tenant. Reject the account mapping before any state mutation.')] },
  };
  function initial() { return { chargeCount:1, status:'PENDING', deliveries:0, transitions:0, processingAttempts:0, inbox:[], outbox:0, outboxState:'Empty', emailIntents:0, shipmentIntents:0, dispatchAttempts:0, emailEffects:0, shipmentEffects:0, destinationKeys:[], ack:'No notification received', decision:'Ready', reconciliation:false }; }
  function accept(state, eventId, design) {
    state.deliveries++;
    state.processingAttempts++;
    if (design === 'unsafe') {
      if (state.status === 'PENDING') { state.status='SUCCEEDED'; state.transitions++; }
      state.emailIntents++; state.shipmentIntents++; state.emailEffects++; state.shipmentEffects++;
      state.ack='200 response (may be lost)'; state.decision='Unsafe handler repeated external work; a repeated assignment is not another payment-state transition.';
      return;
    }
    const key='acme:merchant_1:'+eventId;
    if (state.inbox.includes(key)) { state.ack='200 · duplicate safely acknowledged'; state.decision='Inbox duplicate: no new database work or downstream intent.'; return; }
    state.inbox.push(key);
    state.ack='200 · after durable commit';
    if (state.status !== 'PENDING') {
      state.reconciliation=state.status==='REFUNDED';
      state.decision=state.reconciliation?'State conflict: preserve REFUNDED and reconcile.':'New delivery ID accepted; payment guard blocks another success intent.';
      return;
    }
    state.status='SUCCEEDED'; state.transitions++; state.outbox++; state.emailIntents++; state.shipmentIntents++; state.outboxState='Pending';
    state.decision='Committed inbox + one state transition + one outbox intent atomically.';
  }
  function deliver(state, crash) {
    if (!state.outbox) return;
    state.dispatchAttempts++;
    for (const destination of ['email','shipment']) {
      const key=destination+':payment-succeeded:merchant_1:pay_100';
      if (!state.destinationKeys.includes(key)) { state.destinationKeys.push(key); if(destination==='email')state.emailEffects++; else state.shipmentEffects++; }
    }
    state.outboxState=crash?'Pending · send outcome ambiguous':'Published · destinations acknowledged';
    state.decision=crash?'Sent before crash; retry with the same stable keys.':'Destination idempotency preserves one logical effect per endpoint.';
  }
  function transition(previous, action, design) {
    const state={...previous,inbox:[...previous.inbox],destinationKeys:[...previous.destinationKeys]};
    switch (action) {
      case 'start': state.decision='Provider charge already completed once; notification handling starts next.'; break;
      case 'first': accept(state,'evt_501',design); break;
      case 'retry': accept(state,'evt_501',design); break;
      case 'newid': accept(state,'evt_502',design); break;
      case 'lost': state.ack='Lost after commit · provider will retry'; state.decision='Lost ACK does not roll back the database or create a new payment.'; break;
      case 'forged': state.deliveries++;state.ack='400 · invalid signature';state.decision='Rejected before inbox, state or outbox writes.';break;
      case 'wrongMerchant': state.deliveries++;state.ack='400 · merchant mismatch';state.decision='Rejected before cross-tenant mutation.';break;
      case 'refund': state.status='REFUNDED';state.decision='Authority confirms refund; reconcile local terminal state.';break;
      case 'inspect': state.decision='REFUNDED preserved. Investigate the delayed success notification.';break;
      case 'impact': state.decision='One provider payment; repeated merchant work. No new payment was created by the webhook.';break;
      case 'dispatch': deliver(state,false);break;
      case 'workerCrash': deliver(state,true);break;
    }
    return state;
  }
  function stateAt(mode, cursor) { const scenario=scenarios[mode];if(!scenario)throw Error('Unknown scenario');return scenario.steps.slice(0,Math.max(0,cursor+1)).reduce((state,frame)=>transition(state,frame.action,scenario.design),initial()); }
  return { nodes, scenarios, initial, transition, stateAt };
});
