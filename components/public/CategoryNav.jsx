"use client";

/**
 * Category Navigation
 * MARKET-READY: Uses complete theme color system
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from '@/contexts/ThemeContext';

export function CategoryNav({ categories, activeCategory }) {
    const [active, setActive] = useState(activeCategory);
    const navRef = useRef(null);
    const theme = useTheme();
    const colors = theme?.config?.colors || {};

    useEffect(() => {
        setActive(activeCategory);
    }, [activeCategory]);

    const scrollToCategory = (catName) => {
        setActive(catName);
        const element = document.getElementById(`category-${catName}`);
        if (element) {
            const isMobile = window.innerWidth < 768;
            const headerOffset = isMobile ? 140 : 180;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div
            className="sticky top-[72px] md:top-[80px] z-40 w-full transition-all duration-700"
            style={{
                backgroundColor: `${colors.backgrounds?.elevated || '#ffffff'}cc`,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: `1px solid ${colors.borders?.light || '#e5e7eb'}`
            }}
        >
            <div
                ref={navRef}
                className="relative flex overflow-x-auto py-5 px-6 gap-4 scrollbar-hide snap-x max-w-7xl mx-auto items-center"
                role="tablist"
            >
                {categories.map((cat) => {
                    const isActive = active === cat.name;

                    return (
                        <motion.button
                            key={cat._id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => scrollToCategory(cat.name)}
                            className={cn(
                                "group flex items-center gap-3 px-6 py-3 rounded-[1.25rem] text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 snap-center border-2",
                                isActive ? "" : "shadow-sm"
                            )}
                            style={isActive ? {
                                backgroundColor: colors.brand?.primary || '#4f46e5',
                                color: colors.text?.inverse || '#ffffff',
                                borderColor: 'transparent',
                                boxShadow: `0 15px 35px -10px ${colors.brand?.primary || '#4f46e5'}60`,
                                fontWeight: 'var(--font-heading-weight)',
                                fontFamily: 'var(--font-heading)'
                            } : {
                                backgroundColor: `${colors.backgrounds?.card || '#ffffff'}80`,
                                color: colors.text?.secondary || '#6b7280',
                                borderColor: colors.borders?.light || '#e5e7eb',
                                fontWeight: 'var(--font-heading-weight)',
                                fontFamily: 'var(--font-heading)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.borderColor = colors.borders?.dark || '#9ca3af';
                                    e.currentTarget.style.color = colors.text?.primary || '#111827';
                                    e.currentTarget.style.backgroundColor = colors.backgrounds?.elevated || '#ffffff';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.borderColor = colors.borders?.light || '#e5e7eb';
                                    e.currentTarget.style.color = colors.text?.secondary || '#6b7280';
                                    e.currentTarget.style.backgroundColor = `${colors.backgrounds?.card || '#ffffff'}80`;
                                }
                            }}
                        >
                            <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform duration-500 transform">
                                {cat.emoji || "🍽️"}
                            </span>
                            <span>{cat.name}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="navIndicator"
                                    className="w-1 h-1 rounded-full ml-1"
                                    style={{
                                        backgroundColor: colors.text?.inverse || '#ffffff'
                                    }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Edge fades */}
            <div
                className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                style={{
                    background: `linear-gradient(to right, ${colors.backgrounds?.elevated || '#ffffff'}dd, transparent)`
                }}
            />
            <div
                className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                style={{
                    background: `linear-gradient(to left, ${colors.backgrounds?.elevated || '#ffffff'}dd, transparent)`
                }}
            />
        </div>
    );
}
