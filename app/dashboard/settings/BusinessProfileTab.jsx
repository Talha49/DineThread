"use client";

import { useState, useEffect } from "react";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
    Loader2,
    Save,
    MapPin,
    Phone,
    MessageCircle,
    Instagram,
    Facebook,
    Twitter,
    Clock,
    Globe,
    Info,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function BusinessProfileTab() {
    const { restaurant, updateBusinessProfile, setPreviewData } = useRestaurantStore();
    const [isLoading, setIsLoading] = useState(false);
    const [touched, setTouched] = useState({});

    // Local form state for stability
    const [formData, setFormData] = useState({
        description: "",
        address: "",
        phone: "",
        whatsapp: "",
        socialLinks: {
            instagram: "",
            facebook: "",
            twitter: "",
        },
        openingHours: DAYS.map(day => ({ day, open: "09:00", close: "22:00", isClosed: false }))
    });

    // Validations
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (restaurant?.businessProfile) {
            const bp = restaurant.businessProfile;
            setFormData({
                description: bp.description || "",
                address: bp.address || "",
                phone: bp.phone || "",
                whatsapp: bp.whatsapp || "",
                socialLinks: {
                    instagram: bp.socialLinks?.instagram || "",
                    facebook: bp.socialLinks?.facebook || "",
                    twitter: bp.socialLinks?.twitter || "",
                },
                openingHours: bp.openingHours?.length > 0
                    ? bp.openingHours.map(h => ({
                        day: h.day,
                        open: h.open || "09:00",
                        close: h.close || "22:00",
                        isClosed: !!h.isClosed
                    }))
                    : DAYS.map(day => ({ day, open: "09:00", close: "22:00", isClosed: false }))
            });
        }
    }, [restaurant]);

    // Sync local form data with store preview state for real-time mockup updates
    useEffect(() => {
        setPreviewData({ businessProfile: formData });
    }, [formData, setPreviewData]);

    const validate = (field, value) => {
        let error = "";
        if (field === 'phone' || field === 'whatsapp') {
            if (value && !/^\+?[0-9\s-]{8,20}$/.test(value)) {
                error = "Invalid phone format (e.g. +1 234...)";
            }
        }
        if (field === 'address' && !value) {
            error = "An address helps with SEO and Maps";
        }
        if (['instagram', 'facebook', 'twitter'].includes(field)) {
            if (value && value.length < 3) {
                error = "Handle is too short";
            }
        }
        setErrors(prev => ({ ...prev, [field]: error }));
        return !error;
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));

        let value = field === 'instagram' || field === 'twitter' || field === 'facebook'
            ? formData.socialLinks[field]
            : formData[field];

        validate(field, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation
        const isPhoneValid = validate('phone', formData.phone);
        const isAddressValid = validate('address', formData.address);

        if (!isPhoneValid || !isAddressValid) {
            toast.error("Please fix validation errors before saving");
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateBusinessProfile({ businessProfile: formData });
            if (result.success) {
                toast.success("Professional profile synchronized!");
            } else {
                toast.error(result.error || "Sync failed");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        } finally {
            setIsLoading(true); // Artificial delay for premium feel
            setTimeout(() => setIsLoading(false), 800);
        }
    };

    const updateOpeningHour = (index, field, value) => {
        const newHours = [...formData.openingHours];
        newHours[index] = { ...newHours[index], [field]: value };
        setFormData(prev => ({ ...prev, openingHours: newHours }));
    };

    const updateSocial = (platform, value) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [platform]: value }
        }));
    };

    const FieldLabel = ({ icon: Icon, label, required, error, touched, colorClass }) => (
        <div className="flex items-center justify-between mb-2">
            <label className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", colorClass || "text-zinc-500")}>
                <Icon className="w-3.5 h-3.5" />
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {touched && error && (
                <span className="text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-right-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                </span>
            )}
            {touched && !error && (
                <CheckCircle2 className="w-3 h-3 text-green-500 animate-in zoom-in" />
            )}
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Executive Summary Header */}
            <div className="flex flex-col gap-3 pb-8 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Business Profile
                    </h1>
                </div>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-2xl">
                    Update your restaurant's details, location, and communication channels. These details will be visible on your public digital menu and SEO metadata.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Identity Card: Brand Story */}
                <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 border border-zinc-100">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900">Brand Story</h3>
                            <p className="text-xs text-zinc-400 font-medium">Describe your vision and what makes your restaurant unique</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <textarea
                            className="flex min-h-[200px] w-full rounded-2xl border-2 border-zinc-50 bg-zinc-50/30 px-6 py-6 text-base font-medium ring-offset-background placeholder:text-zinc-300 focus-visible:outline-none focus-visible:border-zinc-200 focus-visible:bg-white transition-all resize-none"
                            placeholder="What makes your restaurant unique? Share your vision, heritage, and flavors..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            maxLength={500}
                        />
                        <div className="absolute bottom-6 right-6 text-[10px] font-bold text-zinc-400 bg-white border border-zinc-100 px-3 py-1.5 rounded-full shadow-sm">
                            {formData.description.length} <span className="opacity-30">/</span> 500
                        </div>
                    </div>
                </div>

                {/* Connect Card: Address & Contact */}
                <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 border border-zinc-100">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900">Location & Contact</h3>
                            <p className="text-xs text-zinc-400 font-medium">Help customers find and reach you easily</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <FieldLabel
                                icon={Globe}
                                label="Physical Address"
                                required
                                touched={touched.address}
                                error={errors.address}
                            />
                            <div className="relative">
                                <Input
                                    className="h-14 rounded-2xl border-2 border-zinc-50 bg-zinc-50/50 pl-12 focus-visible:ring-0 focus-visible:border-zinc-200 focus-visible:bg-white transition-all text-sm font-bold"
                                    placeholder="123 Culinary Avenue, Food District"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    onBlur={() => handleBlur('address')}
                                />
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <FieldLabel
                                icon={Phone}
                                label="Primary Contact"
                                required
                                touched={touched.phone}
                                error={errors.phone}
                            />
                            <div className="relative">
                                <Input
                                    className="h-14 rounded-2xl border-2 border-zinc-50 bg-zinc-50/50 pl-12 focus-visible:ring-0 focus-visible:border-zinc-200 focus-visible:bg-white transition-all text-sm font-bold"
                                    placeholder="+1 234 567 890"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    onBlur={() => handleBlur('phone')}
                                />
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Hub Card */}
                <div className="bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-zinc-950/20 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <Instagram className="w-48 h-48" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/5 backdrop-blur-md">
                                <Globe className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Social Media Channels</h3>
                                <p className="text-xs text-white/40 font-bold tracking-wider uppercase">Connect with your audience</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            {[
                                { id: 'whatsapp', label: 'WhatsApp Business', icon: MessageCircle, color: 'text-green-400', border: 'border-green-500/20', focus: 'focus-visible:border-green-400' },
                                { id: 'instagram', label: 'Instagram Profile', icon: Instagram, color: 'text-pink-400', border: 'border-pink-500/20', focus: 'focus-visible:border-pink-400' },
                                { id: 'facebook', label: 'Facebook Page', icon: Facebook, color: 'text-blue-400', border: 'border-blue-500/20', focus: 'focus-visible:border-blue-400' },
                                { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'text-zinc-400', border: 'border-zinc-500/20', focus: 'focus-visible:border-zinc-400' }
                            ].map((social) => (
                                <div key={social.id} className="space-y-3">
                                    <label className={cn("text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2", social.color)}>
                                        <social.icon className="w-3.5 h-3.5" />
                                        {social.label}
                                    </label>
                                    <Input
                                        className={cn(
                                            "h-12 bg-white/5 border-2 rounded-xl transition-all font-bold placeholder:text-white/10 focus-visible:ring-0 text-white",
                                            social.border,
                                            social.focus
                                        )}
                                        placeholder={social.id === 'whatsapp' ? '+1 234...' : '@handle'}
                                        value={social.id === 'whatsapp' ? formData.whatsapp : formData.socialLinks[social.id]}
                                        onChange={(e) => social.id === 'whatsapp' ? setFormData(prev => ({ ...prev, whatsapp: e.target.value })) : updateSocial(social.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scheduling Engine Card */}
                <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 border border-zinc-100">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900">Service Window</h3>
                            <p className="text-xs text-zinc-400 font-medium">Set your weekly opening and closing hours</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {formData.openingHours.map((h, i) => (
                            <div key={h.day} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-colors group">
                                <span className="text-sm font-bold tracking-tight w-24 group-hover:text-primary transition-colors">{h.day}</span>

                                <div className="flex items-center gap-6">
                                    {!h.isClosed ? (
                                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-100 rounded-xl border border-zinc-200 shadow-inner">
                                            <input
                                                type="time"
                                                className="bg-transparent text-xs font-bold outline-none w-16"
                                                value={h.open}
                                                onChange={(e) => updateOpeningHour(i, 'open', e.target.value)}
                                            />
                                            <span className="text-xs font-bold text-zinc-300">TO</span>
                                            <input
                                                type="time"
                                                className="bg-transparent text-xs font-bold outline-none w-16"
                                                value={h.close}
                                                onChange={(e) => updateOpeningHour(i, 'close', e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-10 px-8 flex items-center text-[10px] font-bold uppercase tracking-wider text-zinc-300 border border-dashed border-zinc-100 rounded-xl">
                                            Station Closed
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => updateOpeningHour(i, 'isClosed', !h.isClosed)}
                                        className={cn(
                                            "rounded-xl h-10 px-4 font-bold text-[10px] uppercase tracking-wider transition-all",
                                            h.isClosed ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                                        )}
                                    >
                                        {h.isClosed ? "Closed" : "Open"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Commit Button */}
                <div className="pt-8 flex flex-col items-center gap-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-16 w-full max-w-md rounded-2xl bg-zinc-950 text-white font-bold uppercase tracking-widest shadow-xl shadow-zinc-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Profile Changes
                                </>
                            )}
                        </span>
                    </Button>
                    <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        Settings synchronized with live menu
                    </div>
                </div>
            </form>
        </div>
    );
}
