"use client";

import { useState } from "react";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { useMenuStore } from "@/hooks/use-menu-store";
import { useCategoryStore } from "@/hooks/use-category-store";
import { useElementWidth } from "@/hooks/use-element-width";
import { LivePreview } from "@/components/settings/LivePreview";
import { BusinessProfileTab } from "./BusinessProfileTab";
import { DesignStudio } from "@/components/dashboard/design-studio/DesignStudio";
import { deepMerge } from "@/lib/object-utils";
import { Store, Sparkles, Monitor, ZoomIn, Lock, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/store/useTranslation";

const DEVICES = [
    { id: 'iPhone X', label: 'iPhone X' },
    { id: 'iPhone 8', label: 'iPhone 8' },
    { id: 'iPhone 8 Plus', label: 'iPhone 8+' },
    { id: 'iPhone 5s', label: 'iPhone 5s' },
    { id: 'iPhone 5c', label: 'iPhone 5c' },
    { id: 'iPhone 4s', label: 'iPhone 4s' },
    { id: 'Galaxy Note 8', label: 'Galaxy Note 8' },
    { id: 'Samsung Galaxy S5', label: 'Galaxy S5' },
    { id: 'Nexus 5', label: 'Nexus 5' },
    { id: 'Lumia 920', label: 'Lumia 920' },
    { id: 'iPad Mini', label: 'iPad Mini' },
    { id: 'MacBook Pro', label: 'MacBook Pro' },
];

export default function SettingsPage() {
    const { restaurant, previewData } = useRestaurantStore();
    const { items: menuItems } = useMenuStore();
    const { categories } = useCategoryStore();
    const { t } = useTranslation();
    const [activeView, setActiveView] = useState("studio");
    const [selectedDevice, setSelectedDevice] = useState("iPhone X");
    const [previewScale, setPreviewScale] = useState(60);
    const [isPreviewOverlayOpen, setIsPreviewOverlayOpen] = useState(false);

    // Measured, not guessed from the viewport - see hooks/use-element-width.js.
    // Start wide (1280) so the roomy layout is what SSR/first paint renders,
    // matching the common case and avoiding a layout flash on load.
    const [shellRef, shellWidth] = useElementWidth(1280);
    const showInlinePreview = shellWidth >= 1024;
    const showDevicePicker = shellWidth >= 512;
    const showZoomSlider = shellWidth >= 576;
    const showLiveIndicator = shellWidth >= 448;
    const showLabels = shellWidth >= 320;

    const activeData = previewData ? deepMerge(restaurant, previewData) : restaurant;
    const isPro = restaurant?.plan === "pro";

    const previewNode = (
        <div
            className="origin-center"
            style={{ transform: `scale(${previewScale / 100})` }}
        >
            <LivePreview
                restaurant={activeData}
                device={selectedDevice}
                branding={{
                    brandColor: activeData?.brandColor || "#4f46e5",
                    fontFamily: activeData?.fontFamily || "Inter",
                    logoUrl: activeData?.logoUrl || "",
                    layoutID: activeData?.experienceConfig?.layoutID || "grid",
                    themeConfig: activeData?.experienceConfig?.designSystem?.config || activeData?.experienceConfig?.themeConfig
                }}
                menuItems={menuItems}
                categories={categories}
            />
        </div>
    );

    return (
        <div ref={shellRef} className="h-full flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className={cn("flex items-center justify-between gap-3 py-3 border-b bg-white shrink-0", shellWidth >= 448 ? "px-6" : "px-4")}>
                {/* Left: View toggle */}
                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl shrink-0">
                    <button
                        onClick={() => setActiveView("studio")}
                        className={cn(
                            "flex items-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
                            shellWidth >= 448 ? "px-5" : "px-3",
                            activeView === "studio"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        <Sparkles className="w-4 h-4" />
                        {showLabels && <span>{t('dashboard.settings.studio')}</span>}
                    </button>
                    <button
                        onClick={() => setActiveView("profile")}
                        className={cn(
                            "flex items-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
                            shellWidth >= 448 ? "px-5" : "px-3",
                            activeView === "profile"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        <Store className="w-4 h-4" />
                        {showLabels && <span>{t('dashboard.settings.profile')}</span>}
                    </button>
                </div>

                {/* Right: Device selector + size slider + sync + preview toggle */}
                {activeView === "studio" && (
                    <div className={cn("flex items-center min-w-0", shellWidth >= 448 ? "gap-4" : "gap-2")}>
                        {isPro && (
                            <>
                                {/* Device picker */}
                                {showDevicePicker && (
                                    <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-lg">
                                        <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                                        <select
                                            value={selectedDevice}
                                            onChange={(e) => setSelectedDevice(e.target.value)}
                                            className="bg-transparent text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer"
                                        >
                                            {DEVICES.map(d => (
                                                <option key={d.id} value={d.id}>{d.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Size slider */}
                                {showZoomSlider && (
                                    <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-lg">
                                        <ZoomIn className="w-3.5 h-3.5 text-zinc-400" />
                                        <input
                                            type="range"
                                            min={30}
                                            max={100}
                                            value={previewScale}
                                            onChange={(e) => setPreviewScale(Number(e.target.value))}
                                            className="w-20 h-1 accent-zinc-700 cursor-pointer"
                                        />
                                        <span className="text-[10px] font-bold text-zinc-500 w-8">{previewScale}%</span>
                                    </div>
                                )}

                                {/* Live indicator */}
                                {showLiveIndicator && (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs text-zinc-400 font-medium">{t('dashboard.settings.live')}</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Preview toggle - only needed once the inline preview column has hidden itself */}
                        {!showInlinePreview && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPreviewOverlayOpen(true)}
                                className="gap-2 shrink-0"
                            >
                                <Eye className="w-4 h-4" />
                                {showLabels && <span>Preview</span>}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {activeView === "studio" ? (
                    <div className="h-full flex">
                        {/* Design Studio - left */}
                        <div className="flex-1 min-w-0 h-full overflow-hidden border-r rtl:border-r-0 rtl:border-l">
                            <DesignStudio />
                        </div>

                        {/* Live Preview - right, only when there's genuinely room for it */}
                        {showInlinePreview && (
                            <div className="w-[420px] shrink-0 bg-zinc-50 flex items-center justify-center overflow-auto">
                                {previewNode}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-8 bg-zinc-50/30">
                        <div className="max-w-3xl mx-auto">
                            <BusinessProfileTab />
                        </div>
                    </div>
                )}
            </div>

            {/* Preview slide-over - stands in for the inline column whenever the pane is too narrow to fit both */}
            {isPreviewOverlayOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                        onClick={() => setIsPreviewOverlayOpen(false)}
                    />
                    <div className="relative w-full max-w-md h-full bg-zinc-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between px-5 py-4 border-b bg-white shrink-0">
                            <h2 className="text-sm font-bold text-zinc-900">Live Preview</h2>
                            <button
                                onClick={() => setIsPreviewOverlayOpen(false)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-6">
                            {previewNode}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
