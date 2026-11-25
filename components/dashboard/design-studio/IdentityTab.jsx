"use client";

import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { cn } from "@/lib/utils";

const FONT_OPTIONS = [
    { name: "Inter", value: "Inter", preview: "Clean & Modern" },
    { name: "Outfit", value: "Outfit", preview: "Geometric" },
    { name: "Playfair Display", value: "Playfair Display", preview: "Elegant Serif" },
    { name: "Bebas Neue", value: "Bebas Neue", preview: "Bold Impact" },
    { name: "Montserrat", value: "Montserrat", preview: "Professional" },
];

export function IdentityTab({ config, onChange, restaurant }) {
    const currentFont = config?.typography?.fonts?.heading?.family || "Inter";
    const currentColor = config?.colors?.brand?.primary || "#4f46e5";

    return (
        <div className="space-y-10 animate-in fade-in duration-300">
            <div>
                <h2 className="text-xl font-bold text-zinc-900 mb-1">Brand Identity</h2>
                <p className="text-sm text-zinc-500">Logo, colors, and typography that define your restaurant.</p>
            </div>

            {/* Logo */}
            <section className="space-y-3">
                <label className="text-sm font-semibold text-zinc-700">Restaurant Logo</label>
                <div className="max-w-sm">
                    <ImageUpload
                        value={config?.logoUrl || restaurant?.logoUrl || ""}
                        onChange={(url) => onChange({ ...config, logoUrl: url })}
                    />
                </div>
                <p className="text-xs text-zinc-400">Recommended: Transparent PNG, 512×512px</p>
            </section>

            {/* Brand Color */}
            <section className="space-y-3">
                <label className="text-sm font-semibold text-zinc-700">Primary Brand Color</label>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div
                            className="w-14 h-14 rounded-xl border-2 border-white shadow-md cursor-pointer"
                            style={{ backgroundColor: currentColor }}
                        />
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => onChange({
                                ...config,
                                colors: {
                                    ...(config?.colors || {}),
                                    brand: { ...(config?.colors?.brand || {}), primary: e.target.value }
                                }
                            })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-900">{currentColor.toUpperCase()}</p>
                        <p className="text-xs text-zinc-400">Click swatch to change</p>
                    </div>
                </div>
            </section>

            {/* Typography */}
            <section className="space-y-3">
                <label className="text-sm font-semibold text-zinc-700">Typography</label>
                <div className="grid grid-cols-1 gap-3">
                    {FONT_OPTIONS.map((font) => {
                        const isActive = currentFont === font.value;
                        return (
                            <button
                                key={font.value}
                                onClick={() => onChange({
                                    ...config,
                                    typography: {
                                        ...(config?.typography || {}),
                                        fonts: {
                                            ...(config?.typography?.fonts || {}),
                                            heading: { family: font.value, weight: 700 },
                                            body: { family: font.value === 'Playfair Display' ? 'Inter' : font.value, weight: 400 }
                                        }
                                    }
                                })}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                                    isActive
                                        ? "border-zinc-900 bg-zinc-50"
                                        : "border-zinc-100 hover:border-zinc-200"
                                )}
                            >
                                <span
                                    className="text-2xl font-bold w-12 text-center shrink-0"
                                    style={{ fontFamily: font.value }}
                                >
                                    Aa
                                </span>
                                <div className="min-w-0">
                                    <span className="font-semibold text-zinc-900 text-sm">{font.name}</span>
                                    <span className="text-xs text-zinc-400 ml-2">{font.preview}</span>
                                </div>
                                {isActive && (
                                    <div className="ml-auto w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
