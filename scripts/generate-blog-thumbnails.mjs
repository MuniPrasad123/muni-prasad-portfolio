/* Topic illustrations for article cards; originals remain in their existing folders. */
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as icons from 'lucide-react';
const topics = [
  ['01', 'Gauge', 'Rate limiting', 'Protect shopping APIs', ['Requests', 'Rate limit', 'Accepted'], 'A gateway limits incoming shopping requests before they reach the service.'],
  ['02', 'DatabaseZap', 'Transactional outbox', 'Save once. Deliver reliably.', ['Order + event', 'Outbox relay', 'Kafka'], 'An order and event commit together before a relay delivers the event to Kafka.'],
  ['03', 'KeyRound', 'Payment idempotency', 'Retry the same attempt', ['Stable key', 'Payment claim', 'Reconcile'], 'A stable attempt key protects payment retries while uncertain results are reconciled.'],
  ['04', 'LockKeyhole', 'Inventory locking', 'Prevent overselling', ['Two shoppers', 'Guard stock', 'One item'], 'Concurrent shoppers share a guarded inventory update for one remaining item.'],
  ['05', 'CircuitBoard', 'Circuit breakers', 'Isolate slow services', ['Checkout', 'Bulkhead', 'Shipping'], 'A bulkhead isolates shipping calls and a circuit breaker limits repeated failures.'],
  ['06', 'Layers', 'Cache stampedes', 'One refresh. Many readers.', ['Cache expires', 'One loader', 'Shared result'], 'Many cache misses are coordinated through one refresh instead of flooding the database.'],
  ['07', 'Repeat2', 'Kafka retries', 'Recover or investigate', ['Main topic', 'Bounded retry', 'Dead-letter'], 'A failed Kafka event follows bounded retries and then dead-letter investigation.'],
  ['08', 'Undo2', 'Saga compensation', 'Recover across services', ['Reserve stock', 'Payment fails', 'Release stock'], 'A failed payment triggers compensation of a completed stock reservation.'],
  ['09', 'ListFilter', 'Fast order history', 'Index + keyset pagination', ['Customer', 'Indexed query', 'Next page'], 'An indexed customer query uses a cursor to fetch the next order-history page.'],
  ['10', 'ShieldCheck', 'Order authorization', 'A token is only the start', ['JWT identity', 'Owner check', 'Order access'], 'A valid JWT is followed by an ownership check before order access is allowed.'],
  ['11', 'ListOrdered', 'Kafka version gates', 'Keep newer order status', ['Old event v1', 'Version guard', 'Keep paid v2'], 'A version guard rejects a stale event instead of regressing a newer paid order status.'],
  ['12', 'Fence', 'Distributed locks', 'Fence stale workers', ['Redis lease', 'Fencing token', 'DB validates'], 'A database validates a fencing token so a stale distributed-lock holder cannot write.'],
  ['13', 'Container', 'Graceful shutdown', 'Drain before stopping', ['Not ready', 'Drain traffic', 'Stop safely'], 'A Kubernetes instance becomes unready, drains traffic and then stops safely.'],
  ['14', 'GitCompareArrows', 'CQRS read models', 'Why order status lags', ['Write: paid', 'Event delivery', 'Read catches up'], 'A confirmed payment is written first and a separate order-status read model catches up later.'],
  ['15', 'Webhook', 'Webhook idempotency', 'One success. One effect.', ['Inbox dedupe', 'State guard', 'Outbox effects'], 'An inbox and state guard deduplicate payment webhooks before outbox-driven effects.'],
  ['16', 'Workflow', 'Java 21 virtual threads', 'Free workers during I/O', ['Request waits', 'Carrier freed', 'Next request'], 'A virtual thread pauses during supported I/O so its carrier can run another request; downstream limits still apply.'],
  ['17', 'Recycle', 'Java 21 Generational ZGC', 'Understand slow product search', ['Search objects', 'Young collection', 'Live objects stay'], 'Product search creates temporary objects; a young collection reclaims unreachable objects while live objects remain.'],
  ['18', 'MemoryStick', 'Java memory leaks', 'Find retained sessions', ['Retained carts', 'Heap evidence', 'Bound cache'], 'Heap evidence reveals retained cart sessions and guides bounded cache retention.'],
  ['19', 'Network', 'Java deadlocks', 'Find the waiting cycle', ['Thread A → B', 'Lock cycle', 'Thread B → A'], 'Two Java threads wait for locks held by each other, forming a deadlock cycle.'],
  ['20', 'TimerOff', 'Future timeouts', 'A timeout is not cancellation', ['Future times out', 'Payment runs', 'Reconcile'], 'A local future times out while remote payment processing can continue and needs reconciliation.'],
  ['21', 'GitBranch', 'Sealed events + records', 'Make transitions explicit', ['Typed event', 'State decision', 'Legal transition'], 'Explicit Java event types guide legal cancellation and fulfillment state transitions.'],
];
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const output = path.join(process.cwd(), 'public/blog/thumbnails');
fs.mkdirSync(output, { recursive: true });
for (const [episode, icon, title, subtitle, nodes, alt] of topics) {
  if (!icons[icon]) throw new Error(`Unknown icon: ${icon}`);
  const art = renderToStaticMarkup(React.createElement(icons[icon], { width: 174, height: 174, strokeWidth: 1.25, color: '#e5c77c' }));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
<title id="title">${escape(title)}</title><desc id="desc">${escape(alt)}</desc>
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#08271b"/><stop offset="1" stop-color="#06170f"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#bg)"/><circle cx="1100" cy="55" r="340" fill="#164632" opacity=".55"/><circle cx="1120" cy="60" r="235" fill="none" stroke="#79b998" stroke-opacity=".12" stroke-width="2"/>
<g font-family="Arial,sans-serif"><text x="55" y="65" fill="#dfc47f" font-size="23" letter-spacing="3">ARCHITECTURE IN MOTION</text><rect x="1000" y="32" width="145" height="49" rx="24" fill="#d6b568"/><text x="1072" y="64" text-anchor="middle" fill="#10291c" font-size="23" font-weight="700">EP ${episode}</text>
<circle cx="152" cy="253" r="112" fill="#153e2b" stroke="#d6b568" stroke-opacity=".45"/><g transform="translate(65 166)">${art}</g>
<text x="303" y="242" fill="#f7f0df" font-size="49" font-weight="700">${escape(title)}</text><text x="305" y="300" fill="#addac3" font-size="31">${escape(subtitle)}</text>
${nodes.map((node, i) => `<rect x="${55+i*382}" y="432" width="326" height="106" rx="16" fill="#143a28" stroke="#bbab6a" stroke-opacity=".65"/><text x="${218+i*382}" y="495" text-anchor="middle" fill="#f4edda" font-size="29" font-weight="600">${escape(node)}</text>${i<2?`<path d="M${395+i*382} 485h26m-9-9 9 9-9 9" fill="none" stroke="#dfc47f" stroke-width="3"/>`:''}`).join('')}
<text x="55" y="595" fill="#b6c8b7" font-size="23">ILLUSTRATED CONCEPT · ARTICLE + INTERACTIVE LAB</text></g></svg>`;
  const filename = `episode-${episode.padStart(3,'0')}.svg`;
  fs.writeFileSync(path.join(output, filename), svg);
  const folder = path.join(process.cwd(), 'content/lessons', `episode-${episode.padStart(3,'0')}`);
  const file = fs.readdirSync(folder).find(f => f.endsWith('.md'));
  const article = path.join(folder, file);
  const source = fs.readFileSync(article, 'utf8');
  fs.writeFileSync(article, source.replace(/^cover:.*$/m, `cover: "/blog/thumbnails/${filename}"`).replace(/^coverAlt:.*$/m, `coverAlt: "${alt}"`));
}
console.log(`Generated ${topics.length} topic-specific SVG thumbnails and updated article cover metadata.`);
