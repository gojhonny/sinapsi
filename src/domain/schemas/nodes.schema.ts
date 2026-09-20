import { SINAPSI_LIMITS } from '@core/config.data'
import type { SinapsiGraphDocument, SinapsiNodePresentation } from '@domain/kernel/nodes.types'
import { z } from 'zod'

const linkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1)
})

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional()

const avatarUrl = optionalText.refine((value) => {
  if (value === undefined) return true
  try {
    // Resolve like an image in the consumer document without needing browser globals.
    const url = new URL(value, 'https://sinapsi.invalid/')
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}, 'avatarUrl must be an HTTP(S) or relative URL')

const presentationSchema: z.ZodType<SinapsiNodePresentation> = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('tooltip'),
      description: z.string().trim().min(1)
    }),
    z
      .object({
        type: z.literal('card'),
        title: optionalText,
        description: optionalText,
        avatarUrl,
        avatarAlt: optionalText,
        reference: optionalText,
        badge: optionalText
      })
      .refine((card) => Boolean(card.title || card.description || card.reference || card.badge), {
        message: 'a card must contain a title, description, reference, or badge'
      })
  ])
  .transform((value): SinapsiNodePresentation => {
    if (value.type === 'tooltip') return value
    return {
      type: 'card',
      ...(value.title ? { title: value.title } : {}),
      ...(value.description ? { description: value.description } : {}),
      ...(value.avatarUrl ? { avatarUrl: value.avatarUrl } : {}),
      ...(value.avatarAlt ? { avatarAlt: value.avatarAlt } : {}),
      ...(value.reference ? { reference: value.reference } : {}),
      ...(value.badge ? { badge: value.badge } : {})
    }
  })

const nodeSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    payload: z.record(z.string(), z.unknown()),
    links: z.array(linkSchema),
    presentation: presentationSchema.optional()
  })
  .transform(({ presentation, ...node }) => (presentation ? { ...node, presentation } : node))

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
