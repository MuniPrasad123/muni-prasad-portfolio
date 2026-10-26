// Original instrumental soundscape generated locally with Web Audio.
// No external recording, download, or third-party audio service is used.
export function createAmbientMusic(context: AudioContext) {
  const output = context.createGain()
  output.gain.value = 0
  output.connect(context.destination)

  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1800
  filter.Q.value = 0.3
  const dry = context.createGain()
  dry.gain.value = 0.75
  filter.connect(dry).connect(output)

  const reverb = context.createConvolver()
  const impulse = context.createBuffer(2, context.sampleRate * 3, context.sampleRate)
  let seed = 8741
  for (let channel = 0; channel < 2; channel++) {
    const samples = impulse.getChannelData(channel)
    for (let i = 0; i < samples.length; i++) {
      seed = (seed * 16807) % 2147483647
      samples[i] = ((seed / 2147483647) * 2 - 1) * Math.pow(1 - i / samples.length, 3)
    }
  }
  reverb.buffer = impulse
  const wet = context.createGain()
  wet.gain.value = 0.32
  filter.connect(reverb).connect(wet).connect(output)

  const voices = new Set<OscillatorNode>()
  function tone(frequency: number, start: number, duration: number, level: number, attack: number, type: OscillatorType) {
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    envelope.gain.setValueAtTime(0, start)
    envelope.gain.linearRampToValueAtTime(level, start + attack)
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(envelope).connect(filter)
    voices.add(oscillator)
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect() }
    oscillator.start(start)
    oscillator.stop(start + duration + 0.05)
  }

  const chords = [[130.81,196,261.63,329.63], [110,164.81,220,329.63], [87.31,130.81,174.61,261.63], [98,146.83,196,293.66]]
  const melody = [523.25,0,659.25,587.33,0,440,523.25,0,659.25,783.99,0,587.33,523.25,0,440,0]
  let chord = 0
  let note = 0
  let nextChord = context.currentTime + 0.15
  let nextNote = context.currentTime + 2.5
  function schedule() {
    if (context.state !== 'running') return
    const now = context.currentTime
    // Resume gently after a background tab throttles the scheduler; never stack missed notes.
    if (nextChord < now) nextChord = now + 0.15
    if (nextNote < now) nextNote = now + 0.5
    const horizon = now + 2
    while (nextChord < horizon) {
      chords[chord % chords.length].forEach((frequency, index) => tone(frequency, nextChord, 17, index === 0 ? 0.045 : 0.024, 3, 'sine'))
      nextChord += 12
      chord++
    }
    while (nextNote < horizon) {
      const frequency = melody[note % melody.length]
      if (frequency) {
        tone(frequency, nextNote, 5, 0.035, 0.14, 'sine')
        tone(frequency * 2, nextNote, 2.7, 0.005, 0.08, 'sine')
      }
      nextNote += 3.8
      note++
    }
  }
  schedule()
  const timer = window.setInterval(schedule, 500)
  return {
    output,
    dispose() {
      window.clearInterval(timer)
      voices.forEach(voice => { voice.onended = null; voice.stop(); voice.disconnect() })
      voices.clear()
      filter.disconnect()
      reverb.disconnect()
      dry.disconnect()
      wet.disconnect()
      output.disconnect()
    },
  }
}
