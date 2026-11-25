/**
 * Theme Engine - Core Processor
 * 
 * This is the heart of the theme system. It:
 * 1. Processes raw theme configs
 * 2. Merges with defaults
 * 3. Validates theme integrity
 * 4. Generates runtime theme objects
 * 5. Handles seasonal overlays
 */

import { MODERN_CLEAN } from './defaults.js';
import { generateCSSVariables, resolveColorReferences } from './css-generator.js';
import { SEASONAL_OVERLAYS } from './seasonal-overlays.js';
import { deepMerge } from '../object-utils.js';

/**
 * Main ThemeEngine class
 */
export class ThemeEngine {
  /**
   * Process a theme configuration
   * Validates, fills defaults, and prepares for rendering
   * @param {object} config - Raw theme config from database
   * @returns {object} Processed theme ready for use
   */
  static process(config) {
    // If no config provided, use default
    if (!config) {
      return this.process(MODERN_CLEAN);
    }

    // Deep merge with defaults to fill any missing values
    const theme = this.mergeWithDefaults(config, MODERN_CLEAN);
    
    // Validate theme for common issues
    const validationResult = this.validate(theme);
    if (!validationResult.valid) {
      console.warn('Theme validation warnings:', validationResult.warnings);
    }
    
    // Return processed theme
    return theme;
  }
  
  /**
   * Deep merge theme config with defaults
   * Ensures all required properties exist
   * @param {object} config - User theme config
   * @param {object} defaults - Default theme (fallback)
   * @returns {object} Merged theme
   */
  static mergeWithDefaults(config, defaults) {
    // Delegates to the one canonical deep-merge implementation (lib/object-utils.js)
    // instead of hand-rolling another one here - config's own values win, defaults
    // fill in anything config doesn't set.
    return deepMerge(defaults, config);
  }
  
