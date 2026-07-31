import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

// Not yet in TypeScript's DOM lib; supported by Chromium/Firefox behind
// navigator.connection.
interface NetworkInformation extends EventTarget {
  saveData?: boolean
}

interface ProjectHeroProps {
  videoSrc?: string
  posterSrc?: string
  bgImageSrc?: string
  ambientVideoSrc?: string
  title: string
  date: string
  scrollToExpand: string
  children?: ReactNode
}

// Wheel deltas are continuous; a key press is discrete. Treat one press as a
// chunky-but-not-instant wheel notch so ~5 presses fully expand the media.
const KEYBOARD_DELTA_Y = 250
const EXPAND_KEYS = [' ', 'Spacebar', 'PageDown', 'ArrowDown']
const COLLAPSE_KEYS = ['PageUp', 'ArrowUp']

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el || typeof el.tagName !== 'string') return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

export default function ProjectHero({
  videoSrc,
  posterSrc,
  bgImageSrc,
  ambientVideoSrc,
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
  const [saveData, setSaveData] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasStartedPlayback = useRef(false)

  // The ambient backdrop video must never be part of the SSR/first-paint
  // output: gating it behind a post-hydration effect guarantees the server
  // HTML (and initial browser fetch) always ships the lightweight poster
  // image first, with the video swapping in only after mount on the client.
  useEffect(() => {
    setMounted(true)
  }, [])

  // Users who asked for reduced motion get the expanded end-state immediately
  // and keep native document scrolling — no scroll-jacking at all.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setReducedMotion(true)
    setScrollProgress(1)
    setMediaFullyExpanded(true)
    setShowContent(true)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const advanceProgress = (scrollDelta: number) => {
      const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1)
      setScrollProgress(newProgress)

      if (newProgress >= 1) {
        setMediaFullyExpanded(true)
        setShowContent(true)
      } else if (newProgress < 0.75) {
        setShowContent(false)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        e.preventDefault()
      } else if (!mediaFullyExpanded) {
        e.preventDefault()
        advanceProgress(e.deltaY * 0.0009)
      }
    }

    // Keyboard scrolling (Space/PageDown/Arrows) and scrollbar drags only fire
    // plain `scroll` events, which handleScroll resets to 0 — without this the
    // hero is a hard keyboard trap and nothing below it is ever reachable.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(e.target)) return

      if (!mediaFullyExpanded && EXPAND_KEYS.includes(e.key)) {
        e.preventDefault()
        advanceProgress(KEYBOARD_DELTA_Y * 0.0009)
      } else if (mediaFullyExpanded && COLLAPSE_KEYS.includes(e.key) && window.scrollY <= 5) {
        e.preventDefault()
        setMediaFullyExpanded(false)
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
        advanceProgress(deltaY * scrollFactor)
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
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [scrollProgress, mediaFullyExpanded, touchStartY, reducedMotion])

  // Don't autoplay: the video is an untranscoded Sanity asset. Only start it
  // once the user has actually engaged with the hero.
  useEffect(() => {
    if (scrollProgress <= 0 || hasStartedPlayback.current || !videoRef.current) return
    hasStartedPlayback.current = true
    void Promise.resolve(videoRef.current.play()).catch(() => {})
  }, [scrollProgress])

  useEffect(() => {
    const checkIfMobile = () => setIsMobileState(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Respect the browser's Save-Data hint: skip the heavy ambient backdrop
  // video for users who've asked their browser to conserve bandwidth.
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
    if (!connection) return
    const updateSaveData = () => setSaveData(Boolean(connection.saveData))
    updateSaveData()
    connection.addEventListener?.('change', updateSaveData)
    return () => connection.removeEventListener?.('change', updateSaveData)
  }, [])

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250)
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400)
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150)

  const firstWord = title.split(' ')[0]
  const restOfTitle = title.split(' ').slice(1).join(' ')
  const showAmbientVideo = Boolean(ambientVideoSrc) && mounted && !reducedMotion && !isMobileState && !saveData

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
            {showAmbientVideo ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                poster={bgImageSrc}
                src={ambientVideoSrc}
                className="h-full w-full object-cover"
              />
            ) : bgImageSrc ? (
              <img src={bgImageSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                data-testid="project-hero-bg-fallback"
                className="cyberpunk-surface h-full w-full"
              />
            )}
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
                    ref={videoRef}
                    data-testid="project-hero-video"
                    src={videoSrc}
                    poster={posterSrc}
                    preload="metadata"
                    muted
                    loop
                    playsInline
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                    className="h-full w-full object-cover"
                  />
                ) : bgImageSrc ? (
                  <img
                    data-testid="project-hero-image"
                    src={bgImageSrc}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    data-testid="project-hero-media-fallback"
                    className="cyberpunk-surface h-full w-full"
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
              // Invisible but still in the DOM — keep its links out of the tab
              // order until the hero has actually expanded.
              inert={!showContent}
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
