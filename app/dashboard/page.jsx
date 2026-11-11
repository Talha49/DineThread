"use client";

import { useEffect } from "react";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { useCategoryStore } from "@/hooks/use-category-store";
import { useMenuStore } from "@/hooks/use-menu-store";
import { useAnalyticsStore } from "@/hooks/use-analytics-store";
import { motion } from "framer-motion";
import {
    Utensils,
    QrCode,
    Layers,
    Sparkles,
    LayoutDashboard,
    ListChecks
} from "lucide-react";
import { DashboardHero } from "@/components/dashboard/overview/DashboardHero";
import { MetricCard } from "@/components/dashboard/overview/MetricCard";
import { SuccessRoadmap } from "@/components/dashboard/overview/SuccessRoadmap";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/store/useTranslation";
import toast from "react-hot-toast";

export default function DashboardPage() {
    const { restaurant, isLoading } = useRestaurantStore();
    const { categories, fetchCategories } = useCategoryStore();
    const { items: menuItems, fetchItems } = useMenuStore();
    const { summary, fetchSummary } = useAnalyticsStore();
    const { t } = useTranslation();

    useEffect(() => {
        fetchCategories();
        fetchItems();
        fetchSummary();
    }, [fetchCategories, fetchItems, fetchSummary]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('dashboard.overview.loading')}</span>
                </div>
            </div>
        );
    }

    // REAL DATA - from the actual category/item stores (the same ones
    // /dashboard/menu uses), not a `restaurant.menu` field that doesn't
    // exist on the Restaurant model and was silently always empty.
    const totalItems = menuItems.length;
    const totalCategories = categories.length;
    const hasVisuals = !!restaurant?.experienceConfig?.designSystem?.config;
    const hasLogo = !!restaurant?.logoUrl;

    const totalVisits = summary ? summary.totalViews + summary.totalScans : null;
    const visitSparkline = summary?.last7Days?.map((d) => d.count) || null;

    // Calculate Completeness %
    const completionScore = [
        totalCategories > 0,
        totalItems >= 5,
        hasVisuals,
        hasLogo
    ].filter(Boolean).length * 25;

    return (
        <div className="space-y-10 pb-20 max-w-[1400px] mx-auto animate-in fade-in duration-1000">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <LayoutDashboard className="w-3 h-3 rtl:ml-2" />
                    <span>{t('dashboard.overview.title')}</span>
                    <span className="opacity-30">/</span>
                    <span className="text-zinc-900">{t('dashboard.overview.subtitle')}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse rtl:ml-2" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">{t('dashboard.overview.syncing')}</span>
                    </div>
                </div>
            </div>

            {/* Premium Hero Section */}
            <DashboardHero 
                restaurantName={restaurant?.name || 'Your Restaurant'} 
                restaurantId={restaurant?.restaurantId}
            />

            {/* Performance Metrics (Wired to Real Data) */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard 
                    title={t('dashboard.overview.metrics.menu_items')} 
                    value={totalItems} 
                    unit={t('dashboard.overview.metrics.active_items')}
                    icon={Utensils}
                    color="indigo"
                />
                <MetricCard 
                    title={t('dashboard.overview.metrics.categories')} 
                    value={totalCategories} 
                    unit={t('dashboard.overview.metrics.sections')}
                    icon={Layers}
                    color="purple"
                />
                <MetricCard 
                    title={t('dashboard.overview.metrics.visual_dna')} 
                    value={hasVisuals ? t('dashboard.overview.metrics.active') : t('dashboard.overview.metrics.default')} 
                    unit={hasVisuals ? t('dashboard.overview.metrics.custom_theme') : t('dashboard.overview.metrics.standard')}
                    icon={Sparkles}
                    color="orange"
                />
                <MetricCard
                    title="Menu Visits"
                    value={totalVisits ?? "—"}
                    unit={summary ? `${summary.todayCount} today` : "Loading..."}
                    icon={QrCode}
                    color="emerald"
                    sparkline={visitSparkline}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-10">
                    <SuccessRoadmap
                        restaurant={restaurant}
                        totalCategories={totalCategories}
                        totalItems={totalItems}
                        totalScans={summary?.totalScans || 0}
                        totalVisits={totalVisits || 0}
                    />
                </div>

                {/* Sidebar Side-panel */}
                <div className="space-y-6">
                    {/* Menu Health Card */}
                    <div className="p-8 rounded-[3rem] bg-white border-2 border-zinc-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <ListChecks className="w-4 h-4 text-primary rtl:ml-2" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">{t('dashboard.overview.health.title')}</h4>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                    <span className="text-zinc-400">{t('dashboard.overview.health.completeness')}</span>
                                    <span className="text-primary">{completionScore}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionScore}%` }}
                                        className="h-full bg-primary" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: t('dashboard.overview.health.cat_created'), ok: totalCategories > 0 },
                                    { label: t('dashboard.overview.health.min_items'), ok: totalItems >= 5 },
                                    { label: t('dashboard.overview.health.visuals_set'), ok: hasVisuals },
                                    { label: t('dashboard.overview.health.logo_set'), ok: hasLogo }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-[10px] font-medium text-zinc-500">{item.label}</span>
                                        <div className={cn(
                                            "w-4 h-4 rounded-full flex items-center justify-center",
                                            item.ok ? "bg-emerald-50 text-emerald-500" : "bg-zinc-50 text-zinc-300"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", item.ok ? "bg-emerald-500" : "bg-zinc-300")} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pro Plan Card */}
                    {restaurant?.plan === 'free' && (
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="p-8 rounded-[3rem] bg-gradient-to-br from-primary to-indigo-600 text-white shadow-2xl relative overflow-hidden group"
                        >
                            <Sparkles className="absolute -right-4 -top-4 w-32 h-32 opacity-20 group-hover:rotate-12 transition-transform duration-700 rtl:-left-4 rtl:-right-auto" />
                            <div className="relative z-10">
                                <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">{t('dashboard.overview.pro.title')}</h4>
                                <p className="text-sm text-white/70 font-medium mb-6">{t('dashboard.overview.pro.desc')}</p>
                                <button
                                    onClick={() => {
                                        const subject = encodeURIComponent("Davoriq Pro - early access");
                                        const body = encodeURIComponent(`Hi,\n\nI'd like to upgrade "${restaurant?.name || 'my restaurant'}" (${restaurant?.restaurantId || ''}) to Pro.\n\nThanks!`);
                                        window.location.href = `mailto:hello@davoriq.com?subject=${subject}&body=${body}`;
                                        toast.success("Opening your email client...");
                                    }}
                                    className="w-full bg-white text-primary text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
                                >
                                    {t('dashboard.overview.pro.btn')}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

