"use client";

import { MenuItem } from "../MenuItem";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MOTION_MAPPING = {
    "liquid-spring": [0.21, 1.11, 0.81, 0.99],
    "haptic-snap": [0.19, 1, 0.22, 1],
    "airy-float": [0.45, 0, 0.55, 1],
    "minimal": [0.4, 0, 0.2, 1]
};

export function ClassicGrid({ isTVMode, groupedItems, setSelectedItem }) {
    const theme = useTheme();
    const entrance = theme.config?.animations?.itemEntrance || { type: 'stagger' };
    
    // Map IDs to Framer Motion variants
    const entranceVariants = {
        stagger: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
        fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
        scale: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
        none: { initial: { opacity: 1 }, animate: { opacity: 1 } }
    };

    const variant = entranceVariants[entrance.type] || entranceVariants.stagger;
    const motionEase = MOTION_MAPPING[entrance.motion] || MOTION_MAPPING["liquid-spring"];

    return (
        <div className="space-y-12 md:space-y-24">
            {groupedItems.map((group) => (
                <div key={group._id} id={`category-${group.name}`} className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-8 md:mb-16">
                        <h2 className={cn(
                            "font-black uppercase italic",
                            isTVMode ? "text-4xl md:text-8xl text-white" : "text-zinc-900"
                        )}
                            style={{
                                color: !isTVMode ? theme.config?.colors?.text?.primary : undefined,
                                fontSize: isTVMode ? undefined : 'var(--text-category-title, 40px)',
                                lineHeight: 'var(--line-height-tight)',
                                letterSpacing: 'var(--letter-spacing-tight)'
                            }}
                        >
                            {group.name}
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent" />
                    </div>

                    <div className={cn(
                        "grid gap-6 md:gap-12",
                        isTVMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    )}>
                        {group.items.map((item, index) => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={variant.initial}
                                whileInView={variant.animate}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.05,
                                    ease: motionEase
                                }}
                                className="menu-item"
                            >
                                <MenuItem
                                    item={item}
                                    theme={theme.config}
                                    onClick={() => setSelectedItem(item)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
