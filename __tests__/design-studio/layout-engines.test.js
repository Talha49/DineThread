/**
 * Layout Engines — Unit Tests
 *
 * Pure-logic tests for the algorithmic modules backing the new signature
 * layouts (Subway Line Map, Menu Deck, Voronoi Mosaic). These are
 * framework-free, so they're tested directly without rendering anything.
 */

import { RouteBuilder } from '@/lib/layout-engines/RouteBuilder';
import { SwipeDeck } from '@/lib/layout-engines/SwipeDeck';
import { buildVoronoiMosaic } from '@/lib/layout-engines/voronoi';

const groupedItems = [
    { _id: 'c1', name: 'Starters', emoji: '🥗', items: [{ _id: 'i1' }, { _id: 'i2' }] },
    { _id: 'c2', name: 'Mains', emoji: '🍝', items: [{ _id: 'i3' }, { _id: 'i4' }, { _id: 'i5' }, { _id: 'i6' }] },
    { _id: 'c3', name: 'Desserts', emoji: '🍰', items: [{ _id: 'i7' }] },
];

describe('RouteBuilder', () => {
    test('builds one station per category, in order', () => {
        const stations = new RouteBuilder(groupedItems).build();
        expect(stations).toHaveLength(3);
        expect(stations.map((s) => s.name)).toEqual(['Starters', 'Mains', 'Desserts']);
        expect(stations.map((s) => s.index)).toEqual([0, 1, 2]);
    });

    test('flags the category with disproportionately more items as an interchange', () => {
        const stations = new RouteBuilder(groupedItems).build();
        const mains = stations.find((s) => s.name === 'Mains');
        const desserts = stations.find((s) => s.name === 'Desserts');
        expect(mains.isInterchange).toBe(true);
        expect(desserts.isInterchange).toBe(false);
    });

    test('handles an empty menu without crashing', () => {
        expect(new RouteBuilder([]).build()).toEqual([]);
    });
});

describe('SwipeDeck', () => {
    const items = [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }];

    test('current is the front item and peek returns front-to-back order', () => {
        const deck = new SwipeDeck(items);
        expect(deck.current._id).toBe('a');
        expect(deck.peek(2).map((i) => i._id)).toEqual(['a', 'b']);
    });

    test('advance(1) rotates the front item to the back without losing any items', () => {
        const deck = new SwipeDeck(items).advance(1);
        expect(deck.current._id).toBe('b');
        expect(deck.items.map((i) => i._id)).toEqual(['b', 'c', 'a']);
        expect(deck.size).toBe(3);
    });

    test('advance(-1) undoes advance(1)', () => {
        const deck = new SwipeDeck(items).advance(1).advance(-1);
        expect(deck.items.map((i) => i._id)).toEqual(['a', 'b', 'c']);
    });

    test('is immutable - advance returns a new deck, original is untouched', () => {
        const deck = new SwipeDeck(items);
        const next = deck.advance(1);
        expect(deck.current._id).toBe('a');
        expect(next).not.toBe(deck);
    });

    test('looping through a full rotation returns to the start', () => {
        let deck = new SwipeDeck(items);
        for (let i = 0; i < items.length; i++) deck = deck.advance(1);
        expect(deck.items.map((i) => i._id)).toEqual(['a', 'b', 'c']);
    });

    test('handles 0 or 1 items without crashing', () => {
        expect(new SwipeDeck([]).advance(1).current).toBeNull();
        expect(new SwipeDeck([{ _id: 'only' }]).advance(1).current._id).toBe('only');
    });
});

describe('buildVoronoiMosaic', () => {
    const items = [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }, { _id: 'd' }];

    test('returns one cell per item with a usable clip-path', () => {
        const cells = buildVoronoiMosaic(items, { width: 400, height: 300 });
        expect(cells).toHaveLength(4);
        for (const cell of cells) {
            expect(cell.clipPath.startsWith('polygon(')).toBe(true);
            expect(cell.centroid.xPct).toBeGreaterThanOrEqual(0);
            expect(cell.centroid.yPct).toBeGreaterThanOrEqual(0);
        }
    });

    test('is deterministic for the same items across calls', () => {
        const first = buildVoronoiMosaic(items, { width: 400, height: 300 });
        const second = buildVoronoiMosaic(items, { width: 400, height: 300 });
        expect(first.map((c) => c.clipPath)).toEqual(second.map((c) => c.clipPath));
    });

    test('handles an empty item list without crashing', () => {
        expect(buildVoronoiMosaic([])).toEqual([]);
    });
});
