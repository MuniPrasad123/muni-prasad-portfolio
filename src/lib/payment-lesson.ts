export type PaymentScenario = 'naive' | 'protected' | 'concurrent' | 'changed'
export type PaymentFrame = { title: string; explanation: string; node: number; requests: number; rows: number; authorizations: number; state: string; response: string; key: string }
const frame = (title: string, explanation: string, node: number, requests: number, rows: number, authorizations: number, state: string, response: string, key = 'attempt-A'): PaymentFrame => ({ title, explanation, node, requests, rows, authorizations, state, response, key })
export const paymentScenarios: Record<PaymentScenario, { label: string; frames: PaymentFrame[] }> = {
 naive: { label: 'Naive retry', frames: [
  frame('Pay $129.00', 'Checkout creates a new gateway operation for each request. No durable attempt identity coordinates retries.', 0, 1, 0, 0, 'NOT TRACKED', 'Waiting'),
  frame('Gateway authorizes; response is lost', 'The provider has authorized $129.00, but the shopper sees a timeout. That timeout does not undo the authorization.', 3, 1, 0, 1, 'UNKNOWN TO CHECKOUT', 'Timeout'),
  frame('Customer taps Pay again', 'A new key tells the gateway this is a different operation, even though the customer meant to retry.', 1, 2, 0, 1, 'NOT TRACKED', 'Waiting', 'attempt-B'),
  frame('Two authorizations for one intended payment', 'Two authorization holds may affect available funds. Neither counter proves capture or settlement. Investigate and void/reconcile as appropriate.', 3, 2, 0, 2, 'DUPLICATE AUTHORIZATION', '200 for retry', 'attempt-B'),
 ]},
 protected: { label: 'Protected retry', frames: [
  frame('Claim one logical attempt', 'Commit tenant + AUTHORIZE + attempt-A and the immutable request fingerprint before the network call.', 2, 1, 1, 0, 'PROCESSING', 'Waiting'),
  frame('Authorized, but checkout times out', 'The provider authorized once. Persist UNKNOWN when possible; reconcile stale PROCESSING too if the worker dies.', 3, 1, 1, 1, 'UNKNOWN', '202 Pending'),
  frame('Retry with the same key', 'The stored fingerprint matches. The API returns pending without starting a new authorization.', 2, 2, 1, 1, 'UNKNOWN', '202 Pending'),
  frame('Reconcile the uncertain result', 'A provider lookup confirms the original authorization. Persist its reference, then return the stored result. This lookup does not authorize again.', 4, 2, 1, 1, 'AUTHORIZED', '200 on status lookup'),
 ]},
 concurrent: { label: 'Concurrent requests', frames: [
  frame('Two replicas receive the same attempt', 'Replica A and B both see attempt-A for $129.00. A JVM-local lock cannot coordinate them.', 1, 2, 0, 0, 'CLAIMING', 'Waiting'),
  frame('PostgreSQL elects one owner', 'A unique constraint permits one committed row. The other insert may wait for the winner transaction, then sees a conflict.', 2, 2, 1, 0, 'PROCESSING', 'Replica B: 202 Pending'),
  frame('Only the owner calls the gateway', 'The winning replica uses the stable provider key outside the claim transaction. A crash still requires reconciliation.', 3, 2, 1, 1, 'AUTHORIZED', 'Replica A: 200'),
  frame('The other request reads the stored result', 'A later status lookup or same-key retry returns the existing authorization. No second gateway operation is needed.', 2, 2, 1, 1, 'AUTHORIZED', '200 on status lookup'),
 ]},
 changed: { label: 'Changed payment amount', frames: [
  frame('Original $129.00 attempt succeeds', 'attempt-A is bound to the original order, amount, currency and payment-token reference.', 3, 1, 1, 1, 'AUTHORIZED', '200'),
  frame('Reuse attempt-A for $139.00', 'The customer submits different parameters under an existing key. The logical operation must remain immutable.', 1, 2, 1, 1, 'AUTHORIZED', 'Checking'),
  frame('Reject before the gateway', 'The canonical fingerprint differs. This API contract returns 409 Conflict and preserves the original authorized attempt.', 2, 2, 1, 1, 'AUTHORIZED (original)', '409 Conflict'),
  frame('Resolve intent before another attempt', 'Do not silently create a new key to bypass the conflict. Resolve the original payment and confirm what the customer intends.', 0, 2, 1, 1, 'AUTHORIZED (original)', '409 Conflict'),
 ]},
}
