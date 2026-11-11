
"use client";

import React, { useEffect, useState } from "react";
import {
    ScrollText, Smartphone,
    Clock, Zap,
    Coins, CreditCard,
    ChefHat, UtensilsCrossed,
    MapPin, Globe,
    Search, ScanLine,
    Coffee, Martini,
    User, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalLoader() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Animation Duration in ms
        const duration = 2500;
        const intervalTime = 20;
        const step = 100 / (duration / intervalTime);

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => setIsVisible(false), 500);
                    return 100;
                }
                return prev + step;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, []);

    if (!isVisible) return null;

    // Icon Pairs: [Traditional/Physical] -> [Digital/Smart]
    const icons = [
        { old: ScrollText, new: Smartphone },    // Paper Menu -> Digital Menu
        { old: Clock, new: Zap },                // Wait -> Instant
        { old: Coins, new: CreditCard },         // Cash -> Card
        { old: ChefHat, new: UtensilsCrossed },  // Prep -> Serve
        { old: Search, new: ScanLine },          // Search -> QR
        { old: MapPin, new: Globe },             // Local -> Global
        { old: Coffee, new: Martini },           // Cafe -> Bar (Variety)
        { old: User, new: Sparkles },            // Customer -> Experience
    ];

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-1000",
                progress === 100 ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
        >
            <div className="w-full max-w-4xl px-4 mb-12">
                {/* Icons Container */}
                <div className="flex justify-between items-end h-24 sm:h-32 mb-8 relative">
                    {icons.map((pair, index) => {
                        const threshold = (index + 0.5) * (100 / icons.length);
                        const showNew = progress >= threshold;

                        return (
                            <div key={index} className="relative flex flex-col items-center justify-end h-full w-full">
                                {/* Traditional Icon (Grey) */}
                                <pair.old
                                    className={cn(
                                        "absolute bottom-0 w-8 h-8 sm:w-12 sm:h-12 transition-all duration-500 ease-out",
                                        showNew
                                            ? "opacity-0 scale-50 translate-y-4"
                                            : "opacity-100 scale-100 text-muted-foreground/40"
                                    )}
                                    strokeWidth={1.5}
                                />

                                {/* Smart Icon (Primary Color) */}
                                <pair.new
                                    className={cn(
                                        "absolute bottom-0 w-8 h-8 sm:w-12 sm:h-12 transition-all duration-500 ease-out",
                                        showNew
                                            ? "opacity-100 scale-100 text-primary"
                                            : "opacity-0 scale-50 translate-y-4"
                                    )}
                                    strokeWidth={2}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Progress Slider (Visual only) */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-4 text-xs sm:text-sm font-medium uppercase tracking-widest text-muted-foreground/50">
                    <span className={cn("transition-colors", progress < 50 && "text-foreground")}>Traditional</span>
                    <span className={cn("transition-colors", progress > 50 && "text-primary")}>Smart</span>
                </div>
            </div>

            <div className="absolute bottom-8 text-muted-foreground/30 text-[10px] tracking-[0.2em] font-light animate-pulse">
                PREPARING YOUR MENU...
            </div>
        </div>
    );
}
