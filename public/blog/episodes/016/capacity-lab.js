(function(){
  const {nodes,scenarios,capacity,stateAt}=window.CapacityLesson;
  const $=id=>document.getElementById(id);
  let mode='threads',cursor=0,timer=null;
  const media=matchMedia('(prefers-reduced-motion: reduce)');let paused=media.matches;
  function add(tag,text,parent){const el=document.createElement(tag);if(text!==undefined)el.textContent=String(text);parent.appendChild(el);return el;}
  function inputs(){return {demand:Number($('demand').value),provider:Number($('capacity').value),queue:Number($('queue').value),db:Number($('db').value)};}
  function stop(){clearInterval(timer);timer=null;$('play').textContent='Play';$('play').setAttribute('aria-pressed','false');}
  function motion(){document.body.dataset.motion=paused?'paused':'playing';$('motion').textContent=paused?'Enable motion':'Pause motion';$('motion').setAttribute('aria-pressed',String(paused));}
  function render(){
    const scenario=scenarios[mode],frame=scenario.steps[cursor],state=stateAt(mode,cursor),c=capacity(inputs(),mode);
    for(const [id,value] of Object.entries({dout:c.demand,cout:c.provider,qout:c.queue,dbout:c.db}))$(id).textContent=value;
    $('unsafe-summary').textContent=`${c.demand} client calls can wait; only ${Math.min(c.demand,c.provider)} provider processing slots. ${c.remoteWaiting} excess callers queue downstream.`;
    $('safe-summary').textContent=`At most ${c.active} active + ${c.waiting} waiting. ${c.rejected} new executions get busy guidance before provider start.`;
    $('step-count').textContent=`Step ${cursor+1} / ${scenario.steps.length}`;$('step-title').textContent=frame.title;$('story').textContent=frame.why;$('decision').textContent=state.decision;
    $('previous').disabled=cursor===0;$('next').disabled=cursor===scenario.steps.length-1;$('progress').max=scenario.steps.length;$('progress').value=cursor+1;
    document.querySelector('.current').dataset.error=String(['timeout','conflict','restart'].includes(frame.action));
    document.querySelectorAll('.node').forEach((b,i)=>{if(frame.active.includes(i))b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    $('customer').dataset.warning=String(state.status==='UNKNOWN'||state.status==='IN_FLIGHT');
    $('customer-message').textContent=state.status==='CONFIRMED'?'Order confirmed after authoritative payment verification.':state.status==='UNKNOWN'?'We’re checking your payment. Do not pay again.':state.status==='IN_FLIGHT'?'Payment processing. Check this existing attempt.':state.response.startsWith('503')?'Checkout is busy. Payment was not started; retry this same operation later.':state.response.startsWith('409')?'This key belongs to another payload. Resolve the original attempt.':'Place Order → loading… waiting for a reliable result.';
    if(state.response.startsWith('409'))$('customer-message').textContent='This key belongs to another payload. Resolve the original attempt.';
    if(mode==='threads'&&cursor>0)$('customer-message').textContent=state.response;
    $('metrics').replaceChildren();
    const metrics=[['Asha’s payment status',state.status],['Durable attempt identities',state.attempts],['Asha’s provider calls',state.providerCalls],['Confirmation outbox intents',state.outbox],['Asha’s local permit held',state.permitHeld?'Yes':'No'],['Customer/API result',state.response],['DB connections in use (model)',Math.min(c.demand,c.db)],['DB waiters without a budget',c.dbWaiting],['Local active-call limit',c.provider],['Local waiting-room limit',c.queue]];
    if(['replicas','global'].includes(frame.action))metrics.push(['3-pod potential calls',frame.action==='replicas'?Math.min(c.demand,c.provider*3):Math.min(c.demand,c.provider)]);
    for(const [label,value] of metrics){const div=add('div',undefined,$('metrics'));add('dt',label,div);add('dd',value,div);}
    $('trace').replaceChildren();scenario.steps.slice(0,cursor+1).forEach((f,i)=>{const li=add('li',undefined,$('trace'));if(i===cursor)li.setAttribute('aria-current','step');add('b',`${i+1}. ${f.title}`,li);add('span',stateAt(mode,i).decision,li);});
  }
  function reset(next=mode){stop();mode=next;cursor=0;$('feedback').textContent='';render();}
  for(const [id,scenario] of Object.entries(scenarios)){const b=add('button',scenario.label,$('scenarios'));b.type='button';b.dataset.mode=id;b.onclick=()=>reset(id);}
  nodes.forEach(([icon,label,help])=>{const b=add('button',undefined,$('nodes'));b.type='button';b.className='node';b.setAttribute('aria-pressed','false');add('span',icon,b).setAttribute('aria-hidden','true');add('b',label,b);b.onclick=()=>{$('component-help').textContent=`${label}: ${help}`;document.querySelectorAll('.node').forEach(node=>node.setAttribute('aria-pressed',String(node===b)));};});
  $('previous').onclick=()=>{stop();cursor=Math.max(0,cursor-1);render();};$('next').onclick=()=>{stop();cursor=Math.min(scenarios[mode].steps.length-1,cursor+1);render();};$('reset').onclick=()=>reset();
  function play(){if(timer){stop();return;}if(cursor===scenarios[mode].steps.length-1)cursor=0;render();$('play').textContent='Pause';$('play').setAttribute('aria-pressed','true');timer=setInterval(()=>{cursor++;render();if(cursor===scenarios[mode].steps.length-1)stop();},Number($('speed').value));}
  $('play').onclick=play;$('speed').onchange=()=>{if(timer){stop();play();}};$('motion').onclick=()=>{paused=!paused;motion();};media.addEventListener('change',event=>{paused=event.matches;motion();});
  for(const id of ['demand','capacity','queue','db'])$(id).oninput=()=>reset();
  $('grade').onclick=()=>{$('feedback').textContent=document.querySelector('input[name=quiz]:checked')?.value==='no'?'Correct. Cheap waiting is not extra dependency capacity.':'Review: virtual threads do not create database connections or provider slots.';};
  motion();render();
})();
