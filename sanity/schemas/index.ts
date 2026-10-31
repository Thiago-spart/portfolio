import { localeString }  from './locale/localeString'
import { localeText }    from './locale/localeText'
import { localeBlock }   from './locale/localeBlock'
import { metric }        from './objects/metric'
import { imageWithAlt }  from './objects/imageWithAlt'
import { heroResult }    from './objects/heroResult'
import { siteSettings }  from './siteSettings'
import { caseStudy }     from './caseStudy'
import { role }          from './role'
import { tech }          from './tech'
import { faq }           from './faq'

// Singletons, pinned at the top of the Studio (document id = type name).
export const SINGLETONS = ['siteSettings']

// New content types, in Studio order.
export const CONTENT_TYPES = ['caseStudy', 'role', 'tech', 'faq']

export const schemaTypes = [
  // objects
  localeString,
  localeText,
  localeBlock,
  metric,
  imageWithAlt,
  heroResult,
  // documents
  siteSettings,
  caseStudy,
  role,
  tech,
  faq,
]
