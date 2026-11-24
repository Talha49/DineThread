/**
 * IdentityTab — Unit Tests
 * 
 * Tests brand color, font selection, and logo URL handling.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { IdentityTab } from '@/components/dashboard/design-studio/IdentityTab';

// Mock ImageUpload since it uses external APIs
jest.mock('@/components/dashboard/ImageUpload', () => ({
    ImageUpload: ({ value, onChange }) => (
        <div data-testid="image-upload">
            <span data-testid="image-value">{value}</span>
            <button data-testid="upload-trigger" onClick={() => onChange('https://example.com/logo.png')}>
                Upload
            </button>
        </div>
    ),
}));

const baseConfig = {
    colors: { brand: { primary: '#4f46e5', secondary: '#f472b6' } },
    typography: { fonts: { heading: { family: 'Inter', weight: 700 }, body: { family: 'Inter', weight: 400 } } },
};

describe('IdentityTab', () => {
    const mockOnChange = jest.fn();
    const mockRestaurant = { logoUrl: 'https://old-logo.com/img.png' };

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    test('renders without crash', () => {
        render(<IdentityTab config={baseConfig} onChange={mockOnChange} restaurant={mockRestaurant} />);
        expect(screen.getByText('Brand Identity')).toBeInTheDocument();
    });

    test('renders with null config without crash', () => {
        render(<IdentityTab config={null} onChange={mockOnChange} restaurant={null} />);
        expect(screen.getByText('Brand Identity')).toBeInTheDocument();
    });

    test('shows current brand color', () => {
        render(<IdentityTab config={baseConfig} onChange={mockOnChange} restaurant={mockRestaurant} />);
        expect(screen.getByText('#4F46E5')).toBeInTheDocument();
    });

    test('font selection updates config with correct typography structure', () => {
        render(<IdentityTab config={baseConfig} onChange={mockOnChange} restaurant={mockRestaurant} />);

        // Click 'Outfit' font
        fireEvent.click(screen.getByText('Outfit'));

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const newConfig = mockOnChange.mock.calls[0][0];
        expect(newConfig.typography.fonts.heading.family).toBe('Outfit');
        expect(newConfig.typography.fonts.body.family).toBe('Outfit');
    });

    test('Playfair Display sets body font to Inter (readability fallback)', () => {
        render(<IdentityTab config={baseConfig} onChange={mockOnChange} restaurant={mockRestaurant} />);

        fireEvent.click(screen.getByText('Playfair Display'));

        const newConfig = mockOnChange.mock.calls[0][0];
        expect(newConfig.typography.fonts.heading.family).toBe('Playfair Display');
        expect(newConfig.typography.fonts.body.family).toBe('Inter');
    });

    test('logo upload updates config.logoUrl', () => {
        render(<IdentityTab config={baseConfig} onChange={mockOnChange} restaurant={mockRestaurant} />);

        fireEvent.click(screen.getByTestId('upload-trigger'));

        const newConfig = mockOnChange.mock.calls[0][0];
        expect(newConfig.logoUrl).toBe('https://example.com/logo.png');
    });

    test('displays config.logoUrl over restaurant.logoUrl', () => {
        const configWithLogo = { ...baseConfig, logoUrl: 'https://new-logo.com/fresh.png' };
        render(<IdentityTab config={configWithLogo} onChange={mockOnChange} restaurant={mockRestaurant} />);

        expect(screen.getByTestId('image-value').textContent).toBe('https://new-logo.com/fresh.png');
    });

    test('falls back to restaurant.logoUrl when config has no logo', () => {
        render(<IdentityTab config={baseConfig} onChange={mockOnChange} restaurant={mockRestaurant} />);

        expect(screen.getByTestId('image-value').textContent).toBe('https://old-logo.com/img.png');
    });
});
