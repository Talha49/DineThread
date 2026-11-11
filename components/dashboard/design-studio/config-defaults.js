/**
 * Design System Configuration Defaults
 * 
 * Enterprise-grade default configuration for the Davoriq Design System.
 * Every field is intentionally defined to prevent runtime null reference errors
 * and provide sensible fallbacks for incomplete preset data.
 * 
 * @version 2.0.0
 * @author Davoriq Design Team
 */

import { deepMerge } from '@/lib/object-utils';

/**
 * Complete default configuration object
 * Used as fallback when preset data is incomplete or during initial setup
 */
export const DEFAULT_CONFIG = {
    // Color Palette - Brand Identity
    colors: {
        brand: {
            primary: '#4f46e5',      // Indigo - primary brand color
            secondary: '#f43f5e',    // Rose - accent color
            tertiary: '#10b981'      // Emerald - success/positive actions
        },
        backgrounds: {
            page: '#FFFFFF',         // Main page background
            card: '#F9FAFB',         // Card/container background
            elevated: '#FFFFFF'      // Elevated elements (modals, dropdowns)
        },
        text: {
            primary: '#111827',      // Main text color (headings, body)
            secondary: '#6B7280',    // Secondary text (descriptions, labels)
            tertiary: '#9CA3AF',     // Tertiary text (hints, disabled states)
            inverse: '#FFFFFF'       // Text on dark backgrounds
        },
        borders: {
            light: '#E5E7EB',        // Subtle borders
            medium: '#D1D5DB',       // Standard borders
            dark: '#9CA3AF'          // Emphasized borders
        }
    },

    // Typography System
    typography: {
        fonts: {
            heading: {
                family: 'Inter',     // Font family for headings
                weight: 700          // Font weight (bold)
            },
            body: {
                family: 'Inter',     // Font family for body text
                weight: 400          // Font weight (regular)
            },
            accent: {
                family: 'Inter',     // Font family for accents
                weight: 600          // Font weight (semi-bold)
            }
        },
        sizes: {
            base: 16,                // Base font size in pixels
            scale: 1.25,             // Type scale ratio
            categoryTitle: 32,
            itemName: 18,
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

    // Visual DNA - Core Design Language
    visual: {
        radius: '16px',              // Border radius for cards and buttons
        glass: 0,                    // Glass morphism intensity (0-100)
        shadow: 'md'                 // Shadow depth (none|sm|md|lg|xl)
    },

    // Background Configuration
    background: {
        type: 'solid',               // Background type (solid|gradient|pattern)
        color: '#FFFFFF',            // Solid background color
        gradient: {
            type: 'linear',          // Gradient type (linear|radial)
            angle: 180,              // Gradient angle in degrees
            stops: [
                { color: '#FFFFFF', position: 0 },
                { color: '#F9FAFB', position: 100 }
            ]
        },
        pattern: {
            type: 'dots',            // Pattern type (dots|grid|checkered)
            color: '#000000',        // Pattern color
            opacity: 0.05,           // Pattern opacity (0-1)
            scale: 1                 // Pattern scale multiplier
        }
    },

    // Effects & Animations
    effects: {
        motion: 'minimal',           // Motion style (minimal|smooth|haptic|liquid|airy)
        atmosphere: {
            active: 'none',          // Active atmosphere (none|snow|stars|bubbles)
            intensity: 0             // Effect intensity (0-100)
        }
    },

    // Menu Item Card Design
    menuItem: {
        layout: 'horizontal',        // Card layout (horizontal|vertical|overlay|minimal)
        content: {
            alignment: 'left',       // Content alignment (left|center|right)
            pricePosition: 'inline'  // Price position (inline|badge)
        },
        image: {
            enabled: true,           // Show item images
            shape: 'rounded',        // Image shape (rounded|circle|square)
            borderRadius: 'lg',      // Image border radius
            aspectRatio: '1/1',      // Image aspect ratio
            objectFit: 'cover' // Image object fit (cover|contain)
        },
        card: {
            borderRadius: 'lg',      // Card border radius (sm|md|lg|xl|xxl|full)
            shadow: 'md',            // Card shadow (none|sm|md|lg|xl)
            padding: 20,             // Card padding in pixels
            border: {
                width: 'none'        // Border width (none|thin|medium|thick)
            },
            hoverEffect: 'lift'      // Hover effect (none|lift|scale|glow)
        }
    }
};

/**
 * Deep merge utility for combining preset config with defaults
 * Ensures no undefined values in the final configuration
 *
 * Delegates to the one canonical deep-merge implementation (lib/object-utils.js)
 * instead of hand-rolling another one here - this used to be a separate,
 * subtly different merge from the one used server-side, which was exactly the
 * kind of inconsistency that caused config fields to survive resets/removals
 * incorrectly.
 *
 * @param {Object} target - Target object (defaults)
 * @param {Object} source - Source object (preset config)
 * @returns {Object} Deeply merged configuration
 */
export function deepMergeConfig(target, source) {
    return deepMerge(target, source);
}

/**
 * Validate and normalize a preset configuration
 * Ensures the preset has all required fields by merging with defaults
 * 
 * @param {Object} presetConfig - Preset configuration to validate
 * @returns {Object} Validated and complete configuration
 */
export function validatePresetConfig(presetConfig) {
    if (!presetConfig || typeof presetConfig !== 'object') {
        console.warn('Invalid preset config, returning defaults');
        return DEFAULT_CONFIG;
    }
    
    return deepMergeConfig(DEFAULT_CONFIG, presetConfig);
}

/**
 * Get a safe configuration value with fallback
 * Prevents runtime errors when accessing nested properties
 * 
 * @param {Object} config - Configuration object
 * @param {string} path - Dot-notation path (e.g., 'colors.brand.primary')
 * @param {*} fallback - Fallback value if path doesn't exist
 * @returns {*} Value at path or fallback
 */
export function getConfigValue(config, path, fallback = null) {
    const keys = path.split('.');
    let value = config;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return fallback;
        }
    }
    
    return value;
}

/**
 * Validate required fields exist in config
 * Used for runtime validation and debugging
 * 
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result with errors if any
 */
export function validateConfigStructure(config) {
    const errors = [];
    const requiredPaths = [
        'colors.brand.primary',
        'colors.backgrounds.page',
        'typography.fonts.heading',
        'visual.radius',
        'background.type',
        'effects.atmosphere',
        'menuItem.layout'
    ];
    
    for (const path of requiredPaths) {
        if (getConfigValue(config, path) === null) {
            errors.push(`Missing required field: ${path}`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}
