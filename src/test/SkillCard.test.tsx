import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SkillCard from '../components/SkillCard'
import type { StackGroup } from '../lib/stack'

function makeGroup(techCount: number): StackGroup {
  return {
    category: 'frontend',
    label: { en: 'Frontend', pt: 'Frontend', es: 'Frontend' },
    techs: Array.from({ length: techCount }, (_, i) => `Skill${i + 1}`),
  }
}

describe('SkillCard', () => {
  it('renders the category label for the active language', () => {
    render(<SkillCard group={{ ...makeGroup(1), category: 'data', label: { en: 'Data', pt: 'Dados', es: 'Datos' } }} lang="pt" />)
    expect(screen.getByText('Dados')).toBeInTheDocument()
  })

  it('renders all techs when the count is at or below the visible cap', () => {
    render(<SkillCard group={makeGroup(6)} lang="en" />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`Skill${i}`)).toBeInTheDocument()
    }
    expect(screen.queryByText(/more/)).not.toBeInTheDocument()
  })

  it('caps at 6 techs and shows a "+N more" chip when there are more', () => {
    render(<SkillCard group={makeGroup(20)} lang="en" />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`Skill${i}`)).toBeInTheDocument()
    }
    expect(screen.queryByText('Skill7')).not.toBeInTheDocument()
    expect(screen.getByText('+14 more')).toBeInTheDocument()
  })

  it('reveals the rest and shows "Show less" after clicking the chip', () => {
    render(<SkillCard group={makeGroup(20)} lang="en" />)
    fireEvent.click(screen.getByText('+14 more'))
    expect(screen.getByText('Skill20')).toBeInTheDocument()
    expect(screen.getByText('Show less')).toBeInTheDocument()
  })

  it('collapses back after clicking "Show less"', () => {
    render(<SkillCard group={makeGroup(20)} lang="en" />)
    fireEvent.click(screen.getByText('+14 more'))
    fireEvent.click(screen.getByText('Show less'))
    expect(screen.queryByText('Skill20')).not.toBeInTheDocument()
    expect(screen.getByText('+14 more')).toBeInTheDocument()
  })
})
