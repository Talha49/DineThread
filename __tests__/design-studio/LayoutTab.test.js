/**
 * LayoutTab — Unit Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { LayoutTab } from '@/components/dashboard/design-studio/LayoutTab';

// Mock child components
jest.mock('@/components/dashboard/theme-studio/CardDesigner', () => ({
    CardDesigner: ({ value, onChange }) => <div data-testid="card-designer">CardDesigner</div>,
}));
jest.mock('@/components/dashboard/theme-studio/TypographyControls', () => ({
    TypographyControls: ({ value, onChange }) => <div data-testid="typography-controls">TypographyControls</div>,
}));

const baseConfig = {
    layoutID: 'grid',
    menuItem: { layout: 'horizontal' },
    typography: { fonts: { heading: { family: 'Inter' } } },
};

describe('LayoutTab', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => mockOnChange.mockClear());

    test('renders without crash', () => {
        render(<LayoutTab config={baseConfig} onChange={mockOnChange} />);
        expect(screen.getByText('Layout & Composition')).toBeInTheDocument();
    });

    test('shows all layout modes including new ones', () => {
        render(<LayoutTab config={baseConfig} onChange={mockOnChange} />);

        expect(screen.getByText('Standard / None')).toBeInTheDocument();
        expect(screen.getByText('Minimal List')).toBeInTheDocument();
        expect(screen.getByText('Luxury Masonry')).toBeInTheDocument();
        expect(screen.getByText('Orbital Wheel')).toBeInTheDocument();
        expect(screen.getByText('Signature Showcase')).toBeInTheDocument();
        expect(screen.getByText('Editorial Bento')).toBeInTheDocument();
    });

    test('clicking a layout mode updates config.layoutID', () => {
        render(<LayoutTab config={baseConfig} onChange={mockOnChange} />);

        fireEvent.click(screen.getByText('Minimal List'));

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const newConfig = mockOnChange.mock.calls[0][0];
        expect(newConfig.layoutID).toBe('list');
    });

    test('clicking Signature Showcase sets layoutID to "signature-showcase"', () => {
        render(<LayoutTab config={baseConfig} onChange={mockOnChange} />);

        fireEvent.click(screen.getByText('Signature Showcase'));

        const newConfig = mockOnChange.mock.calls[0][0];
        expect(newConfig.layoutID).toBe('signature-showcase');
    });

    test('switching to Item Surface tab shows CardDesigner', () => {
        render(<LayoutTab config={baseConfig} onChange={mockOnChange} />);

        fireEvent.click(screen.getByText('Item Surface'));
        expect(screen.getByTestId('card-designer')).toBeInTheDocument();
    });

    test('switching to Typography Lab tab shows TypographyControls', () => {
        render(<LayoutTab config={baseConfig} onChange={mockOnChange} />);

        fireEvent.click(screen.getByText('Typography Lab'));
        expect(screen.getByTestId('typography-controls')).toBeInTheDocument();
    });
});
