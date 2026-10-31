import type { StructureBuilder, StructureResolver } from 'sanity/structure'
import { CONTENT_TYPES, SINGLETONS } from './schemas'

type Ordering = { field: string; direction: 'asc' | 'desc' }

// Lists that should not fall back to "last edited".
const DEFAULT_ORDERING: Record<string, Ordering[]> = {
  caseStudy: [{ field: 'tier', direction: 'desc' }, { field: 'order', direction: 'asc' }],
  role:      [{ field: 'startDate', direction: 'desc' }],
  tech:      [{ field: 'name', direction: 'asc' }],
  faq:       [{ field: 'order', direction: 'asc' }],
}

// Singletons open straight into the one document whose id is the type name.
function singleton(S: StructureBuilder, type: string) {
  return S.documentTypeListItem(type).child(S.document().schemaType(type).documentId(type))
}

function typeList(S: StructureBuilder, type: string) {
  const item = S.documentTypeListItem(type)
  const ordering = DEFAULT_ORDERING[type]
  if (!ordering) return item
  return item.child(S.documentTypeList(type).defaultOrdering(ordering))
}

// Order: singletons pinned at the top, then the content types.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...SINGLETONS.map((type) => singleton(S, type)),
      S.divider(),
      ...CONTENT_TYPES.map((type) => typeList(S, type)),
    ])
