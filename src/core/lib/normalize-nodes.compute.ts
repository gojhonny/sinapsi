import type { SinapsiGraphDocument } from '@domain/kernel/nodes.types'
import { nodesDocumentSchema } from '@domain/schemas/nodes.schema'

export type NodesParseResult =
  | { readonly ok: true; readonly document: SinapsiGraphDocument }
  | { readonly ok: false }

/** Parses a JSON string or object into a snapshot graph document. */
export function parseNodesDocument(value: unknown): NodesParseResult {
  const candidate = typeof value === 'string' ? parseJsonObject(value) : value
  if (candidate === undefined) {
    return { ok: false }
  }

  const result = nodesDocumentSchema.safeParse(candidate)
  if (!result.success) {
    return { ok: false }
  }

  return { ok: true, document: snapshotGraphDocument(result.data) }
}

/** Serializes an accepted graph document for the `nodes` attribute. */
export function serializeNodesDocument(document: SinapsiGraphDocument): string {
  return JSON.stringify(document)
}

export function reportInvalidNodes(value: unknown): void {
  console.error(
    `[Sinapsi] Invalid nodes=${describeNodes(value)}: expected a JSON nodes document. Keeping previous graph.`
  )
}

function snapshotGraphDocument(document: SinapsiGraphDocument): SinapsiGraphDocument {
  return structuredClone(document)
}

function parseJsonObject(value: string): unknown {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return undefined
  }
}

function describeNodes(value: unknown): string {
  if (typeof value === 'string') {
    return value.length > 120 ? `${value.slice(0, 117)}...` : value
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
