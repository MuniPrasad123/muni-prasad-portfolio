'use client'

import { useEffect, useState } from 'react'
import styles from './OrderHistoryPractice.module.css'

const initialOrders = [
  { id: 105, time: '12:04' }, { id: 104, time: '12:03' },
  { id: 103, time: '12:03' }, { id: 102, time: '12:02' },
]
const firstPage = initialOrders.slice(0, 2)
const cursor = firstPage[1]
const afterInsert = [{ id: 106, time: '12:05' }, ...initialOrders]
const notes = [
  'A shopper opens order history. Start by fetching the first two orders.',
  'The first page is saved. Its last row, #104 at 12:03, is the cursor.',
  'Order #106 arrives. The database order changes while the shopper still sees the original page.',
  'OFFSET skips the first two rows in the updated list. It returns #104 again.',
  'Keyset starts below the saved cursor. #103 shares the timestamp, but its smaller ID places it after #104.',
]

export function OrderHistoryPractice({ fullLab }: { fullLab: string }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing || step === 4) return
    const timer = window.setTimeout(() => {
      setStep(step + 1)
      if (step === 3) setPlaying(false)
    }, 2400)
    return () => window.clearTimeout(timer)
  }, [playing, step])

  const database = step >= 2 ? afterInsert : initialOrders
  const offsetPage = database.slice(2, 4)
  const cursorPage = database.filter(order =>
    order.time < cursor.time || (order.time === cursor.time && order.id < cursor.id),
  ).slice(0, 2)

  function goTo(next: number) {
    setPlaying(false)
    setStep(next)
  }

  return <section className="lesson-panel" id="interactive-lab">
    <h2>Order history incident simulator</h2>
    <p>Follow a shopper across two page requests while a new order lands in PostgreSQL.</p>
    <div className={styles.controls}>
      <button type="button" className="button button-gold" onClick={() => goTo(step + 1)} disabled={step === 4}>
        {['Load first page', 'Insert a new order', 'Fetch page 2 with OFFSET', 'Compare with keyset', 'Walkthrough complete'][step]}
      </button>
      <button type="button" className="button button-outline" onClick={() => {
        if (step === 4) setStep(0)
        setPlaying(!playing)
      }}>{playing ? 'Pause' : 'Play walkthrough'}</button>
      <button type="button" className="button button-outline" onClick={() => goTo(0)}>Reset</button>
    </div>
    <div className={styles.board}>
      <div className={styles.column}>
        <h3>Database order</h3>
        <ol>{database.map(order => <li key={order.id} className={order.id === 106 ? styles.newRow : undefined}>
          <strong>#{order.id}</strong><span>{order.time}{order.id === 106 ? ' · New' : ''}</span>
        </li>)}</ol>
      </div>
      <div className={styles.column}>
        <h3>Shopper’s order history</h3>
        {step === 0 && <p>Waiting for the first request.</p>}
        {step >= 1 && <div className={styles.result}>Page 1 <strong>#105, #104</strong></div>}
        {step >= 3 && <div className={`${styles.result} ${styles.duplicate}`}>
          Page 2 · OFFSET <strong>{offsetPage.map(order => '#' + order.id).join(', ')}</strong>
          <span>#104 repeats</span>
        </div>}
        {step >= 4 && <div className={styles.result}>
          Page 2 · Keyset <strong>{cursorPage.map(order => '#' + order.id).join(', ')}</strong>
          <span>No repeats</span>
        </div>}
      </div>
    </div>
    <p className={styles.note} role="status"><strong>Step {step + 1} of 5.</strong> {notes[step]}</p>
    <a className="text-link" href={fullLab} target="_blank" rel="noreferrer">Open the SQL experiments and quiz ↗</a>
  </section>
}
