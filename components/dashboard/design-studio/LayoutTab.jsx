"use client";

/**
 * Advanced Layout & Composition Tab
 * 
 * Controls for overall menu structure, card design, and typography.
 */

import { useState } from 'react';
import { CardDesigner } from '../theme-studio/CardDesigner';
import { TypographyControls } from '../theme-studio/TypographyControls';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { cn } from '@/lib/utils';
import {
    LayoutGrid,
    List,
    Layers,
    Check,
    BookOpen,
    Compass,
    Settings2,
    Palette,
    PenTool,
    Sparkles,
    Waves,
    TrainFront,
    SquareStack,
    Hexagon
} from 'lucide-react';

const LAYOUT_MODES = [
    {
        id: 'grid',
        name: 'Standard / None',
        desc: 'Clean, classic grid layout',
        icon: LayoutGrid
    },
    {
        id: 'signature-showcase',
        name: 'Signature Showcase',
        desc: 'Featured dishes spotlight, then the full menu',
        icon: Sparkles,
        premium: true
    },
    { 
        id: 'bento-magazine', 
        name: 'Editorial Bento', 
        desc: 'Magazine-style grid with varied sizes',
        icon: BookOpen,
        premium: true
    },
    { 
        id: 'orbital-wheel', 
        name: 'Orbital Wheel', 
        desc: 'Futuristic circular navigation',
        icon: Compass,
        premium: true
    },
    { 
        id: 'masonry', 
        name: 'Luxury Masonry', 
        desc: 'Elegant brick-style for premium brands',
        icon: Layers 
    },
    {
        id: 'list',
        name: 'Minimal List',
        desc: 'Clean, text-focused readability',
        icon: List
    },
    {
        id: 'liquid-carousel',
        name: 'Liquid Carousel',
        desc: 'Horizontal scrolling rows per category',
        icon: Waves,
        premium: true
    },
    {
        id: 'subway-map',
        name: 'Subway Line Map',
        desc: 'Categories as stations on a single route',
        icon: TrainFront,
        premium: true
    },
    {
        id: 'menu-deck',
        name: 'Menu Deck',
        desc: 'A swipeable card stack, one dish at a time',
        icon: SquareStack,
        premium: true
    },
    {
        id: 'voronoi-mosaic',
        name: 'Voronoi Mosaic',
        desc: 'Organic tessellated photo mosaic, never a straight edge',
        icon: Hexagon,
        premium: true
    },
];

export function LayoutTab({ config, contentWidth = 600, onChange }) {
    const [activeSection, setActiveSection] = useState('mode');
    const currentLayout = config?.layoutID || 'grid';
    const menuItem = config?.menuItem || {};
    const typography = config?.typography || {};

    const sections = [
        { id: 'mode', label: 'Architecture', icon: Settings2 },
        { id: 'cards', label: 'Item Surface', icon: Palette },
        { id: 'typography', label: 'Typography Lab', icon: PenTool },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Layout & Composition</h2>
                <p className="text-sm text-zinc-500 font-medium">Define the spatial hierarchy and structural feel.</p>
            </div>

            {/* Section Switcher (Pill-style) */}
            <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 rounded-2xl w-fit">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            activeSection === section.id
                                ? "bg-white text-zinc-900 shadow-md scale-100"
                                : "text-zinc-400 hover:text-zinc-600 scale-95"
                        )}
                    >
                        <section.icon className="w-3.5 h-3.5" />
                        <span>{section.label}</span>
                    </button>
                ))}
            </div>

            {/* Layout Mode Selector */}
            {activeSection === 'mode' && (
                <ResponsiveGrid width={contentWidth} cols={{ base: 1, 448: 2 }} className="gap-4">
                    {LAYOUT_MODES.map((layout) => {
                        const Icon = layout.icon;
                        const isActive = currentLayout === layout.id;
                        return (
                            <button
                                key={layout.id}
                                onClick={() => onChange({ ...config, layoutID: layout.id })}
                                className={cn(
                                    "flex flex-col gap-4 p-6 rounded-[2rem] border-2 transition-all text-left relative group",
                                    isActive
                                        ? "border-zinc-900 bg-white shadow-2xl scale-[1.02] z-10"
                                        : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-200"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:rotate-6",
                                        isActive ? "bg-zinc-900 text-white shadow-xl" : "bg-white text-zinc-400 border border-zinc-100 shadow-sm"
                                    )}>
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    {isActive ? (
                                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    ) : layout.premium && (
                                        <div className="px-3 py-1 bg-zinc-900 text-white text-[8px] font-black uppercase tracking-tighter rounded-full">
                                            Premium
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-zinc-900 uppercase italic tracking-tighter text-lg">{layout.name}</p>
                                    <p className="text-xs text-zinc-500 mt-1 font-medium leading-relaxed">{layout.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </ResponsiveGrid>
            )}

            {/* Card Design */}
            {activeSection === 'cards' && (
                <div className="bg-white p-2 rounded-[2.5rem] border-2 border-zinc-100 shadow-sm">
                    <CardDesigner
                        value={menuItem}
                        onChange={(newMenuItem) => onChange({ ...config, menuItem: newMenuItem })}
                    />
                </div>
            )}

            {/* Typography */}
            {activeSection === 'typography' && (
                <div className="bg-white p-2 rounded-[2.5rem] border-2 border-zinc-100 shadow-sm">
                    <TypographyControls
                        value={typography}
                        onChange={(newTypography) => onChange({ ...config, typography: newTypography })}
                    />
                </div>
            )}
        </div>
    );
}
