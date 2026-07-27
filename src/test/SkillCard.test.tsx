import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SkillCard from '../components/SkillCard'
import type { SanitySkillCategory } from '../types/sanity'

function makeCategory(skillCount: number): SanitySkillCategory {
  return {
    _id: 'cat-1',
    category: { en: 'Front-End', pt: 'Front-End', es: 'Front-End' },
    order: 0,
    skills: Array.from({ length: skillCount }, (_, i) => ({ name: `Skill${i + 1}` })),
  }
}

describe('SkillCard', () => {
  it('renders all skills when the count is at or below the visible cap', () => {
    render(<SkillCard category={makeCategory(6)} lang="en" />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`Skill${i}`)).toBeInTheDocument()
    }
    expect(screen.queryByText(/more/)).not.toBeInTheDocument()
  })

  it('caps at 6 skills and shows a "+N more" chip when there are more', () => {
    render(<SkillCard category={makeCategory(20)} lang="en" />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`Skill${i}`)).toBeInTheDocument()
    }
    expect(screen.queryByText('Skill7')).not.toBeInTheDocument()
    expect(screen.getByText('+14 more')).toBeInTheDocument()
  })

  it('reveals the rest and shows "Show less" after clicking the chip', () => {
    render(<SkillCard category={makeCategory(20)} lang="en" />)
    fireEvent.click(screen.getByText('+14 more'))
    expect(screen.getByText('Skill20')).toBeInTheDocument()
    expect(screen.getByText('Show less')).toBeInTheDocument()
  })

  it('collapses back after clicking "Show less"', () => {
    render(<SkillCard category={makeCategory(20)} lang="en" />)
    fireEvent.click(screen.getByText('+14 more'))
    fireEvent.click(screen.getByText('Show less'))
    expect(screen.queryByText('Skill20')).not.toBeInTheDocument()
    expect(screen.getByText('+14 more')).toBeInTheDocument()
  })
})
