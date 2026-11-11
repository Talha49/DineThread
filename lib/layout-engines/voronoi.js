import { Delaunay } from "d3-delaunay";

/**
 * buildVoronoiMosaic
 *
 * Tessellates a list of items into an organic, non-rectangular mosaic
 * instead of a grid: seed points -> Delaunay triangulation -> Voronoi dual,
 * refined with a couple of Lloyd relaxation passes (recentring each seed on
 * its own cell's centroid and re-triangulating) so cells come out evenly
 * sized rather than the spiky diagram raw random points produce.
 *
 * Seeded deterministically from the items' own ids, so a given menu's
 * mosaic looks the same on every load instead of reshuffling on refresh.
 *
 * Returns, per item: its cell polygon, centroid (for placing a label), and
 * a ready-to-use CSS clip-path percentage string.
 */
export function buildVoronoiMosaic(items, { width = 1000, height = 600, relaxIterations = 2, seed } = {}) {
    if (!items || items.length === 0) return [];

    const n = items.length;
    const rand = mulberry32(seed ?? hashItems(items));

    let points = Array.from({ length: n }, () => [rand() * width, rand() * height]);
    let voronoi;

    for (let iter = 0; iter <= relaxIterations; iter++) {
        const delaunay = Delaunay.from(points);
        voronoi = delaunay.voronoi([0, 0, width, height]);

        if (iter < relaxIterations) {
            points = points.map((point, i) => {
                const cell = voronoi.cellPolygon(i);
                return cell ? centroid(cell) : point;
            });
        }
    }

    return items.map((item, i) => {
        const polygon = voronoi.cellPolygon(i) || [];
        const [cx, cy] = polygon.length ? centroid(polygon) : points[i];
        return {
            item,
            polygon,
            centroid: { xPct: (cx / width) * 100, yPct: (cy / height) * 100 },
            clipPath: polygonToClipPath(polygon, width, height),
        };
    });
}

function centroid(polygon) {
    let x = 0;
    let y = 0;
    for (const [px, py] of polygon) {
        x += px;
        y += py;
    }
    return [x / polygon.length, y / polygon.length];
}

function polygonToClipPath(polygon, width, height) {
    if (!polygon || polygon.length === 0) return "none";
    const points = polygon.map(
        ([x, y]) => `${((x / width) * 100).toFixed(2)}% ${((y / height) * 100).toFixed(2)}%`
    );
    return `polygon(${points.join(", ")})`;
}

// Tiny deterministic PRNG (mulberry32) - good enough for layout seeding,
// avoids pulling in a random-number library for one function.
function mulberry32(seed) {
    let a = seed | 0;
    return function () {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hashItems(items) {
    const str = items.map((i) => i._id).join("");
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return hash || 1;
}
