export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
