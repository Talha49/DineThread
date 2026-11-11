"use client";

/**
 * A grid whose column count is chosen from a measured pixel width (passed in
 * as `width`) rather than a Tailwind viewport breakpoint - see
 * hooks/use-element-width.js for why. `cols` maps a minimum width to a
 * column count, e.g. `{ base: 1, 384: 2, 512: 4 }` means "1 column below
 * 384px, 2 from 384px, 4 from 512px up." Any Tailwind classes for spacing
 * (gap-*, etc.) still work fine via `className`.
 */
export function ResponsiveGrid({ width, cols, className, children }) {
  const thresholds = Object.keys(cols)
    .filter((k) => k !== "base")
    .map(Number)
    .sort((a, b) => a - b);

  let columns = cols.base ?? 1;
  for (const t of thresholds) {
    if (width >= t) columns = cols[t];
  }

  return (
    <div
      className={className}
      style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}
