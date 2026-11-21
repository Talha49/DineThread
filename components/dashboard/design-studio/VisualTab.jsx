"use client";

/**
 * Advanced Visual DNA Tab
 * 
 * Controls for shape, structural depth, textures, and canvas style.
 */

import { Slider } from '@/components/ui/Slider';
import { BackgroundDesigner } from '../theme-studio/BackgroundDesigner';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { Square, Layers, Waves, CloudFog } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VisualTab({ config, contentWidth = 600, onChange }) {
    const visual = config?.visual || { radius: '16px', glass: 0, shadow: 'md', texture: 'none' };
    const background = config?.background || { type: 'solid', color: '#FFFFFF' };

    const SHADOW_OPTIONS = [
        { id: 'none', label: 'Flat', desc: 'No depth', icon: '⬜' },
        { id: 'sm', label: 'Soft', desc: 'Subtle lift', icon: '☁️' },
        { id: 'md', label: 'Natural', desc: 'Default depth', icon: '👤' },
        { id: 'lg', label: 'Sharp', desc: 'Focused shadow', icon: '📐' },
        { id: 'xl', label: 'Deep', desc: 'Heavy elevation', icon: '🌑' }
    ];

    const TEXTURE_OPTIONS = [
        { id: 'none', label: 'Silk', desc: 'Pure & smooth', icon: '✨' },
        { id: 'grain', label: 'Grain', desc: 'Analog feel', icon: '🎞️' },
        { id: 'noise', label: 'Noise', desc: 'Digital texture', icon: '📺' },
        { id: 'dust', label: 'Dust', desc: 'Vintage paper', icon: '📜' }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Visual DNA</h2>
                <p className="text-sm text-zinc-500 font-medium">Define the core structural feel of your menu.</p>
            </div>

            {/* Geometry & Glass */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-zinc-400" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Geometry & Glass</label>
                </div>
                
                <ResponsiveGrid
                    width={contentWidth}
                    cols={{ base: 1, 448: 2 }}
                    className="gap-8 bg-zinc-50 p-8 rounded-[2.5rem] border-2 border-zinc-100"
                >
                    <Slider
                        label="Corner Radius"
                        value={parseInt(visual.radius) || 16}
                        min={0}
                        max={60}
                        suffix="px"
                        onChange={(val) => onChange({
                            ...config,
                            visual: { ...visual, radius: `${val}px` }
                        })}
                    />
                    <Slider
                        label="Glassmorphism"
                        value={visual.glass || 0}
                        min={0}
                        max={100}
                        suffix="%"
                        onChange={(val) => onChange({
                            ...config,
                            visual: { ...visual, glass: val }
                        })}
                    />
                </ResponsiveGrid>
            </section>

            {/* Shadow Depth */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Shadow Architecture</label>
                </div>

                <ResponsiveGrid width={contentWidth} cols={{ base: 2, 384: 3, 672: 5 }} className="gap-3">
                    {SHADOW_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => onChange({
                                ...config,
                                visual: { ...visual, shadow: opt.id }
                            })}
                            className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                                visual.shadow === opt.id
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-xl"
                                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                            )}
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-wider">{opt.label}</p>
                            </div>
                        </button>
                    ))}
                </ResponsiveGrid>
            </section>

            {/* Texture Overlays */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-zinc-400" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Surface Texture</label>
                </div>

                <ResponsiveGrid width={contentWidth} cols={{ base: 2, 512: 4 }} className="gap-4">
                    {TEXTURE_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => onChange({
                                ...config,
                                visual: { ...visual, texture: opt.id }
                            })}
                            className={cn(
                                "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                                visual.texture === opt.id
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-xl"
                                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                            )}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight">{opt.label}</p>
                                <p className="text-[9px] opacity-60 font-bold">{opt.desc}</p>
                            </div>
                        </button>
                    ))}
                </ResponsiveGrid>
            </section>

            {/* Canvas Designer */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <CloudFog className="w-4 h-4 text-zinc-400" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Canvas Designer</label>
                </div>
                <div className="bg-white p-2 rounded-[2.5rem] border-2 border-zinc-100 shadow-sm overflow-hidden">
                    <BackgroundDesigner
                        value={background}
                        onChange={(bg) => onChange({ ...config, background: bg })}
                    />
                </div>
            </section>
        </div>
    );
}
