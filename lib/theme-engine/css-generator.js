/**
 * CSS Variable Generator
 * 
 * This module converts themeConfig objects into CSS custom properties (variables).
 * CSS variables provide zero-runtime-cost theming with instant updates.
 * 
 * Why CSS Variables?
 * - Native browser support (all modern browsers)
 * - No JavaScript overhead
 * - Instant theme switching without re-render
 * - Works with any styling methodology
 * - Excellent performance at scale
 */

/**
 * Generate complete CSS variables object from theme config
 * @param {object} theme - Theme configuration object
 * @returns {object} CSS custom properties ready for inline styles
 */
export function generateCSSVariables(theme) {
  if (!theme) return {};
  
  const vars = {};

  // Background is deliberately NOT represented as CSS variables here - a
  // gradient/pattern/image background is a composite value (e.g.
  // `linear-gradient(...), url(...)`) that a handful of `--theme-bg-*`
  // variables can't represent completely, and a partial version (as used to
  // exist here, solid-color only) is worse than none: it silently drops
  // gradients/patterns/images for any future caller who reasonably assumes
  // these variables are the full picture. `renderBackground()` in
  // background-renderer.js is the single, complete source of truth for
  // background styles and is what ThemeContext.jsx actually uses.
  
  // Typography variables
  if (theme.typography) {
    const { fonts, sizes, lineHeights, letterSpacing, letterSpacings } = theme.typography;
    const ls = letterSpacings || letterSpacing; // Handle both naming conventions
    
    if (fonts) {
      vars['--font-heading'] = fonts.heading?.family || 'Inter';
      vars['--font-heading-weight'] = fonts.heading?.weight || 700;
      vars['--font-body'] = fonts.body?.family || 'Inter';
      vars['--font-body-weight'] = fonts.body?.weight || 400;
      vars['--font-accent'] = fonts.accent?.family || 'Inter';
      vars['--font-accent-weight'] = fonts.accent?.weight || 600;
    }
    
    if (sizes) {
      vars['--text-base'] = `${sizes.base || 16}px`;
      vars['--text-scale'] = sizes.scale || 1.25;
      vars['--text-category-title'] = `${sizes.categoryTitle || 32}px`;
      vars['--text-item-name'] = `${sizes.itemName || 20}px`;
      vars['--text-item-desc'] = `${sizes.itemDescription || 14}px`;
      vars['--text-price'] = `${sizes.price || 18}px`;
    }
    
    if (lineHeights) {
      vars['--line-height-tight'] = lineHeights.tight || 1.2;
      vars['--line-height-normal'] = lineHeights.normal || 1.5;
      vars['--line-height-relaxed'] = lineHeights.relaxed || 1.8;
    }
    
    if (ls) {
      vars['--letter-spacing-tight'] = typeof ls.tight === 'number' ? `${ls.tight}em` : (ls.tight || '-0.02em');
      vars['--letter-spacing-normal'] = typeof ls.normal === 'number' ? `${ls.normal}em` : (ls.normal || '0em');
      vars['--letter-spacing-wide'] = typeof ls.wide === 'number' ? `${ls.wide}em` : (ls.wide || '0.05em');
    }
  }

  // Visual DNA variables
  if (theme.visual) {
    vars['--theme-radius'] = theme.visual.radius || '16px';
    vars['--theme-glass-blur'] = `${(theme.visual.glass || 0) / 4}px`;
    vars['--theme-glass-opacity'] = `${1 - (theme.visual.glass || 0) / 150}`;
    
    // Map shadow key to actual CSS shadow value
    const shadowMap = {
      none: 'none',
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
      xl: '0 20px 25px rgba(0,0,0,0.15)'
    };
    vars['--theme-shadow'] = shadowMap[theme.visual.shadow] || shadowMap.md;
    vars['--theme-texture'] = theme.visual.texture || 'none';
  }
  
  // Color variables
  if (theme.colors) {
    const { brand, backgrounds, text, borders, semantic } = theme.colors;
    
    if (brand) {
      vars['--color-primary'] = brand.primary || '#4f46e5';
      vars['--color-secondary'] = brand.secondary || '#f43f5e';
      vars['--color-tertiary'] = brand.tertiary || '#10b981';
    }
    
    if (backgrounds) {
      vars['--bg-page'] = backgrounds.page || '#FFFFFF';
      vars['--bg-card'] = backgrounds.card || '#F9FAFB';
      vars['--bg-elevated'] = backgrounds.elevated || '#FFFFFF';
    }
    
    if (text) {
      vars['--text-primary'] = text.primary || '#111827';
      vars['--text-secondary'] = text.secondary || '#6B7280';
      vars['--text-tertiary'] = text.tertiary || '#9CA3AF';
      vars['--text-inverse'] = text.inverse || '#FFFFFF';
    }
    
    if (borders) {
      vars['--border-light'] = borders.light || '#E5E7EB';
      vars['--border-medium'] = borders.medium || '#D1D5DB';
      vars['--border-dark'] = borders.dark || '#9CA3AF';
    }
    
    if (semantic) {
      vars['--color-success'] = semantic.success || '#10B981';
      vars['--color-warning'] = semantic.warning || '#F59E0B';
      vars['--color-error'] = semantic.error || '#EF4444';
      vars['--color-info'] = semantic.info || '#3B82F6';
    }
  }
  
  // Spacing variables
  if (theme.spacing) {
    vars['--space-unit'] = `${theme.spacing.unit || 4}px`;
    vars['--space-card-padding'] = `${theme.spacing.cardPadding || 16}px`;
    vars['--space-section-gap'] = `${theme.spacing.sectionGap || 48}px`;
    vars['--space-item-gap'] = `${theme.spacing.itemGap || 16}px`;
    
    // Generate scale variables (--space-0, --space-1, etc.)
    if (theme.spacing.scale && Array.isArray(theme.spacing.scale)) {
      theme.spacing.scale.forEach((value, index) => {
        vars[`--space-${index}`] = `${value}px`;
      });
    }
  }
  
  // Border radius variables
  if (theme.borders?.radius) {
    const { radius } = theme.borders;
    vars['--radius-none'] = `${radius.none || 0}px`;
    vars['--radius-sm'] = `${radius.sm || 4}px`;
    vars['--radius-md'] = `${radius.md || 8}px`;
    vars['--radius-lg'] = `${radius.lg || 16}px`;
    vars['--radius-xl'] = `${radius.xl || 24}px`;
    vars['--radius-xxl'] = `${radius.xxl || 32}px`;
    vars['--radius-full'] = `${radius.full || 9999}px`;
  }
  
  // Border width variables
  if (theme.borders?.widths) {
    const { widths } = theme.borders;
    vars['--border-none'] = `${widths.none || 0}px`;
    vars['--border-thin'] = `${widths.thin || 1}px`;
    vars['--border-medium'] = `${widths.medium || 2}px`;
    vars['--border-thick'] = `${widths.thick || 4}px`;
  }
  
  // Shadow variables
  if (theme.shadows) {
    vars['--shadow-none'] = theme.shadows.none || 'none';
    vars['--shadow-sm'] = theme.shadows.sm || '0 1px 2px rgba(0,0,0,0.05)';
    vars['--shadow-md'] = theme.shadows.md || '0 4px 6px rgba(0,0,0,0.1)';
    vars['--shadow-lg'] = theme.shadows.lg || '0 10px 15px rgba(0,0,0,0.1)';
    vars['--shadow-xl'] = theme.shadows.xl || '0 20px 25px rgba(0,0,0,0.15)';
    vars['--shadow-xxl'] = theme.shadows.xxl || '0 25px 50px rgba(0,0,0,0.25)';
  }
  
  // Menu item specific variables
  if (theme.menuItem) {
    const { image, card, content } = theme.menuItem;
    
    if (image) {
      vars['--item-image-aspect'] = image.aspectRatio || '1/1';
      vars['--item-image-radius'] = image.borderRadius || 'md'; // Reference to radius var
      vars['--item-image-fit'] = image.objectFit || 'cover';
    }
    
    if (card) {
      vars['--item-card-bg'] = card.background || 'card'; // Reference to bg var
      vars['--item-card-radius'] = card.borderRadius || 'lg';
      vars['--item-card-shadow'] = card.shadow || 'md';
      vars['--item-card-padding'] = `${card.padding || 16}px`;
      vars['--item-border-width'] = card.border?.width || 'none';
      vars['--item-border-color'] = card.border?.color || 'light';
    }
    
    if (content) {
      vars['--item-text-align'] = content.alignment || 'left';
      vars['--item-name-size'] = `${content.nameSize || 20}px`;
      vars['--item-desc-size'] = `${content.descriptionSize || 14}px`;
      vars['--item-price-size'] = `${content.priceSize || 18}px`;
    }
  }
  
  // Category section variables
  if (theme.categorySection) {
    const { header, spacing } = theme.categorySection;
    
    if (header) {
      vars['--category-header-size'] = `${header.size || 32}px`;
      vars['--category-header-color'] = header.color || 'primary';
      vars['--category-header-align'] = header.alignment || 'left';
    }
    
    if (spacing) {
      vars['--category-spacing-top'] = `${spacing.top || 48}px`;
      vars['--category-spacing-bottom'] = `${spacing.bottom || 24}px`;
    }
  }
  
  return vars;
}

