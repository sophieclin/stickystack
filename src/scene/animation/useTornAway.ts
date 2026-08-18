import gsap from "gsap";
import { useLayoutEffect, type RefObject } from "react";
import { Vector3, type Group, type Quaternion } from "three";

/**
 * Plays once when `active` becomes true: a quick shake (selling the item
 * being gripped), then a pull-away-and-shrink along an outward direction,
 * like it's being torn off the spike (or popped out of the jar).
 *
 * `outward` defaults to the note's own fan-rotation direction (the original
 * spike behavior); pass an explicit vector (e.g. straight up) for items with
 * no meaningful rotation-derived direction, like stars in a jar.
 */
export function useTornAway({
  groupRef,
  active,
  finalPosition,
  finalQuaternion,
  finalScale,
  outward: outwardOverride,
  onComplete,
}: {
  groupRef: RefObject<Group | null>;
  active: boolean;
  finalPosition: Vector3;
  finalQuaternion: Quaternion;
  finalScale: number;
  outward?: Vector3;
  onComplete: () => void;
}) {
  useLayoutEffect(() => {
    if (!active) return;
    const group = groupRef.current;
    if (!group) return;

    group.position.copy(finalPosition);
    group.quaternion.copy(finalQuaternion);
    group.scale.setScalar(finalScale);

    const outward =
      outwardOverride ?? new Vector3(1, 0, 0).applyQuaternion(finalQuaternion).setY(0).normalize();

    const timeline = gsap.timeline({ onComplete });
    timeline
      .to(group.rotation, {
        z: "+=0.05",
        duration: 0.05,
        yoyo: true,
        repeat: 3,
        ease: "power1.inOut",
      })
      .to(
        group.position,
        {
          x: finalPosition.x + outward.x * 0.55,
          y: finalPosition.y + 0.4,
          z: finalPosition.z + outward.z * 0.55,
          duration: 0.4,
          ease: "power3.in",
        },
        "-=0.02",
      )
      .to(group.scale, { x: 0, y: 0, z: 0, duration: 0.32, ease: "power2.in" }, "<");

    return () => {
      timeline.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, groupRef]);
}
