"use client";

/**
 * Advanced Motion & Atmosphere Tab
 * 
 * Controls for entrance animations, hover states, and environmental effects.
 */

import { cn } from "@/lib/utils";
import { Sparkles, MousePointer2, Wind, Zap } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { ResponsiveGrid } from "@/components/ui/ResponsiveGrid";

const ENTRANCE_OPTIONS = [
    { id: 'stagger', name: 'Cascading Flow', desc: 'Items slide up one by one', icon: '🌊' },
    { id: 'fade', name: 'Soft Reveal', desc: 'Graceful opacity transition', icon: '✨' },
    { id: 'scale', name: 'Elastic Pop', desc: 'Scale bounce entrance', icon: '🎈' },
    { id: 'none', name: 'Instant', desc: 'No animations', icon: '⏹️' },
];

const HOVER_OPTIONS = [
    { id: 'lift', name: 'Float', desc: 'Rise with shadow', icon: '☁️' },
    { id: 'glow', name: 'Glow', desc: 'Brand color glow', icon: '💡' },
    { id: 'scale', name: 'Zoom', desc: 'Subtle scale up', icon: '🔍' },
    { id: 'none', name: 'None', desc: 'No hover effect', icon: '🚫' },
];

const ATMOSPHERE_OPTIONS = [
    { id: 'none', name: 'Vacuum', desc: 'No background particles', icon: '🌌' },
    { id: 'snow', name: 'Snowfall', desc: 'Gentle winter particles', icon: '❄️' },
    { id: 'stars', name: 'Starfield', desc: 'Twinkling night sky', icon: '✨' },
    { id: 'bubbles', name: 'Bubbles', desc: 'Rising airy circles', icon: '🫧' },
    { id: 'rain', name: 'Rainfall', desc: 'Subtle vertical lines', icon: '🌧️' }
];

export function MotionTab({ config, contentWidth = 600, onChange }) {
    const animations = config?.animations || {};
    const entranceType = animations?.itemEntrance?.type || 'stagger';
    // Single source of truth for hover effect is menuItem.card.hoverEffect -
    // this used to also be writable/readable via animations.interactions.hover,
    // a second control (in Item Surface's now-removed Effects tab) writing a
    // second field for the exact same behavior. Whichever one you touched
    // last silently won, which read as "the hover effect setting doesn't work."
    const hoverType = config?.menuItem?.card?.hoverEffect || 'lift';

    // Atmosphere is often stored in effects.atmosphere
    const effects = config?.effects || { atmosphere: { active: 'none', intensity: 0 } };
    const atmosphere = effects.atmosphere || { active: 'none', intensity: 0 };

    const setEntrance = (type) => onChange({
        ...config,
        animations: {
            ...(animations),
            itemEntrance: { type, duration: 600, delay: 50 }
        }
    });

    const setHover = (type) => onChange({
        ...config,
        menuItem: {
            ...(config?.menuItem),
            card: { ...(config?.menuItem?.card), hoverEffect: type }
        }
    });

    const setAtmosphere = (active) => onChange({
        ...config,
        effects: {
            ...effects,
            atmosphere: { ...atmosphere, active }
        }
    });

    const setIntensity = (val) => onChange({
        ...config,
        effects: {
            ...effects,
            atmosphere: { ...atmosphere, intensity: val }
        }
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Motion & Atmosphere</h2>
                <p className="text-sm text-zinc-500 font-medium">Bring your menu to life with professional physics.</p>
            </div>

            {/* Entrance Animations */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-zinc-400" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Page Entrance</label>
                </div>
                <ResponsiveGrid width={contentWidth} cols={{ base: 1, 384: 2 }} className="gap-4">
                    {ENTRANCE_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setEntrance(opt.id)}
                            className={cn(
                                "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group",
                                entranceType === opt.id
                                    ? "border-zinc-900 bg-zinc-900 text-white shadow-xl"
                                    : "border-zinc-100 bg-white hover:border-zinc-200"
                            )}
                        >
                            <span className="text-3xl group-hover:rotate-12 transition-transform shrink-0">{opt.icon}</span>
                            <div>
                                <p className="font-bold text-sm">{opt.name}</p>
                                <p className={cn("text-[10px] font-medium", entranceType === opt.id ? "text-white/60" : "text-zinc-400")}>{opt.desc}</p>
                            </div>
                        </button>
                    ))}
                </ResponsiveGrid>
            </section>

            {/* Interaction State */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4 text-zinc-400" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Interaction Feedback</label>
                </div>
                <ResponsiveGrid width={contentWidth} cols={{ base: 2, 512: 4 }} className="gap-3">
                    {HOVER_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setHover(opt.id)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                                hoverType === opt.id
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-xl"
                                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                            )}
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-wider">{opt.name}</p>
                            </div>
                        </button>
                    ))}
                </ResponsiveGrid>
            </section>

            {/* Environmental Atmosphere */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-zinc-400" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Atmosphere Engine</label>
                </div>

                <ResponsiveGrid width={contentWidth} cols={{ base: 2, 384: 3, 672: 5 }} className="gap-3">
                    {ATMOSPHERE_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setAtmosphere(opt.id)}
                            className={cn(
                                "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                atmosphere.active === opt.id
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-xl"
                                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                            )}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <p className="text-[10px] font-black uppercase text-center">{opt.name}</p>
                        </button>
                    ))}
                </ResponsiveGrid>

                {atmosphere.active !== 'none' && (
                    <div className="bg-zinc-50 p-8 rounded-[2rem] border-2 border-zinc-100 animate-in slide-in-from-top-2 duration-300">
                        <Slider
                            label="Effect Intensity"
                            value={atmosphere.intensity || 0}
                            min={0}
                            max={100}
                            suffix="%"
                            onChange={setIntensity}
                        />
                    </div>
                )}
            </section>
        </div>
    );
}
