import { useEffect, useRef } from "react";

// Trigger line sits at 60% down the viewport rather than dead center: since
// exit fires when the block's bottom crosses this line, moving it down
// shrinks the dead scroll space between "note has spiked" and "block ends"
// (most visible after the last point, where nothing fills that gap).
const TRIGGER_LINE_PERCENT = 60;

/**
 * Watches a block-level element against a thin trigger line partway down
 * the viewport. Calls `onEnter` the first time the element crosses that
 * line scrolling down into it, and `onExit` the first time it scrolls back
 * out past the top (i.e. the user has scrolled past it, not that it hasn't
 * been reached yet — checked via `boundingClientRect.top`).
 */
export function useScrollPointTrigger<T extends HTMLElement>({
  onEnter,
  onExit,
}: {
  onEnter: () => void;
  onExit: () => void;
}) {
  const ref = useRef<T>(null);
  const hasEntered = useRef(false);
  const hasExited = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasEntered.current) {
            hasEntered.current = true;
            onEnter();
          }
          return;
        }
        if (hasEntered.current && !hasExited.current && entry.boundingClientRect.top < 0) {
          hasExited.current = true;
          onExit();
        }
      },
      {
        rootMargin: `-${TRIGGER_LINE_PERCENT}% 0px -${100 - TRIGGER_LINE_PERCENT}% 0px`,
        threshold: 0,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
