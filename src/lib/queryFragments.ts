// GROQ fragments shared by the queries in src/lib/queries. Plain strings,
// interpolated into defineQuery templates (TypeGen resolves them).

// One metric (sanity/schemas/objects/metric.ts), as shown on the site.
export const METRIC_FIELDS = /* groq */ `_key, before, after, unit, label, direction`
