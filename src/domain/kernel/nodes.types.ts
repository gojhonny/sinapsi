/** Interaction that may emit a host CustomEvent for a semantic node. */
export const SINAPSI_NODE_EVENTS = ['click', 'hover'] as const

export type SinapsiNodeEventName = (typeof SINAPSI_NODE_EVENTS)[number]

export const SinapsiNodeEvent = {
  Click: 'click',
  Hover: 'hover'
} as const satisfies Record<string, SinapsiNodeEventName>

/** Directed named link; `id` must match another node in the same document. */
export interface SinapsiLink {
  readonly id: string
  readonly name: string
}

/** Optional text-only details opened by explicit node activation. */
export type SinapsiNodePresentation =
  | {
      readonly type: 'tooltip'
      readonly description: string
    }
  | {
      readonly type: 'card'
      readonly title?: string
      readonly description?: string
      readonly avatarUrl?: string
      readonly avatarAlt?: string
      readonly reference?: string
      readonly badge?: string
    }

/** Consumer-supplied semantic node. */
export interface SinapsiNode {
  readonly id: string
  readonly name: string
  readonly payload: Readonly<Record<string, unknown>>
  readonly links: readonly SinapsiLink[]
  readonly presentation?: SinapsiNodePresentation
}

/** Public JSON document stored on the `nodes` attribute. */
export interface SinapsiGraphDocument {
  readonly graph: readonly SinapsiNode[]
}

export const SINAPSI_NODE_CLICK_EVENT = 'sinapsi-node-click'
export const SINAPSI_NODE_HOVER_EVENT = 'sinapsi-node-hover'

export interface SinapsiNodeEventDetail {
  readonly id: string
  readonly event: SinapsiNodeEventName
  readonly payload: Readonly<Record<string, unknown>>
}

export type SinapsiNodeClickEvent = CustomEvent<SinapsiNodeEventDetail>
export type SinapsiNodeHoverEvent = CustomEvent<SinapsiNodeEventDetail>
