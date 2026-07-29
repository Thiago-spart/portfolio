import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ProjectHeroProps {
  videoSrc?: string
  posterSrc?: string
  bgImageSrc: string
  title: string
  date: string
  scrollToExpand: string
  children?: ReactNode
}

export default function ProjectHero({
  videoSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  children,
}: ProjectHeroProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isMobileState, setIsMobileState] = useState(false)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        e.preventDefault()
      } else if (!mediaFullyExpanded) {
        e.preventDefault()
        const scrollDelta = e.deltaY * 0.0009
        const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1)
        setScrollProgress(newProgress)

        if (newProgress >= 1) {
          setMediaFullyExpanded(true)
          setShowContent(true)
        } else if (newProgress < 0.75) {
          setShowContent(false)
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return

      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        e.preventDefault()
      } else if (!mediaFullyExpanded) {
        e.preventDefault()
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005
        const scrollDelta = deltaY * scrollFactor
        const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1)
        setScrollProgress(newProgress)

        if (newProgress >= 1) {
          setMediaFullyExpanded(true)
          setShowContent(true)
        } else if (newProgress < 0.75) {
          setShowContent(false)
        }

        setTouchStartY(touchY)
      }
    }

    const handleTouchEnd = () => {
      setTouchStartY(0)
    }

    const handleScroll = () => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [scrollProgress, mediaFullyExpanded, touchStartY])

  useEffect(() => {
    const checkIfMobile = () => setIsMobileState(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250)
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400)
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150)

  const firstWord = title.split(' ')[0]
  const restOfTitle = title.split(' ').slice(1).join(' ')

  return (
    <div className="overflow-x-hidden">
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-start">
        <div className="relative flex min-h-[100dvh] w-full flex-col items-center">
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <img src={bgImageSrc} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(5,5,8,0.6)]" />
          </motion.div>

          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-start px-6">
            <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center">
              <div
                data-testid="project-hero-media"
                className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0 0 50px rgba(0,170,255,0.25)',
                }}
              >
                {videoSrc ? (
                  <video
                    data-testid="project-hero-video"
                    src={videoSrc}
                    poster={posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    data-testid="project-hero-image"
                    src={bgImageSrc}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                )}
                <motion.div
                  className="absolute inset-0 bg-[rgba(5,5,8,0.3)]"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              <div className="relative z-10 flex w-full flex-col items-center justify-center gap-4 text-center">
                <motion.h2
                  className="font-['Bebas_Neue'] text-4xl tracking-wider text-white md:text-5xl lg:text-6xl"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className="text-center font-['Bebas_Neue'] text-4xl tracking-wider text-white md:text-5xl lg:text-6xl"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h2>
                <p
                  className="text-sm text-[var(--electric-blue,#00aaff)]"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {date}
                </p>
                <p
                  className="text-sm font-medium text-[var(--electric-blue,#00aaff)]"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {scrollToExpand}
                </p>
              </div>
            </div>

            <motion.section
              className="flex w-full flex-col px-2 py-10 md:px-8 lg:py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  )
}
