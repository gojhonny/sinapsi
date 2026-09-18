import { clamp01 } from '@core/math/scalar.compute'

/** Two-peak lub-dub envelope for one heartbeat cycle (`phase` wraps at 1). */
export function heartbeat(phase: number): number {
  const t = ((phase % 1) + 1) % 1
  const lub = Math.exp(-((t - 0.12) ** 2) / (2 * 0.018 ** 2))
  const dub = 0.55 * Math.exp(-((t - 0.32) ** 2) / (2 * 0.022 ** 2))
  return clamp01(lub + dub)
}

/** Compact at rest (`beat` 0) and expand at the peak (`beat` 1) around size 1. */
export function heartbeatScale(beat: number, amplitude: number): number {
  return 1 + (clamp01(beat) * 2 - 1) * amplitude
}
