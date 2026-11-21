/**
 * SwipeDeck
 *
 * A small immutable circular queue backing the Menu Deck layout
 * (components/public/layouts/MenuDeck.jsx). Swiping never deletes an item -
 * it rotates the front of the deck to the back (or vice versa for "undo"),
 * so browsing a category loops indefinitely without ever running out of
 * cards or needing index-bounds math in the component.
 */
export class SwipeDeck {
    constructor(items = []) {
        this.items = items;
    }

    get size() {
        return this.items.length;
    }

    get current() {
        return this.items[0] ?? null;
    }

    /** The top `n` cards, front-to-back - what the UI actually renders as a stack. */
    peek(n = 3) {
        return this.items.slice(0, n);
    }

    /** direction: 1 = advance to the next card, -1 = go back to the previous one. */
    advance(direction = 1) {
        if (this.items.length < 2) return this;
        const items = [...this.items];
        if (direction >= 0) {
            items.push(items.shift());
        } else {
            items.unshift(items.pop());
        }
        return new SwipeDeck(items);
    }
}
