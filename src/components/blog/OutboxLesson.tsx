'use client'
import { useEffect, useReducer, useRef, useState } from 'react'
import { initialOutbox, transitionOutbox, type OutboxAction } from '@/lib/outbox'

export function OutboxContext() {
  return <section className="lesson-panel"><div className="eyebrow">Architecture in Motion · Episode 002</div><h2>The customer placed an order. Fulfilment never started.</h2><p>A crash between saving an order and publishing its event can leave customers without confirmation and warehouse teams without work to fulfil.</p><p><strong>The fix:</strong> commit the order and event intent in one PostgreSQL transaction. Debezium relays the committed change to Kafka; consumers handle retries with stable event IDs. Delivery is asynchronous, not universally exactly-once.</p></section>
}

export function OutboxLesson() {
  const [state, dispatch] = useReducer(transitionOutbox, undefined, initialOutbox)
  const [run, setRun] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  const actions: [OutboxAction, string][] = [['naive', 'Naive dual-write crash'], ['outbox', 'Outbox + Kafka down'], ['restore', 'Restore Kafka'], ['replay', 'Replay same event'], ['rollback', 'Database rollback'], ['reset', 'Reset']]
  const metrics: [string, number][] = [['Order rows', state.orders], ['Outbox rows', state.outbox], ['Kafka deliveries', state.deliveries], ['OMS jobs', state.oms], ['Email intents', state.email], ['Analytics writes', state.analytics], ['Duplicate checks skipped', state.duplicates]]
  const [stage, setStage] = useState(-1)
  const [steps, setSteps] = useState<string[]>([])
  const [active, setActive] = useState<OutboxAction>('reset')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const busy = stage >= 0
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function play(action: OutboxAction) {
    if (timer.current) clearTimeout(timer.current)
    setActive(action); setRun(n => n + 1)
    if (action === 'reset') { dispatch(action); setStage(-1); setSteps([]); return }
    if ((action === 'restore' && (!state.outbox || state.deliveries > 0)) || (action === 'replay' && !state.deliveries)) { dispatch(action); setStage(-1); setSteps([]); return }
    const frames: Record<Exclude<OutboxAction, 'reset'>, string[]> = {
      naive: ['Checkout receives order #1042', 'PostgreSQL commits the order', 'Checkout crashes before Kafka publication', 'No event: customers get no downstream confirmation'],
      outbox: ['Start one database transaction', 'Insert order AND event e-904', 'Commit both rows atomically', 'Kafka offline: durable event waits for recovery'],
      restore: ['Kafka becomes available', 'Debezium reads the committed WAL change', 'Publish e-904 to the orders topic', 'OMS, email intent and analytics apply one local effect'],
      replay: ['Redeliver the same event e-904', 'Consumers check their processed-event IDs', 'All three detect the duplicate', 'Skip repeated effects: business counts stay at one'],
      rollback: ['Start one database transaction', 'Attempt order and outbox inserts', 'Database transaction fails', 'Roll back both rows: nothing reaches Kafka'],
    }
    if (['naive', 'outbox', 'rollback'].includes(action)) dispatch('reset')
    const sequence = frames[action]; setSteps(sequence); setStage(0)
    const next = (index: number) => {
      timer.current = setTimeout(() => {
        if (index === sequence.length) { dispatch(action); setStage(-1); timer.current = null }
        else { setStage(index); next(index + 1) }
      }, 800)
    }
    next(1)
  }
  const moving = busy && (active === 'restore' || active === 'replay')
  const status = busy ? steps[stage] : state.message
  return <section id="interactive-lab" className="lesson-panel" aria-labelledby="outbox-lab-title"><div className="eyebrow">Illustrative failure lab · no live services</div><h2 id="outbox-lab-title">Break delivery. Recover the order event.</h2><p>Start a new scenario with crash, outage, or rollback. Restore and replay continue the current scenario. Each consumer’s deduplication record and local business effect commit together in this model.</p><div className="hero-actions">{actions.map(([action, label]) => <button key={action} className="button button-outline" disabled={busy && action !== 'reset'} aria-pressed={active === action} onClick={() => play(action)}>{label}</button>)}</div><p role="status" className="outbox-result">{busy ? `Step ${stage + 1}/4 · ` : 'Result · '}{status}</p><ol className="outbox-steps">{steps.map((text, i) => <li key={text} className={busy && i === stage ? 'current' : !busy || i < stage ? 'complete' : ''}>{text}</li>)}</ol><p><strong>Kafka: {state.offline ? 'offline' : 'available'}</strong> · Event ID: e-904 · Order: #1042</p>
    <div className={`outbox-flow phase-${busy ? active : state.phase}`} aria-label="Simplified proposed architecture: checkout writes orders and outbox atomically; Debezium relays committed changes to Kafka and three independent consumer groups."><div className={busy && stage === 0 ? 'outbox-active' : ''}>Spring Boot checkout</div><span aria-hidden="true">↓</span><div className={`outbox-transaction ${busy && stage === 1 ? 'outbox-active' : ''}`}><strong>One PostgreSQL transaction</strong><span>orders: {state.orders} · outbox_event: {state.outbox}</span></div><span aria-hidden="true">↓ Committed WAL change</span><div className={moving && stage === 1 ? 'outbox-active' : ''}>Debezium CDC</div><svg key={run} viewBox="0 0 600 60" className="outbox-wire" aria-hidden="true"><path d="M20 30H580" stroke="#bfa15d" strokeWidth="2"/>{moving && <circle r="7" fill="#e7c779" className="outbox-packet"><animateMotion path="M20 30H580" dur=".8s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" dur="1.6s" fill="freeze"/></circle>}</svg><div className={moving && stage === 2 ? 'outbox-active' : state.offline ? 'outbox-offline' : ''}>Kafka · outbox.event.orders {state.offline ? '— delivery waiting' : ''}</div><span aria-hidden="true">↓ Separate consumer groups</span><div className={`outbox-consumers ${moving && stage === 3 ? 'outbox-active' : ''}`}><div>OMS<br/><small>{state.oms} fulfilment job</small></div><div>Email<br/><small>{state.email} delivery intent</small></div><div>Analytics<br/><small>{state.analytics} local write</small></div></div></div>
    <dl className="lab-metrics">{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="article-caption">Counts are deterministic teaching examples. A duplicate means redelivery, not necessarily another stored Kafka record. A durable outbox needs healthy database durability, CDC progress, retention, and recovery procedures.</p>
    <fieldset className="lesson-panel"><legend>Interview check: Kafka transactions are enabled. Is the PostgreSQL write now atomic with publication?</legend>{['Yes, Kafka transactions include every external database.', 'No. Use a local outbox transaction for durable intent and idempotent consumers for retries.'].map((label, i) => <label className="quiz-choice" key={label}><input type="radio" name="outbox-quiz" checked={answer === i} onChange={() => setAnswer(i)}/>{label}</label>)}<p role="status">{answer === null ? 'Choose an answer.' : answer === 1 ? 'Correct. Kafka transactions do not automatically make an ordinary PostgreSQL commit atomic with Kafka publication.' : 'Try again. Kafka transaction guarantees have a defined scope; the database is a separate resource.'}</p></fieldset>
  </section>
}
