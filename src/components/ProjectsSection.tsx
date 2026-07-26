import { useEffect, useState } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import ProjectCard from './ProjectCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '#/components/ui/carousel'
import type { Lang, SanityProject } from '#/types/sanity'

interface Props {
  projects: SanityProject[]
  lang: Lang
}

export default function ProjectsSection({ projects, lang }: Props) {
  const { t } = useTranslation()
  const [api, setApi] = useState<CarouselApi>()
  const [selected, setSelected] = useState(0)
  const [snapCount, setSnapCount] = useState(0)

  useEffect(() => {
    if (!api) return
    setSnapCount(api.scrollSnapList().length)
    setSelected(api.selectedScrollSnap())
    const onSelect = () => setSelected(api.selectedScrollSnap())
    const onReInit = () => {
      setSnapCount(api.scrollSnapList().length)
      setSelected(api.selectedScrollSnap())
    }
    api.on('select', onSelect)
    api.on('reInit', onReInit)
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onReInit)
    }
  }, [api])

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="cyberpunk-surface px-6 py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="projects-heading"
          className="text-center font-['Bebas_Neue'] text-[clamp(2rem,5vw,4rem)] tracking-wider text-white"
        >
          {t('projects.title')}
        </h2>
        <p className="mt-3 text-center text-sm text-[rgba(255,255,255,0.55)]">
          {t('projects.subtitle')}
        </p>

        {projects.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[rgba(255,255,255,0.55)]">
            {t('projects.empty')}
          </p>
        ) : (
          <>
            <div className="px-12">
              <Carousel setApi={setApi} opts={{ align: 'start' }} className="mt-12">
                <CarouselContent>
                  {projects.map((project, index) => (
                    <CarouselItem
                      key={project._id}
                      className="basis-full sm:basis-1/2 lg:basis-1/3"
                    >
                      <ProjectCard project={project} lang={lang} accentIndex={index} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="border-electric-blue text-electric-blue" />
                <CarouselNext className="border-electric-blue text-electric-blue" />
              </Carousel>
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: snapCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 w-2 rounded-full transition ${
                    index === selected ? 'bg-electric-blue' : 'bg-[rgba(255,255,255,0.2)]'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
