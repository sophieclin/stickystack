import { useEffect, useRef } from "react";

/**
 * Watches a block-level element against a thin trigger line at the
 * viewport's vertical center. Calls `onEnter` the first time the element
 * crosses that line scrolling down into it, and `onExit` the first time it
 * scrolls back out past the top (i.e. the user has scrolled past it, not
 * that it hasn't been reached yet — checked via `boundingClientRect.top`).
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
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
