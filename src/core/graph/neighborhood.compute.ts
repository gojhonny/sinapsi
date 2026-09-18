import type { SinapsiGraphDocument } from '@domain/kernel/nodes.types'

/** Undirected one-level neighborhood: the node, its links, and inbound reverse links. */
export function neighborhoodIds(document: SinapsiGraphDocument, id: string): ReadonlySet<string> {
  const ids = new Set<string>([id])
  const node = document.graph.find((entry) => entry.id === id)
  if (!node) {
    return ids
  }

  for (const link of node.links) {
    ids.add(link.id)
  }

  for (const other of document.graph) {
    if (other.links.some((link) => link.id === id)) {
      ids.add(other.id)
    }
  }

  return ids
}
