export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const clamp01 = (value: number): number => clamp(value, 0, 1)
