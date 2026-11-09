'use client'

import { useEffect, useState } from 'react'
import styles from './IncidentPractice.module.css'

const stages = ['Shopper', 'Token and scope', 'Order lookup', 'API response']
const steps = [
  { action: '', title: 'Alice opens her order history', stage: 0, request: 'Alice → her order A-101', lookup: 'Waiting for request', response: 'Waiting', outcome: 'Alice has a valid sign-in token with permission to read orders.' },
  { action: 'Open Alice’s order', title: 'Alice can read her own order', stage: 3, request: 'Alice → her order A-101', lookup: 'Order ID only', response: '200 OK', outcome: 'The request succeeds. This alone gives the team no evidence that other customers’ orders are protected.' },
  { action: 'Request Bob’s order', title: 'Bob’s order details leak', stage: 3, request: 'Alice → Bob’s order B-102', lookup: 'Order ID only', response: '200 OK · data exposed', outcome: 'Alice changes only the order ID. Her token and scope still pass. The database finds Bob’s order and the API exposes it.' },
  { action: 'Apply the ownership fix', title: 'The lookup now checks ownership', stage: 2, request: 'Alice → Bob’s order B-102', lookup: 'Order ID + verified owner + tenant', response: 'Ready to retry', outcome: 'The order service adds Alice’s verified identity and store to the query. The order ID still comes from the request.' },
  { action: 'Retry Bob’s order', title: 'Bob’s order stays private', stage: 3, request: 'Alice → Bob’s order B-102', lookup: 'Order ID + verified owner + tenant', response: '404 Not Found', outcome: 'No row matches Bob’s order ID and Alice’s identity. The API returns no order details and uses the same response as for a missing order.' },
  { action: 'Verify Alice’s own order', title: 'Alice can still see her order', stage: 3, request: 'Alice → her order A-101', lookup: 'Order ID + verified owner + tenant', response: '200 OK', outcome: 'All three fields match. Alice gets her own order, confirming that the fix protects Bob’s data while keeping her order history usable.' },
]
const finalStep = steps.length - 1

export function OrderAuthorizationPractice({ fullLab }: { fullLab: string }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const current = steps[step]

  useEffect(() => {
    if (!playing || step === finalStep) return
    const timer = window.setTimeout(() => {
      setStep(step + 1)
      if (step + 1 === finalStep) setPlaying(false)
    }, 4200)
    return () => window.clearTimeout(timer)
  }, [playing, step])

  function goTo(next: number) {
    setPlaying(false)
    setStep(next)
  }

  return <section className="lesson-panel" id="interactive-lab">
    <div className={styles.lab}>
      <div className={styles.eyebrow}>Interactive conceptual simulation</div>
      <h2>Protect a shopper’s order details</h2>
      <p>See how a signed-in shopper can access someone else’s order, then fix the lookup and verify both shoppers’ privacy and access.</p>
      <div className={styles.controls}>
        <button type="button" className="button button-gold" onClick={() => goTo(step + 1)} disabled={step === finalStep}>
          {steps[step + 1]?.action ?? 'Walkthrough complete'}
        </button>
        <button type="button" className="button button-outline" onClick={() => {
          if (step === finalStep) setStep(0)
          setPlaying(!playing)
        }}>{playing ? 'Pause' : 'Play walkthrough'}</button>
        <button type="button" className="button button-outline" onClick={() => goTo(0)}>Reset</button>
      </div>
      <div className={styles.layout}>
        <div>
          <ol className={styles.actors} aria-label="Request flow">
            {stages.map((stage, index) => <li key={stage} aria-current={index === current.stage ? 'step' : undefined}>{stage}</li>)}
          </ol>
          <div className={styles.track} aria-hidden="true">
            <span>Request flow</span>
            <div className={styles.lane}>
              <span className={styles.packet} style={{ left: current.stage / (stages.length - 1) * 100 + '%' }}/>
            </div>
          </div>
          <div className={styles.event} data-failure={step === 2} role="status">
            <strong>{current.title}</strong>
            <p>{current.outcome}</p>
          </div>
          <progress className={styles.progress} value={step} max={finalStep} aria-label="Walkthrough progress"/>
          <small>Step {step + 1} of {steps.length}</small>
        </div>
        <div className={styles.state}>
          <h3>Request snapshot</h3>
          <dl className={styles.snapshot}>
            <div><dt>Requested order</dt><dd>{current.request}</dd></div>
            <div><dt>Token and scope</dt><dd>{step ? 'Valid · orders:read' : 'Ready to check'}</dd></div>
            <div><dt>Database lookup</dt><dd>{current.lookup}</dd></div>
            <div><dt>API response</dt><dd>{current.response}</dd></div>
          </dl>
          <h3>Event log</h3>
          <ol className={styles.log} reversed start={step + 1} tabIndex={0} aria-label="Event log, newest first">
            {steps.slice(0, step + 1).reverse().map(entry => <li key={entry.title}>{entry.title}</li>)}
          </ol>
        </div>
      </div>
      <a className="text-link" href={fullLab} target="_blank" rel="noreferrer">Try more token, scope, and tenant scenarios ↗</a>
    </div>
  </section>
}
