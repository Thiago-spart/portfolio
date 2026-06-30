// src/components/HeroModel.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type * as THREE from 'three'

interface Props {
  scrollProgress: number
}

export default function HeroModel({ scrollProgress }: Props) {
  const ref = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/living-things.glb')

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = scrollProgress * Math.PI * 2
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.05
  })

  return <primitive ref={ref} object={scene} scale={1.5} />
}

useGLTF.preload('/models/living-things.glb')
