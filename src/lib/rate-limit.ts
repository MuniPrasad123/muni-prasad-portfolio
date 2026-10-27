export type LimiterState = { time: number; windowStart: number; used: number; tokens: number; accepted: number; rejected: number }
export const initialLimiter = (): LimiterState => ({ time: 0, windowStart: 0, used: 0, tokens: 5, accepted: 0, rejected: 0 })
export function advance(state: LimiterState, seconds: number): LimiterState {
  if (!Number.isFinite(seconds) || seconds < 0) throw new Error('Time must move forward by a finite non-negative amount')
  const time = state.time + seconds, windowStart = Math.floor(time / 10) * 10
  return { ...state, time, windowStart, used: windowStart === state.windowStart ? state.used : 0, tokens: Math.min(5, state.tokens + seconds * 0.5) }
}
export function burst(state: LimiterState, count: number, algorithm: 'fixed' | 'bucket') {
  if (!Number.isInteger(count) || count < 1 || count > 50) throw new Error('Burst must contain 1–50 requests')
  const available = algorithm === 'fixed' ? 5 - state.used : Math.floor(state.tokens + 1e-9)
  const accepted = Math.min(count, available), rejected = count - accepted
  const next = { ...state, accepted: state.accepted + accepted, rejected: state.rejected + rejected,
    used: algorithm === 'fixed' ? state.used + accepted : state.used, tokens: algorithm === 'bucket' ? Math.max(0, state.tokens - accepted) : state.tokens }
  const retryAfter = rejected ? Math.ceil(algorithm === 'fixed' ? state.windowStart + 10 - state.time : (1 - next.tokens) / 0.5) : 0
  return { state: next, accepted, rejected, retryAfter }
}
