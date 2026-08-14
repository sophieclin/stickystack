import { useEffect, useRef, useState } from "react";
import type { ScrollStoryPoint } from "./scrollStoryData";
import { useScrollPointTrigger } from "./useScrollPointTrigger";

const MS_PER_CHAR = 18;
// How often we recompute progress. Deliberately coarser than MS_PER_CHAR:
// progress is derived from elapsed wall-clock time (not a per-tick counter),
// so a delayed or dropped tick just reveals a bigger jump next time rather
// than permanently losing time — robust to throttling under heavy load
// (this page runs two live WebGL canvases at once).
const POLL_MS = 50;

function fullText(point: ScrollStoryPoint): string {
  return [point.heading, ...point.bullets.map((b) => `• ${b}`)].join("\n");
}

export function ScrollStoryPoint({
  point,
  index,
  onReveal,
}: {
  point: ScrollStoryPoint;
  index: number;
  onReveal: (id: string) => void;
}) {
  const side = index % 2 === 0 ? "left" : "right";
  const [shown, setShown] = useState(0);
  const text = fullText(point);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ref = useScrollPointTrigger<HTMLDivElement>({
    onEnter: () => {
      const startedAt = performance.now();
      intervalRef.current = setInterval(() => {
        const elapsed = performance.now() - startedAt;
        const target = Math.min(text.length, Math.floor(elapsed / MS_PER_CHAR));
        setShown((prev) => (prev === target ? prev : target));
        if (target >= text.length && intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }, POLL_MS);
    },
    onExit: () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setShown(text.length);
      onReveal(point.id);
    },
  });

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const [headingPart, ...bulletParts] = text.slice(0, shown).split("\n");
  const typingDone = shown >= text.length;

  return (
    <div className="scroll-point" ref={ref}>
      <div className={`scroll-note-sticky scroll-note-sticky--${side}`}>
        <div className={`scroll-note-card scroll-note-card--${side}`} style={{ backgroundColor: point.color }}>
          <p className="scroll-note-heading">
            {headingPart}
            {!typingDone && <span className="scroll-note-cursor" />}
          </p>
          <ul className="scroll-note-bullets">
            {bulletParts.map((b, i) => (
              <li key={i}>{b.replace(/^•\s*/, "")}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
