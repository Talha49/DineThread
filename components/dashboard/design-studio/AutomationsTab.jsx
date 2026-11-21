"use client";

/**
 * Advanced Automations & Scheduling Tab
 * 
 * Controls for seasonal transitions and AI-driven layout optimization.
 */

import { Calendar, Bot, Zap, Clock } from 'lucide-react';
import { SeasonalManager } from '../theme-studio/SeasonalManager';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';

export function AutomationsTab({ config, contentWidth = 600, onChange }) {
    const handleSeasonalChange = (partialUpdate) => {
        onChange({
            ...config,
            ...partialUpdate,
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Automations</h2>
                <p className="text-sm text-zinc-500 font-medium">Let your menu evolve automatically with your business.</p>
            </div>

            {/* Seasonal Engine */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Seasonal Engine</label>
                </div>

                <div className="bg-white rounded-[2.5rem] border-2 border-zinc-100 p-2 shadow-sm">
                    <SeasonalManager
                        value={config?.seasonal}
                        atmosphere={config?.effects?.atmosphere}
                        onChange={handleSeasonalChange}
                    />
                </div>
            </section>

            {/* Smart Optimization */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-zinc-400" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Intelligence (BETA)</label>
                </div>

                <ResponsiveGrid width={contentWidth} cols={{ base: 1, 448: 2 }} className="gap-4">
                    {/* Heatmap Optimization */}
                    <div className={cn(
                        "p-8 rounded-[2rem] flex flex-col justify-between relative overflow-hidden transition-all duration-500",
                        config?.intelligence?.heatmap?.enabled
                            ? "bg-zinc-900 text-white ring-4 ring-primary/20"
                            : "bg-zinc-50 border-2 border-zinc-100"
                    )}>
                        <Zap className={cn(
                            "absolute -right-4 -top-4 w-32 h-32 opacity-10 transition-transform duration-1000",
                            config?.intelligence?.heatmap?.enabled ? "scale-110 text-primary rotate-12" : "scale-100"
                        )} />

                        <div className="relative z-10">
                            <div className={cn(
                                "w-fit p-3 rounded-2xl mb-4 transition-colors",
                                config?.intelligence?.heatmap?.enabled ? "bg-white/10" : "bg-white shadow-sm"
                            )}>
                                <Clock className={cn("w-5 h-5", config?.intelligence?.heatmap?.enabled ? "text-primary" : "text-zinc-400")} />
                            </div>
                            <h3 className={cn(
                                "text-lg font-black italic tracking-tight mb-2 uppercase",
                                config?.intelligence?.heatmap?.enabled ? "text-white" : "text-zinc-900"
                            )}>Heatmap Optimization</h3>
                            <p className={cn(
                                "text-xs font-medium leading-relaxed",
                                config?.intelligence?.heatmap?.enabled ? "text-white/50" : "text-zinc-500"
                            )}>
                                AI analyzes customer interactions to automatically promote high-margin items during peak hours.
                            </p>

                            {config?.intelligence?.heatmap?.enabled && (
                                <div className="mt-6 flex items-center gap-3 animate-in slide-in-from-left-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-primary flex items-center justify-center text-[8px] font-bold">AI</div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Optimizing Live...</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex items-center gap-4 relative z-10">
                            <button
                                onClick={() => onChange({
                                    ...config,
                                    intelligence: {
                                        ...config?.intelligence,
                                        heatmap: { ...config?.intelligence?.heatmap, enabled: !config?.intelligence?.heatmap?.enabled }
                                    }
                                })}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all",
                                    config?.intelligence?.heatmap?.enabled
                                        ? "bg-primary text-white shadow-lg shadow-primary/40"
                                        : "bg-white text-zinc-900 border-2 border-zinc-200"
                                )}
                            >
                                {config?.intelligence?.heatmap?.enabled ? 'Active' : 'Activate AI'}
                            </button>

                            {config?.intelligence?.heatmap?.enabled && (
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div
                                        onClick={() => onChange({
                                            ...config,
                                            intelligence: {
                                                ...config?.intelligence,
                                                heatmap: { ...config?.intelligence?.heatmap, showPreview: !config?.intelligence?.heatmap?.showPreview }
                                            }
                                        })}
                                        className={cn(
                                            "w-8 h-4 rounded-full relative transition-colors",
                                            config?.intelligence?.heatmap?.showPreview ? "bg-primary" : "bg-zinc-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-2 h-2 rounded-full bg-white transition-all",
                                            config?.intelligence?.heatmap?.showPreview ? "right-1" : "left-1"
                                        )} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Show Heatmap</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Pricing */}
                    <div className={cn(
                        "p-8 rounded-[2rem] flex flex-col justify-between relative overflow-hidden transition-all duration-500",
                        config?.intelligence?.dynamicPricing?.enabled
                            ? "bg-zinc-900 text-white ring-4 ring-primary/20"
                            : "bg-zinc-50 border-2 border-zinc-100"
                    )}>
                        <div>
                            <div className={cn(
                                "w-fit p-3 rounded-2xl mb-4 transition-colors",
                                config?.intelligence?.dynamicPricing?.enabled ? "bg-white/10" : "bg-white shadow-sm"
                            )}>
                                <Bot className={cn("w-5 h-5", config?.intelligence?.dynamicPricing?.enabled ? "text-primary" : "text-zinc-400")} />
                            </div>
                            <h3 className={cn(
                                "text-lg font-black italic tracking-tight mb-2 uppercase",
                                config?.intelligence?.dynamicPricing?.enabled ? "text-white" : "text-zinc-900"
                            )}>Dynamic Pricing</h3>
                            <p className={cn(
                                "text-xs font-medium leading-relaxed",
                                config?.intelligence?.dynamicPricing?.enabled ? "text-white/50" : "text-zinc-500"
                            )}>
                                Automatically adjust prices based on demand, inventory levels, or happy hour schedules.
                            </p>
                        </div>

                        <div className="mt-8 flex items-center gap-3">
                            <button
                                onClick={() => onChange({
                                    ...config,
                                    intelligence: {
                                        ...config?.intelligence,
                                        dynamicPricing: { ...config?.intelligence?.dynamicPricing, enabled: !config?.intelligence?.dynamicPricing?.enabled }
                                    }
                                })}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all",
                                    config?.intelligence?.dynamicPricing?.enabled
                                        ? "bg-primary text-white shadow-lg shadow-primary/40"
                                        : "bg-white text-zinc-900 border-2 border-zinc-200"
                                )}
                            >
                                {config?.intelligence?.dynamicPricing?.enabled ? 'Active' : 'Configure'}
                            </button>
                            {!config?.intelligence?.dynamicPricing?.enabled && (
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-zinc-300" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ready</span>
                                </div>
                            )}
                        </div>
                    </div>
                </ResponsiveGrid>

                {/* Pricing Editor Overlay */}
                {config?.intelligence?.dynamicPricing?.enabled && (
                    <div className="bg-white rounded-[2.5rem] border-2 border-zinc-100 p-8 shadow-sm animate-in slide-in-from-top-8 duration-500">
                        <DynamicPricingForm config={config} onChange={onChange} />
                    </div>
                )}
            </section>
        </div>
    );
}

import { DynamicPricingForm } from './DynamicPricingForm'; import { cn } from '@/lib/utils';

