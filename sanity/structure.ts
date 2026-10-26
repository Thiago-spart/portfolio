import { ArchiveIcon } from '@sanity/icons/Archive'
import type { StructureBuilder, StructureResolver } from 'sanity/structure'
import { CONTENT_TYPES, LEGACY_TYPES } from './schemas'

type Ordering = { field: string; direction: 'asc' | 'desc' }

// Lists that should not fall back to "last edited".
const DEFAULT_ORDERING: Record<string, Ordering[]> = {
  caseStudy: [{ field: 'tier', direction: 'desc' }, { field: 'order', direction: 'asc' }],
  role:      [{ field: 'startDate', direction: 'desc' }],
  tech:      [{ field: 'name', direction: 'asc' }],
}

function typeList(S: StructureBuilder, type: string) {
  const item = S.documentTypeListItem(type)
  const ordering = DEFAULT_ORDERING[type]
  if (!ordering) return item
  return item.child(S.documentTypeList(type).defaultOrdering(ordering))
}

// Order: singletons pinned at the top, then the new content types, then the
// pre-migration types the live site still reads (removed in #47).
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...CONTENT_TYPES.map((type) => typeList(S, type)),
      S.divider(),
      S.listItem()
        .title('Legacy (pre-migration)')
        .icon(ArchiveIcon)
        .child(
          S.list()
            .title('Legacy (pre-migration)')
            .items(LEGACY_TYPES.map((type) => S.documentTypeListItem(type))),
        ),
    ])
