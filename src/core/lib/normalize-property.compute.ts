import type { ZodType } from 'zod'

const LOG_PREFIX = '[Graphz]'

/**
 * Resolves one public property. Absent values (`null`/`undefined`) mean "use the
 * default" and stay silent; invalid values are reported once through
 * `console.error` and replaced by `recover(value)` when provided, else `fallback`.
 */
export function normalizeProperty<T>(
  name: string,
  value: unknown,
  schema: ZodType<T>,
  fallback: T,
  recover?: (value: unknown) => T | undefined
): T {
  if (value === null || value === undefined) {
    return fallback
  }

  const result = schema.safeParse(value)
  if (result.success) {
    return result.data
  }

  const replacement = recover?.(value) ?? fallback
  reportInvalidProperty(name, value, schema, replacement)

  return replacement
}

export function reportInvalidProperty(
  name: string,
  value: unknown,
  schema: ZodType,
  replacement: unknown
): void {
  const expectation = schema.description ?? 'a supported value'
  console.error(
    `${LOG_PREFIX} Invalid ${name}=${describe(value)}: expected ${expectation}. Using ${describe(replacement)}.`
  )
}

function describe(value: unknown): string {
  if (typeof value === 'object' || typeof value === 'string') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  return String(value)
}
