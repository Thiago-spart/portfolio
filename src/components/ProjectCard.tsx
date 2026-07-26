import type { Lang, SanityProject } from '#/types/sanity'

interface ProjectCardProps {
  project: SanityProject
  lang: Lang
  accentIndex: number
}

const ACCENT_COLORS = ['#00aaff', '#7b2fff', '#ff6a00']

export default function ProjectCard({ project, lang, accentIndex }: ProjectCardProps) {
  const accent = ACCENT_COLORS[accentIndex % ACCENT_COLORS.length]
  const hasImage = Boolean(project.coverImageUrl)

  return (
    <div
      className="group relative h-72 w-full overflow-hidden rounded-2xl"
      style={
        !hasImage
          ? { border: `2px solid ${accent}`, boxShadow: `0 0 20px ${accent}33 inset` }
          : undefined
      }
    >
      {hasImage ? (
        <div
          data-testid="project-card-image"
          className="absolute inset-0 saturate-0 transition-all duration-500 group-hover:scale-110 group-hover:saturate-100"
          style={{
            backgroundImage: `url(${project.coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        <div data-testid="project-card-fallback" className="cyberpunk-surface absolute inset-0" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,8,0.9)] via-[rgba(5,5,8,0.3)] to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-5">
        <h3 className="glitch-flicker font-['Bebas_Neue'] text-2xl tracking-wide text-white transition-colors group-hover:text-electric-blue">
          {project.title[lang]}
        </h3>
        <p className="line-clamp-3 text-sm text-[rgba(255,255,255,0.75)]">
          {project.shortDescription[lang]}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-xs text-[rgba(255,255,255,0.75)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
