import { CanvasTexture } from "three";

const SIZE = 128;

/**
 * A soft radial alpha ramp for the highlight glow: fully transparent at the
 * center (where the real note/star sits, since the glow copy is scaled up
 * and would otherwise cover its face) and near the glow copy's own outer
 * edge, with a soft bright ring in between — reads as light escaping around
 * the shape's border rather than a second, harder-edged shape sitting behind
 * it. Used as `alphaMap`, so brightness here (not canvas alpha) is what
 * drives visibility — Three.js reads alphaMap opacity from the texture's
 * green channel.
 */
function buildGlowRingTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
  gradient.addColorStop(0, "rgb(0, 0, 0)");
  gradient.addColorStop(0.72, "rgb(0, 0, 0)");
  gradient.addColorStop(0.85, "rgb(255, 255, 255)");
  gradient.addColorStop(1, "rgb(0, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const glowRingTexture = buildGlowRingTexture();
