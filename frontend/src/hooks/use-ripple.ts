import { useCallback, useRef, useState, type PointerEvent } from 'react';

export interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

/**
 * Material-style press ripple. Attach `addRipple` to a pointer-down handler
 * and drop a `.ripple` element per entry; remove each via `removeRipple` on
 * animation end (no timers to leak).
 */
export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const addRipple = useCallback((e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    setRipples((prev) => [
      ...prev,
      {
        id: nextId.current++,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        size,
      },
    ]);
  }, []);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
  }, []);

  return { ripples, addRipple, removeRipple };
}
