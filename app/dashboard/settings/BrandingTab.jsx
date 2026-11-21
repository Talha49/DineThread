"use client";

import { useState, useEffect } from "react";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { Loader2, Lock, Save, LayoutGrid, RotateCcw, Waves, Palette } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const LAYOUT_OPTIONS = [
    { id: "classic-grid", label: "Classic Grid", icon: LayoutGrid, description: "Professional grid layout for most restaurants." },
    { id: "orbital-wheel", label: "Orbital Wheel", icon: RotateCcw, description: "Interactive circular navigation for discovery." },
    { id: "liquid-carousel", label: "Liquid Carousel", icon: Waves, description: "High-impact vertical visuals for food focus." },
    { id: "masonry", label: "Masonry Grid", icon: LayoutGrid, description: "Pinterest-style dynamic grid layout." },
    { id: "list", label: "List View", icon: LayoutGrid, description: "Traditional vertical menu list." },
];

export function BrandingTab() {
    const { restaurant, updateBranding, setPreviewData } = useRestaurantStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        logoUrl: "",
        experienceConfig: {
            layoutID: "classic-grid"
        }
    });

    const isPro = restaurant?.plan === "pro";

    useEffect(() => {
        if (restaurant) {
            setFormData({
                logoUrl: restaurant.logoUrl || "",
                experienceConfig: {
                    layoutID: restaurant.experienceConfig?.layoutID || "classic-grid"
                }
            });
        }
    }, [restaurant]);

    // Sync local form data with store preview state for real-time mockup updates
    useEffect(() => {
        setPreviewData(formData);
    }, [formData, setPreviewData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateBranding(formData);

        if (result.success) {
            toast.success("Branding updated successfully!");
        } else {
            toast.error(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="space-y-6 relative h-full flex flex-col">
            {!isPro && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-primary/20 bg-muted/10">
                    <Lock className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">Pro Feature</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        Upgrade to Davoriq Pro to customize your logo and layout.
                    </p>
                    <Button className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                        Upgrade to Pro
                    </Button>
                </div>
            )}

            <CardHeader className="px-0 pt-0">
                <CardTitle>Basic Branding</CardTitle>
                <CardDescription>
                    Upload your logo and choose your layout. For complete customization, use Theme Studio.
                </CardDescription>
            </CardHeader>

            <div className="space-y-6 flex-1 pr-2 custom-scrollbar">
                {/* Logo Upload */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Restaurant Logo</label>
                    <div className="max-w-xs">
                        <ImageUpload
                            value={formData.logoUrl}
                            onChange={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
                            onRemove={() => setFormData(prev => ({ ...prev, logoUrl: "" }))}
                            folderPrefix="logos"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Recommended: Transparent PNG, 500x500px.</p>
                </div>

                {/* Menu Layout */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                        <label className="text-sm font-medium">Menu Layout</label>
                        <p className="text-xs text-muted-foreground mt-1">Choose how your menu is displayed to customers.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {LAYOUT_OPTIONS.map((layout) => {
                            const Icon = layout.icon;
                            return (
                                <button
                                    key={layout.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        experienceConfig: { ...prev.experienceConfig, layoutID: layout.id }
                                    }))}
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-xl border-2 transition-all hover:bg-accent text-left",
                                        formData.experienceConfig.layoutID === layout.id
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border"
                                    )}
                                >
                                    <Icon className="w-6 h-6 flex-shrink-0 text-primary" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold">{layout.label}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">{layout.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Theme Studio CTA */}
                <div className="p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl border-2 border-zinc-200">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0">
                            <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-zinc-900 mb-1">Want Complete Customization?</h4>
                            <p className="text-sm text-zinc-600 mb-3">
                                Use Theme Studio for colors, fonts, backgrounds, and more!
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    // Navigate to Theme Studio tab
                                    const themeTab = document.querySelector('[value="theme"]');
                                    if (themeTab) themeTab.click();
                                }}
                                className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
                            >
                                Open Theme Studio →
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-border">
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Branding
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
