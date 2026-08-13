import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

// One plank's tile: narrow and tall so grain runs along the board's length,
// not a square that would crosshatch when repeated in both directions.
const TILE_WIDTH = 96;
const TILE_HEIGHT = 512;
const REPEAT_X = 14;
const REPEAT_Y = 4;

/**
 * Procedural wood-plank texture for the desk the spike sits on, drawn once to
 * a canvas rather than fetched — keeps the scene free of external asset
 * requests. Built once at module scope and shared, since the desk is a
 * single fixed surface.
 */
function buildWoodTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TILE_WIDTH;
  canvas.height = TILE_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Slight per-plank tint variance (seeded per module load, fine since this is decorative).
  const tint = Math.random() * 14 - 7;
  ctx.fillStyle = `rgb(${185 + tint}, ${138 + tint}, ${88 + tint})`;
  ctx.fillRect(0, 0, TILE_WIDTH, TILE_HEIGHT);

  // Grain streaks running along the board's length (vertical), gently wavering in x.
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * TILE_WIDTH;
    const amplitude = 2 + Math.random() * 4;
    const freq = 0.01 + Math.random() * 0.015;
    const phase = Math.random() * Math.PI * 2;
    const dark = Math.random() > 0.4;
    ctx.strokeStyle = dark ? "rgba(80,48,24,0.14)" : "rgba(220,185,140,0.12)";
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.beginPath();
    for (let y = 0; y <= TILE_HEIGHT; y += 8) {
      const xx = x + Math.sin(y * freq + phase) * amplitude;
      if (y === 0) ctx.moveTo(xx, y);
      else ctx.lineTo(xx, y);
    }
    ctx.stroke();
  }

  // A few short darker flecks/knots for texture variation.
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = "rgba(70,42,20,0.1)";
    const x = Math.random() * TILE_WIDTH;
    const y = Math.random() * TILE_HEIGHT;
    ctx.beginPath();
    ctx.ellipse(x, y, 2 + Math.random() * 3, 6 + Math.random() * 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Board seam down each edge.
  ctx.strokeStyle = "rgba(50,29,14,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(1, TILE_HEIGHT);
  ctx.moveTo(TILE_WIDTH - 1, 0);
  ctx.lineTo(TILE_WIDTH - 1, TILE_HEIGHT);
  ctx.stroke();

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.repeat.set(REPEAT_X, REPEAT_Y);
  return texture;
}

export const woodTexture = buildWoodTexture();
