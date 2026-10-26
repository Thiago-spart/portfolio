import { localeString }  from './locale/localeString'
import { localeText }    from './locale/localeText'
import { localeBlock }   from './locale/localeBlock'
import { metric }        from './objects/metric'
import { imageWithAlt }  from './objects/imageWithAlt'
import { tech }          from './tech'
import { experience }    from './experience'
import { qa }            from './qa'
import { skillCategory } from './skillCategory'
import { project }       from './project'

// New content types, in Studio order.
export const CONTENT_TYPES = ['tech']

// Legacy document types: the live site still queries these until #47.
export const LEGACY_TYPES = ['experience', 'project', 'qa', 'skillCategory']

export const schemaTypes = [
  // objects
  localeString,
  localeText,
  localeBlock,
  metric,
  imageWithAlt,
  // documents
  tech,
  // legacy documents
  experience,
  qa,
  skillCategory,
  project,
]
