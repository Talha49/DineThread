/**
 * VisualTab — Unit Tests
 */

import { render, screen } from '@testing-library/react';
import { VisualTab } from '@/components/dashboard/design-studio/VisualTab';

// Mock child components
jest.mock('@/components/ui/Slider', () => ({
    Slider: ({ label, value, onChange }) => (
        <div data-testid={`slider-${label}`}>
            <span data-testid={`slider-value-${label}`}>{value}</span>
            <button data-testid={`slider-change-${label}`} onClick={() => onChange(42)}>Change</button>
        </div>
    ),
}));

jest.mock('@/components/dashboard/theme-studio/BackgroundDesigner', () => ({
    BackgroundDesigner: ({ value, onChange }) => (
        <div data-testid="background-designer">
            <span data-testid="bg-type">{value?.type}</span>
        </div>
    ),
}));

describe('VisualTab', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => mockOnChange.mockClear());

    test('renders without crash with null config', () => {
        render(<VisualTab config={null} onChange={mockOnChange} />);
        expect(screen.getByText('Visual DNA')).toBeInTheDocument();
    });

    test('renders without crash with empty config', () => {
        render(<VisualTab config={{}} onChange={mockOnChange} />);
        expect(screen.getByText('Visual DNA')).toBeInTheDocument();
    });

    test('shows corner rounding slider with default value', () => {
        render(<VisualTab config={{}} onChange={mockOnChange} />);
        expect(screen.getByTestId('slider-value-Corner Radius').textContent).toBe('16');
    });

    test('shows glass intensity slider with default value', () => {
        render(<VisualTab config={{}} onChange={mockOnChange} />);
        expect(screen.getByTestId('slider-value-Glassmorphism').textContent).toBe('0');
    });

    test('uses existing config values', () => {
        const config = { visual: { radius: '24px', glass: 50 } };
        render(<VisualTab config={config} onChange={mockOnChange} />);

        expect(screen.getByTestId('slider-value-Corner Radius').textContent).toBe('24');
        expect(screen.getByTestId('slider-value-Glassmorphism').textContent).toBe('50');
    });

    test('renders background designer', () => {
        render(<VisualTab config={{ background: { type: 'solid', color: '#fff' } }} onChange={mockOnChange} />);
        expect(screen.getByTestId('bg-type').textContent).toBe('solid');
    });
});
