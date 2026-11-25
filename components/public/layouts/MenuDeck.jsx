"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { SwipeDeck } from "@/lib/layout-engines/SwipeDeck";

const SWIPE_THRESHOLD = 100;

export function MenuDeck({ groupedItems, setSelectedItem, isTVMode }) {
    const theme = useTheme();
    const palette = theme.config?.colors?.brand || { primary: "#4f46e5" };
    const categories = groupedItems.filter((g) => (g.items || []).length > 0);

    const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?._id);
    const activeCategory = categories.find((c) => c._id === activeCategoryId) || categories[0];

    const [deck, setDeck] = useState(() => new SwipeDeck(activeCategory?.items || []));

    useEffect(() => {
        setDeck(new SwipeDeck(activeCategory?.items || []));
    }, [activeCategory?._id]);

    if (!activeCategory) return null;

    const advance = (direction) => setDeck((d) => d.advance(direction));
    const currentIndex = (activeCategory.items || []).findIndex((i) => i._id === deck.current?._id);

    return (
        <div className="pb-20">
            {/* Category pills - plain flex-wrap, so this row is safe at any width */}
            <div className="flex items-center justify-center gap-2 flex-wrap px-4 mb-10">
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => setActiveCategoryId(cat._id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border-2 transition-all",
                            cat._id === activeCategory._id
                                ? "text-white border-transparent"
                                : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200"
                        )}
                        style={cat._id === activeCategory._id ? { backgroundColor: palette.primary } : undefined}
                    >
                        {cat.emoji} {cat.name}
                    </button>
                ))}
            </div>

            {/* The deck - a fixed aspect-ratio box, all offsets are small fixed
                px/percent nudges rather than viewport-computed coordinates, so
                it never breaks or overlaps at any screen width */}
            <div className="relative w-full max-w-sm mx-auto" style={{ aspectRatio: "3 / 4" }}>
                {deck
                    .peek(3)
                    .slice(1)
                    .reverse()
                    .map((item, i, arr) => {
                        const depth = arr.length - i; // 2 = furthest back, 1 = just behind front
                        return (
                            <div
                                key={item._id}
                                className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-md"
                                style={{
                                    transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.05})`,
                                    zIndex: 3 - depth,
                                    opacity: 1 - depth * 0.25,
                                }}
                            >
                                <CardFace item={item} palette={palette} />
                            </div>
                        );
                    })}

                <AnimatePresence>
                    {deck.current && (
                        <motion.div
                            key={deck.current._id}
                            drag="x"
                            dragElastic={0.7}
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, info) => {
                                if (info.offset.x < -SWIPE_THRESHOLD) advance(1);
                                else if (info.offset.x > SWIPE_THRESHOLD) advance(-1);
                            }}
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            whileDrag={{ rotate: 0 }}
                            className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
                            style={{ zIndex: 10, touchAction: "pan-y" }}
                        >
                            <CardFace item={deck.current} palette={palette} isFront />
                            <button
                                onClick={() => setSelectedItem(deck.current)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
                                title="View details"
                            >
                                <Info className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls - simple flex row, works identically regardless of item count or screen width */}
            <div className="flex items-center justify-center gap-6 mt-8">
                <button
                    onClick={() => advance(-1)}
                    className="w-11 h-11 rounded-full bg-white border-2 border-zinc-100 shadow-sm flex items-center justify-center text-zinc-500 hover:border-zinc-200 active:scale-95 transition-all"
                    title="Previous"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    {currentIndex + 1} / {activeCategory.items.length}
                </span>
                <button
                    onClick={() => advance(1)}
                    className="w-11 h-11 rounded-full bg-white border-2 border-zinc-100 shadow-sm flex items-center justify-center text-zinc-500 hover:border-zinc-200 active:scale-95 transition-all"
                    title="Next"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Progress bar - a plain flex row of equal-width segments, scales
                to any item count without overflowing */}
            <div className="flex gap-1 max-w-sm mx-auto px-4 mt-4">
                {activeCategory.items.map((item) => (
                    <div
                        key={item._id}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{ backgroundColor: item._id === deck.current?._id ? palette.primary : "#e4e4e7" }}
                    />
                ))}
            </div>
        </div>
    );
}

function CardFace({ item, palette, isFront }) {
    return (
        <div className="relative w-full h-full bg-zinc-100">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: item.imageUrl
                        ? `url(${item.imageUrl})`
                        : `linear-gradient(135deg, ${palette.primary}, ${palette.secondary || palette.primary})`,
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            {isFront && (
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-end justify-between gap-3 mb-1">
                        <h3 className="text-2xl font-black tracking-tight leading-tight">{item.name}</h3>
                        <span className="text-lg font-black shrink-0" style={{ color: palette.tertiary || "#fff" }}>
                            ${item.price}
                        </span>
                    </div>
                    {item.description && (
                        <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                </div>
            )}
        </div>
    );
}
