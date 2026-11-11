/**
 * MotionTab — Unit Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MotionTab } from '@/components/dashboard/design-studio/MotionTab';

describe('MotionTab', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => mockOnChange.mockClear());

    test('renders without crash with null config', () => {
        render(<MotionTab config={null} onChange={mockOnChange} />);
        expect(screen.getByText('Motion & Atmosphere')).toBeInTheDocument();
    });

    test('renders without crash with empty config', () => {
        render(<MotionTab config={{}} onChange={mockOnChange} />);
        expect(screen.getByText('Motion & Atmosphere')).toBeInTheDocument();
    });

    test('shows all 4 entrance options', () => {
        render(<MotionTab config={{}} onChange={mockOnChange} />);

        expect(screen.getByText('Cascading Flow')).toBeInTheDocument();
        expect(screen.getByText('Soft Reveal')).toBeInTheDocument();
        expect(screen.getByText('Elastic Pop')).toBeInTheDocument();
        expect(screen.getByText('Instant')).toBeInTheDocument();
    });

    test('shows all 4 hover options', () => {
        render(<MotionTab config={{}} onChange={mockOnChange} />);
        expect(screen.getByText('Interaction Feedback')).toBeInTheDocument();
        expect(screen.getByText('Float')).toBeInTheDocument();
        expect(screen.getByText('Glow')).toBeInTheDocument();
        expect(screen.getByText('Zoom')).toBeInTheDocument();
        expect(screen.getByText('None')).toBeInTheDocument();
    });

    test('clicking entrance option updates animations.itemEntrance', () => {
        render(<MotionTab config={{}} onChange={mockOnChange} />);

        fireEvent.click(screen.getByText('Soft Reveal'));

        const newConfig = mockOnChange.mock.calls[0][0];
        expect(newConfig.animations.itemEntrance.type).toBe('fade');
        expect(newConfig.animations.itemEntrance.duration).toBe(600);
    });

    test('clicking hover option updates menuItem.card.hoverEffect', () => {
        // Hover effect has one field now: menuItem.card.hoverEffect. It used to
        // also be readable/writable via animations.interactions.hover (a second
        // control, in Item Surface's now-removed Effects tab) - whichever one
        // you touched last silently won, which read as the setting not working.
        render(<MotionTab config={{}} onChange={mockOnChange} />);

        fireEvent.click(screen.getByText('Glow'));

        const newConfig = mockOnChange.mock.calls[0][0];
        expect(newConfig.menuItem.card.hoverEffect).toBe('glow');
    });

    test('preserves existing config fields when updating', () => {
        const config = {
            colors: { brand: { primary: '#ff0000' } },
            animations: { itemEntrance: { type: 'stagger' } }
        };
        render(<MotionTab config={config} onChange={mockOnChange} />);

        fireEvent.click(screen.getByText('Elastic Pop'));

        const newConfig = mockOnChange.mock.calls[0][0];
        // Should keep colors intact
        expect(newConfig.colors.brand.primary).toBe('#ff0000');
        // Should update entrance
        expect(newConfig.animations.itemEntrance.type).toBe('scale');
    });
});
