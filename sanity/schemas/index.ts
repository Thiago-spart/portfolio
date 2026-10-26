import { localeString }  from './locale/localeString'
import { localeText }    from './locale/localeText'
import { experience }    from './experience'
import { qa }            from './qa'
import { skillCategory } from './skillCategory'
import { project }       from './project'

// Legacy document types: the live site still queries these until #47.
export const LEGACY_TYPES = ['experience', 'project', 'qa', 'skillCategory']

export const schemaTypes = [
  // objects
  localeString,
  localeText,
  // legacy documents
  experience,
  qa,
  skillCategory,
  project,
]
