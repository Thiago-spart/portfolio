import type { CSSProperties } from 'react'
import { prefersReducedMotion } from './inPage'

// Case card or archive row to case page (#77): the title and the first
// result morph into the case page's title and first metric, and the back
// link morphs them home again. Both ends name the same elements by slug, so
// the names stay unique on every page.
export const caseMorph = (slug: string, part: 'title' | 'result'): CSSProperties => ({
  viewTransitionName: `case-${part}-${slug}`,
})

// The `viewTransition` option for those links. The router skips it where
// document.startViewTransition is missing; under reduced motion the types
// resolve to false, so no transition starts at all (motion.css also stills
// one in browsers that don't support transition types).
export const caseViewTransition = {
  types: (): string[] | false => (prefersReducedMotion() ? false : ['case']),
}
