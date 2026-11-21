import { useEffect, useRef, useState } from "react";

/**
 * Tracks an element's own rendered width via ResizeObserver.
 *
 * This exists because the layout needs to respond to how much space a
 * component ACTUALLY has - which depends on things like whether the app
 * sidebar is open - not to the raw browser viewport width. CSS container
 * queries are the native way to do this, but this project's Tailwind v4
 * build isn't generating working container-query rules (verified: every
 * `@size:` variant compiles to an empty, unwrapped selector), so this
 * hook is the reliable stand-in until that's sorted out upstream.
 *
 * @param {number} fallback - width to report before the first real
 *   measurement lands (avoids a flash of the "narrow" layout on mount).
 * @returns {[React.RefObject, number]} [ref to attach, current width in px]
 */
export function useElementWidth(fallback = 0) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
