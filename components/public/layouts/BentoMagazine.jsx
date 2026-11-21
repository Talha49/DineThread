"use client";

/**
 * Bento Magazine Layout
 * 
 * A high-end, editorial-style layout with varied card sizes.
 * Feels like a luxury food magazine or a curated gallery.
 */

import { motion } from "framer-motion";
import { MenuItem } from "../MenuItem";
import { cn } from "@/lib/utils";

export function BentoMagazine({ groupedItems, setSelectedItem, theme }) {
    return (
        <div className="space-y-24 pb-20">
            {groupedItems.map((group, groupIndex) => (
                <section key={group._id} className="space-y-12">
                    {/* Category Header with large numeral */}
                    <div className="relative flex items-end gap-4 border-b-2 border-zinc-900 pb-6">
                        <span className="text-8xl font-black text-zinc-100 absolute -top-12 -left-4 select-none -z-10">
                            0{groupIndex + 1}
                        </span>
                        <div className="relative z-10">
                            <h2 
                                className="italic tracking-tighter uppercase leading-none"
                                style={{ 
                                    fontSize: 'var(--text-category-title, 48px)',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 'var(--font-heading-weight)'
                                }}
                            >
                                {group.name}
                            </h2>
                            <p 
                                className="font-black tracking-[0.5em] text-zinc-400 mt-2 uppercase ml-1"
                                style={{ fontSize: '10px', fontFamily: 'var(--font-body)' }}
                            >
                                {group.items.length} Curated Selections
                            </p>
                        </div>
                        <span className="ml-auto text-4xl">{group.emoji}</span>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[280px]">
                        {group.items.map((item, index) => {
                            // Unique Magazine Pattern
                            // 0: Big Featured (2x2)
                            // 1, 2: Small Vertical (1x1)
                            // 3: Wide (2x1)
                            // 4: Tall (1x2)
                            const isFeatured = index % 7 === 0;
                            const isWide = index % 7 === 3;
                            const isTall = index % 7 === 4;

                            return (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className={cn(
                                        "menu-item group h-full",
                                        isFeatured && "md:col-span-2 md:row-span-2",
                                        isWide && "md:col-span-2",
                                        isTall && "md:row-span-2"
                                    )}
                                >
                                    <MenuItem
                                        item={item}
                                        theme={theme}
                                        onClick={() => setSelectedItem(item)}
                                        variant={isFeatured ? "featured" : "compact"}
                                        className="h-full"
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
