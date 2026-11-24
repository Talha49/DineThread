"use client";

/**
 * Seasonal Manager - Professional Seasonal Theme Overlay System
 * Complete UI for managing seasonal themes in Theme Studio
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SEASONAL_OVERLAYS } from '@/lib/theme-engine/seasonal-overlays';
import { Calendar, Check, Clock } from 'lucide-react';

export function SeasonalManager({ value, atmosphere, onChange }) {
    const [selectedSeason, setSelectedSeason] = useState(null);
    const enabledSeasons = value?.enabledSeasons || [];

    const handleToggleSeason = (seasonId) => {
        const newEnabled = enabledSeasons.includes(seasonId)
            ? enabledSeasons.filter(id => id !== seasonId)
            : [...enabledSeasons, seasonId];

        onChange({
            seasonal: { ...value, enabledSeasons: newEnabled }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Seasonal Themes</h3>
                <p className="text-sm text-zinc-600">
                    Automatically apply themed overlays during seasonal periods
                </p>
            </div>

            {/* Seasonal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(SEASONAL_OVERLAYS).map(([id, season]) => {
                    const isEnabled = enabledSeasons.includes(id);
                    const isSelected = selectedSeason === id;

                    return (
                        <div
                            key={id}
                            className={cn(
                                "relative p-5 rounded-2xl border-2 transition-all cursor-pointer",
                                isEnabled
                                    ? "border-zinc-900 bg-zinc-50 shadow-lg"
                                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md"
                            )}
                            onClick={() => setSelectedSeason(isSelected ? null : id)}
                        >
                            {/* Enable Checkbox */}
                            <label className="absolute top-3 right-3 flex items-center gap-2 cursor-pointer z-10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={() => handleToggleSeason(id)}
                                    className="w-5 h-5 rounded border-2 border-zinc-300 cursor-pointer"
                                />
                            </label>

                            {/* Emoji Icon */}
                            <div className="text-5xl mb-3">
                                {season.emoji}
                            </div>

                            {/* Season Name */}
                            <h4 className="font-bold text-zinc-900 text-lg mb-2">
                                {season.name}
                            </h4>

                            {/* Date Range */}
                            <div className="flex items-center gap-2 text-sm text-zinc-600 mb-3">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {formatDateRange(season.dateRange)}
                                </span>
                            </div>

                            {/* Color Preview */}
                            <div className="flex gap-2 mb-3">
                                {Object.values(season.overlay.colors?.brand || {}).slice(0, 3).map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-lg border border-zinc-200"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            {/* Status */}
                            {isEnabled && (
                                <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                                    <Check className="w-3 h-3" />
                                    Enabled
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isSelected && (
                                <div className="mt-4 pt-4 border-t border-zinc-200">
                                    <h5 className="font-semibold text-sm text-zinc-900 mb-2">Preview</h5>
                                    <SeasonalPreview season={season} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Auto-Enable Toggle */}
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={value?.autoEnable !== false}
                        onChange={(e) => onChange({ ...value, autoEnable: e.target.checked })}
                        className="mt-1 w-5 h-5 rounded border-2 border-blue-300 cursor-pointer"
                    />
                    <div>
                        <div className="font-semibold text-blue-900 mb-1">
                            Auto-Enable Seasonal Themes
                        </div>
                        <p className="text-sm text-blue-700">
                            Automatically activate enabled seasonal themes during their date ranges.
                            Themes will revert to base theme when the season ends.
                        </p>
                    </div>
                </label>
            </div>

            {/* Manual Atmosphere Overrides */}
            <div className="pt-6 border-t border-zinc-100">
                <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-zinc-400" />
                    Atmosphere Effects
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { id: 'none', label: 'None', emoji: '🚫' },
                        { id: 'snow', label: 'Snow', emoji: '❄️' },
                        { id: 'stars', label: 'Stars', emoji: '✨' },
                        { id: 'bubbles', label: 'Bubbles', emoji: '🫧' }
                    ].map((eff) => (
                        <button
                            key={eff.id}
                            onClick={() => {
                                const currentAtmosphere = atmosphere || { active: 'none', intensity: 50 };
                                onChange({
                                    atmosphere: { ...currentAtmosphere, active: eff.id }
                                });
                            }}
                            className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                (value?.atmosphere?.active === eff.id || (!value?.atmosphere?.active && eff.id === 'none'))
                                    ? "border-zinc-900 bg-zinc-50"
                                    : "border-zinc-200 hover:border-zinc-300"
                            )}
                        >
                            <span className="text-2xl">{eff.emoji}</span>
                            <span className="text-xs font-semibold">{eff.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SeasonalPreview({ season }) {
    const colors = season.overlay.colors?.brand || {};
    const decorations = season.overlay.decorations?.elements || [];

    return (
        <div className="space-y-3">
            {/* Colors */}
            <div>
                <p className="text-xs font-medium text-zinc-600 mb-2">Brand Colors</p>
                <div className="flex gap-2">
                    {Object.entries(colors).map(([key, color]) => (
                        <div key={key} className="flex-1">
                            <div
                                className="h-10 rounded-lg border border-zinc-200 mb-1"
                                style={{ backgroundColor: color }}
                            />
                            <p className="text-[10px] text-zinc-500 capitalize text-center">{key}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorations */}
            {decorations.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-zinc-600 mb-2">Decorations</p>
                    <div className="flex gap-2">
                        {decorations.map((dec, i) => (
                            <div key={i} className="text-2xl">
                                {dec.content}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function formatDateRange(dateRange) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const start = `${months[dateRange.start.month - 1]} ${dateRange.start.day}`;
    const end = `${months[dateRange.end.month - 1]} ${dateRange.end.day}`;
    return `${start} - ${end}`;
}
