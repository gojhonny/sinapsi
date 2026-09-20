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
  if (typeof value === 'number' || typeof value === 'boolean' || value == null) return String(value)
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) return value
  // Consumer payloads and presentation text may be sensitive. Never echo documents.
  return typeof value === 'string' ? `[string, ${value.length} characters]` : `[${typeof value}]`
}
