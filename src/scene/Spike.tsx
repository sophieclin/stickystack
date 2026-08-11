import { SPIKE_BOTTOM_RADIUS, SPIKE_HEIGHT, SPIKE_ORIGIN_Y, SPIKE_TOP_RADIUS } from "./constants";

export function Spike() {
  return (
    <mesh position={[0, SPIKE_ORIGIN_Y + SPIKE_HEIGHT / 2, 0]} castShadow>
      <cylinderGeometry args={[SPIKE_TOP_RADIUS, SPIKE_BOTTOM_RADIUS, SPIKE_HEIGHT, 24]} />
      <meshStandardMaterial color="#d8d8dc" metalness={0.9} roughness={0.28} />
    </mesh>
  );
}
