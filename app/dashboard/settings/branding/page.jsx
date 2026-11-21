"use client";

import { useState, useEffect } from "react";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { useMenuStore } from "@/hooks/use-menu-store";
import { useCategoryStore } from "@/hooks/use-category-store";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ColorPicker } from "@/components/settings/ColorPicker";
import { LivePreview } from "@/components/settings/LivePreview";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { Loader2, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const FONT_OPTIONS = [
    { name: "Inter", value: "Inter" },
    { name: "Outfit", value: "Outfit" },
    { name: "Roboto", value: "Roboto" },
    { name: "Playfair Display", value: "Playfair Display" },
    { name: "Lato", value: "Lato" },
];

export default function BrandingPage() {
    const { restaurant, updateBranding } = useRestaurantStore();
    const { items: menuItems } = useMenuStore();
    const { categories } = useCategoryStore();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        brandColor: "#4f46e5",
        fontFamily: "Inter",
        logoUrl: "",
    });

    const isPro = restaurant?.plan === "pro";

    useEffect(() => {
        if (restaurant) {
            setFormData({
                brandColor: restaurant.brandColor || "#4f46e5",
                fontFamily: restaurant.fontFamily || "Inter",
                logoUrl: restaurant.logoUrl || "",
            });
        }
    }, [restaurant]);

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
        <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header removed as it is now in TopBar dynamic title, 
                BUT we might keep the description or subtitle? 
                User said "In the heading... the header showing me Dashboard everytime. We should update it" 
                So likely top header handles title now. We can keep a minimal subtitle or remove.
                Lets keep a minimal flexible layout.
            */}

            <div className="grid lg:grid-cols-12 gap-6 h-full items-stretch">

                {/* Left Column: Form (40% -> 5/12) */}
                <div className="lg:col-span-5 flex flex-col h-full">
                    <Card className={cn("flex flex-col h-full", !isPro && "border-primary/20 bg-muted/10 relative overflow-hidden")}>
                        {!isPro && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
                                <Lock className="w-12 h-12 text-primary mb-4" />
                                <h3 className="text-xl font-bold mb-2">Pro Feature</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">
                                    Upgrade to Davoriq Pro to customize your logo, colors, and fonts.
                                </p>
                                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                                    Upgrade to Pro
                                </Button>
                            </div>
                        )}

                        <CardHeader>
                            <CardTitle>Brand Settings</CardTitle>
                            <CardDescription>
                                Configure your restaurant's digital identity.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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

                            {/* Brand Color */}
                            <ColorPicker
                                label="Primary Brand Color"
                                value={formData.brandColor}
                                onChange={(color) => setFormData(prev => ({ ...prev, brandColor: color }))}
                            />

                            {/* Font Family */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Font Family</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {FONT_OPTIONS.map((font) => (
                                        <button
                                            key={font.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, fontFamily: font.value }))}
                                            className={cn(
                                                "border rounded-lg p-3 text-center transition-all hover:bg-accent flex flex-col items-center gap-1",
                                                formData.fontFamily === font.value
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-border"
                                            )}
                                        >
                                            <span style={{ fontFamily: font.value }} className="text-lg">Aa</span>
                                            <span className="text-xs text-muted-foreground">{font.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>

                        {/* Footer Action */}
                        <div className="p-6 border-t mt-auto bg-muted/5">
                            <Button
                                onClick={handleSubmit}
                                size="lg"
                                disabled={isLoading || !isPro}
                                className="w-full"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Live Preview (60% -> 7/12) */}
                <div className="lg:col-span-7 flex flex-col h-full">
                    <Card className="h-full flex flex-col overflow-hidden bg-muted/30 border-dashed">
                        <div className="flex-1 flex flex-col items-center justify-center p-8 relative min-h-[600px]">
                            {/* Device Emulator */}
                            <div className="scale-[0.8] md:scale-[0.85] origin-center w-full flex justify-center">
                                <LivePreview
                                    restaurant={restaurant}
                                    branding={formData}
                                    menuItems={menuItems}
                                    categories={categories}
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t bg-background/50 text-center text-xs text-muted-foreground">
                            Interactive Mockup • Select device from dropdown
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
