/**
 * New Signature Layouts — Smoke Tests
 *
 * Confirms Subway Line Map, Menu Deck and Voronoi Mosaic render
 * without crashing given a minimal groupedItems fixture, the same
 * shape LayoutFactory passes to every public layout.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { SubwayMenu } from '@/components/public/layouts/SubwayMenu';
import { MenuDeck } from '@/components/public/layouts/MenuDeck';
import { VoronoiMosaic } from '@/components/public/layouts/VoronoiMosaic';

jest.mock('@/contexts/ThemeContext', () => ({
    useTheme: () => ({
        config: {
            colors: {
                brand: { primary: '#4f46e5', secondary: '#f43f5e', tertiary: '#10b981' },
                text: { primary: '#111827', secondary: '#6B7280' },
            },
        },
    }),
}));

jest.mock('@/components/public/MenuItem', () => ({
    MenuItem: ({ item }) => <div data-testid="menu-item">{item.name}</div>,
}));

const groupedItems = [
    {
        _id: 'c1',
        name: 'Starters',
        emoji: '🥗',
        items: [
            { _id: 'i1', name: 'Bruschetta', price: 8, imageUrl: '' },
            { _id: 'i2', name: 'Soup', price: 6, imageUrl: '' },
        ],
    },
    {
        _id: 'c2',
        name: 'Mains',
        emoji: '🍝',
        items: [{ _id: 'i3', name: 'Pasta', price: 14, imageUrl: '' }],
    },
];

describe('SubwayMenu', () => {
    test('renders stations and the active category platform', () => {
        render(<SubwayMenu groupedItems={groupedItems} setSelectedItem={jest.fn()} />);
        expect(screen.getAllByText('Starters').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Mains').length).toBeGreaterThan(0);
    });

    test('handles an empty menu without crashing', () => {
        render(<SubwayMenu groupedItems={[]} setSelectedItem={jest.fn()} />);
    });
});

describe('MenuDeck', () => {
    test('renders category pills and the front card of the first category', () => {
        render(<MenuDeck groupedItems={groupedItems} setSelectedItem={jest.fn()} />);
        expect(screen.getByText(/Starters/)).toBeInTheDocument();
        expect(screen.getByText(/Mains/)).toBeInTheDocument();
        expect(screen.getByText('Bruschetta')).toBeInTheDocument();
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    test('Next advances the deck to the following item', () => {
        render(<MenuDeck groupedItems={groupedItems} setSelectedItem={jest.fn()} />);
        fireEvent.click(screen.getByTitle('Next'));
        expect(screen.getByText('Soup')).toBeInTheDocument();
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });

    test('handles a menu with no items anywhere without crashing', () => {
        render(<MenuDeck groupedItems={[{ _id: 'empty', name: 'Empty', items: [] }]} setSelectedItem={jest.fn()} />);
    });
});

describe('VoronoiMosaic', () => {
    test('renders a mosaic cell per item', () => {
        render(<VoronoiMosaic groupedItems={groupedItems} setSelectedItem={jest.fn()} />);
        expect(screen.getAllByTitle('Bruschetta').length).toBeGreaterThan(0);
        expect(screen.getAllByTitle('Pasta').length).toBeGreaterThan(0);
    });

    test('skips a category with no items without crashing', () => {
        render(<VoronoiMosaic groupedItems={[{ _id: 'empty', name: 'Empty', items: [] }]} setSelectedItem={jest.fn()} />);
    });
});
