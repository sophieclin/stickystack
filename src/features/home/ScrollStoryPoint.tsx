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
  onUnreveal,
}: {
  point: ScrollStoryPoint;
  index: number;
  onReveal: (id: string) => void;
  onUnreveal: (id: string) => void;
}) {
  const side = index % 2 === 0 ? "left" : "right";
  const [shown, setShown] = useState(0);
  const text = fullText(point);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopTyping() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const ref = useScrollPointTrigger<HTMLDivElement>({
    onEnter: () => {
      stopTyping();
      setShown(0);
      const startedAt = performance.now();
      intervalRef.current = setInterval(() => {
        const elapsed = performance.now() - startedAt;
        const target = Math.min(text.length, Math.floor(elapsed / MS_PER_CHAR));
        setShown((prev) => (prev === target ? prev : target));
        if (target >= text.length) stopTyping();
      }, POLL_MS);
    },
    onExit: () => {
      stopTyping();
      setShown(text.length);
      onReveal(point.id);
    },
    onReverseExit: () => {
      onUnreveal(point.id);
    },
    onReverseEnter: () => {
      stopTyping();
      const startedAt = performance.now();
      intervalRef.current = setInterval(() => {
        const elapsed = performance.now() - startedAt;
        const target = Math.max(0, text.length - Math.floor(elapsed / MS_PER_CHAR));
        setShown((prev) => (prev === target ? prev : target));
        if (target <= 0) stopTyping();
      }, POLL_MS);
    },
  });

  useEffect(() => stopTyping, []);

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
