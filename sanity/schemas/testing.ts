// Test helpers: run a field's `validation` builder against a chainable spy
// rule and report which rule methods it called, with their arguments.
type Call = { method: string; args: unknown[] }

type Validatable = { name: string; validation?: unknown }

export function ruleCalls(validation: unknown): Call[] {
  const calls: Call[] = []
  const rule: object = new Proxy({}, {
    get: (_, method) => (...args: unknown[]) => {
      calls.push({ method: String(method), args })
      return rule
    },
  })
  if (typeof validation === 'function') validation(rule)
  return calls
}

export function fieldOf(type: { fields?: readonly Validatable[] }, name: string) {
  const field = type.fields?.find((f) => f.name === name)
  if (!field) throw new Error(`No field "${name}"`)
  return field
}

export function isRequired(field: Validatable) {
  return ruleCalls(field.validation).some((c) => c.method === 'required')
}
