"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PAGE_TITLES = {
    "/dashboard": "Overview",
    "/dashboard/menu": "Menu Management",
    "/dashboard/qr": "QR Code",
    "/dashboard/settings/branding": "Branding & Appearance",
};

export function TopBar({ onMenuClick, isSidebarOpen }) {
    const { user } = useAuth();
    const pathname = usePathname();

    const currentTitle = PAGE_TITLES[pathname] || "Dashboard";

    return (
        <header className="flex h-16 items-center gap-4 border-b bg-background/50 backdrop-blur-md px-6 sticky top-0 z-30">
            {/* Toggle Button - Visible on Mobile AND Desktop if we support collapsing */}
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>

            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-semibold font-display text-foreground animate-fade-in">
                        {currentTitle}
                    </h1>
                    {user?.restaurantId && (
                        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border text-[10px] font-mono font-bold text-muted-foreground">
                            <span className="opacity-50">/menu/</span>
                            <span className="text-foreground">{user.restaurantId}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="text-right hidden sm:block">
                        <p className="font-medium leading-none">{user?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <User className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </header>
    );
}
