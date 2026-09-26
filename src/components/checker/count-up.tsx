"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * A number that runs up to its value. Starts from the last value shown, so a
 * slider change animates from where it was rather than from zero.
 */
export function CountUp({
  value,
  format,
  duration = 1.6,
  delay = 0,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const from = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        from.current = latest;
        setDisplay(latest);
      },
    });
    return () => controls.stop();
  }, [value, duration, delay, reduce]);

  return <span className={className}>{format(reduce ? value : display)}</span>;
}
