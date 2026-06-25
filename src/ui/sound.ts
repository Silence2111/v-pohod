// Процедурный звук на Web Audio — без файлов, лёгкий, offline.
// Мягкие приятные тембры, негромко (премиально, не назойливо).

let ctx: AudioContext | null = null
const KEY = 'vpohod_muted'

let muted = (() => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
})()

export function isMuted() {
  return muted
}
export function setMuted(v: boolean) {
  muted = v
  try {
    localStorage.setItem(KEY, v ? '1' : '0')
  } catch {
    /* ignore */
  }
}
export function toggleMuted() {
  setMuted(!muted)
  if (!muted) sfx.click()
  return muted
}

function ac(): AudioContext | null {
  if (muted) return null
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

type Wave = OscillatorType

function tone(
  freq: number,
  dur: number,
  opts: { type?: Wave; gain?: number; delay?: number; slideTo?: number } = {},
) {
  const c = ac()
  if (!c) return
  const { type = 'sine', gain = 0.12, delay = 0, slideTo } = opts
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur)
  // мягкая ADSR-огибающая
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

function noise(dur: number, gain = 0.06, delay = 0) {
  const c = ac()
  if (!c) return
  const len = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = c.createBufferSource()
  src.buffer = buf
  const g = c.createGain()
  g.gain.value = gain
  const filt = c.createBiquadFilter()
  filt.type = 'bandpass'
  filt.frequency.value = 1200
  src.connect(filt).connect(g).connect(c.destination)
  src.start(c.currentTime + delay)
}

// мажорная гамма (ноты)
const N = { C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, C6: 1046, E6: 1318, G6: 1568 }

export const sfx = {
  click: () => tone(660, 0.06, { type: 'triangle', gain: 0.07 }),
  step: () => tone(300, 0.08, { type: 'sine', gain: 0.09, slideTo: 360 }),
  dice: () => {
    noise(0.12, 0.05)
    tone(220, 0.1, { type: 'square', gain: 0.04, slideTo: 480 })
  },
  reveal: () => tone(520, 0.16, { type: 'sine', gain: 0.08, slideTo: 760 }),
  pickup: () => {
    tone(N.E5, 0.1, { type: 'triangle', gain: 0.1 })
    tone(N.A5, 0.14, { type: 'triangle', gain: 0.1, delay: 0.08 })
  },
  card: () => {
    tone(400, 0.12, { type: 'sine', gain: 0.07, slideTo: 620 })
    noise(0.1, 0.03, 0.02)
  },
  weather: () => tone(300, 0.4, { type: 'sine', gain: 0.05, slideTo: 500 }),
  tip: () => {
    tone(N.G5, 0.1, { type: 'sine', gain: 0.08 })
    tone(N.C6, 0.14, { type: 'sine', gain: 0.08, delay: 0.09 })
  },
  achieve: () => {
    tone(N.E5, 0.1, { type: 'triangle', gain: 0.1 })
    tone(N.G5, 0.1, { type: 'triangle', gain: 0.1, delay: 0.08 })
    tone(N.C6, 0.2, { type: 'triangle', gain: 0.1, delay: 0.16 })
  },
  quest: () => {
    // задание выполнено — короткий приятный аккорд
    tone(N.G5, 0.12, { type: 'triangle', gain: 0.1 })
    tone(N.C6, 0.18, { type: 'triangle', gain: 0.1, delay: 0.1 })
  },
  error: () => tone(180, 0.18, { type: 'sawtooth', gain: 0.05, slideTo: 120 }),
  win: () => {
    // короткая радостная фанфара (мажор)
    const seq: [number, number][] = [
      [N.C5, 0],
      [N.E5, 0.12],
      [N.G5, 0.24],
      [N.C6, 0.36],
      [N.E6, 0.5],
      [N.G6, 0.64],
    ]
    for (const [f, d] of seq) tone(f, 0.5, { type: 'triangle', gain: 0.11, delay: d })
  },
}

// Лёгкая вибро-отдача на мобильных
export function haptic(ms = 12) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms)
  } catch {
    /* ignore */
  }
}
