"use client";

/**
 * Typography Controls - Professional Typography Management
 * Complete font and text styling controls for Theme Studio
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Type, Plus, Minus, AlignLeft, ArrowRightLeft } from 'lucide-react';

const GOOGLE_FONTS = [
    { family: 'Inter', category: 'Sans-Serif' },
    { family: 'Outfit', category: 'Geometric' },
    { family: 'Playfair Display', category: 'Serif' },
    { family: 'Bebas Neue', category: 'Display' },
    { family: 'Montserrat', category: 'Sans-Serif' },
    { family: 'Poppins', category: 'Sans-Serif' },
    { family: 'Lora', category: 'Serif' },
    { family: 'Syne', category: 'Artistic' },
    { family: 'Epilogue', category: 'Sans-Serif' }
];

export function TypographyControls({ value, onChange }) {
    // Guard each nested field individually - `value.fonts` can exist but be
    // missing `body`/`accent` (e.g. an older saved config), and spreading
    // `...value` last used to silently reintroduce that incomplete object,
    // which crashed FontSelector on `value.family` of undefined.
    const typography = {
        ...value,
        fonts: {
            heading: { family: 'Inter', weight: 700, ...value.fonts?.heading },
            body: { family: 'Inter', weight: 400, ...value.fonts?.body },
            accent: { family: 'Inter', weight: 600, ...value.fonts?.accent },
        },
        sizes: { categoryTitle: 32, itemName: 18, itemDescription: 14, price: 18, ...value.sizes },
        lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.8, ...value.lineHeights },
        letterSpacings: { tight: '-0.02em', normal: '0em', wide: '0.05em', ...value.letterSpacings },
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Font Families */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-zinc-900 rounded-full" />
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Master Fonts</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FontSelector
                        label="Heading Font"
                        value={typography.fonts.heading}
                        onChange={(heading) => onChange({
                            ...typography,
                            fonts: { ...typography.fonts, heading }
                        })}
                    />

                    <FontSelector
                        label="Body Font"
                        value={typography.fonts.body}
                        onChange={(body) => onChange({
                            ...typography,
                            fonts: { ...typography.fonts, body }
                        })}
                    />
                </div>
            </section>

            {/* Sizes & Scale */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-zinc-900 rounded-full" />
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Scale & Sizing</h3>
                </div>

                <div className="bg-zinc-50 p-6 rounded-[2rem] border-2 border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SizeControl
                        label="Category Headers"
                        value={typography.sizes.categoryTitle}
                        onChange={(categoryTitle) => onChange({
                            ...typography,
                            sizes: { ...typography.sizes, categoryTitle }
                        })}
                        min={20}
                        max={60}
                    />

                    <SizeControl
                        label="Item Names"
                        value={typography.sizes.itemName}
                        onChange={(itemName) => onChange({
                            ...typography,
                            sizes: { ...typography.sizes, itemName }
                        })}
                        min={14}
                        max={32}
                    />

                    <SizeControl
                        label="Descriptions"
                        value={typography.sizes.itemDescription}
                        onChange={(itemDescription) => onChange({
                            ...typography,
                            sizes: { ...typography.sizes, itemDescription }
                        })}
                        min={10}
                        max={20}
                    />

                    <SizeControl
                        label="Price Labels"
                        value={typography.sizes.price}
                        onChange={(price) => onChange({
                            ...typography,
                            sizes: { ...typography.sizes, price }
                        })}
                        min={14}
                        max={32}
                    />
                </div>
            </section>

            {/* Advanced Spacing */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-zinc-900 rounded-full" />
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Refined Spacing</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-8 rounded-[2rem] border-2 border-zinc-100 shadow-sm">
                    {/* Line Heights */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4" /> Line Height
                        </h4>
                        <SliderControl
                            label="Tight (Headings)"
                            value={typography.lineHeights.tight}
                            onChange={(tight) => onChange({
                                ...typography,
                                lineHeights: { ...typography.lineHeights, tight }
                            })}
                            min={0.8}
                            max={1.5}
                            step={0.05}
                        />
                        <SliderControl
                            label="Reading (Body)"
                            value={typography.lineHeights.normal}
                            onChange={(normal) => onChange({
                                ...typography,
                                lineHeights: { ...typography.lineHeights, normal }
                            })}
                            min={1.2}
                            max={2.0}
                            step={0.05}
                        />
                    </div>

                    {/* Letter Spacing */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <ArrowRightLeft className="w-4 h-4" /> Letter Spacing
                        </h4>
                        <SpacingButtons
                            label="Heading Spacing"
                            value={typography.letterSpacings.tight}
                            onChange={(tight) => onChange({
                                ...typography,
                                letterSpacings: { ...typography.letterSpacings, tight }
                            })}
                            options={[
                                { value: '-0.05em', label: 'Tight' },
                                { value: '0em', label: 'Normal' },
                                { value: '0.05em', label: 'Wide' }
                            ]}
                        />
                         <SpacingButtons
                            label="Body Spacing"
                            value={typography.letterSpacings.normal}
                            onChange={(normal) => onChange({
                                ...typography,
                                letterSpacings: { ...typography.letterSpacings, normal }
                            })}
                            options={[
                                { value: '-0.02em', label: 'Compact' },
                                { value: '0em', label: 'Standard' },
                                { value: '0.04em', label: 'Airy' }
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* Preview Section */}
            <TypographyPreview typography={typography} />
        </div>
    );
}

function FontSelector({ label, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-3">
            <label className="text-sm font-bold text-zinc-700">{label}</label>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-zinc-200 bg-white hover:border-zinc-900 transition-all shadow-sm group"
                >
                    <span className="font-bold text-lg" style={{ fontFamily: value.family }}>{value.family}</span>
                    <Type className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-3 max-h-72 overflow-y-auto bg-white border-2 border-zinc-900 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                        {GOOGLE_FONTS.map((font) => (
                            <button
                                key={font.family}
                                onClick={() => {
                                    onChange({ ...value, family: font.family });
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full px-4 py-3 text-left rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-between group",
                                    value.family === font.family && "bg-zinc-100"
                                )}
                            >
                                <span className="text-lg" style={{ fontFamily: font.family }}>{font.family}</span>
                                <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-zinc-600">{font.category}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Weight Chips */}
            <div className="flex gap-2">
                {[300, 400, 500, 600, 700, 800, 900].filter(w => label.includes('Heading') || w <= 700).map((weight) => (
                    <button
                        key={weight}
                        onClick={() => onChange({ ...value, weight })}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-[10px] font-bold border-2 transition-all",
                            value.weight === weight
                                ? "bg-zinc-900 border-zinc-900 text-white"
                                : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200"
                        )}
                    >
                        {weight}
                    </button>
                ))}
            </div>
        </div>
    );
}

function SizeControl({ label, value, onChange, min, max }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">{label}</label>
                <span className="text-sm font-mono font-bold text-zinc-900">{value}px</span>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onChange(Math.max(min, value - 1))}
                    className="w-10 h-10 rounded-xl bg-white border-2 border-zinc-200 hover:border-zinc-900 flex items-center justify-center transition-all active:scale-90"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-zinc-900"
                />
                <button
                    onClick={() => onChange(Math.min(max, value + 1))}
                    className="w-10 h-10 rounded-xl bg-white border-2 border-zinc-200 hover:border-zinc-900 flex items-center justify-center transition-all active:scale-90"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function SliderControl({ label, value, onChange, min, max, step }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-600">{label}</label>
                <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-900 font-bold">{value.toFixed(2)}x</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-zinc-900"
            />
        </div>
    );
}

function SpacingButtons({ label, value, onChange, options }) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-600">{label}</label>
            <div className="flex gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                            value === opt.value
                                ? "bg-zinc-900 border-zinc-900 text-white"
                                : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function TypographyPreview({ typography }) {
    return (
        <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Type className="w-32 h-32" />
            </div>
            
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-8">Artistic Preview</h3>

            <div className="space-y-10 relative z-10">
                <div className="space-y-2">
                    <h4
                        style={{
                            fontFamily: typography.fonts.heading.family,
                            fontSize: `${typography.sizes.categoryTitle}px`,
                            fontWeight: typography.fonts.heading.weight,
                            lineHeight: typography.lineHeights.tight,
                            letterSpacing: typography.letterSpacings.tight
                        }}
                    >
                        Signature Cocktails
                    </h4>
                    <div className="w-12 h-1 bg-white/20 rounded-full" />
                </div>

                <div className="flex justify-between items-start border-l-2 border-white/10 pl-6">
                    <div className="space-y-2">
                        <h5
                            style={{
                                fontFamily: typography.fonts.body.family,
                                fontSize: `${typography.sizes.itemName}px`,
                                fontWeight: typography.fonts.body.weight,
                                lineHeight: typography.lineHeights.normal,
                                letterSpacing: typography.letterSpacings.normal
                            }}
                        >
                            Old Fashioned
                        </h5>
                        <p
                            className="text-white/50 max-w-xs"
                            style={{
                                fontFamily: typography.fonts.body.family,
                                fontSize: `${typography.sizes.itemDescription}px`,
                                lineHeight: typography.lineHeights.relaxed,
                                letterSpacing: typography.letterSpacings.normal
                            }}
                        >
                            Bourbon, bitters, sugar, and a twist of citrus peel. A timeless classic served over clear ice.
                        </p>
                    </div>
                    <div 
                        className="font-mono text-xl"
                        style={{
                            fontFamily: typography.fonts.heading.family,
                            fontSize: `${typography.sizes.price}px`
                        }}
                    >
                        $14
                    </div>
                </div>
            </div>
        </div>
    );
}
