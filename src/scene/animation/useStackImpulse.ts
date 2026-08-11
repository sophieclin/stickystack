import gsap from "gsap";
import { useCallback, useRef, type RefObject } from "react";
import { MathUtils, type Group } from "three";

/**
 * A small, bounded, self-correcting rotation wobble on the whole spike
 * assembly (base + spike + pile), triggered each time a note lands. Always
 * decays back to rotation 0 — this is a transient physical reflex, not a
 * navigation control (the spec is explicit that rotation must never be used
 * to browse the stack).
 */
export function useStackImpulse(groupRef: RefObject<Group | null>) {
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  return useCallback(() => {
    const group = groupRef.current;
    if (!group) return;

    tweenRef.current?.kill();
    const kick = MathUtils.degToRad((Math.random() - 0.5) * 2 * 7);
    group.rotation.y = kick;
    tweenRef.current = gsap.to(group.rotation, {
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.35)",
    });
  }, [groupRef]);
}
