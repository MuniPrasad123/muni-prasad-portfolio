import Image from 'next/image'
import { PracticeFrame } from './PracticeFrame'
import styles from './WebhookLessonWindow.module.css'

export function WebhookCustomerContext() {
  return <section className={styles.context} aria-labelledby="webhook-customer-title">
    <p className={styles.eyebrow}>Illustrative incident · Maya · $120 headphones · pay_100</p>
    <h2 id="webhook-customer-title">“I paid once. Why did I get three confirmations?”</h2>
    <div className={styles.screens}>
      <div><span>🏦 Banking app</span><strong>One $120 payment</strong><p>Checkout says “Payment successful.” The provider transaction is pay_100.</p></div>
      <div className={styles.worried} role="img" aria-label="Maya worries that repeated confirmations mean repeated payments">🤔<small>“Will more packages arrive?”</small></div>
      <div><span>✉ Inbox + warehouse</span><strong>Three emails. Repeated shipping requests.</strong><p>The merchant repeated work when the same notification was delivered again.</p></div>
    </div>
    <p>A webhook reports an existing payment outcome. It does not charge Maya again. Support must check the actual provider transaction IDs before making any claim about duplicate charges.</p>
    <div className={styles.protections}><p><b>1 · Inbox</b><span>Remember the delivery.</span></p><p><b>2 · State guard</b><span>Apply success once.</span></p><p><b>3 · Outbox + destination keys</b><span>Recover downstream work safely.</span></p></div>
  </section>
}

export function WebhookLessonWindow({ originalLab }: { originalLab: string }) {
  return <>
    <section id="interactive-lab" className="lesson-panel">
      <h2>Follow Maya’s notification, retry and recovery</h2>
      <p>Compare the unsafe and protected paths, then test a forged signature, a new event ID, a delayed success after refund, or a worker crash.</p>
      <a className="text-link" href="/blog/episodes/015/customer-lab.html" target="_blank" rel="noreferrer">Open customer-first lab ↗</a>
      <PracticeFrame title="Episode 015 customer-first webhook failure and recovery lab" src="/blog/episodes/015/customer-lab.html"/>
    </section>
    <details className="lesson-panel" id="original-webhook-lab">
      <summary>Open the original side-by-side comparison</summary>
      <p>The existing lost-acknowledgement and invalid-signature comparisons remain available with their original controls.</p>
      <a className="text-link" href={originalLab} target="_blank" rel="noreferrer">Open original lab ↗</a>
      <PracticeFrame title="Episode 015 original unsafe/protected comparison" src={originalLab}/>
    </details>
    <section className={styles.diagram} aria-labelledby="webhook-architecture-title">
      <h2 id="webhook-architecture-title">The protection follows the payment, not the delivery count</h2>
      <Image src="/blog/episodes/015/architecture.svg" alt="Signed webhook enters signature and merchant verification, then one inbox, state and outbox transaction; after commit, a worker dispatches to idempotent email and fulfillment destinations." width={1200} height={720}/>
      <ol className={styles.mobileFlow} aria-label="Webhook architecture in reading order">
        <li><b>Provider → Merchant API</b><span>Verify the signed original bytes, timestamp and trusted account.</span></li>
        <li><b>One PostgreSQL transaction</b><span>Inbox uniqueness → guarded payment state → outbox intent.</span></li>
        <li><b>Commit → ACK → dispatcher</b><span>Return 2xx after the commit. Dispatch separately with stable keys.</span></li>
        <li><b>Email + fulfillment destinations</b><span>Each deduplicates its own key, or reconciles an ambiguous send.</span></li>
      </ol>
      <details><summary>See the package’s visual summary</summary><Image src="/blog/episodes/015/customer-poster.svg" alt="One payment, three webhook deliveries, one guarded transition and one outbox intent." width={1200} height={675}/></details>
    </section>
  </>
}
