"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { MenuItem } from "../MenuItem";

const MOTION_MAPPING = {
    "liquid-spring": { type: "spring", damping: 15, stiffness: 100 },
    "haptic-snap": { type: "spring", damping: 25, stiffness: 300 },
    "airy-float": { type: "tween", ease: "easeInOut", duration: 0.8 },
    "minimal": { type: "tween", ease: "linear", duration: 0.4 }
};

// Professional spacing constants
const LAYOUT_CONFIG = {
    mobile: {
        centerCircle: 160,      // Center circle diameter
        orbitRadius: 140,       // Distance from center to orbit items
        itemSize: 56,           // Orbiting item size
        containerSize: 400      // Total container size
    },
    desktop: {
        centerCircle: 240,      // Center circle diameter
        orbitRadius: 200,       // Distance from center to orbit items
        itemSize: 80,           // Orbiting item size
        containerSize: 600      // Total container size
    }
};

export function OrbitalWheel({ groupedItems, setSelectedItem, isTVMode }) {
    const theme = useTheme();
    const visual = theme.config?.visual || { radius: "24px", glass: 20 };
    const animations = theme.config?.animations || { interactions: { hover: "liquid-spring" } };
    const palette = theme.config?.colors?.brand || { primary: "#4f46e5", accent: "#f43f5e" };
    const motionConfig = MOTION_MAPPING[animations.interactions?.hover] || MOTION_MAPPING["liquid-spring"];

    const [activeIndex, setActiveIndex] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const config = isMobile ? LAYOUT_CONFIG.mobile : LAYOUT_CONFIG.desktop;
    const activeGroup = groupedItems[activeIndex];
    const categoryCount = groupedItems.length;
    const angleStep = 360 / categoryCount;

    const handleCategoryClick = (index) => {
        const diff = index - activeIndex;
        setRotation(prev => prev - (diff * angleStep));
        setActiveIndex(index);
    };

    return (
        <div className="flex flex-col items-center min-h-[80vh] pt-8 pb-20 overflow-hidden">
            {/* Orbital Wheel Container */}
            <div
                className="relative shrink-0 flex items-center justify-center mb-12"
                style={{
                    width: config.containerSize,
                    height: config.containerSize
                }}
            >
                {/* Background glow effect */}
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [0.95, 1.05, 0.95],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="rounded-full blur-3xl opacity-30"
                        style={{
                            width: config.centerCircle * 1.5,
                            height: config.centerCircle * 1.5,
                            backgroundColor: `${palette.primary}33`
                        }}
                    />
                </div>

                {/* Center Circle - Active Category */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div
                        className="relative rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center p-8 text-center overflow-hidden pointer-events-auto transition-all"
                        style={{
                            width: config.centerCircle,
                            height: config.centerCircle,
                            backgroundColor: visual.glass > 0 ? `rgba(255, 255, 255, ${Math.max(0.2, visual.glass / 120)})` : "white",
                            backdropFilter: visual.glass > 0 ? `blur(${visual.glass / 4}px)` : undefined,
                            border: `1px solid rgba(0,0,0,0.05)`
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeGroup?.name}
                                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -20, opacity: 0, scale: 0.8 }}
                                transition={motionConfig}
                                className="flex flex-col items-center"
                            >
                                <span className="text-5xl md:text-7xl mb-3 drop-shadow-lg">{activeGroup?.emoji}</span>
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-900 leading-tight">
                                    {activeGroup?.name}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Rotating Orbit Ring with Items */}
                <motion.div
                    animate={{ rotate: rotation }}
                    transition={motionConfig}
                    className="absolute inset-0 z-10"
                    style={{
                        width: config.containerSize,
                        height: config.containerSize
                    }}
                >
                    {groupedItems.map((group, i) => {
                        const angle = (i * angleStep * Math.PI) / 180; // Convert to radians

                        // Calculate position on orbit circle
                        const x = (config.containerSize / 2) + (config.orbitRadius * Math.cos(angle)) - (config.itemSize / 2);
                        const y = (config.containerSize / 2) + (config.orbitRadius * Math.sin(angle)) - (config.itemSize / 2);

                        return (
                            <motion.div
                                key={group._id}
                                animate={{ rotate: -rotation }} // Counter-rotate to keep items upright
                                transition={motionConfig}
                                className="absolute"
                                style={{
                                    left: x,
                                    top: y,
                                    width: config.itemSize,
                                    height: config.itemSize
                                }}
                            >
                                <motion.button
                                    onClick={() => handleCategoryClick(i)}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={cn(
                                        "w-full h-full rounded-full flex items-center justify-center transition-all duration-500 relative group",
                                        activeIndex === i
                                            ? "text-white"
                                            : "bg-white text-zinc-400 border border-zinc-100 shadow-md hover:shadow-xl hover:border-zinc-200"
                                    )}
                                    style={{
                                        backgroundColor: activeIndex === i ? palette.primary : undefined,
                                        boxShadow: activeIndex === i ? `0 20px 50px ${palette.primary}66` : undefined,
                                    }}
                                >
                                    <span className="text-2xl md:text-4xl relative z-10">{group.emoji}</span>
                                    {activeIndex === i && (
                                        <motion.div
                                            layoutId="activeGlow"
                                            className="absolute inset-0 rounded-full blur-xl scale-150"
                                            style={{ backgroundColor: `${palette.primary}33` }}
                                        />
                                    )}
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Decorative orbit ring */}
                <div
                    className="absolute rounded-full border border-dashed border-zinc-200 z-0 animate-[spin_100s_linear_infinite] opacity-50"
                    style={{
                        width: config.orbitRadius * 2,
                        height: config.orbitRadius * 2,
                        left: (config.containerSize - config.orbitRadius * 2) / 2,
                        top: (config.containerSize - config.orbitRadius * 2) / 2
                    }}
                />
            </div>

            {/* Items List Below */}
            <div className="w-full max-w-2xl px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={motionConfig}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col">
                                <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none"
                                    style={{ color: theme.config?.colors?.text?.primary }}
                                >
                                    {activeGroup?.name}
                                </h2>
                                <span className="text-[10px] font-black tracking-[0.3em] mt-2 uppercase" style={{ color: palette.primary }}>
                                    {activeGroup?.items.length} Signature Creations
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {activeGroup?.items.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ ...motionConfig, delay: index * 0.05 }}
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
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
