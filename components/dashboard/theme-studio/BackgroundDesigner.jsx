"use client";

/**
 * Background Designer Component
 * 
 * Allows restaurant owners to customize their menu background.
 * Supports: Solid colors, gradients, patterns, and images.
 * 
 * UI/UX Principles:
 * - Mobile-first responsive design
 * - Live preview for instant feedback
 * - Progressive disclosure (simple → advanced)
 * - Visual pattern library
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { renderBackground, getPatternPreview } from '@/lib/theme-engine/background-renderer';
import { ImageUpload } from '@/components/dashboard/ImageUpload';
import {
    Palette,
    Sparkles,
    Image as ImageIcon,
    Grid3x3,
    ChevronDown,
    Check
} from 'lucide-react';

const BACKGROUND_TYPES = [
    { id: 'solid', label: 'Solid Color', icon: Palette },
    { id: 'gradient', label: 'Gradient', icon: Sparkles },
    { id: 'pattern', label: 'Pattern', icon: Grid3x3 },
    { id: 'image', label: 'Image', icon: ImageIcon }
];

const PATTERN_TYPES = [
    { id: 'dots', label: 'Dots', description: 'Clean dotted pattern' },
    { id: 'grid', label: 'Grid', description: 'Squared grid lines' },
    { id: 'waves', label: 'Waves', description: 'Wavy decorative lines' },
    { id: 'checkered', label: 'Checkered', description: 'Classic checkerboard' },
    { id: 'diagonal', label: 'Diagonal', description: 'Diagonal stripes' }
];

const GRADIENT_PRESETS = [
    {
        id: 'sunset',
        label: 'Sunset',
        stops: [
            { color: '#FF6B6B', position: 0 },
            { color: '#FFA500', position: 100 }
        ]
    },
    {
        id: 'ocean',
        label: 'Ocean',
        stops: [
            { color: '#667eea', position: 0 },
            { color: '#764ba2', position: 100 }
        ]
    },
    {
        id: 'mint',
        label: 'Mint',
        stops: [
            { color: '#00F5A0', position: 0 },
            { color: '#00D9F5', position: 100 }
        ]
    },
    {
        id: 'rose',
        label: 'Rose Gold',
        stops: [
            { color: '#ED4264', position: 0 },
            { color: '#FFEDBC', position: 100 }
        ]
    }
];

export function BackgroundDesigner({ value, onChange }) {
    const [activeType, setActiveType] = useState(value?.type || 'solid');

    const handleTypeChange = (type) => {
        setActiveType(type);

        // Update with default config for selected type
        const defaultConfig = getDefaultConfig(type);
        onChange({ ...value, type, ...defaultConfig });
    };

    const updateConfig = (updates) => {
        onChange({ ...value, ...updates });
    };

    return (
        <div className="space-y-6">
            {/* Type Selector */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Background Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {BACKGROUND_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isActive = activeType === type.id;

                        return (
                            <button
                                key={type.id}
                                onClick={() => handleTypeChange(type.id)}
                                className={cn(
                                    "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                    "hover:border-zinc-400 hover:shadow-md",
                                    isActive
                                        ? "border-zinc-900 bg-zinc-50 shadow-lg"
                                        : "border-zinc-200 bg-white"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <Icon className={cn(
                                    "w-6 h-6",
                                    isActive ? "text-zinc-900" : "text-zinc-400"
                                )} />
                                <span className={cn(
                                    "text-xs font-medium",
                                    isActive ? "text-zinc-900" : "text-zinc-600"
                                )}>
                                    {type.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Conditional Panels */}
            <div className="min-h-[300px]">
                {activeType === 'solid' && (
                    <SolidColorPanel value={value} onChange={updateConfig} />
                )}

                {activeType === 'gradient' && (
                    <GradientPanel value={value} onChange={updateConfig} />
                )}

                {activeType === 'pattern' && (
                    <PatternPanel value={value} onChange={updateConfig} />
                )}

                {activeType === 'image' && (
                    <ImagePanel value={value} onChange={updateConfig} />
                )}
            </div>

            {/* Live Preview */}
            <PreviewPanel config={value} />
        </div>
    );
}

/**
 * Solid Color Panel
 */
function SolidColorPanel({ value, onChange }) {
    const color = value?.color || '#FFFFFF';

    return (
        <div className="space-y-4">
            <label className="block text-sm font-semibold text-zinc-900">
                Background Color
            </label>

            <div className="flex items-center gap-4">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onChange({ color: e.target.value })}
                    className="w-20 h-20 rounded-xl border-2 border-zinc-200 cursor-pointer"
                />

                <div className="flex-1">
                    <input
                        type="text"
                        value={color}
                        onChange={(e) => onChange({ color: e.target.value })}
                        placeholder="#FFFFFF"
                        className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 font-mono text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                        Enter hex color code or use the color picker
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Gradient Panel
 */
function GradientPanel({ value, onChange }) {
    const gradient = value?.gradient || {
        type: 'linear',
        angle: 135,
        stops: [
            { color: '#667eea', position: 0 },
            { color: '#764ba2', position: 100 }
        ]
    };

    const applyPreset = (preset) => {
        onChange({
            gradient: {
                ...gradient,
                stops: preset.stops
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Gradient Type */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Gradient Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => onChange({ gradient: { ...gradient, type: 'linear' } })}
                        className={cn(
                            "px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all",
                            gradient.type === 'linear'
                                ? "border-zinc-900 bg-zinc-50"
                                : "border-zinc-200 hover:border-zinc-300"
                        )}
                    >
                        Linear
                    </button>
                    <button
                        onClick={() => onChange({ gradient: { ...gradient, type: 'radial' } })}
                        className={cn(
                            "px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all",
                            gradient.type === 'radial'
                                ? "border-zinc-900 bg-zinc-50"
                                : "border-zinc-200 hover:border-zinc-300"
                        )}
                    >
                        Radial
                    </button>
                </div>
            </div>

            {/* Angle (for linear) */}
            {gradient.type === 'linear' && (
                <div>
                    <label className="block text-sm font-semibold text-zinc-900 mb-3">
                        Angle: {gradient.angle}°
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={gradient.angle}
                        onChange={(e) => onChange({
                            gradient: { ...gradient, angle: parseInt(e.target.value) }
                        })}
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            )}

            {/* Quick Presets */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Quick Presets
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {GRADIENT_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => applyPreset(preset)}
                            className="group relative h-20 rounded-xl overflow-hidden border-2 border-zinc-200 hover:border-zinc-900 hover:scale-105 transition-all"
                            style={{
                                background: `linear-gradient(135deg, ${preset.stops[0].color}, ${preset.stops[1].color})`
                            }}
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm">
                                <p className="text-xs font-medium text-white">{preset.label}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Stops */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Gradient Colors
                </label>
                <div className="space-y-3">
                    {gradient.stops.map((stop, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <input
                                type="color"
                                value={stop.color}
                                onChange={(e) => {
                                    const newStops = [...gradient.stops];
                                    newStops[index].color = e.target.value;
                                    onChange({ gradient: { ...gradient, stops: newStops } });
                                }}
                                className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={stop.color}
                                onChange={(e) => {
                                    const newStops = [...gradient.stops];
                                    newStops[index].color = e.target.value;
                                    onChange({ gradient: { ...gradient, stops: newStops } });
                                }}
                                className="flex-1 px-3 py-2 rounded-lg border-2 border-zinc-200 font-mono text-sm focus:border-zinc-900 focus:outline-none"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Pattern Panel
 */
function PatternPanel({ value, onChange }) {
    const pattern = value?.pattern || {
        type: 'dots',
        color: '#000000',
        opacity: 0.1,
        scale: 1
    };
    const bgColor = value?.color || '#FFFFFF';

    return (
        <div className="space-y-6">
            {/* Pattern Library */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Pattern Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PATTERN_TYPES.map((type) => {
                        const isActive = pattern.type === type.id;
                        const previewStyle = getPatternPreview(type.id);

                        return (
                            <button
                                key={type.id}
                                onClick={() => onChange({ pattern: { ...pattern, type: type.id } })}
                                className={cn(
                                    "relative group flex flex-col gap-2 p-3 rounded-xl border-2 transition-all",
                                    "hover:border-zinc-400 hover:shadow-md",
                                    isActive
                                        ? "border-zinc-900 bg-zinc-50"
                                        : "border-zinc-200 bg-white"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center z-10">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}

                                <div
                                    className="w-full h-16 rounded-lg border border-zinc-200"
                                    style={previewStyle}
                                />

                                <div className="text-left">
                                    <p className="text-xs font-semibold text-zinc-900">{type.label}</p>
                                    <p className="text-[10px] text-zinc-500">{type.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Background Color */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Background Color
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => onChange({ color: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => onChange({ color: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-zinc-200 font-mono text-sm focus:border-zinc-900 focus:outline-none"
                    />
                </div>
            </div>

            {/* Pattern Color */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Pattern Color
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={pattern.color}
                        onChange={(e) => onChange({ pattern: { ...pattern, color: e.target.value } })}
                        className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={pattern.color}
                        onChange={(e) => onChange({ pattern: { ...pattern, color: e.target.value } })}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-zinc-200 font-mono text-sm focus:border-zinc-900 focus:outline-none"
                    />
                </div>
            </div>

            {/* Pattern Opacity */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Pattern Opacity: {Math.round(pattern.opacity * 100)}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={pattern.opacity * 100}
                    onChange={(e) => onChange({
                        pattern: { ...pattern, opacity: parseInt(e.target.value) / 100 }
                    })}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Pattern Scale */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Pattern Size: {pattern.scale}x
                </label>
                <input
                    type="range"
                    min="50"
                    max="300"
                    value={pattern.scale * 100}
                    onChange={(e) => onChange({
                        pattern: { ...pattern, scale: parseInt(e.target.value) / 100 }
                    })}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
}

/**
 * Image Upload Panel
 */
function ImagePanel({ value, onChange }) {
    const media = value?.media || {
        url: '',
        position: 'center',
        size: 'cover',
        blur: 0,
        overlay: { color: '#000000', opacity: 0.5 }
    };

    return (
        <div className="space-y-6">
            {/* Background Image */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Background Image
                </label>
                <ImageUpload
                    value={media.url}
                    onChange={(url) => onChange({ media: { ...media, url } })}
                />
                <p className="text-xs text-zinc-500 mt-2">
                    Uploads are cropped, compressed, and hosted for you - no external URL needed.
                </p>
            </div>

            {/* Position */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Position
                </label>
                <select
                    value={media.position}
                    onChange={(e) => onChange({ media: { ...media, position: e.target.value } })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 text-sm focus:border-zinc-900 focus:outline-none cursor-pointer"
                >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                </select>
            </div>

            {/* Size */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Size
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {['cover', 'contain'].map((size) => (
                        <button
                            key={size}
                            onClick={() => onChange({ media: { ...media, size } })}
                            className={cn(
                                "px-4 py-3 rounded-xl border-2 font-medium text-sm capitalize transition-all",
                                media.size === size
                                    ? "border-zinc-900 bg-zinc-50"
                                    : "border-zinc-200 hover:border-zinc-300"
                            )}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Blur */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Blur: {media.blur}px
                </label>
                <input
                    type="range"
                    min="0"
                    max="20"
                    value={media.blur}
                    onChange={(e) => onChange({
                        media: { ...media, blur: parseInt(e.target.value) }
                    })}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Overlay */}
            <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-3">
                    Overlay Opacity: {Math.round(media.overlay.opacity * 100)}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={media.overlay.opacity * 100}
                    onChange={(e) => onChange({
                        media: {
                            ...media,
                            overlay: { ...media.overlay, opacity: parseInt(e.target.value) / 100 }
                        }
                    })}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
}

/**
 * Live Preview Panel
 */
function PreviewPanel({ config }) {
    const backgroundStyle = renderBackground(config);

    return (
        <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-3">
                Live Preview
            </label>
            <div
                className="w-full h-40 md:h-60 rounded-2xl border-2 border-zinc-200 overflow-hidden shadow-lg relative"
                style={backgroundStyle}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md">
                        <p className="text-sm font-semibold text-zinc-900">
                            Menu Preview
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Helper: Get default config for background type
 */
function getDefaultConfig(type) {
    switch (type) {
        case 'solid':
            return { color: '#FFFFFF' };

        case 'gradient':
            return {
                gradient: {
                    type: 'linear',
                    angle: 135,
                    stops: [
                        { color: '#667eea', position: 0 },
                        { color: '#764ba2', position: 100 }
                    ]
                }
            };

        case 'pattern':
            return {
                color: '#FFFFFF',
                pattern: {
                    type: 'dots',
                    color: '#000000',
                    opacity: 0.1,
                    scale: 1
                }
            };

        case 'image':
            return {
                media: {
                    url: '',
                    position: 'center',
                    size: 'cover',
                    blur: 0,
                    overlay: { color: '#000000', opacity: 0.5 }
                }
            };

        default:
            return { color: '#FFFFFF' };
    }
}
