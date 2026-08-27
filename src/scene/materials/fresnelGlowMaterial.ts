import { AdditiveBlending, Color, ShaderMaterial } from "three";
import { HIGHLIGHT_GLOW_COLOR, HIGHLIGHT_GLOW_OPACITY } from "../constants";

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 glowColor;
  uniform float glowOpacity;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float facing = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 2.5);
    gl_FragColor = vec4(glowColor, fresnel * glowOpacity);
  }
`;

/**
 * A Fresnel/rim-light glow: brightness is driven by the angle between each
 * fragment's own surface normal and the camera, so it reads as light escaping
 * around a shape's silhouette from any viewing angle — unlike a scaled-up
 * duplicate rendered with a fixed technique (e.g. backface-only), which only
 * reads as a rim from the one angle that trick happens to work from.
 *
 * Built once at module scope and shared across every highlighted StarMesh,
 * since none of its inputs vary per-instance.
 */
export const fresnelGlowMaterial = new ShaderMaterial({
  uniforms: {
    glowColor: { value: new Color(HIGHLIGHT_GLOW_COLOR) },
    glowOpacity: { value: HIGHLIGHT_GLOW_OPACITY },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
});
