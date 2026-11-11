/**
 * Unified Preset Library
 * 
 * Professional collection of curated design presets for Davoriq.
 * Each preset is a complete, validated design system configuration.
 * 
 * @version 2.0.0
 */

import { DEFAULT_CONFIG, validatePresetConfig } from './config-defaults';

/**
 * Design Presets Collection
 */
export const DESIGN_PRESETS = [
    {
        id: 'midnight-neon',
        name: 'Midnight Neon',
        category: 'Bold',
        emoji: '🌃',
        description: 'Cyberpunk aesthetics with dark glass and neon accents',
        config: {
            colors: {
                brand: { primary: '#2dd4bf', secondary: '#f472b6', tertiary: '#a78bfa' },
                backgrounds: { page: '#0f172a', card: 'rgba(15, 23, 42, 0.8)', elevated: 'rgba(30, 41, 59, 0.9)' },
                text: { primary: '#f8fafc', secondary: '#cbd5e1', tertiary: '#94a3b8', inverse: '#0f172a' },
                borders: { light: 'rgba(45, 212, 191, 0.1)', medium: 'rgba(45, 212, 191, 0.3)', dark: 'rgba(45, 212, 191, 0.5)' }
            },
            typography: {
                fonts: { heading: { family: 'Inter', weight: 900 }, body: { family: 'Inter', weight: 400 }, accent: { family: 'Inter', weight: 600 } },
                sizes: { base: 16, scale: 1.25 }
            },
            visual: { radius: '12px', glass: 45, shadow: 'xl' },
            background: { type: 'gradient', gradient: { type: 'linear', angle: 135, stops: [{ color: '#0f172a', position: 0 }, { color: '#1e293b', position: 100 }] } },
            layoutID: 'grid'
        }
    },
    {
        id: 'alpine-frost',
        name: 'Alpine Frost',
        category: 'Elegant',
        emoji: '❄️',
        description: 'Pure, crisp design with frosted glass and snow effects',
        config: {
            colors: {
                brand: { primary: '#0ea5e9', secondary: '#f8fafc', tertiary: '#60a5fa' },
                backgrounds: { page: '#f8fafc', card: 'rgba(255, 255, 255, 0.9)', elevated: 'rgba(255, 255, 255, 0.95)' },
                text: { primary: '#0f172a', secondary: '#475569', tertiary: '#94a3b8', inverse: '#ffffff' },
                borders: { light: '#e2e8f0', medium: '#cbd5e1', dark: '#94a3b8' }
            },
            typography: {
                fonts: { heading: { family: 'Outfit', weight: 700 }, body: { family: 'Outfit', weight: 400 }, accent: { family: 'Outfit', weight: 600 } },
                sizes: { base: 16, scale: 1.2 }
            },
            visual: { radius: '20px', glass: 60, shadow: 'lg' },
            background: { type: 'solid', color: '#f8fafc' },
            layoutID: 'grid'
        }
    },
    {
        id: 'sunset-bistro',
        name: 'Sunset Bistro',
        category: 'Warm',
        emoji: '🌅',
        description: 'Warm, cozy atmosphere with elegant serif typography',
        config: {
            colors: {
                brand: { primary: '#f97316', secondary: '#7c2d12', tertiary: '#fb923c' },
                backgrounds: { page: '#fff7ed', card: '#ffffff', elevated: '#ffedd5' },
                text: { primary: '#431407', secondary: '#7c2d12', tertiary: '#9a3412', inverse: '#ffffff' },
                borders: { light: '#ffedd5', medium: '#fed7aa', dark: '#f97316' }
            },
            typography: {
                fonts: { heading: { family: 'Playfair Display', weight: 700 }, body: { family: 'Inter', weight: 400 }, accent: { family: 'Playfair Display', weight: 600 } },
                sizes: { base: 18, scale: 1.3 }
            },
            visual: { radius: '8px', glass: 0, shadow: 'md' },
            background: { type: 'solid', color: '#fff7ed' },
            layoutID: 'list'
        }
    },
    {
        id: 'organic-matcha',
        name: 'Organic Matcha',
        category: 'Minimal',
        emoji: '🍃',
        description: 'Earthy tones and smooth motion for a calm experience',
        config: {
            colors: {
                brand: { primary: '#65a30d', secondary: '#365314', tertiary: '#84cc16' },
                backgrounds: { page: '#f7fee7', card: '#ffffff', elevated: '#ecfccb' },
                text: { primary: '#1a2e05', secondary: '#365314', tertiary: '#4d7c0f', inverse: '#ffffff' },
                borders: { light: '#ecfccb', medium: '#d9f99d', dark: '#a3e635' }
            },
            typography: {
                fonts: { heading: { family: 'Montserrat', weight: 700 }, body: { family: 'Montserrat', weight: 400 }, accent: { family: 'Montserrat', weight: 600 } },
                sizes: { base: 16, scale: 1.2 }
            },
            visual: { radius: '30px', glass: 10, shadow: 'sm' },
            background: { type: 'solid', color: '#f7fee7' },
            layoutID: 'grid'
        }
    },
    {
        id: 'royal-velvet',
        name: 'Royal Velvet',
        category: 'Luxury',
        emoji: '👑',
        description: 'Deep purple and gold for a truly premium feel',
        config: {
            colors: {
                brand: { primary: '#7c3aed', secondary: '#fbbf24', tertiary: '#4c1d95' },
                backgrounds: { page: '#1e1b4b', card: 'rgba(30, 27, 75, 0.7)', elevated: 'rgba(49, 46, 129, 0.8)' },
                text: { primary: '#ffffff', secondary: '#c7d2fe', tertiary: '#a5b4fc', inverse: '#1e1b4b' },
                borders: { light: 'rgba(251, 191, 36, 0.2)', medium: 'rgba(251, 191, 36, 0.4)', dark: '#fbbf24' }
            },
            typography: {
                fonts: { heading: { family: 'Playfair Display', weight: 900 }, body: { family: 'Inter', weight: 400 }, accent: { family: 'Inter', weight: 600 } },
                sizes: { base: 17, scale: 1.4 }
            },
            visual: { radius: '0px', glass: 30, shadow: '2xl' },
            background: { type: 'gradient', gradient: { type: 'radial', stops: [{ color: '#1e1b4b', position: 0 }, { color: '#0f172a', position: 100 }] } },
            layoutID: 'grid'
        }
    },
    {
        id: 'cyber-volt',
        name: 'Cyber Volt',
        category: 'Bold',
        emoji: '⚡',
        description: 'High-voltage yellow on black for maximum impact',
        config: {
            colors: {
                brand: { primary: '#facc15', secondary: '#000000', tertiary: '#eab308' },
                backgrounds: { page: '#000000', card: '#111111', elevated: '#1a1a1a' },
                text: { primary: '#facc15', secondary: '#a1a1aa', tertiary: '#71717a', inverse: '#000000' },
                borders: { light: '#27272a', medium: '#3f3f46', dark: '#facc15' }
            },
            typography: {
                fonts: { heading: { family: 'Bebas Neue', weight: 400 }, body: { family: 'Inter', weight: 400 }, accent: { family: 'Bebas Neue', weight: 400 } },
                sizes: { base: 18, scale: 1.5 }
            },
            visual: { radius: '4px', glass: 0, shadow: 'none' },
            background: { type: 'solid', color: '#000000' },
            layoutID: 'list'
        }
    },
    {
        id: 'crystal-clear',
        name: 'Crystal Clear',
        category: 'Minimal',
        emoji: '💎',
        description: 'Minimalist glassmorphism with pure white accents',
        config: {
            colors: {
                brand: { primary: '#6366f1', secondary: '#ffffff', tertiary: '#818cf8' },
                backgrounds: { page: '#ffffff', card: 'rgba(255, 255, 255, 0.7)', elevated: 'rgba(255, 255, 255, 0.9)' },
                text: { primary: '#18181b', secondary: '#52525b', tertiary: '#a1a1aa', inverse: '#ffffff' },
                borders: { light: '#f4f4f5', medium: '#e4e4e7', dark: '#d4d4d8' }
            },
            typography: {
                fonts: { heading: { family: 'Outfit', weight: 800 }, body: { family: 'Outfit', weight: 400 }, accent: { family: 'Outfit', weight: 600 } },
                sizes: { base: 16, scale: 1.25 }
            },
            visual: { radius: '24px', glass: 80, shadow: 'xl' },
            background: { type: 'solid', color: '#ffffff' },
            layoutID: 'grid'
        }
    },
    {
        id: 'retro-diner',
        name: 'Retro Diner',
        category: 'Playful',
        emoji: '🕹️',
        description: 'Playful vintage vibes with bold primary colors',
        config: {
            colors: {
                brand: { primary: '#dc2626', secondary: '#fbbf24', tertiary: '#3b82f6' },
                backgrounds: { page: '#fff7ed', card: '#ffffff', elevated: '#fef3c7' },
                text: { primary: '#1c1917', secondary: '#44403c', tertiary: '#78716c', inverse: '#ffffff' },
                borders: { light: '#fef3c7', medium: '#fde68a', dark: '#fbbf24' }
            },
            typography: {
                fonts: { heading: { family: 'Inter', weight: 800 }, body: { family: 'Inter', weight: 400 }, accent: { family: 'Inter', weight: 700 } },
                sizes: { base: 17, scale: 1.3 }
            },
            visual: { radius: '8px', glass: 0, shadow: 'lg' },
            background: { type: 'pattern', pattern: { type: 'checkered', color: '#fbbf24', opacity: 0.1, scale: 1 } },
            layoutID: 'grid'
        }
    }
];

export function getPresetById(id) {
    const preset = DESIGN_PRESETS.find(p => p.id === id);
    if (!preset) return null;
    return { ...preset, config: validatePresetConfig(preset.config) };
}

export function getPresetsByCategory(category) {
    return DESIGN_PRESETS.filter(p => p.category === category).map(preset => ({ ...preset, config: validatePresetConfig(preset.config) }));
}

export function getCategories() {
    return [...new Set(DESIGN_PRESETS.map(p => p.category))];
}
