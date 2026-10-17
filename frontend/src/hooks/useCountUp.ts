import { useEffect, useState } from 'react'

// Animates from 0 up to `target` once. With reduced motion, or when disabled,
// it returns the target straight away.
export function useCountUp(
  target: number,
  enabled: boolean,
  durationMs = 800,
): number {
  const [value, setValue] = useState(enabled ? 0 : target)

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (!enabled || reduceMotion) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      setValue(target * (1 - Math.pow(1 - progress, 3)))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [durationMs, enabled, target])

  return value
}
