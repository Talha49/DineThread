"use client";

import { motion } from "framer-motion";
import { Sparkles, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { MenuItem } from "../MenuItem";
import { useTheme } from "@/contexts/ThemeContext";

const MOTION_MAPPING = {
    "liquid-spring": [0.21, 1.11, 0.81, 0.99],
    "haptic-snap": [0.19, 1, 0.22, 1],
    "airy-float": [0.45, 0, 0.55, 1],
    "minimal": [0.4, 0, 0.2, 1]
};

export function LiquidCarousel({ groupedItems, setSelectedItem, isTVMode }) {
    const theme = useTheme();
    const dna = theme.config?.animations?.itemEntrance || { motion: "liquid-spring" };
    const palette = theme.config?.colors?.brand || { primary: "#4f46e5", accent: "#f43f5e" };
    const motionEase = MOTION_MAPPING[dna.motion] || MOTION_MAPPING["liquid-spring"];

    return (
        <div className="space-y-20 pb-20">
            {groupedItems.map((group) => (
                <div key={group._id} id={`category-${group.name}`} className="scroll-mt-32">
                    <div className="px-4 mb-8">
                        <div className="flex items-baseline gap-4">
                            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-zinc-900"
                                style={{ color: theme.config?.colors?.text?.primary }}
                            >
                                {group.name}
                            </h2>
                            <span className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: palette.primary }}>
                                {group.items.length} Options
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar pb-8 -mx-4 px-4 scroll-smooth">
                        <div className="flex gap-6 md:gap-10 min-w-max px-4">
                            {group.items.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "0px 100px 0px 100px" }}
                                    transition={{ duration: 1, ease: motionEase, delay: index * 0.05 }}
                                    whileHover={{ y: -10 }}
                                    className="w-[280px] md:w-[400px] group cursor-pointer snap-center relative menu-item"
                                >
                                    <MenuItem
                                        item={item}
                                        theme={theme.config}
                                        onClick={() => setSelectedItem(item)}
                                    />
                                </motion.div>
                            ))}

                            <div className="w-20 md:w-40 flex items-center justify-center pr-10">
                                <div className="w-px h-20 bg-gradient-to-b from-transparent via-zinc-200 to-transparent opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
