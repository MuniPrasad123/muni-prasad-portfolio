(function () {
  const {nodes,scenarios,stateAt}=window.WebhookLesson;
  const $=id=>document.getElementById(id);
  let mode='unsafe',cursor=0,timer=null;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let pausedMotion=preference.matches;
  function node(tag,text,parent){const element=document.createElement(tag);if(text!==undefined)element.textContent=String(text);parent.appendChild(element);return element;}
  function stop(){clearInterval(timer);timer=null;$('play').textContent='Play';$('play').setAttribute('aria-pressed','false');}
  function motion(){document.body.dataset.motion=pausedMotion?'paused':'playing';$('motion').textContent=pausedMotion?'Enable motion':'Pause motion';$('motion').setAttribute('aria-pressed',String(pausedMotion));}
  function render(){
    const scenario=scenarios[mode],frame=scenario.steps[cursor],state=stateAt(mode,cursor);
    $('step-count').textContent=`Step ${cursor+1} / ${scenario.steps.length} · ${scenario.design} design`;
    $('step-title').textContent=frame.title;$('story').textContent=frame.why;$('decision').textContent=state.decision;
    document.querySelector('.current').dataset.error=String(['forged','wrongMerchant'].includes(frame.action)||state.reconciliation);
    $('next').disabled=cursor===scenario.steps.length-1;$('previous').disabled=cursor===0;
    $('progress').max=scenario.steps.length;$('progress').value=cursor+1;
    document.querySelectorAll('.node').forEach((button,i)=>{if(frame.active.includes(i))button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    const warning=state.emailIntents>1||state.shipmentIntents>1;
    $('customer').dataset.warning=String(warning);$('customer').dataset.error=String(state.reconciliation);
    $('customer-message').textContent=state.status==='REFUNDED'?'Payment refunded. Reconcile delayed notifications; do not restore success.':warning?`${state.emailIntents} confirmation intents and ${state.shipmentIntents} shipment intents. “Did I pay again?”`:state.emailEffects?'One logical confirmation and fulfillment intent.':state.outbox?'Payment confirmed. Confirmation and fulfillment queued.':'Payment already completed; waiting for a valid merchant notification.';
    $('metrics').replaceChildren();
    const metrics=[['Provider charges (assumed)',state.chargeCount],['Webhook deliveries',state.deliveries],['Success state transitions',state.transitions],['Processing attempts',state.processingAttempts],['Inbox rows',state.inbox.length],['Payment state',state.status],['Outbox business intents',state.outbox],['Outbox state',state.outboxState],['Email intents',state.emailIntents],['Shipment intents',state.shipmentIntents],['Dispatch attempts',state.dispatchAttempts],['HTTP acknowledgement',state.ack],['Destination email effects (model)',state.emailEffects],['Destination shipment effects (model)',state.shipmentEffects]];
    for(const [label,value] of metrics){const div=node('div',undefined,$('metrics'));node('dt',label,div);node('dd',value,div);}
    $('trace').replaceChildren();
    scenario.steps.slice(0,cursor+1).forEach((f,i)=>{const li=node('li',undefined,$('trace'));if(i===cursor)li.setAttribute('aria-current','step');node('b',`${i+1}. ${f.title}`,li);node('span',stateAt(mode,i).decision,li);});
    document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  }
  function reset(nextMode=mode){stop();mode=nextMode;cursor=0;$('score').textContent='';document.querySelectorAll('input[type=radio]').forEach(input=>input.checked=false);render();}
  for(const [id,scenario] of Object.entries(scenarios)){const button=node('button',scenario.label,$('scenarios'));button.type='button';button.dataset.mode=id;button.onclick=()=>reset(id);}
  nodes.forEach(([icon,label,help])=>{const button=node('button',undefined,$('nodes'));button.type='button';button.className='node';button.setAttribute('aria-pressed','false');node('span',icon,button).setAttribute('aria-hidden','true');node('b',label,button);button.onclick=()=>{document.querySelectorAll('.node').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('component-help').textContent=`${label}: ${help}`;};});
  $('next').onclick=()=>{stop();cursor=Math.min(cursor+1,scenarios[mode].steps.length-1);render();};
  $('previous').onclick=()=>{stop();cursor=Math.max(0,cursor-1);render();};
  $('reset').onclick=()=>reset();
  function play(){if(timer){stop();return;}if(cursor===scenarios[mode].steps.length-1)cursor=0;$('play').textContent='Pause';$('play').setAttribute('aria-pressed','true');render();timer=setInterval(()=>{cursor++;render();if(cursor===scenarios[mode].steps.length-1)stop();},Number($('speed').value));}
  $('play').onclick=play;$('speed').onchange=()=>{if(timer){stop();play();}};
  $('motion').onclick=()=>{pausedMotion=!pausedMotion;motion();};preference.addEventListener('change',e=>{pausedMotion=e.matches;motion();});
  $('grade').onclick=()=>{const answers={q1:'b',q2:'a',q3:'c'};const score=Object.entries(answers).filter(([q,answer])=>document.querySelector(`input[name=${q}]:checked`)?.value===answer).length;$('score').textContent=`Score ${score}/3. Inbox deduplicates delivery; state guards protect business transitions; destinations still need idempotency or reconciliation.`;};
  motion();render();
})();
