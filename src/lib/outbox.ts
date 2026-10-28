export type OutboxAction = 'naive' | 'outbox' | 'restore' | 'replay' | 'rollback' | 'reset'
export const initialOutbox = () => ({ orders: 0, outbox: 0, deliveries: 0, oms: 0, email: 0, analytics: 0, duplicates: 0, offline: false, phase: 'ready', message: 'Start with a crash, then compare durable outbox recovery.' })
export type OutboxState = ReturnType<typeof initialOutbox>
export function transitionOutbox(state: OutboxState, action: OutboxAction): OutboxState {
  const fresh = initialOutbox()
  switch (action) {
    case 'reset': return fresh
    case 'naive': return { ...fresh, orders: 1, phase: 'lost', message: 'Order committed. Checkout crashed before publication. No durable event exists for the relay; OMS, email and analytics never hear about it.' }
    case 'outbox': return { ...fresh, orders: 1, outbox: 1, offline: true, phase: 'pending', message: 'Order and event intent committed together. Kafka is offline: customers still wait for downstream processing, but the event can be relayed after recovery.' }
    case 'rollback': return { ...fresh, phase: 'rollback', message: 'The database transaction failed. Both the order and outbox insert rolled back. Nothing is published.' }
    case 'restore':
      if (!state.outbox) return { ...state, message: 'No outbox event to recover. Start the outbox outage scenario first.' }
      if (state.deliveries) return { ...state, message: 'Kafka is already restored. No new event or business effect was created.' }
      return { ...state, offline: false, deliveries: 1, oms: 1, email: 1, analytics: 1, phase: 'delivered', message: 'Debezium relayed committed event e-904. Three consumer groups each applied one local effect. Email counts a delivery intent, not a confirmed send.' }
    case 'replay':
      if (!state.deliveries || state.offline) return { ...state, message: 'Restore Kafka and deliver an event before replaying it.' }
      return { ...state, deliveries: state.deliveries + 1, duplicates: state.duplicates + 3, phase: 'duplicate', message: 'Same event ID redelivered. Each consumer detects it and skips its local effect. External email delivery still needs provider idempotency and reconciliation.' }
  }
}