  /**
   * Validate theme configuration
   * Checks for common issues like poor contrast, invalid values
   * @param {object} theme - Theme to validate
   * @returns {object} { valid: boolean, warnings: string[] }
   */
  static validate(theme) {
    const warnings = [];
    
    // Validate color contrast (basic check)
    if (theme.colors) {
      const { backgrounds, text } = theme.colors;
      if (backgrounds && text) {
        // Check if text color is too similar to background
        if (this.isSimilarColor(backgrounds.page, text.primary)) {
          warnings.push('Text color may have poor contrast with background');
        }
      }
    }
    
    // Validate font sizes
    if (theme.typography?.sizes) {
      const { base } = theme.typography.sizes;
      if (base < 12 || base > 24) {
        warnings.push(`Base font size ${base}px may be too ${base < 12 ? 'small' : 'large'}`);
      }
    }
    
    // Validate spacing
    if (theme.spacing?.unit) {
      if (theme.spacing.unit < 2 || theme.spacing.unit > 10) {
        warnings.push(`Spacing unit ${theme.spacing.unit}px may cause layout issues`);
      }
    }
    
    // Validate border radius values
    if (theme.borders?.radius) {
      const maxRadius = Math.max(...Object.values(theme.borders.radius));
      if (maxRadius > 100) {
        warnings.push(`Border radius ${maxRadius}px may be excessively large`);
      }
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
  
  /**
   * Check if two colors are too similar (basic luminance check)
   * @param {string} color1 - Hex color
   * @param {string} color2 - Hex color
   * @returns {boolean} True if colors are too similar
   */
  static isSimilarColor(color1, color2) {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    try {
      const lum1 = getLuminance(color1);
      const lum2 = getLuminance(color2);
      return Math.abs(lum1 - lum2) < 50; // Threshold for "too similar"
    } catch (e) {
      return false; // If color parsing fails, assume they're different
    }
  }
  
  /**
   * Merge seasonal overlays based on current date
   * @param {object} baseTheme - Base theme configuration
   * @param {Array} overlays - Seasonal overlay configurations
   * @returns {object} Theme with active seasonal overlay applied
   */
  static mergeSeasonalOverlays(baseTheme, overlays) {
    if (!overlays || !Array.isArray(overlays) || overlays.length === 0) {
      return baseTheme;
    }
    
    const activeOverlay = this.getActiveSeasonalOverlay(overlays);
    
    if (!activeOverlay || !activeOverlay.overrides) {
      return baseTheme;
    }
    
    // Deep merge the overlay overrides with base theme
    return this.mergeWithDefaults(activeOverlay.overrides, baseTheme);
  }
  
  /**
   * Find the currently active seasonal overlay
   * @param {Array} overlays - Seasonal overlay configurations
   * @returns {object|null} Active overlay or null
   */
  static getActiveSeasonalOverlay(overlays) {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentDay = now.getDate();
    
    return overlays.find(overlay => {
      if (!overlay.enabled) return false;
      
      // Parse schedule dates
      const { start, end } = overlay.schedule || {};
      if (!start || !end) return false;
      
      const [startMonth, startDay] = this.parseMonthDay(start);
      const [endMonth, endDay] = this.parseMonthDay(end);
      
      // Check if current date is within range
      return this.isDateInRange(
        currentMonth, currentDay,
        startMonth, startDay,
        endMonth, endDay
      );
    }) || null;
  }
  
  /**
   * Parse month/day from date string
   * @param {string} dateStr - Date string (e.g., "2024-12-01")
   * @returns {Array} [month, day] as 0-indexed month
   */
  static parseMonthDay(dateStr) {
    const date = new Date(dateStr);
    return [date.getMonth(), date.getDate()];
  }
  
  /**
   * Check if current date is within seasonal range
   * Handles year-crossing ranges (e.g., Dec-Feb)
   * @returns {boolean}
   */
  static isDateInRange(currentMonth, currentDay, startMonth, startDay, endMonth, endDay) {
    if (startMonth <= endMonth) {
      // Same year range (e.g., Mar-Nov)
      if (currentMonth < startMonth || currentMonth > endMonth) return false;
      if (currentMonth === startMonth && currentDay < startDay) return false;
      if (currentMonth === endMonth && currentDay > endDay) return false;
      return true;
    } else {
      // Year-crossing range (e.g., Dec-Feb)
      if (currentMonth >= startMonth) {
        // In start year (e.g., December)
        return currentMonth > startMonth || currentDay >= startDay;
      } else {
        // In end year (e.g., January-February)
        return currentMonth < endMonth || (currentMonth === endMonth && currentDay <= endDay);
      }
    }
  }
  
  /**
   * Generate complete runtime theme object
   * Includes both config and computed CSS variables
   * @param {object} config - Theme configuration
   * @returns {object} { config, cssVars, metadata }
   */
  static generateRuntimeTheme(config) {
    const processedConfig = this.process(config);
    const cssVars = generateCSSVariables(processedConfig);
    const resolvedVars = resolveColorReferences(cssVars, processedConfig);
    
    return {
      config: processedConfig,
      cssVars: resolvedVars,
      metadata: {
        version: processedConfig.version || '2.0',
        generatedAt: new Date().toISOString(),
        validated: this.validate(processedConfig).valid
      }
    };
  }
}

/**
 * Convenience function: Process theme from restaurant experienceConfig
 * Establishes clear priority: themeConfig > vibeTokens > legacy fields
 * @param {object} experienceConfig - Restaurant's experienceConfig object
 * @param {object} restaurant - Full restaurant object (for legacy fields)
 * @returns {object} Processed theme ready for rendering
 */
export function processRestaurantTheme(experienceConfig, restaurant = null) {
  if (!experienceConfig) {
    // If restaurant has legacy fields, convert them
    if (restaurant && (restaurant.brandColor || restaurant.fontFamily)) {
      const legacyTheme = convertLegacyFieldsToTheme(restaurant);
      return ThemeEngine.generateRuntimeTheme(legacyTheme);
    }
    return ThemeEngine.generateRuntimeTheme(MODERN_CLEAN);
  }
  
  // PRIORITY 0: If designSystem exists, use it (highest priority for new system)
  if (experienceConfig.designSystem?.config) {
    let theme = ThemeEngine.process(experienceConfig.designSystem.config);
    
    // Merge layoutID if it exists at the designSystem level
    if (experienceConfig.designSystem.layoutID) {
      theme.layoutID = experienceConfig.designSystem.layoutID;
    }

    // Apply seasonal overlays if enabled (Critical fix for real-time testing)
    if (experienceConfig.designSystem.config.seasonal?.enabledSeasons?.length > 0) {
      theme = applyEnabledSeasonalOverlays(theme, experienceConfig.designSystem.config.seasonal);
    }

    return ThemeEngine.generateRuntimeTheme(theme);
  }

  // PRIORITY 1: If themeConfig exists, use it (fallback for legacy Phase 1 saves)
  if (experienceConfig.themeConfig) {
    let theme = ThemeEngine.process(experienceConfig.themeConfig);
    
    // Apply atmosphere manual overrides from themeConfig
    if (experienceConfig.themeConfig.atmosphere) {
      theme.atmosphere = experienceConfig.themeConfig.atmosphere;
    }

    // Apply seasonal overlays if enabled (New structure)
    if (experienceConfig.themeConfig.seasonal?.enabledSeasons?.length > 0) {
      theme = applyEnabledSeasonalOverlays(theme, experienceConfig.themeConfig.seasonal);
    }
    // Legacy support for seasonalOverlays array
    else if (experienceConfig.seasonalOverlays && Array.isArray(experienceConfig.seasonalOverlays)) {
      theme = ThemeEngine.mergeSeasonalOverlays(theme, experienceConfig.seasonalOverlays);
    }
    
    return ThemeEngine.generateRuntimeTheme(theme);
  }
  
  // PRIORITY 2: Fallback to vibeTokens
  if (experienceConfig.vibeTokens) {
    const theme = convertVibeTokensToTheme(experienceConfig.vibeTokens);
    return ThemeEngine.generateRuntimeTheme(theme);
  }
  
  // PRIORITY 3: Ultimate fallback to legacy restaurant fields
  if (restaurant && (restaurant.brandColor || restaurant.fontFamily)) {
    const legacyTheme = convertLegacyFieldsToTheme(restaurant);
    return ThemeEngine.generateRuntimeTheme(legacyTheme);
  }
  
  // PRIORITY 4: Default theme if nothing else exists
  return ThemeEngine.generateRuntimeTheme(MODERN_CLEAN);
}

/**
 * Convert legacy restaurant fields (brandColor, fontFamily) to themeConfig
 * Ensures backward compatibility for restaurants created before Theme Studio
 * @param {object} restaurant - Restaurant object with legacy fields
 * @returns {object} Theme config
 */
function convertLegacyFieldsToTheme(restaurant) {
  const baseTheme = { ...MODERN_CLEAN };
  
  // Override with legacy brandColor if exists
  if (restaurant.brandColor) {
    baseTheme.colors.brand.primary = restaurant.brandColor;
  }
  
  // Override with legacy fontFamily if exists
  if (restaurant.fontFamily) {
    baseTheme.typography.fonts.heading.family = restaurant.fontFamily;
    baseTheme.typography.fonts.body.family = restaurant.fontFamily;
    baseTheme.typography.fonts.accent.family = restaurant.fontFamily;
  }
  
  return baseTheme;
}

/**
 * Convert legacy vibeTokens to new themeConfig format
 * Ensures backward compatibility
 * @param {object} vibeTokens - Legacy vibe tokens
 * @returns {object} Theme config
 */
function convertVibeTokensToTheme(vibeTokens) {
  const { dna, palette, atmosphere } = vibeTokens;
  
  return {
    version: '2.0',
    
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
        scale: 1.25
      },
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: -0.02,
        normal: 0,
        wide: 0.05
      }
    },
    
