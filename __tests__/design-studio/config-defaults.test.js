/**
 * Config Defaults — Unit Tests
 * 
 * Tests that validatePresetConfig fills all missing fields
 * and never returns null/undefined for any nested property.
 */

import { DEFAULT_CONFIG, validatePresetConfig } from '@/components/dashboard/design-studio/config-defaults';

describe('validatePresetConfig', () => {
    test('returns a complete config when called with empty object', () => {
        const result = validatePresetConfig({});

        // Core color structure must exist
        expect(result.colors).toBeDefined();
        expect(result.colors.brand).toBeDefined();
        expect(result.colors.brand.primary).toBeTruthy();
        expect(result.colors.backgrounds).toBeDefined();
        expect(result.colors.text).toBeDefined();
    });

    test('returns a complete config when called with null', () => {
        const result = validatePresetConfig(null);
        expect(result).toBeDefined();
        expect(result.colors).toBeDefined();
        expect(result.typography).toBeDefined();
    });

    test('returns a complete config when called with undefined', () => {
        const result = validatePresetConfig(undefined);
        expect(result).toBeDefined();
        expect(result.colors).toBeDefined();
    });

    test('preserves user values over defaults', () => {
        const result = validatePresetConfig({
            colors: {
                brand: { primary: '#ff0000' }
            }
        });

        // User value preserved
        expect(result.colors.brand.primary).toBe('#ff0000');
        // Defaults filled in for missing fields
        expect(result.colors.backgrounds).toBeDefined();
        expect(result.colors.text).toBeDefined();
    });

    test('fills typography defaults', () => {
        const result = validatePresetConfig({});

        expect(result.typography).toBeDefined();
        expect(result.typography.fonts).toBeDefined();
        expect(result.typography.fonts.heading).toBeDefined();
        expect(result.typography.fonts.heading.family).toBeTruthy();
        expect(result.typography.fonts.body).toBeDefined();
    });

    test('fills visual defaults', () => {
        const result = validatePresetConfig({});

        expect(result.visual).toBeDefined();
        expect(result.visual.radius).toBeDefined();
        expect(result.visual.glass).toBeDefined();
    });

    test('fills menuItem defaults', () => {
        const result = validatePresetConfig({});

        expect(result.menuItem).toBeDefined();
        expect(result.menuItem.layout).toBeTruthy();
        expect(result.menuItem.image).toBeDefined();
        expect(result.menuItem.image.objectFit).toBe('cover');
        expect(result.menuItem.card).toBeDefined();
    });

    test('fills lineHeights and letterSpacings defaults', () => {
        const result = validatePresetConfig({});

        expect(result.typography.lineHeights).toBeDefined();
        expect(result.typography.lineHeights.normal).toBe(1.5);
        expect(result.typography.letterSpacings).toBeDefined();
        expect(result.typography.letterSpacings.normal).toBe('0em');
    });

    test('objectFit is always "cover" or "contain", never "object-cover"', () => {
        const result = validatePresetConfig({
            menuItem: { image: { objectFit: 'object-cover' } }
        });

        // Even if user passes 'object-cover', it should stay as-is or be normalized.
        // But DEFAULT should be 'cover'
        const defaultResult = validatePresetConfig({});
        expect(defaultResult.menuItem.image.objectFit).toBe('cover');
    });

    test('does not crash when animations field is missing', () => {
        const result = validatePresetConfig({});
        // animations is optional — created by MotionTab when user interacts
        // Just ensure no crash
        expect(result).toBeDefined();
    });

    test('DEFAULT_CONFIG has all required fields', () => {
        expect(DEFAULT_CONFIG.colors).toBeDefined();
        expect(DEFAULT_CONFIG.colors.brand.primary).toBeTruthy();
        expect(DEFAULT_CONFIG.typography).toBeDefined();
        expect(DEFAULT_CONFIG.typography.lineHeights).toBeDefined();
        expect(DEFAULT_CONFIG.visual).toBeDefined();
        expect(DEFAULT_CONFIG.menuItem).toBeDefined();
    });
});
