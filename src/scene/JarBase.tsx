import { JAR_BASE_HEIGHT, JAR_BASE_RADIUS } from "./jarConstants";

export function JarBase() {
  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[JAR_BASE_RADIUS, JAR_BASE_RADIUS * 1.05, JAR_BASE_HEIGHT, 48]} />
      <meshStandardMaterial color="#6b4a33" roughness={0.7} metalness={0.05} />
    </mesh>
  );
}
