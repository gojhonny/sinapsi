export interface FrameTick {
  /** Milliseconds elapsed since the previous tick. */
  readonly delta: number
}

export type FrameCallback = (tick: FrameTick) => void

/** Per-frame scheduler seam; production uses motion's frameloop, tests drive ticks by hand. */
export interface FrameLoop {
  schedule(callback: FrameCallback): void
  cancel(callback: FrameCallback): void
}

export interface TweenHandle {
  stop(): void
}

/** Interpolates a scalar over time; production uses motion's `animate`. */
export type Tween = (
  from: number,
  to: number,
  durationSeconds: number,
  onUpdate: (value: number) => void
) => TweenHandle
