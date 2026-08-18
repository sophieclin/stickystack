import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { PCFShadowMap } from "three";
import type { Note, Week } from "../types/domain";
import { JarAssembly } from "./JarAssembly";
import { JAR_HEIGHT, JAR_ORIGIN_Y } from "./jarConstants";
import { woodTexture } from "./textures/woodTexture";

const ORBIT_TARGET: [number, number, number] = [0, JAR_ORIGIN_Y + JAR_HEIGHT * 0.4, 0];

export function JarScene({
  notes,
  isLoading,
  weeksById,
  autoRotate = false,
  interactive = true,
}: {
  notes: Note[];
  isLoading: boolean;
  weeksById: Map<string, Week>;
  autoRotate?: boolean;
  /** See StackScene's identical prop for why this exists (OrbitControls blocks page scroll). */
  interactive?: boolean;
}) {
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      dpr={[1, 2]}
      camera={{ position: [0, 0.75, 2.2], fov: 33 }}
      onCreated={({ camera }) => camera.lookAt(...ORBIT_TARGET)}
    >
      <color attach="background" args={["#171d42"]} />
      <hemisphereLight args={["#c8d4ff", "#232860", 0.9]} />
      <directionalLight
        position={[0.9, 1.6, 0.9]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={4}
        shadow-camera-left={-0.6}
        shadow-camera-right={0.6}
        shadow-camera-top={0.6}
        shadow-camera-bottom={-0.6}
      />
      <Suspense fallback={null}>
        <Environment preset="night" environmentIntensity={0.5} />
      </Suspense>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={woodTexture} roughness={0.85} metalness={0} />
      </mesh>
      <JarAssembly notes={notes} isLoading={isLoading} weeksById={weeksById} />
      {interactive && (
        <OrbitControls
          target={ORBIT_TARGET}
          enablePan={false}
          minDistance={1.2}
          maxDistance={3.5}
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
