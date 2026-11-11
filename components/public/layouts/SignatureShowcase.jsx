"use client";

/**
 * Signature Showcase Layout
 *
 * Replaces the old "3D Perspective Deck" (a swipe-through card-stack that
 * forced customers to click through every single item one at a time, and
 * bypassed the shared MenuItem renderer entirely - so almost none of the
 * Item Surface / Typography settings actually reached it).
 *
 * This is the pattern real restaurant sites actually use: a horizontal
 * "signature dishes" spotlight up top for the handful of items the owner
 * has marked Featured, then the full menu below in the same reliable
 * category grid every other layout uses. Built entirely on the shared
 * <MenuItem> component, so every Item Surface and Typography setting that
 * works elsewhere works here too - nothing custom to drift out of sync.
 */

import { MenuItem } from "../MenuItem";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignatureShowcase({ isTVMode, groupedItems, setSelectedItem }) {
    const theme = useTheme();

    const featuredItems = groupedItems
        .flatMap((group) => group.items.filter((item) => item.isFeatured))
        .slice(0, 8);

    const featuredIds = new Set(featuredItems.map((item) => item._id));
    const remainingGroups = featuredIds.size
        ? groupedItems
            .map((group) => ({ ...group, items: group.items.filter((item) => !featuredIds.has(item._id)) }))
            .filter((group) => group.items.length > 0)
        : groupedItems;

    return (
        <div className="space-y-12 md:space-y-24">
            {/* Signature spotlight - only appears once the owner has actually featured something real */}
            {featuredItems.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                        <Sparkles
                            className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                            style={{ color: theme.config?.colors?.brand?.primary }}
                        />
                        <h2
                            className={cn(
                                "font-black tracking-tighter uppercase italic",
                                isTVMode ? "text-4xl md:text-7xl text-white" : "text-2xl md:text-4xl text-zinc-900"
                            )}
                            style={{ color: !isTVMode ? theme.config?.colors?.text?.primary : undefined }}
                        >
                            Signature Selections
                        </h2>
                    </div>

                    <div className="flex gap-5 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {featuredItems.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.08 }}
                                className="menu-item shrink-0 w-[78%] sm:w-[45%] md:w-[32%] lg:w-[26%] h-[420px] snap-start"
                            >
                                <MenuItem
                                    item={item}
                                    theme={theme.config}
                                    variant="featured"
                                    onClick={() => setSelectedItem(item)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* The rest of the menu, in the same reliable grid every layout uses */}
            {remainingGroups.map((group) => (
                <div key={group._id} id={`category-${group.name}`} className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-8 md:mb-16">
                        <h2
                            className={cn(
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
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: (index % 8) * 0.05 }}
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
