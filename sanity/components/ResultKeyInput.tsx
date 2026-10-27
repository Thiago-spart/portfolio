import { useEffect, useState } from 'react'
import { Card, Select, Text } from '@sanity/ui'
import { set, unset, useClient, useFormValue } from 'sanity'
import type { Reference, StringInputProps } from 'sanity'
import { CASE_STUDY_RESULTS_QUERY, formatMetric, type ResultOption } from '../schemas/objects/metric'

// Lets the editor pick one of the referenced case study's results instead of
// typing its `_key`. Reads the published case study, which is what the site
// renders.
export function ResultKeyInput(props: StringInputProps) {
  const { value, onChange, path, readOnly, elementProps } = props
  const caseStudy = useFormValue([...path.slice(0, -1), 'caseStudy']) as Reference | undefined
  const client = useClient({ apiVersion: '2024-01-01' })
  const [results, setResults] = useState<ResultOption[] | null>(null)

  const id = caseStudy?._ref
  useEffect(() => {
    if (!id) return
    let cancelled = false
    setResults(null)
    client
      .fetch<ResultOption[] | null>(CASE_STUDY_RESULTS_QUERY, { id })
      .then((list) => { if (!cancelled) setResults(list ?? []) })
      .catch(() => { if (!cancelled) setResults([]) })
    return () => { cancelled = true }
  }, [client, id])

  if (!id) return <Hint>Pick a case study first.</Hint>
  if (results === null) return <Hint>Loading results…</Hint>
  if (results.length === 0) return <Hint>This case study has no published results yet.</Hint>

  return (
    <Select
      {...elementProps}
      value={value ?? ''}
      disabled={readOnly}
      onChange={(event) => {
        const next = event.currentTarget.value
        onChange(next ? set(next) : unset())
      }}
    >
      <option value="">Select a result…</option>
      {results.map((result) => (
        <option key={result._key} value={result._key}>
          {[formatMetric(result), result.label].filter(Boolean).join(' · ')}
        </option>
      ))}
    </Select>
  )
}

function Hint({ children }: { children: string }) {
  return (
    <Card padding={3} radius={2} tone="transparent" border>
      <Text size={1} muted>{children}</Text>
    </Card>
  )
}
