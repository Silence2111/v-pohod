import { useEffect, useRef } from 'react'

// Лёгкий конфетти-салют на canvas (фирменные цвета), сам останавливается.
const COLORS = ['#5236AF', '#1FA567', '#F0A024', '#0077FF', '#F75A40', '#8ADBAB', '#A9E44D']

export function Confetti({ duration = 2600 }: { duration?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const W = (canvas.width = window.innerWidth * dpr)
    const H = (canvas.height = window.innerHeight * dpr)
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    const N = 140
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: -Math.random() * H * 0.4,
      r: (5 + Math.random() * 7) * dpr,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 2.4 * dpr,
      vy: (2.2 + Math.random() * 3) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      shape: Math.random() < 0.5 ? 0 : 1,
    }))

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = now - start
      ctx.clearRect(0, 0, W, H)
      const fade = t > duration - 600 ? Math.max(0, (duration - t) / 600) : 1
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02 * dpr
        p.rot += p.vr
        if (p.y > H + 20) {
          p.y = -20
          p.x = Math.random() * W
        }
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.c
        if (p.shape === 0) ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6)
        else {
          ctx.beginPath()
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      if (t < duration) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, W, H)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [duration])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    />
  )
}
