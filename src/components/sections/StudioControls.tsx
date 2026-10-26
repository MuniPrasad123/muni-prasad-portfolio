'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const motionQuery = '(prefers-reduced-motion: reduce)'
function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(motionQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const getMotion = () => window.matchMedia(motionQuery).matches

export function StudioControls() {
  const player = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [volume, setVolume] = useState(55)
  const [userPaused, setUserPaused] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotion, () => false)
  const paused = userPaused || reducedMotion
  const heldAnimations = useRef(new Set<Animation>())

  useEffect(() => {
    document.documentElement.classList.toggle('studio-motion-paused', paused)
    const sync = () => {
      document.querySelectorAll<SVGSVGElement>('svg').forEach(svg => {
        if (!svg.querySelector('animate, animateMotion, animateTransform')) return
        if (paused) svg.pauseAnimations()
        else svg.unpauseAnimations()
      })
      if (paused) {
        document.getAnimations().forEach(animation => {
          if (animation.playState === 'running') {
            heldAnimations.current.add(animation)
            animation.pause()
          }
        })
      } else {
        heldAnimations.current.forEach(animation => {
          if (animation.playState === 'paused') animation.play()
        })
        heldAnimations.current.clear()
      }
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('animationstart', sync, true)
    return () => {
      observer.disconnect()
      document.removeEventListener('animationstart', sync, true)
    }
  }, [paused])

  async function toggleMusic() {
    const audio = player.current
    if (!audio || busy) return
    setMessage('')
    if (!audio.paused) { audio.pause(); return }
    setBusy(true)
    audio.volume = volume / 100
    try { await audio.play() }
    catch { setMessage('Music could not start. Try again, or check whether this tab is muted.') }
    finally { setBusy(false) }
  }

  return <section className="site-playback-controls" aria-label="Site sound and animation controls">
    <audio ref={player} src="/audio/quiet-water-meditation.wav" loop preload="none"
      onPlaying={() => { setPlaying(true); setBusy(false) }} onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setBusy(false); setMessage('Music could not load. Please reload the page and try again.') }}/>
    <div className="playback-buttons">
      <button type="button" onClick={toggleMusic} aria-pressed={playing} disabled={busy}>
        {busy ? 'Starting music…' : playing ? '♫ Pause music' : '♫ Play peaceful music'}
      </button>
      <button type="button" aria-pressed={paused} disabled={reducedMotion} onClick={() => setUserPaused(value => !value)}>
        {reducedMotion ? 'Reduced motion enabled' : paused ? 'Resume animations' : 'Pause animations'}
      </button>
    </div>
    <div className="playback-status">
      <span role="status">{playing ? 'Music playing' : 'Music off'} · {paused ? 'Animations paused' : 'Animations playing'}</span>
      <label>Volume {volume}%<input aria-label="Music volume" type="range" min="0" max="100" value={volume} onChange={event => {
        const value = Number(event.target.value)
        setVolume(value)
        if (player.current) player.current.volume = value / 100
      }}/></label>
    </div>
    {message && <p className="playback-message" role="status">{message}</p>}
  </section>
}