/**
 * Convert theme config color references to actual colors
 * Some properties reference other variables (e.g., "primary" instead of "#4f46e5")
 * This resolves those references to actual color values
 * @param {object} vars - CSS variables object
 * @param {object} theme - Original theme config
 * @returns {object} Resolved CSS variables
 */
export function resolveColorReferences(vars, theme) {
  const resolved = { ...vars };
  
  // Helper to get color by reference
  const getColor = (ref) => {
    if (ref.startsWith('#')) return ref;
    
    switch(ref) {
      case 'primary': return theme.colors?.brand?.primary || '#4f46e5';
      case 'secondary': return theme.colors?.brand?.secondary || '#f43f5e';
      case 'tertiary': return theme.colors?.brand?.tertiary || '#10b981';
      case 'page': return theme.colors?.backgrounds?.page || '#FFFFFF';
      case 'card': return theme.colors?.backgrounds?.card || '#F9FAFB';
      case 'elevated': return theme.colors?.backgrounds?.elevated || '#FFFFFF';
      case 'light': return theme.colors?.borders?.light || '#E5E7EB';
      case 'medium': return theme.colors?.borders?.medium || '#D1D5DB';
      case 'dark': return theme.colors?.borders?.dark || '#9CA3AF';
      default: return ref;
    }
  };
  
  // Resolve color references
  Object.keys(resolved).forEach(key => {
    if (key.includes('color') || key.includes('bg') || key.includes('border-color')) {
      resolved[key] = getColor(resolved[key]);
    }
  });
  
  return resolved;
}

/**
 * Generate inline style object for React components
 * @param {object} theme - Theme configuration
 * @returns {object} Style object ready for React inline styles
 */
export function generateInlineStyles(theme) {
  const vars = generateCSSVariables(theme);
  const resolved = resolveColorReferences(vars, theme);
  return resolved;
}

/**
 * Generate CSS string for <style> tags or stylesheets
 * @param {object} theme - Theme configuration
 * @param {string} selector - CSS selector to apply variables to (default: ':root')
 * @returns {string} CSS string
 */
export function generateCSSString(theme, selector = ':root') {
  const vars = generateCSSVariables(theme);
  const resolved = resolveColorReferences(vars, theme);
  
  const cssVars = Object.entries(resolved)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  
  return `${selector} {\n${cssVars}\n}`;
}

/**
 * Helper to get a specific CSS variable value
 * @param {object} theme - Theme configuration
 * @param {string} varName - Variable name (e.g., 'color-primary')
 * @returns {string} Variable value
 */
export function getThemeVariable(theme, varName) {
  const vars = generateCSSVariables(theme);
  const resolved = resolveColorReferences(vars, theme);
  return resolved[`--${varName}`];
}
