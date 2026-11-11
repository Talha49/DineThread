/**
 * RouteBuilder
 *
 * Lays out a restaurant's categories as stops along a single transit-style
 * route instead of a stacked list. Pure layout math, no React/DOM - the
 * Subway Line Map component (components/public/layouts/SubwayMenu.jsx) is
 * just a renderer for whatever this produces.
 *
 * Each station gets:
 *   - index      position along the route (0..n-1)
 *   - radius     marker size, scaled by how many items the category holds
 *   - lane       a small vertical offset so the route curves like a real
 *                transit map instead of sitting on a flat line
 *   - isInterchange  true for categories that carry a disproportionate share
 *                    of the menu - rendered as a bigger "hub" station
 */
export class RouteBuilder {
    constructor(groupedItems = [], { laneAmplitude = 1 } = {}) {
        this.groupedItems = groupedItems || [];
        this.laneAmplitude = laneAmplitude;
    }

    build() {
        const counts = this.groupedItems.map((g) => g.items?.length || 0);
        const maxCount = Math.max(1, ...counts, 0);
        const interchangeThreshold = Math.max(4, maxCount * 0.6);

        return this.groupedItems.map((group, index) => {
            const count = group.items?.length || 0;
            const radius = 10 + (count / maxCount) * 14;

            // A sine wave gives the line a natural, gentle curve instead of a
            // row of evenly-spaced dots - same idea a real metro map uses to
            // keep a long line visually readable.
            const lane = Math.sin(index * 0.9) * this.laneAmplitude;

            return {
                id: group._id,
                name: group.name,
                emoji: group.emoji,
                items: group.items || [],
                index,
                radius: Math.round(radius),
                lane,
                isInterchange: count >= interchangeThreshold,
            };
        });
    }
}
