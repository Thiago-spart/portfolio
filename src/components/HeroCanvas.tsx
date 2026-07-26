// src/components/HeroCanvas.tsx
import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import HeroModel from "./HeroModel";

export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative h-[50dvh] w-full lg:h-[70dvh]">
      <Canvas
        frameloop={visible ? "always" : "never"}
        camera={{ fov: 45, position: [0, 0, 5.5] }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting — lagoon teal key + palm green fill, matching the
            hero background's glow colors */}
        <ambientLight intensity={0.15} />
        <pointLight position={[-4, 4, 3]} color="#60d7cf" intensity={2} />
        <pointLight position={[4, -2, -3]} color="#6ec89a" intensity={1.2} />

        <Suspense fallback={null}>
          <HeroModel />
          <Environment
            preset="city"
            environmentIntensity={0.4}
            background={false}
          />
        </Suspense>

        <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.2}
            luminanceSmoothing={0.3}
            intensity={1.2}
          />
        </EffectComposer>
      </Canvas>

      <p className="absolute bottom-2 right-3 text-[10px] text-[var(--muted-gray,#5a6a7a)] opacity-60">
        <a
          href="https://skfb.ly/6WXIs"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-100"
        >
          "Looking Glass Hologram Concept 3"
        </a>{" "}
        by shinymagic is licensed under{" "}
        <a
          href="http://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-100"
        >
          CC BY 4.0
        </a>
      </p>
    </div>
  );
}
