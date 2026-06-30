// src/components/HeroCanvas.tsx
import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import HeroModel from './HeroModel'

interface Props {
  scrollProgress: number
}

export default function HeroCanvas({ scrollProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative h-[50dvh] w-full lg:h-[70dvh]">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        camera={{ fov: 45, position: [0, 1, 5] }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <pointLight position={[-4, 4, 3]} color="#00aaff" intensity={2} />
        <pointLight position={[4, -2, -3]} color="#7b2fff" intensity={1.2} />

        <Suspense fallback={null}>
          <HeroModel scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>

      <p className="absolute bottom-2 right-3 text-[10px] text-[var(--muted-gray,#5a6a7a)] opacity-60">
        <a href="https://skfb.ly/6TTyx" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">
          "LIVING THINGS"
        </a>{' '}
        by luc1906 is licensed under{' '}
        <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">
          CC BY 4.0
        </a>
      </p>
    </div>
  )
}
