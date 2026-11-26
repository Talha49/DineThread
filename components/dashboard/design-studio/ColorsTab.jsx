"use client";

/**
 * Advanced Colors Tab - Professional Color Architecture
 * 
 * Includes contrast checking, palette generation, and deep state management.
 */

import { useState, useMemo } from 'react';
import { Palette, Droplet, FileText, Square, RefreshCcw, ShieldCheck, AlertTriangle, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { relativeLuminance } from '@/lib/theme-engine/color-contrast';
import { DEFAULT_CONFIG } from './config-defaults';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';

export function ColorsTab({ config, contentWidth = 600, onChange }) {
    if (!config) return <NoPresetMessage />;

    const colors = config.colors || DEFAULT_CONFIG.colors;

    const handleCoreColorChange = (key, value) => {
        let newColors = JSON.parse(JSON.stringify(colors)); // Deep clone to avoid mutation

        if (key === 'brand.primary') {
            newColors.brand.primary = value;
            newColors.brand.secondary = adjustColor(value, -20);
            newColors.brand.tertiary = adjustColor(value, 40);
        }

        if (key === 'backgrounds.card') {
            newColors.backgrounds.card = value;
            const isDark = relativeLuminance(value) < 0.5;
            newColors.backgrounds.elevated = isDark ? adjustColor(value, 10) : adjustColor(value, 5);
            
            // Auto-generate all borders and lines based on the Menu Item Background
            newColors.borders.light = isDark ? adjustColor(value, 15) : adjustColor(value, -10);
            newColors.borders.medium = isDark ? adjustColor(value, 30) : adjustColor(value, -20);
            newColors.borders.dark = isDark ? adjustColor(value, 50) : adjustColor(value, -40);
            
            // Sync page background just in case, though Visual Tab usually handles it
            newColors.backgrounds.page = value;
        }

        if (key === 'text.primary') {
            newColors.text.primary = value;
            const isDark = relativeLuminance(value) < 0.5;
            newColors.text.secondary = isDark ? adjustColor(value, 40) : adjustColor(value, -40);
            newColors.text.tertiary = isDark ? adjustColor(value, 70) : adjustColor(value, -70);
            newColors.text.inverse = isDark ? '#FFFFFF' : '#111827';
        }

        onChange({ ...config, colors: newColors });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-2 bg-zinc-50 p-6 rounded-[2.5rem] border-2 border-zinc-100">
                <h3 className="text-2xl font-black tracking-tight text-zinc-900">Essential Colors</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    Note: To change the Page Background, please use the Visual Tab. Set these 3 core colors below and we'll calculate everything else.
                </p>
            </div>

            {/* Core 3 Colors */}
            <ResponsiveGrid width={contentWidth} cols={{ base: 1, 448: 2 }} className="gap-6">
                <ColorCard
                    label="Brand Accent Color"
                    desc="Used for category highlights, buttons and accents."
                    value={colors.brand.primary}
                    onChange={(val) => handleCoreColorChange('brand.primary', val)}
                    contrastBg={colors.backgrounds.card}
                />
                <ColorCard
                    label="Menu Item Background"
                    desc="The background color of the food item boxes and inactive Category Tabs."
                    value={colors.backgrounds.card}
                    onChange={(val) => handleCoreColorChange('backgrounds.card', val)}
                    contrastText={colors.text.primary}
                />
                <ColorCard
                    label="Primary Text"
                    desc="Used for Food Item Names and Category Titles."
                    value={colors.text.primary}
                    onChange={(val) => handleCoreColorChange('text.primary', val)}
                    contrastBg={colors.backgrounds.card}
                />
            </ResponsiveGrid>
        </div>
    );
}

function ColorCard({ label, desc, value, onChange, contrastBg, contrastText }) {
    const [inputValue, setInputValue] = useState(value);
    
    const contrastRatio = useMemo(() => {
        if (!contrastBg && !contrastText) return null;
        return calculateContrast(value, contrastBg || contrastText);
    }, [value, contrastBg, contrastText]);

    const isAccessible = contrastRatio >= 4.5;

    return (
        <div className="bg-white p-6 rounded-[2rem] border-2 border-zinc-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 overflow-visible">
            <div className="flex items-start justify-between">
                <div className="relative group flex items-center gap-2">
                    <h4 className="font-black text-zinc-900 leading-tight">{label}</h4>
                    <div className="cursor-help">
                        <Info className="w-4 h-4 text-zinc-300 hover:text-zinc-600 transition-colors" />
                    </div>
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-zinc-900 text-white text-[11px] font-bold tracking-wide rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                        {desc}
                        <div className="absolute top-full left-4 -mt-1 border-[6px] border-transparent border-t-zinc-900" />
                    </div>
                </div>
                
                {contrastRatio && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black tracking-tighter",
                        isAccessible ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {isAccessible ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {contrastRatio.toFixed(1)}:1
                    </div>
                )}
            </div>

            <div className="relative group">
                <div 
                    className="w-full h-24 rounded-2xl border-4 border-white shadow-inner cursor-crosshair relative overflow-hidden"
                    style={{ backgroundColor: value }}
                >
                    <input 
                        aria-label={label + " picker"}
                        type="color"
                        value={value.startsWith('#') ? value : '#000000'}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            onChange(e.target.value);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input 
                        aria-label={label}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value)) {
                                onChange(e.target.value);
                            }
                        }}
                        className="w-full px-4 py-2.5 bg-zinc-50 border-2 border-transparent rounded-xl text-xs font-mono font-bold text-zinc-900 placeholder:text-zinc-600 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        placeholder="#000000"
                    />
                </div>
                <button 
                    onClick={() => {
                        const newColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                        setInputValue(newColor);
                        onChange(newColor);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-50 border-2 border-transparent hover:border-zinc-200 transition-all"
                >
                    <RefreshCcw className="w-4 h-4 text-zinc-400" />
                </button>
            </div>
        </div>
    );
}

// Helpers
function NoPresetMessage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center animate-bounce">
                <Palette className="w-12 h-12 text-zinc-300" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-black text-zinc-900">Choose a starting point</h3>
                <p className="text-zinc-500 max-w-xs mx-auto text-sm">Select a theme from <strong>Quick Start</strong> to unlock full color customization.</p>
            </div>
        </div>
    );
}

function adjustColor(hex, percent) {
    if (!hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
}

function calculateContrast(c1, c2) {
    const lum1 = relativeLuminance(c1);
    const lum2 = relativeLuminance(c2);
    if (lum1 === null || lum2 === null) return null;
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}
