import { useEffect, useRef } from "react";

// Trigger line sits at 60% down the viewport rather than dead center: since
// the "spiked" phase begins when the block's bottom crosses this line,
// moving it down shrinks the dead scroll space between "note has spiked"
// and "block ends" (most visible after the last point, where nothing fills
// that gap).
const TRIGGER_LINE_PERCENT = 60;

type Phase = 0 | 1 | 2; // 0 = before the block, 1 = typing/idle, 2 = spiked

/**
 * Tracks a block-level element against a trigger line 60% down the viewport
 * as a 3-phase state machine — before -> typing -> spiked — driven directly
 * by scroll position every frame, rather than one-shot IntersectionObserver
 * crossings. That makes it inherently bidirectional: scrolling back up
 * fires the reverse callbacks and walks back down through the same phases,
 * instead of getting stuck wherever the forward pass last left it.
 */
export function useScrollPointTrigger<T extends HTMLElement>({
  onEnter,
  onExit,
  onReverseExit,
  onReverseEnter,
}: {
  /** Phase 0 -> 1: block's top has reached the trigger line. Start typing. */
  onEnter: () => void;
  /** Phase 1 -> 2: block's bottom has passed the trigger line. Note spikes. */
  onExit: () => void;
  /** Phase 2 -> 1, scrolling back up: un-spike the note. */
  onReverseExit: () => void;
  /** Phase 1 -> 0, scrolling back up: untype back to empty. */
  onReverseEnter: () => void;
}) {
  const ref = useRef<T>(null);
  const phaseRef = useRef<Phase>(0);
  // Always-current callbacks, read from a ref inside the effect so the
  // scroll listener never needs to be torn down and reattached just because
  // a callback closure identity changed on re-render (same pattern as the
  // GSAP animation hooks — see scene/animation/*).
  const callbacksRef = useRef({ onEnter, onExit, onReverseExit, onReverseEnter });
  callbacksRef.current = { onEnter, onExit, onReverseExit, onReverseEnter };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function computePhase(): Phase {
      const rect = el!.getBoundingClientRect();
      const lineY = (window.innerHeight * TRIGGER_LINE_PERCENT) / 100;
      if (rect.top > lineY) return 0;
      if (rect.bottom <= lineY) return 2;
      return 1;
    }

    function applyPhase(target: Phase) {
      while (phaseRef.current !== target) {
        if (target > phaseRef.current) {
          phaseRef.current = (phaseRef.current + 1) as Phase;
          if (phaseRef.current === 1) callbacksRef.current.onEnter();
          else callbacksRef.current.onExit();
        } else {
          phaseRef.current = (phaseRef.current - 1) as Phase;
          if (phaseRef.current === 1) callbacksRef.current.onReverseExit();
          else callbacksRef.current.onReverseEnter();
        }
      }
    }

    let ticking = false;
    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        applyPhase(computePhase());
        ticking = false;
      });
    }

    applyPhase(computePhase()); // sync immediately in case the page loaded already scrolled past
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
