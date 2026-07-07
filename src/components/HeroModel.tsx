// src/components/HeroModel.tsx
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// Fraction of the visible viewport (the smaller of its width/height, in
// world units) the model's longest axis should fill — leaves a margin so it
// never touches the canvas edges, at any aspect ratio.
const FIT_RATIO = 0.85;

export default function HeroModel() {
  // Rotation/bob apply to this outer group, pivoting on the world origin —
  // `scene` gets re-centered onto that same origin below, so the two never
  // fight over what "center" means.
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(
    "/models/looking_glass_hologram_concept_3.glb",
  );
  const { actions } = useAnimations(animations, ref);
  const viewportWidth = useThree((state) => state.viewport.width);
  const viewportHeight = useThree((state) => state.viewport.height);

  useEffect(() => {
    for (const action of Object.values(actions)) {
      action?.play();
    }
  }, [actions]);

  useEffect(() => {
    // Reset first so this stays idempotent — StrictMode (and HMR) can invoke
    // this effect more than once, and re-measuring an already-scaled scene
    // would compound the fit instead of just re-applying it.
    scene.scale.setScalar(1);
    scene.position.set(0, 0, 0);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const targetSize = Math.min(viewportWidth, viewportHeight) * FIT_RATIO;
      const scale = targetSize / maxDim;
      scene.scale.setScalar(scale);
      scene.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale,
      );
    }
  }, [scene, viewportWidth, viewportHeight]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.degToRad(15);
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.05;
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/looking_glass_hologram_concept_3.glb");
