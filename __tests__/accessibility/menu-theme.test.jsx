/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { DESIGN_PRESETS } from '@/components/dashboard/design-studio/presets';
import { Modal } from '@/components/ui/Modal';
import { generateCSSVariables } from '@/lib/theme-engine/css-generator';
import { relativeLuminance, textOnBrand } from '@/lib/theme-engine/color-contrast';

test.each(DESIGN_PRESETS)('$name supplies readable text for brand-coloured controls', ({ config }) => {
    const vars = generateCSSVariables(config);
    const background = relativeLuminance(vars['--color-primary']);
    const foreground = relativeLuminance(vars['--color-primary-foreground']);
    const ratio = (Math.max(background, foreground) + 0.05) / (Math.min(background, foreground) + 0.05);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test('custom shorthand colours have the same contrast as six-digit colours', () => {
    expect(textOnBrand('#ff0')).toBe('#000000');
    expect(textOnBrand('#006')).toBe('#ffffff');
    expect(relativeLuminance('#abc')).toBe(relativeLuminance('#aabbcc'));
});

test('a guest dialog inherits the restaurant theme from its portal host', () => {
    const host = document.createElement('div');
    host.className = 'theme-root';
    document.body.appendChild(host);
    const { unmount } = render(<Modal title="Dish details" isOpen portalContainer={host} />);
    expect(screen.getByRole('dialog').closest('.theme-root')).toBe(host);
    unmount();
    host.remove();
});
