"use client";

import { useState, useEffect } from 'react';
import { useRestaurantStore } from '@/hooks/use-restaurant-store';
import { useElementWidth } from '@/hooks/use-element-width';
import {
    Save,
    Loader2,
    Sparkles,
    Palette,
    LayoutGrid,
    Wind,
    Calendar,
    ShieldCheck,
    Eye,
    Lock,
    Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { DEFAULT_CONFIG, validatePresetConfig } from './config-defaults';

// Sub-tabs
import { QuickStartTab } from './QuickStartTab';
import { IdentityTab } from './IdentityTab';
import { VisualTab } from './VisualTab';
import { ColorsTab } from './ColorsTab';
import { LayoutTab } from './LayoutTab';
import { MotionTab } from './MotionTab';
import { AutomationsTab } from './AutomationsTab';
import { SaveThemeModal } from './SaveThemeModal';

const NAV_ITEMS = [
    { id: 'themes', label: 'Themes', icon: Sparkles },
    { id: 'identity', label: 'Identity', icon: ShieldCheck },
    { id: 'visuals', label: 'Visuals', icon: Eye },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'layout', label: 'Layout', icon: LayoutGrid },
    { id: 'motion', label: 'Motion', icon: Wind },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
];

export function DesignStudio() {
    const { restaurant, updateBranding, isLoading, setPreviewData } = useRestaurantStore();
    const [activeTab, setActiveTab] = useState('themes');
    const [isSaving, setIsSaving] = useState(false);

    const isPro = restaurant?.plan === 'pro';

    const [config, setConfig] = useState(null);
    const [appliedPresetId, setAppliedPresetId] = useState(null);
    const [customThemes, setCustomThemes] = useState([]);
    const [showSaveThemeModal, setShowSaveThemeModal] = useState(false);
    const [isSavingTheme, setIsSavingTheme] = useState(false);

    // Measured, not guessed from the viewport - see hooks/use-element-width.js
    // for why (short version: this needs to know its OWN available width,
    // e.g. whether the app sidebar just ate 256px of it, and the browser
    // viewport has no idea that happened).
    const [panelRef, panelWidth] = useElementWidth(900);
    const isRailVertical = panelWidth >= 576;
    const [contentRef, contentWidth] = useElementWidth(600);

    // Initial sync - merge with defaults so nothing is ever null
    useEffect(() => {
        if (restaurant && !config) {
            const designSystem = restaurant?.experienceConfig?.designSystem;
            const themeConfig = restaurant?.experienceConfig?.themeConfig;
            const rawConfig = designSystem?.config || themeConfig || {};

            // Merge with defaults - this guarantees every field exists
            const safeConfig = validatePresetConfig({
                ...rawConfig,
                layoutID: rawConfig.layoutID || restaurant?.experienceConfig?.layoutID || 'grid',
            });

            setConfig(safeConfig);
            if (designSystem?.appliedPreset) {
                setAppliedPresetId(designSystem.appliedPreset);
            }
            setCustomThemes(restaurant?.experienceConfig?.customThemes || []);
        }
    }, [restaurant, config]);

    // Live preview broadcast
    useEffect(() => {
        if (config) {
            const previewUpdate = {
                brandColor: config.colors?.brand?.primary,
                fontFamily: config.typography?.fonts?.heading?.family,
                experienceConfig: {
                    designSystem: { config, appliedPreset: appliedPresetId },
                    themeConfig: config,
                    layoutID: config.layoutID || 'grid'
                }
            };
            setPreviewData(previewUpdate);

            const iframe = document.querySelector('iframe');
            if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'PREVIEW_UPDATE', data: previewUpdate }, '*');
            }
        }
    }, [config, appliedPresetId, setPreviewData]);

    // Accepts explicit overrides so callers (like Reset) can persist a value
    // immediately without waiting on React state to catch up to setConfig().
    const handleSave = async (configOverride, presetOverride, loadingMessage = 'Saving design...', successMessage = 'Design saved!', customThemesOverride) => {
        const configToSave = configOverride || config;
        const presetToSave = presetOverride !== undefined ? presetOverride : appliedPresetId;
        const customThemesToSave = customThemesOverride !== undefined ? customThemesOverride : customThemes;

        setIsSaving(true);
        const loadingToast = toast.loading(loadingMessage);
        try {
            const payload = {
                brandColor: configToSave.colors?.brand?.primary,
                fontFamily: configToSave.typography?.fonts?.heading?.family,
                logoUrl: configToSave.logoUrl || undefined,
                experienceConfig: {
                    designSystem: {
                        config: configToSave,
                        appliedPreset: presetToSave,
                        lastEdited: new Date().toISOString(),
                        version: '2.0',
                    },
                    themeConfig: configToSave,
                    layoutID: configToSave.layoutID || 'grid',
                    customThemes: customThemesToSave,
                }
            };
            const result = await updateBranding(payload);
            if (result.success) {
                toast.success(successMessage, { id: loadingToast });
            } else {
                toast.error(`Error: ${result.error}`, { id: loadingToast });
            }
            return result.success;
        } catch (error) {
            toast.error("Failed to save", { id: loadingToast });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfigChange = (newConfig) => {
        // Always merge with defaults to prevent null
        setConfig(validatePresetConfig(newConfig));
        setAppliedPresetId(null);
    };

    const handleReset = async () => {
        const freshConfig = { ...DEFAULT_CONFIG };
        setConfig(freshConfig);
        setAppliedPresetId(null);
        // Reset reads as a final "clear everything" action, so it persists
        // immediately rather than leaving a draft the user has to remember
        // to Save separately - that gap was exactly why Reset used to look
        // like it "did nothing" after leaving the page.
        await handleSave(freshConfig, null, 'Resetting design...', 'Design Studio reset to factory defaults');
    };

    // Clears the working draft only - unlike Reset, this doesn't save, so the
    // user can freely experiment across tabs and just navigate away to bail out.
    // Also jumps straight into the Colors tool instead of leaving the user on
    // the Quick Start screen wondering where the actual editor is.
    const handleStartCustom = () => {
        setConfig({ ...DEFAULT_CONFIG });
        setAppliedPresetId(null);
        setActiveTab('colors');
        toast.success('Blank canvas ready - use Colors, Visuals, Typography & Layout to design it, then Save.');
    };

    const handleApplyCustomTheme = (theme) => {
        setAppliedPresetId(theme.id);
        setConfig(validatePresetConfig(theme.config));
        toast.success(`Applied: ${theme.name}`);
    };

    const handleSaveCustomTheme = async ({ name, emoji }) => {
        setIsSavingTheme(true);
        const newTheme = {
            id: crypto.randomUUID(),
            name,
            emoji,
            config,
            createdAt: new Date().toISOString(),
        };
        const updatedThemes = [...customThemes, newTheme];
        const success = await handleSave(config, appliedPresetId, 'Saving theme...', `Saved "${name}"!`, updatedThemes);
        if (success) {
            setCustomThemes(updatedThemes);
            setShowSaveThemeModal(false);
        }
        setIsSavingTheme(false);
    };

    const handleDeleteCustomTheme = async (theme) => {
        const updatedThemes = customThemes.filter((t) => t.id !== theme.id);
        const nextPresetId = appliedPresetId === theme.id ? null : appliedPresetId;
        setCustomThemes(updatedThemes);
        setAppliedPresetId(nextPresetId);
        await handleSave(config, nextPresetId, 'Removing theme...', `Removed "${theme.name}"`, updatedThemes);
    };

    // Loading
    if (isLoading || !config) {
        return (
            <div className="flex items-center justify-center h-full gap-3">
                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                <span className="text-sm text-zinc-400">Loading design engine...</span>
            </div>
        );
    }

    return (
        <div ref={panelRef} className={cn("h-full flex", isRailVertical ? "flex-row" : "flex-col")}>
            {/* Nav - a horizontal strip when the panel is narrow, a vertical rail once there's real room */}
            <nav className={cn(
                "shrink-0 bg-zinc-50 flex",
                isRailVertical ? "flex-col border-r w-[72px]" : "flex-row border-b"
            )}>
                <div className={cn(
                    "flex-1 min-w-0 flex items-center gap-1 scrollbar-hide",
                    isRailVertical ? "flex-col overflow-y-auto px-0 py-4" : "flex-row overflow-x-auto px-2 py-2"
                )}>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                title={item.label}
                                className={cn(
                                    "shrink-0 w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                                    isActive
                                        ? "bg-white shadow-sm text-zinc-900 border border-zinc-200"
                                        : "text-zinc-400 hover:text-zinc-600 hover:bg-white/60"
                                )}
                            >
                                <Icon className="w-[18px] h-[18px]" />
                                <span className="text-[9px] font-semibold leading-none">{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Save actions - pinned to the trailing edge of the strip (bottom when vertical, right when horizontal) */}
                <div className={cn(
                    "shrink-0 border-zinc-200 flex items-center justify-center gap-1",
                    isRailVertical ? "flex-col border-t px-0 py-4" : "px-2"
                )}>
                    <button
                        onClick={() => setShowSaveThemeModal(true)}
                        disabled={isSaving}
                        title="Save as My Theme"
                        className="w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl text-zinc-400 hover:text-indigo-600 hover:bg-white transition-all active:scale-95"
                    >
                        <Wand2 className="w-[18px] h-[18px]" />
                        <span className="text-[9px] font-semibold leading-none">Theme</span>
                    </button>
                    <button
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        title="Save Design"
                        className="w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl bg-zinc-900 text-white hover:bg-black transition-all active:scale-95"
                    >
                        {isSaving
                            ? <Loader2 className="w-[18px] h-[18px] animate-spin" />
                            : <Save className="w-[18px] h-[18px]" />
                        }
                        <span className="text-[9px] font-semibold leading-none">
                            {isSaving ? "Saving" : "Save"}
                        </span>
                    </button>
                </div>
            </nav>

            {/* Content area - measured so each tab's internal grids can respond to the
                real space left after the nav, instead of guessing from the browser viewport */}
            <main ref={contentRef} className={cn("flex-1 min-w-0 min-h-0 overflow-y-auto", isRailVertical ? "p-8" : "p-4")}>
                <div className="max-w-2xl mx-auto">
                    {activeTab === 'themes' && (
                        <QuickStartTab
                            contentWidth={contentWidth}
                            onApplyPreset={(preset) => {
                                setAppliedPresetId(preset?.id);
                                setConfig(validatePresetConfig(preset?.config));
                                toast.success(`Applied: ${preset?.name}`);
                            }}
                            onReset={handleReset}
                            onStartCustom={handleStartCustom}
                            currentPresetId={appliedPresetId}
                            customThemes={customThemes}
                            onApplyCustomTheme={handleApplyCustomTheme}
                            onDeleteCustomTheme={handleDeleteCustomTheme}
                        />
                    )}

                    {activeTab !== 'themes' && !isPro ? (
                        <div className="flex items-center justify-center pt-20">
                            <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-[2.5rem] border-2 border-zinc-100 shadow-xl shadow-zinc-200/20 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Lock className="w-10 h-10 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight text-zinc-900">Pro Feature</h2>
                                    <p className="text-zinc-500 font-medium leading-relaxed">
                                        Upgrade to Davoriq Pro to unlock full customization. Design custom layouts, advanced colors, and create a unique visual DNA for your brand.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Button className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 w-full py-6 text-base font-bold uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                        Upgrade to Pro
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTab !== 'themes' && !appliedPresetId && (
                                <div className="mb-6 flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-indigo-50 border-2 border-indigo-100">
                                    <div className="flex items-center gap-2 text-indigo-700 min-w-0">
                                        <Wand2 className="w-4 h-4 shrink-0" />
                                        <span className="text-xs font-bold truncate">Designing a custom look - not saved as a theme yet.</span>
                                    </div>
                                    <button
                                        onClick={() => setShowSaveThemeModal(true)}
                                        className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors"
                                    >
                                        Save as My Theme
                                    </button>
                                </div>
                            )}
                            {activeTab === 'identity' && (
                                <IdentityTab config={config} restaurant={restaurant} onChange={handleConfigChange} />
                            )}
                            {activeTab === 'visuals' && (
                                <VisualTab config={config} contentWidth={contentWidth} onChange={handleConfigChange} />
                            )}
                            {activeTab === 'colors' && (
                                <ColorsTab config={config} contentWidth={contentWidth} onChange={handleConfigChange} />
                            )}
                            {activeTab === 'layout' && (
                                <LayoutTab config={config} contentWidth={contentWidth} onChange={handleConfigChange} />
                            )}
                            {activeTab === 'motion' && (
                                <MotionTab config={config} contentWidth={contentWidth} onChange={handleConfigChange} />
                            )}
                            {activeTab === 'schedule' && (
                                <AutomationsTab config={config} contentWidth={contentWidth} onChange={handleConfigChange} />
                            )}
                        </>
                    )}
                </div>
            </main>

            <SaveThemeModal
                isOpen={showSaveThemeModal}
                onClose={() => setShowSaveThemeModal(false)}
                config={config}
                onSave={handleSaveCustomTheme}
                isSaving={isSavingTheme}
            />
        </div>
    );
}
