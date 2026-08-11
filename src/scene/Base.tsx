import { BASE_HEIGHT, BASE_RADIUS } from "./constants";

export function Base() {
  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[BASE_RADIUS, BASE_RADIUS * 1.05, BASE_HEIGHT, 48]} />
      <meshStandardMaterial color="#8a8a8f" metalness={0.6} roughness={0.5} />
    </mesh>
  );
}
