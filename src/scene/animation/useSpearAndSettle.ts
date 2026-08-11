import gsap from "gsap";
import { useLayoutEffect, type RefObject } from "react";
import type { Group, Quaternion, Vector3 } from "three";

/**
 * Plays once when `active` becomes true: the note drops from above the
 * current pile and settles into its final seeded position, with the
 * settle tween's elastic ease providing the landing bounce/wobble.
 */
export function useSpearAndSettle({
  groupRef,
  active,
  finalPosition,
  finalQuaternion,
  onLanded,
  onComplete,
}: {
  groupRef: RefObject<Group | null>;
  active: boolean;
  finalPosition: Vector3;
  finalQuaternion: Quaternion;
  onLanded?: () => void;
  onComplete: () => void;
}) {
  useLayoutEffect(() => {
    if (!active) return;
    const group = groupRef.current;
    if (!group) return;

    group.quaternion.copy(finalQuaternion);
    group.scale.setScalar(1);
    group.position.set(finalPosition.x, finalPosition.y + 0.9, finalPosition.z);

    const timeline = gsap.timeline({ onComplete });
    timeline
      .to(group.position, {
        y: finalPosition.y + 0.05,
        duration: 0.26,
        ease: "power2.in",
        onStart: () => onLanded?.(),
      })
      .to(group.position, {
        y: finalPosition.y,
        duration: 0.42,
        ease: "elastic.out(1, 0.5)",
      });

    return () => {
      timeline.kill();
    };
    // Deliberately keyed only on `active`/`groupRef`: this should replay once per
    // entering phase, not on every render or benign identity change of the callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, groupRef]);
}
