export type Lang = 'en' | 'pt' | 'es'

interface LocaleString {
  en: string
  pt: string
  es: string
}

interface SanityHighlight {
  value: string
  label: LocaleString
}

export interface SanityExperience {
  _id: string
  company: string
  companyUrl?: string
  companyLogoUrl?: string
  role: LocaleString
  description: LocaleString
  startDate: string       // ISO date string "YYYY-MM-DD"
  endDate: string | null  // null = "Present"
  techStack: string[]
  highlights: SanityHighlight[]
}

export interface SanityQA {
  _id: string
  question: LocaleString
  answer: LocaleString
  order: number
}

interface SanitySkill {
  name: string
  icon?: string
}

export interface SanitySkillCategory {
  _id: string
  category: LocaleString
  skills: SanitySkill[]
  order: number
}

export interface SanityProject {
  _id: string
  title: LocaleString
  slug: { current: string }
  shortDescription: LocaleString
  longDescription: LocaleString
  highlights?: LocaleString[]
  challenges?: LocaleString[]
  coverImageUrl?: string
  videoUrl?: string
  galleryUrls?: string[]
  techStack: string[]
  category: 'web' | 'mobile' | 'api' | 'other'
  liveUrl?: string
  githubUrl?: string
  startDate: string
  endDate: string | null
  status: 'completed' | 'in-progress' | 'archived'
  featured: boolean
}