    colors: {
      brand: {
        primary: palette?.primary || '#4f46e5',
        secondary: palette?.accent || '#f43f5e',
        tertiary: '#10b981'
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
    
    spacing: {
      unit: 4,
      scale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
      cardPadding: 16,
      sectionGap: 48,
      itemGap: 16
    },
    
    borders: {
      radius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: parseInt(dna?.radius) || 16,
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
        borderRadius: 'lg',
        shadow: 'md',
        border: {
          width: 'none',
          color: 'light'
        },
        padding: 16,
        hoverEffect: 'lift'
      },
      content: {
        alignment: 'left',
        pricePosition: 'inline'
      }
    },
    
    categorySection: {
      header: {
        style: 'bold',
        size: 32,
        color: 'primary',
        alignment: 'left',
        decoration: {
          type: 'none'
        }
      },
      spacing: {
        top: 48,
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
        duration: 800,
        easing: 'easeOut'
      },
      itemEntrance: {
        type: dna?.motion === 'haptic-snap' ? 'scale' : 'stagger',
        duration: 600,
        delay: 50
      },
      interactions: {
        hover: 'lift',
        tap: 'shrink'
      }
    }
  };
}

/**
 * Apply seasonal overlays based on the new enabledSeasons configuration
 * @param {object} theme - Current theme
 * @param {object} seasonalConfig - { enabledSeasons: string[], autoEnable: boolean }
 * @returns {object} Updated theme
 */
function applyEnabledSeasonalOverlays(theme, seasonalConfig) {
  const { enabledSeasons } = seasonalConfig;
  let updatedTheme = { ...theme };

  // 1. Apply manually enabled seasons
  if (enabledSeasons && Array.isArray(enabledSeasons)) {
    enabledSeasons.forEach(seasonId => {
      const season = SEASONAL_OVERLAYS[seasonId];
      if (season?.overlay) {
        updatedTheme = ThemeEngine.mergeWithDefaults(season.overlay, updatedTheme);
        
        // Also sync atmosphere if the season has one
        if (seasonId === 'christmas' || seasonId === 'winter_zen') {
          updatedTheme.effects.atmosphere = { active: 'snow', intensity: 70 };
        } else if (seasonId === 'halloween') {
          updatedTheme.effects.atmosphere = { active: 'stars', intensity: 50 };
        } else if (seasonId === 'spring_blossom' || seasonId === 'golden_meadow' || seasonId === 'valentines') {
          updatedTheme.effects.atmosphere = { active: 'bubbles', intensity: 40 };
        } else if (seasonId === 'summer') {
          updatedTheme.effects.atmosphere = { active: 'bubbles', intensity: 60 };
        }
      }
    });
  }

  return updatedTheme;
}

// Export all functions
export default ThemeEngine;
