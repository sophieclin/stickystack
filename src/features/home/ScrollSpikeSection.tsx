import { useMemo, useState } from "react";
import { StackScene } from "../../scene/StackScene";
import { DEMO_FONT_URL } from "./demoStack";
import { pointToNote, SCROLL_STORY_POINTS, SCROLL_WEEKS_BY_ID } from "./scrollStoryData";
import { ScrollStoryPoint } from "./ScrollStoryPoint";

export function ScrollSpikeSection() {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const notes = useMemo(
    () =>
      SCROLL_STORY_POINTS.filter((p) => revealedIds.has(p.id)).map((p, i) => pointToNote(p, i)),
    [revealedIds],
  );

  function handleReveal(id: string) {
    setRevealedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  function handleUnreveal(id: string) {
    setRevealedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <section className="scroll-spike">
      <div className="scroll-spike-bg">
        <StackScene
          notes={notes}
          isLoading={false}
          weeksById={SCROLL_WEEKS_BY_ID}
          fontUrl={DEMO_FONT_URL}
          interactive={false}
        />
      </div>
      <div className="scroll-spike-points">
        {SCROLL_STORY_POINTS.map((point, index) => (
          <ScrollStoryPoint
            key={point.id}
            point={point}
            index={index}
            onReveal={handleReveal}
            onUnreveal={handleUnreveal}
          />
        ))}
        {/* Every point but the last gets its landing buffer for free: the
         * next 180vh point block stays pinned over it while its spear
         * animation finishes. The last point has no such block after it —
         * without this, its exit trigger fires just ~150px before the
         * divider curtain (.home-divider-line) starts covering the scene,
         * nowhere near enough scroll room for the animation to finish first. */}
        <div className="scroll-spike-tail-buffer" />
      </div>
    </section>
  );
}
