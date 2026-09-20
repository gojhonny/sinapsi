export interface PresentationBounds {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

export interface PresentationSize {
  readonly width: number
  readonly height: number
}

export type PresentationSide = 'right' | 'left' | 'top' | 'bottom'

export interface PresentationPosition {
  readonly x: number
  readonly y: number
  readonly side: PresentationSide
}

/** Coordinates and bounds are CSS pixels, never backing-store/DPR units. */
export function positionPresentation(
  anchor: { readonly x: number; readonly y: number },
  size: PresentationSize,
  bounds: PresentationBounds,
  previousSide?: PresentationSide
): PresentationPosition {
  const gap = 18
  const rooms = {
    right: bounds.right - anchor.x - gap,
    left: anchor.x - bounds.left - gap,
    top: anchor.y - bounds.top - gap,
    bottom: bounds.bottom - anchor.y - gap
  }
  const need = (side: PresentationSide) =>
    side === 'left' || side === 'right' ? size.width : size.height
  const sides: PresentationSide[] = ['right', 'left', 'top', 'bottom']
  // Keep the current side through small oscillations near a boundary.
  const side =
    previousSide && rooms[previousSide] >= need(previousSide) - 12
      ? previousSide
      : (sides.find((candidate) => rooms[candidate] >= need(candidate)) ??
        sides.reduce((best, candidate) =>
          rooms[candidate] / need(candidate) > rooms[best] / need(best) ? candidate : best
        ))

  let x = anchor.x - size.width / 2
  let y = anchor.y - size.height * 0.35
  if (side === 'right') x = anchor.x + gap
  if (side === 'left') x = anchor.x - gap - size.width
  if (side === 'top') y = anchor.y - gap - size.height
  if (side === 'bottom') y = anchor.y + gap
  return {
    x: clamp(x, bounds.left, bounds.right - size.width),
    y: clamp(y, bounds.top, bounds.bottom - size.height),
    side
  }
}

export function intersectBounds(a: PresentationBounds, b: PresentationBounds): PresentationBounds {
  return {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom)
  }
}

export function containsPoint(bounds: PresentationBounds, x: number, y: number): boolean {
  return (
    bounds.right > bounds.left &&
    bounds.bottom > bounds.top &&
    x >= bounds.left &&
    x <= bounds.right &&
    y >= bounds.top &&
    y <= bounds.bottom
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, Math.max(min, max)))
}
