"use client";

/**
 * List Layout
 * Traditional vertical menu layout
 * Clean, easy-to-scan presentation
 */

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { MenuItem } from "../MenuItem";

export function ListLayout({ groupedItems, setSelectedItem, isTVMode }) {
    const theme = useTheme();
    const config = theme.config;

    return (
        <div className="space-y-16">
            {groupedItems.map((category, catIndex) => (
                <section key={category.name} className="category-section">
                    {/* Category Header */}
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: catIndex * 0.1 }}
                        className={cn(
                            "font-bold mb-6 pb-3",
                            config.categorySection?.header?.alignment === 'center' ? "text-center" : "text-left",
                            config.categorySection?.header?.decoration?.type === 'underline' && "border-b-2"
                        )}
                        style={{
                            fontSize: `${config.categorySection?.header?.size || 32}px`,
                            color: config.colors?.brand?.primary || '#111827',
                            borderColor: config.categorySection?.header?.decoration?.type === 'underline'
                                ? config.colors?.brand?.primary
                                : 'transparent',
                            marginTop: `${config.categorySection?.spacing?.top || 48}px`,
                            marginBottom: `${config.categorySection?.spacing?.bottom || 24}px`
                        }}
                    >
                        {category.name}
                    </motion.h2>

                    {/* Items List */}
                    <div className="space-y-4">
                        {category.items.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: catIndex * 0.1 + index * 0.05 }}
                                className="menu-item"
                            >
                                <MenuItem
                                    item={item}
                                    theme={config}
                                    onClick={() => setSelectedItem(item)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
