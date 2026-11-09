'use client'

import { useEffect, useState } from 'react'
import styles from './IncidentPractice.module.css'

const orders = [
  { id: 105, time: '12:04' }, { id: 104, time: '12:03' },
  { id: 103, time: '12:03' }, { id: 102, time: '12:02' },
]
const firstPage = orders.slice(0, 2)
const cursor = firstPage[1]
const updatedOrders = [{ id: 106, time: '12:05' }, ...orders]
const offsetPage = updatedOrders.slice(2, 4)
const keysetPage = updatedOrders.filter(order =>
  order.time < cursor.time || (order.time === cursor.time && order.id < cursor.id),
).slice(0, 2)
const latestPage = updatedOrders.slice(0, 2)
const orderIds = (page: typeof orders) => page.map(order => '#' + order.id).join(', ')

const actors = ['Shopper', 'Order History API', 'PostgreSQL', 'Order History UI']
const events = [
  { action: '', title: 'Ready to load order history', actor: 0, note: 'The shopper opens order history. The API will request the two newest orders.' },
  { action: 'Load first page', title: 'First page loaded', actor: 1, note: 'The shopper sees #105 and #104. The API saves the last row’s timestamp and ID as the cursor.' },
  { action: 'Insert a new order', title: 'New order arrives', actor: 2, note: 'PostgreSQL now has #106 at the top. The shopper’s loaded page still shows #105 and #104.' },
  { action: 'Fetch with OFFSET', title: 'OFFSET repeats an order', actor: 3, note: 'OFFSET skips the current first two rows, #106 and #105. The response repeats #104 from page one.' },
  { action: 'Continue with keyset', title: 'Keyset restores the browsing position', actor: 1, note: 'The API fetches rows after (12:03, #104). #103 has the same timestamp and a smaller ID, so it comes next, followed by #102.' },
  { action: 'Refresh latest orders', title: 'The new order is visible', actor: 3, note: 'Refresh starts a fresh first-page query with no cursor. The shopper now sees #106 and #105. If they continue, the new cursor is (12:04, #105).' },
]
const lastStep = events.length - 1

export function OrderHistoryPractice({ fullLab }: { fullLab: string }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const event = events[step]

  useEffect(() => {
    if (!playing || step === lastStep) return
    const timer = window.setTimeout(() => {
      setStep(step + 1)
      if (step + 1 === lastStep) setPlaying(false)
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [playing, step])

  function goTo(next: number) {
    setPlaying(false)
    setStep(next)
  }

  const visiblePage = [null, firstPage, firstPage, offsetPage, keysetPage, latestPage][step]
  const database = step >= 2 ? updatedOrders : orders
  const savedCursor = step === lastStep ? latestPage[1] : cursor

  return <section className="lesson-panel" id="interactive-lab">
    <div className={styles.lab}>
      <div className={styles.eyebrow}>Interactive conceptual simulation</div>
      <h2>Order history incident simulator</h2>
      <p>Reproduce a duplicate order, recover the shopper’s place, then refresh to show the newest purchase.</p>
      <div className={styles.controls}>
        <button type="button" className="button button-gold" onClick={() => goTo(step + 1)} disabled={step === lastStep}>
          {events[step + 1]?.action ?? 'Walkthrough complete'}
        </button>
        <button type="button" className="button button-outline" onClick={() => {
          if (step === lastStep) setStep(0)
          setPlaying(!playing)
        }}>{playing ? 'Pause' : 'Play walkthrough'}</button>
        <button type="button" className="button button-outline" onClick={() => goTo(0)}>Reset</button>
      </div>
      <div className={styles.layout}>
        <div className={styles.flow}>
          <ol className={styles.actors} aria-label="Request flow">
            {actors.map((actor, index) => <li key={actor} aria-current={index === event.actor ? 'step' : undefined}>{actor}</li>)}
          </ol>
          <div className={styles.track} aria-hidden="true">
            <span>Request / event flow</span>
            <div className={styles.lane}>
              <span className={styles.packet} style={{ left: (event.actor / (actors.length - 1)) * 100 + '%' }}/>
            </div>
          </div>
          <div className={styles.event} data-failure={step === 3} role="status">
            <strong>{event.title}</strong>
            <p>{event.note}</p>
          </div>
          <progress className={styles.progress} value={step} max={lastStep} aria-label="Walkthrough progress"/>
          <small>Step {step + 1} of {events.length}</small>
          {step >= 3 && <div className={styles.comparison}>
            <div><span>OFFSET page 2</span><strong>{orderIds(offsetPage)}</strong><small>#104 repeats</small></div>
            {step >= 4 && <div><span>Keyset page 2</span><strong>{orderIds(keysetPage)}</strong><small>No repeats</small></div>}
          </div>}
        </div>
        <div className={styles.state}>
          <h3>State snapshot</h3>
          <dl className={styles.snapshot}>
            <div><dt>Database newest</dt><dd>#{database[0].id}</dd></div>
            <div><dt>Shopper’s current page</dt><dd>{visiblePage ? orderIds(visiblePage) : 'Waiting for request'}</dd></div>
            <div><dt>Database sort order</dt><dd>{orderIds(database)}</dd></div>
            <div><dt>First-page cursor</dt><dd>{step ? savedCursor.time + ' · #' + savedCursor.id : 'None'}</dd></div>
          </dl>
          <h3>Event log</h3>
          <ol className={styles.log} reversed start={step + 1} tabIndex={0} aria-label="Event log, newest first">
            {events.slice(0, step + 1).reverse().map(entry => <li key={entry.title}>{entry.title}</li>)}
          </ol>
        </div>
      </div>
      <a className="text-link" href={fullLab} target="_blank" rel="noreferrer">Open the SQL experiments and quiz ↗</a>
    </div>
  </section>
}
