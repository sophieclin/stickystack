import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { PCFSoftShadowMap } from "three";
import type { Note, Week } from "../types/domain";
import { SpikeAssembly } from "./SpikeAssembly";

export function StackScene({
  notes,
  isLoading,
  weeksById,
  fontUrl,
  onCompleteNote,
}: {
  notes: Note[];
  isLoading: boolean;
  weeksById: Map<string, Week>;
  fontUrl: string;
  onCompleteNote: (id: string) => void;
}) {
  return (
    <Canvas
      shadows={{ type: PCFSoftShadowMap }}
      dpr={[1, 2]}
      camera={{ position: [0, 1.15, 2.5], fov: 32 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.55, 0)}
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
      <Environment preset="apartment" environmentIntensity={0.4} />
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.25} />
      </mesh>
      <SpikeAssembly
        notes={notes}
        isLoading={isLoading}
        weeksById={weeksById}
        fontUrl={fontUrl}
        onCompleteNote={onCompleteNote}
      />
    </Canvas>
  );
}
