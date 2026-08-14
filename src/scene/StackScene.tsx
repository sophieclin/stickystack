import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { PCFShadowMap } from "three";
import type { Note, Week } from "../types/domain";
import { SpikeAssembly } from "./SpikeAssembly";
import { woodTexture } from "./textures/woodTexture";

const ORBIT_TARGET: [number, number, number] = [0, 0.46, 0];

export function StackScene({
  notes,
  isLoading,
  weeksById,
  fontUrl,
  autoRotate = false,
  interactive = true,
}: {
  notes: Note[];
  isLoading: boolean;
  weeksById: Map<string, Week>;
  fontUrl: string;
  autoRotate?: boolean;
  /**
   * Disable when the canvas fills the viewport as a pinned scroll backdrop.
   * OrbitControls sets `touchAction: "none"` on the canvas as soon as it
   * connects (regardless of enableZoom/enablePan/enableRotate), which
   * blocks the browser's normal wheel-scroll over that element — not just
   * drag-to-rotate. The only real fix is to not mount OrbitControls at all
   * for a passive backdrop instance.
   */
  interactive?: boolean;
}) {
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      dpr={[1, 2]}
      camera={{ position: [0, 1.02, 2.55], fov: 33 }}
      onCreated={({ camera }) => camera.lookAt(...ORBIT_TARGET)}
    >
      <color attach="background" args={["#efece5"]} />
      <hemisphereLight args={["#fff7ec", "#4a4a55", 0.9]} />
      <directionalLight
        position={[0.9, 1.6, 0.9]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={4}
        shadow-camera-left={-0.7}
        shadow-camera-right={0.7}
        shadow-camera-top={0.7}
        shadow-camera-bottom={-0.7}
      />
      <Suspense fallback={null}>
        <Environment preset="apartment" environmentIntensity={0.4} />
      </Suspense>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={woodTexture} roughness={0.85} metalness={0} />
      </mesh>
      <SpikeAssembly notes={notes} isLoading={isLoading} weeksById={weeksById} fontUrl={fontUrl} />
      {interactive && (
        <OrbitControls
          target={ORBIT_TARGET}
          enablePan={false}
          minDistance={1.4}
          maxDistance={4}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.08}
          autoRotate={autoRotate}
          autoRotateSpeed={1.1}
        />
      )}
    </Canvas>
  );
}
