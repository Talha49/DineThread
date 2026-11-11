/**
 * Default Theme Presets
 * 
 * These are professionally-designed theme configurations that serve as:
 * 1. Quick-start templates for new restaurants
 * 2. Inspiration for custom themes
 * 3. Fallback defaults when themeConfig is not set
 * 
 * Each preset is a complete themeConfig object that can be used directly.
 */

/**
 * Modern Clean - Minimalist, professional aesthetic
 * Perfect for: Cafes, bakeries, clean eateries
 */
export const MODERN_CLEAN = {
  version: "2.0",
  
  background: {
    type: 'solid',
    color: '#FFFFFF'
  },
  
  typography: {
    fonts: {
      heading: { family: 'Inter', weight: 700 },
      body: { family: 'Inter', weight: 400 },
      accent: { family: 'Inter', weight: 600 }
    },
    sizes: {
      base: 16,
      scale: 1.25,
      categoryTitle: 32,
      itemName: 20,
      itemDescription: 14,
      price: 18
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8
    },
    letterSpacings: {
      tight: '-0.02em',
      normal: '0em',
      wide: '0.05em'
    }
  },
  
  colors: {
    brand: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#D1D5DB'
    },
    backgrounds: {
      page: '#FFFFFF',
      card: '#F9FAFB',
      elevated: '#FFFFFF'
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF'
    },
    borders: {
      light: '#E5E7EB',
      medium: '#D1D5DB',
      dark: '#9CA3AF'
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    }
  },
  
  visual: {
    radius: '16px',
    glass: 0,
    shadow: 'md',
    texture: 'none'
  },

  effects: {
    atmosphere: {
      active: 'none',
      intensity: 0
    }
  },

  spacing: {
    unit: 4,
    scale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
    cardPadding: 20,
    sectionGap: 64,
    itemGap: 16
  },
  
  borders: {
    radius: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
      xxl: 32,
      full: 9999
    },
    widths: {
      none: 0,
      thin: 1,
      medium: 2,
      thick: 4
    }
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
    xxl: '0 25px 50px rgba(0,0,0,0.25)'
  },
  
  menuItem: {
    layout: 'horizontal',
    image: {
      enabled: true,
      shape: 'rounded',
      aspectRatio: '1/1',
      position: 'left',
      objectFit: 'cover',
      borderRadius: 'lg'
    },
    card: {
      background: 'card',
      borderRadius: 'xl',
      shadow: 'sm',
      border: {
        width: 'thin',
        color: 'light'
      },
      padding: 20,
      hoverEffect: 'lift'
    },
    content: {
      alignment: 'left',
      nameSize: 20,
      descriptionSize: 14,
      priceSize: 18,
      pricePosition: 'inline'
    }
  },
  
  categorySection: {
    header: {
      style: 'minimal',
      size: 28,
      color: 'primary',
      alignment: 'left',
      decoration: {
        type: 'none'
      }
    },
    spacing: {
      top: 64,
      bottom: 24
    }
  },
  
  decorations: {
    enabled: false,
    elements: [],
    borderDecoration: {
      type: 'none'
    }
  },
  
  animations: {
    reducedMotion: false,
    pageLoad: {
      type: 'fade',
      duration: 600,
      easing: 'easeOut'
    },
    itemEntrance: {
      type: 'stagger',
      duration: 400,
      delay: 40
    },
    interactions: {
      hover: 'lift',
      tap: 'shrink'
    }
  }
};

// RETRO_DINER / MINIMAL_LUXURY / PLAYFUL_BURGER and the DEFAULT_THEMES id-based
// preset lookup (getThemePreset/getAvailablePresets) were removed here - they were
// a second, unreachable preset system that only ever fed a `typeof config ===
// 'string'` branch in ThemeEngine.process() that nothing ever called with a
// string. The real, user-facing preset gallery lives in
// components/dashboard/design-studio/presets.js. MODERN_CLEAN remains as the
// single ultimate fallback theme.
