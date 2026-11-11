"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { buildVoronoiMosaic } from "@/lib/layout-engines/voronoi";

const CANVAS = { width: 1000, height: 600 };

export function VoronoiMosaic({ groupedItems, setSelectedItem, isTVMode }) {
    const theme = useTheme();
    const palette = theme.config?.colors?.brand || { primary: "#4f46e5" };

    return (
        <div className="space-y-16 md:space-y-24 pb-20">
            {groupedItems.map((group) => (
                <CategoryMosaic
                    key={group._id}
                    group={group}
                    palette={palette}
                    textColor={theme.config?.colors?.text?.primary}
                    setSelectedItem={setSelectedItem}
                />
            ))}
        </div>
    );
}

function CategoryMosaic({ group, palette, textColor, setSelectedItem }) {
    const cells = useMemo(
        () => buildVoronoiMosaic(group.items || [], { width: CANVAS.width, height: CANVAS.height }),
        [group.items]
    );

    if (cells.length === 0) return null;

    return (
        <div id={`category-${group.name}`} className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase" style={{ color: textColor }}>
                    {group.name}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent" />
            </div>

            <div
                className="relative w-full rounded-[2rem] overflow-hidden shadow-sm border border-zinc-100"
                style={{ aspectRatio: `${CANVAS.width} / ${CANVAS.height}` }}
            >
                {cells.map(({ item, clipPath }, i) => (
                    <button
                        key={item._id}
                        onClick={() => setSelectedItem(item)}
                        className="absolute inset-0 w-full h-full group cursor-pointer"
                        style={{ clipPath }}
                        title={item.name}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: i * 0.03 }}
                            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{
                                backgroundImage: item.imageUrl
                                    ? `url(${item.imageUrl})`
                                    : `linear-gradient(135deg, ${palette.primary}, ${palette.secondary || palette.primary})`,
                            }}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
                    </button>
                ))}

                {/* Labels float above the clipped tiles, unaffected by cell shape */}
                {cells.map(({ item, centroid }) => (
                    <div
                        key={`${item._id}-label`}
                        className="absolute pointer-events-none"
                        style={{
                            left: `${centroid.xPct}%`,
                            top: `${centroid.yPct}%`,
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-center">
                            <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-tight leading-none whitespace-nowrap">
                                {item.name}
                            </p>
                            <p className="text-[9px] font-bold mt-0.5 leading-none" style={{ color: palette.tertiary || '#fff' }}>
                                ${item.price}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
