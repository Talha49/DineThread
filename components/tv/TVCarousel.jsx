"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function TVCarousel({ menu, brandColor }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter out empty categories
    const validGroups = menu.filter(g => g.items.length > 0);

    useEffect(() => {
        if (validGroups.length <= 1) return;

        // Auto-advance every 15 seconds
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % validGroups.length);
        }, 15000);

        return () => clearInterval(interval);
    }, [validGroups.length]);

    if (validGroups.length === 0) return null;

    const currentGroup = validGroups[currentIndex];

    // Identify top picks (global first 3 across all items in all valid groups)
    const topPickIds = [];
    let count = 0;
    for (const group of validGroups) {
        for (const item of group.items) {
            if (count < 3) {
                topPickIds.push(item._id);
                count++;
            } else {
                break;
            }
        }
        if (count >= 3) break;
    }

    // Calculate progress bar width
    const progress = ((currentIndex + 1) / validGroups.length) * 100;

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            {/* Header / Category Title */}
            <div className="flex items-center justify-between p-8 pb-4">
                <h2 className="text-5xl font-display font-bold text-primary flex items-center gap-4 animate-in slide-in-from-left duration-700">
                    <span className="text-6xl">{currentGroup.emoji}</span>
                    {currentGroup.name}
                </h2>

                {/* Progress Indicators */}
                <div className="flex gap-2">
                    {validGroups.map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "w-3 h-3 rounded-full transition-all duration-500",
                                idx === currentIndex ? "bg-primary scale-125" : "bg-primary/20"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Grid Content - Key-based animation to trigger re-render effects */}
            <div key={currentIndex} className="flex-1 p-8 pt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-right-8 duration-700">
                {currentGroup.items.map((item) => {
                    const isTopPick = topPickIds.includes(item._id);

                    return (
                        <div
                            key={item._id}
                            className={cn(
                                "bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 flex flex-col gap-4 shadow-lg relative overflow-hidden",
                                isTopPick && "ring-2 ring-primary/40 bg-gradient-to-br from-card/80 to-primary/10"
                            )}
                        >
                            {isTopPick && (
                                <div
                                    className="absolute top-0 right-0 px-6 py-2 rounded-bl-3xl flex items-center gap-2 text-sm font-bold text-white shadow-xl"
                                    style={{ backgroundColor: brandColor || "var(--primary)" }}
                                >
                                    <Sparkles className="w-5 h-5 fill-current" />
                                    TOP PICK
                                </div>
                            )}

                            {item.imageUrl && (
                                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted relative">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-3xl font-bold leading-tight">{item.name}</h3>
                                    <span className="text-3xl font-bold text-primary">${item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-xl text-muted-foreground line-clamp-3 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 h-2 bg-primary/20 w-full">
                <div
                    className="h-full bg-primary transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
