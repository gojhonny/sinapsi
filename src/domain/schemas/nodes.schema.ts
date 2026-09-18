import { SINAPSI_LIMITS } from '@core/config.data'
import type { SinapsiGraphDocument } from '@domain/kernel/nodes.types'
import { z } from 'zod'

const linkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1)
})

const nodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  links: z.array(linkSchema)
})

/** Validates `{ graph: SinapsiNode[] }` including unique ids and resolvable links. */
export const nodesDocumentSchema: z.ZodType<SinapsiGraphDocument> = z
  .object({
    graph: z.array(nodeSchema).max(SINAPSI_LIMITS.nodes.max)
  })
  .superRefine((document, context) => {
    const ids = document.graph.map((node) => node.id)
    const unique = new Set(ids)
    if (unique.size !== ids.length) {
      context.addIssue({ code: 'custom', message: 'node ids must be unique' })
    }

    for (const [index, node] of document.graph.entries()) {
      for (const [linkIndex, link] of node.links.entries()) {
        if (link.id === node.id) {
          context.addIssue({
            code: 'custom',
            message: 'links must not include the node id',
            path: ['graph', index, 'links', linkIndex]
          })
        } else if (!unique.has(link.id)) {
          context.addIssue({
            code: 'custom',
            message: 'links must reference ids in the same document',
            path: ['graph', index, 'links', linkIndex]
          })
        }
      }
    }
  })
  .describe('a JSON nodes document')
