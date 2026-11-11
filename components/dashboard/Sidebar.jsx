"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Menu,
    UtensilsCrossed,
    Settings,
    LogOut,
    ExternalLink,
    X,
    Tv,
    QrCode,
    Utensils,
    ClipboardList
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { useEffect, useState } from "react";
import { useTranslation } from "@/store/useTranslation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Sidebar({ className, onClose, isMobile }) {
    const pathname = usePathname();
    const { restaurant } = useRestaurantStore();
    const { logout } = useAuth();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const liveMenuUrl = restaurant?.restaurantId ? `/menu/${restaurant.restaurantId}` : "/";
    const tvMenuUrl = restaurant?.restaurantId ? `/tv/${restaurant.restaurantId}` : "/";

    const sidebarLinks = [
        { name: t('dashboard.sidebar.overview'), href: "/dashboard", icon: LayoutDashboard },
        { name: t('dashboard.sidebar.menu_management'), href: "/dashboard/menu", icon: UtensilsCrossed },
        { name: t('dashboard.sidebar.qr_code'), href: "/dashboard/qr", icon: QrCode },
        { name: t('dashboard.sidebar.tables'), href: "/dashboard/tables", icon: Utensils },
        { name: t('dashboard.sidebar.orders'), href: "/dashboard/orders", icon: ClipboardList },
        { name: t('dashboard.sidebar.shop_settings'), href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <aside className={cn("flex h-full flex-col bg-card border-r rtl:border-r-0 rtl:border-l", className)}>
            {/* Header / Logo */}
            <div className="flex h-16 items-center px-6 border-b justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
                    <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Davoriq
                    </span>
                </Link>
                {isMobile && (
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-3">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={isMobile ? onClose : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Language Switcher in Sidebar (Desktop & Mobile) */}
            <div className="px-4 py-2">
                <LanguageSwitcher className="w-full justify-start" position="top" />
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-2">
                {mounted && (
                    <>
                        <Link
                            href={liveMenuUrl}
                            target="_blank"
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                restaurant?.restaurantId
                                    ? "text-primary hover:bg-primary/10 bg-primary/5"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <ExternalLink className="h-4 w-4" />
                            {t('dashboard.sidebar.view_live')}
                        </Link>
                        <Link
                            href={tvMenuUrl}
                            target="_blank"
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-2",
                                restaurant?.restaurantId
                                    ? "text-primary hover:bg-primary/10 bg-primary/5"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Tv className="h-4 w-4" />
                            {t('dashboard.sidebar.launch_tv')}
                        </Link>
                    </>
                )}
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    {t('dashboard.sidebar.sign_out')}
                </button>
            </div>
        </aside>
    );
}
