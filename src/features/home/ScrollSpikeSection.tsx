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

  return (
    <section className="scroll-spike">
      <div className="scroll-spike-bg">
        <StackScene notes={notes} isLoading={false} weeksById={SCROLL_WEEKS_BY_ID} fontUrl={DEMO_FONT_URL} />
      </div>
      <div className="scroll-spike-points">
        {SCROLL_STORY_POINTS.map((point) => (
          <ScrollStoryPoint key={point.id} point={point} onReveal={handleReveal} />
        ))}
      </div>
    </section>
  );
}
