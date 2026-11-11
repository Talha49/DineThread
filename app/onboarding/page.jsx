"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Store, ArrowRight, ArrowLeft, Palette, Utensils, CheckCircle2, Sparkles, Image as ImageIcon, Loader2, AlertTriangle, Plus } from "lucide-react";
import { useDebounce } from "use-debounce";
import { RestaurantService } from "@/services/restaurantService";
import { CategoryService } from "@/services/categoryService";
import { MenuService } from "@/services/menuService";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

const BRAND_COLORS = [
    { name: "Indigo", value: "#4f46e5" },
    { name: "Rose", value: "#e11d48" },
    { name: "Amber", value: "#d97706" },
    { name: "Emerald", value: "#059669" },
    { name: "Sky", value: "#0284c7" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Classic", value: "#111827" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { user, loading: authLoading, refresh } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isAlreadyOnboarded, setIsAlreadyOnboarded] = useState(false);

    useEffect(() => {
        if (!authLoading && user?.restaurantId) {
            setIsAlreadyOnboarded(true);
        }
    }, [user, authLoading]);

    const [formData, setFormData] = useState({
        name: "",
        restaurantId: "",
        brandColor: "#4f46e5",
        logoUrl: "",
        signatureDish: {
            name: "",
            category: "Signatures",
            price: "",
            description: "",
            imageUrl: ""
        }
    });

    const [slugStatus, setSlugStatus] = useState({
        checking: false,
        available: null,
        message: ""
    });

    const [debouncedRestaurantId] = useDebounce(formData.restaurantId, 500);

    // Live Slug Check
    useEffect(() => {
        const checkSlug = async () => {
            if (debouncedRestaurantId.length < 3) {
                setSlugStatus({ checking: false, available: null, message: "" });
                return;
            }

            setSlugStatus(p => ({ ...p, checking: true }));
            try {
                const res = await RestaurantService.checkAvailability(debouncedRestaurantId);
                setSlugStatus({
                    checking: false,
                    available: res.available,
                    message: res.message
                });
            } catch (error) {
                setSlugStatus({ checking: false, available: false, message: "Error" });
            }
        };

        checkSlug();
    }, [debouncedRestaurantId]);

    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        setFormData(prev => ({ ...prev, name, restaurantId: slug }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    if (isAlreadyOnboarded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
                <Card className="glass max-w-md w-full border-none shadow-2xl p-8 text-center space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold mb-2">You're all set!</h2>
                        <p className="text-muted-foreground">
                            You have already completed your onboarding. Your digital menu is live and ready to serve.
                        </p>
                    </div>
                    <div className="pt-4 space-y-3">
                        <Button className="w-full h-12 rounded-xl" onClick={() => router.push("/dashboard")}>
                            Go to Dashboard
                        </Button>
                        <Button variant="ghost" className="w-full h-12 rounded-xl" onClick={() => router.push("/dashboard/settings/branding")}>
                            Update Branding
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground pt-4 border-t">
                        Need help? Contact our support team.
                    </p>
                </Card>
            </div>
        );
    }

    const handleComplete = async () => {
        setLoading(true);
        try {
            // 1. Create Restaurant
            const restData = await RestaurantService.create({
                name: formData.name,
                restaurantId: formData.restaurantId,
                brandColor: formData.brandColor,
                logoUrl: formData.logoUrl
            });

            // 2. Create Category & Initial Item if provided
            if (formData.signatureDish.name) {
                const category = await CategoryService.createCategory(
                    formData.signatureDish.category,
                    "⭐"
                );

                await MenuService.createMenuItem({
                    name: formData.signatureDish.name,
                    price: Number(formData.signatureDish.price) || 0,
                    description: formData.signatureDish.description,
                    category: category.name,
                    imageUrl: formData.signatureDish.imageUrl,
                    restaurant: restData.restaurant._id
                });
            }

            // Trigger Celebration
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: [formData.brandColor, '#ffffff']
            });

            toast.success("Welcome to Davoriq!");

            // Refresh user state to get the new restaurantId
            await refresh();

            setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
            }, 2000);

        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div
                    className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 transition-colors duration-1000"
                    style={{ backgroundColor: formData.brandColor }}
                />
                <div className="absolute top-[60%] -right-[5%] w-[30%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl w-full grid lg:grid-cols-[1fr_350px] gap-8 items-start">

                {/* Main Wizard Card */}
                <div className="w-full">
                    <Card className="glass border-none shadow-2xl relative overflow-hidden min-h-[550px] flex flex-col">

                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-muted/20">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "25%" }}
                                animate={{ width: `${(step / 4) * 100}%` }}
                                style={{ backgroundColor: formData.brandColor }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="flex-1 flex flex-col"
                            >
                                {step === 1 && (
                                    <StepIdentity
                                        formData={formData}
                                        slugStatus={slugStatus}
                                        loading={loading}
                                        onChange={handleNameChange}
                                        onSlugChange={(v) => setFormData(p => ({ ...p, restaurantId: v }))}
                                        onNext={nextStep}
                                    />
                                )}
                                {step === 2 && (
                                    <StepBranding formData={formData} setFormData={setFormData} onNext={nextStep} onBack={prevStep} />
                                )}
                                {step === 3 && (
                                    <StepFirstDish formData={formData} setFormData={setFormData} onNext={nextStep} onBack={prevStep} />
                                )}
                                {step === 4 && (
                                    <StepFinal formData={formData} loading={loading} onComplete={handleComplete} onBack={prevStep} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </Card>
                </div>

                {/* Sidebar Preview (Desktop Only) */}
                <div className="hidden lg:block sticky top-8">
                    <div className="p-1 bg-slate-900 rounded-[3rem] shadow-2xl aspect-[9/19] border-[6px] border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />

                        {/* Mock App Content */}
                        <div className="h-full w-full bg-white dark:bg-slate-950 overflow-hidden flex flex-col pt-8">
                            {/* Logo */}
                            <div className="px-6 mb-6">
                                {formData.logoUrl ? (
                                    <img src={formData.logoUrl} className="h-12 w-auto object-contain rounded-lg" />
                                ) : (
                                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-xl" style={{ color: formData.brandColor }}>
                                        {formData.name?.charAt(0) || "S"}
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div className="px-6 mb-8">
                                <h1 className="text-xl font-bold">{formData.name || "Your Restaurant"}</h1>
                                <p className="text-xs text-muted-foreground">Digital Menu</p>
                            </div>

                            {/* Category Header */}
                            <div className="px-6 mb-4 flex gap-2">
                                <div className="h-8 px-4 rounded-full text-xs font-bold flex items-center text-white" style={{ backgroundColor: formData.brandColor }}>
                                    {formData.signatureDish.category}
                                </div>
                            </div>

                            {/* Item Mockup */}
                            <div className="px-4 space-y-3">
                                <div className="p-3 border rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex gap-3 transition-all">
                                    <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {formData.signatureDish.imageUrl ? (
                                            <img src={formData.signatureDish.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <Utensils className="h-6 w-6 opacity-20" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm font-bold truncate">{formData.signatureDish.name || "Main Dish"}</h3>
                                            <span className="text-sm font-bold" style={{ color: formData.brandColor }}>
                                                ${parseFloat(formData.signatureDish.price || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                                            {formData.signatureDish.description || "Your dish description will appear here..."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Action Button Mock */}
                            <div className="mt-auto p-4 flex justify-center">
                                <div className="h-10 w-32 rounded-full shadow-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: formData.brandColor }}>
                                    View Cart
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4 font-medium uppercase tracking-widest">Live Menu Preview</p>
                </div>
            </div>
        </div>
    );
}

function StepIdentity({ formData, slugStatus, loading, onChange, onSlugChange, onNext }) {
    const isError = slugStatus.available === false && formData.restaurantId.length >= 3;
    const isSuccess = slugStatus.available === true;

    return (
        <div className="flex flex-col h-full">
            <CardHeader className="pt-10">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Store className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-3xl font-display">Let's name your venue</CardTitle>
                <CardDescription className="text-base">
                    Every great business starts with a memorable name.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
                <Input
                    label="What's the name of your venue?"
                    placeholder="e.g. The Golden Grill"
                    value={formData.name}
                    onChange={onChange}
                    autoFocus
                    required
                    className="h-14 text-lg"
                />
                <div className="space-y-2">
                    <Input
                        label="Choose your custom URL link"
                        placeholder="golden-grill"
                        value={formData.restaurantId}
                        onChange={(e) => onSlugChange(e.target.value)}
                        required
                        className={cn(
                            "h-12 font-mono transition-all",
                            isError && "border-destructive focus-visible:ring-destructive",
                            isSuccess && "border-green-500 focus-visible:ring-green-500"
                        )}
                        startIcon={<span className="text-muted-foreground">/</span>}
                        endIcon={
                            slugStatus.checking ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : isSuccess ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : isError ? (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : null
                        }
                    />
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            smartmenu.com/<span className={cn("font-bold", isSuccess ? "text-green-600" : "text-foreground")}>
                                {formData.restaurantId || 'link'}
                            </span>
                        </p>
                        {slugStatus.message && (
                            <p className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                isSuccess ? "text-green-500" : "text-destructive"
                            )}>
                                {slugStatus.message}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="mt-auto pb-10">
                <Button
                    className="w-full h-14 text-lg rounded-2xl shadow-lg transition-all"
                    disabled={!formData.name || !isSuccess || loading}
                    onClick={onNext}
                    style={{ backgroundColor: formData.brandColor }}
                >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </CardFooter>
        </div>
    );
}

function StepBranding({ formData, setFormData, onNext, onBack }) {
    return (
        <div className="flex flex-col h-full">
            <CardHeader className="pt-10">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Palette className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-3xl font-display">Pick your vibe</CardTitle>
                <CardDescription className="text-base">
                    Customize your menu's layout and personality.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-0">

                {/* Logo Upload Section */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Restaurant Logo
                    </label>
                    <ImageUpload
                        value={formData.logoUrl}
                        onChange={(url) => setFormData(p => ({ ...p, logoUrl: url }))}
                    />
                </div>

                {/* Color Picker Section */}
                <div className="space-y-4">
                    <label className="text-sm font-semibold">Branding Color</label>
                    <div className="flex flex-wrap gap-4">
                        {BRAND_COLORS.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => setFormData(p => ({ ...p, brandColor: color.value }))}
                                className="group relative"
                            >
                                <div
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${formData.brandColor === color.value ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: color.value, borderColor: formData.brandColor === color.value ? 'white' : 'transparent' }}
                                />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {color.name}
                                </span>
                            </button>
                        ))}

                        {/* Custom Color Picker */}
                        <div className="relative group">
                            <input
                                type="color"
                                id="custom-color"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                value={formData.brandColor}
                                onChange={(e) => setFormData(p => ({ ...p, brandColor: e.target.value }))}
                            />
                            <button
                                className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${!BRAND_COLORS.some(c => c.value === formData.brandColor) ? "ring-2 ring-offset-2 ring-primary scale-110 border-primary" : "border-muted-foreground/30 hover:scale-105"
                                    }`}
                                style={!BRAND_COLORS.some(c => c.value === formData.brandColor) ? { backgroundColor: formData.brandColor } : {}}
                            >
                                <Plus className={cn("h-4 w-4", !BRAND_COLORS.some(c => c.value === formData.brandColor) ? "text-white" : "text-muted-foreground")} />
                            </button>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Custom Color
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="mt-auto pb-10 flex gap-4">
                <Button variant="ghost" onClick={onBack} className="h-14 w-20 rounded-2xl">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                    className="flex-1 h-14 text-lg rounded-2xl"
                    onClick={onNext}
                    style={{ backgroundColor: formData.brandColor }}
                >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </CardFooter>
        </div>
    );
}

function StepFirstDish({ formData, setFormData, onNext, onBack }) {
    return (
        <div className="flex flex-col h-full">
            <CardHeader className="pt-10">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Utensils className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-3xl font-display">The first victory</CardTitle>
                <CardDescription className="text-base">
                    What's your absolute best-selling signature dish?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
                <Input
                    label="Signature Dish Name"
                    placeholder="e.g. Wagyu Beef Burger"
                    value={formData.signatureDish.name}
                    onChange={(e) => setFormData(p => ({
                        ...p,
                        signatureDish: { ...p.signatureDish, name: e.target.value }
                    }))}
                    className="h-12"
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Price ($)"
                        placeholder="18.00"
                        type="number"
                        value={formData.signatureDish.price}
                        onChange={(e) => setFormData(p => ({
                            ...p,
                            signatureDish: { ...p.signatureDish, price: e.target.value }
                        }))}
                        className="h-12"
                    />
                    <Input
                        label="Category"
                        value={formData.signatureDish.category}
                        onChange={(e) => setFormData(p => ({
                            ...p,
                            signatureDish: { ...p.signatureDish, category: e.target.value }
                        }))}
                        className="h-12"
                    />
                </div>
                <Input
                    label="Short Description"
                    placeholder="Brioche bun, secret sauce, caramelized onions..."
                    value={formData.signatureDish.description}
                    onChange={(e) => setFormData(p => ({
                        ...p,
                        signatureDish: { ...p.signatureDish, description: e.target.value }
                    }))}
                    className="h-12"
                />

                {/* Dish Image Upload */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Dish Image
                    </label>
                    <ImageUpload
                        value={formData.signatureDish.imageUrl}
                        onChange={(url) => setFormData(p => ({
                            ...p,
                            signatureDish: { ...p.signatureDish, imageUrl: url }
                        }))}
                    />
                </div>
            </CardContent>
            <CardFooter className="mt-auto pb-10 flex gap-4">
                <Button variant="ghost" onClick={onBack} className="h-14 w-20 rounded-2xl">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                    className="flex-1 h-14 text-lg rounded-2xl"
                    onClick={onNext}
                    style={{ backgroundColor: formData.brandColor }}
                >
                    That looks good! <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </CardFooter>
        </div>
    );
}

function StepFinal({ formData, loading, onComplete, onBack }) {
    return (
        <div className="flex flex-col h-full">
            <CardHeader className="pt-16 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="mx-auto h-24 w-24 rounded-[2rem] bg-slate-50 border shadow-inner flex items-center justify-center mb-8"
                >
                    <Sparkles className="h-12 w-12" style={{ color: formData.brandColor }} />
                </motion.div>
                <CardTitle className="text-4xl font-display mb-4">You're ready to launch!</CardTitle>
                <CardDescription className="text-lg max-w-sm mx-auto leading-relaxed">
                    Everything is set up. We've built your brand, your theme, and your first dish.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1">
                <div className="flex items-center gap-3 text-sm font-medium bg-muted/30 px-6 py-3 rounded-full border">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: formData.brandColor }} />
                    Live preview enabled for {formData.name}
                </div>
            </CardContent>
            <CardFooter className="mt-auto pb-10 flex gap-4">
                {!loading && (
                    <Button variant="ghost" onClick={onBack} className="h-14 w-20 rounded-2xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <Button
                    className="flex-1 h-16 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                    isLoading={loading}
                    onClick={onComplete}
                    style={{ backgroundColor: formData.brandColor }}
                >
                    Launch My Menu <CheckCircle2 className="ml-2 h-6 w-6" />
                </Button>
            </CardFooter>
        </div>
    );
}
