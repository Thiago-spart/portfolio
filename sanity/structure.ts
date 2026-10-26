import { ArchiveIcon } from '@sanity/icons/Archive'
import type { StructureResolver } from 'sanity/structure'
import { LEGACY_TYPES } from './schemas'

// Order: singletons pinned at the top, then the new content types, then the
// pre-migration types the live site still reads (removed in #47).
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Legacy (pre-migration)')
        .icon(ArchiveIcon)
        .child(
          S.list()
            .title('Legacy (pre-migration)')
            .items(LEGACY_TYPES.map((type) => S.documentTypeListItem(type))),
        ),
    ])
