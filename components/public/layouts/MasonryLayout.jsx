"use client";

/**
 * Masonry Layout
 * Pinterest-style dynamic grid layout with COMPLETE color system integration
 * MARKET-READY: Uses ALL color variables from Design Studio
 */

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MenuItem } from "../MenuItem";

export function MasonryLayout({ groupedItems, setSelectedItem, isTVMode }) {
    const theme = useTheme();
    const config = theme.config;
    const colors = config.colors || {};

    // Flatten all items from all categories
    const allItems = groupedItems.flatMap(category =>
        category.items.map(item => ({ ...item, categoryName: category.name }))
    );

    // Responsive column counts
    const columns = {
        mobile: config.layoutConfig?.responsive?.mobile?.columns || 1,
        tablet: config.layoutConfig?.responsive?.tablet?.columns || 2,
        desktop: config.layoutConfig?.responsive?.desktop?.columns || 3
    };

    const gap = config.layoutConfig?.responsive?.desktop?.gap || 24;

    return (
        <div
            className="space-y-12 min-h-screen p-6"
            style={{
                backgroundColor: colors.backgrounds?.page || '#ffffff'
            }}
        >
            {groupedItems.map((category, catIndex) => (
                <section key={category.name} className="masonry-section">
                    {/* Category Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIndex * 0.1 }}
                        className="mb-6 pb-4"
                        style={{
                            borderBottom: `2px solid ${colors.borders?.light || '#e5e7eb'}`
                        }}
                    >
                        <h2
                            className={cn(
                                "font-bold",
                                config.categorySection?.header?.alignment === 'center' ? "text-center" : "text-left"
                            )}
                            style={{
                                fontSize: `${config.categorySection?.header?.size || 32}px`,
                                color: colors.text?.primary || '#111827'
                            }}
                        >
                            {category.name}
                        </h2>

                        {/* Category badge with secondary brand color */}
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: colors.brand?.secondary || '#f43f5e',
                                    color: colors.text?.inverse || '#ffffff'
                                }}
                            >
                                {category.items.length} items
                            </span>
                        </div>
                    </motion.div>

                    {/* Masonry Grid */}
                    <div className="masonry-grid">
                        <style jsx>{`
                            .masonry-grid {
                                column-count: ${columns.mobile};
                                column-gap: ${gap}px;
                            }
                            
                            @media (min-width: 640px) {
                                .masonry-grid {
                                    column-count: ${columns.tablet};
                                }
                            }
                            
                            @media (min-width: 1024px) {
                                .masonry-grid {
                                    column-count: ${columns.desktop};
                                }
                            }
                            
                            .masonry-item {
                                break-inside: avoid;
                                page-break-inside: avoid;
                                margin-bottom: ${gap}px;
                            }
                        `}</style>

                        {category.items.map((item, index) => (
                            <motion.div
                                key={item._id}
                                className="masonry-item menu-item"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div
                                    className="rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl"
                                    onClick={() => setSelectedItem(item)}
                                    style={{
                                        backgroundColor: colors.backgrounds?.card || '#f9fafb',
                                        border: `1px solid ${colors.borders?.light || '#e5e7eb'}`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = colors.borders?.dark || '#9ca3af';
                                        e.currentTarget.style.backgroundColor = colors.backgrounds?.elevated || '#ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = colors.borders?.light || '#e5e7eb';
                                        e.currentTarget.style.backgroundColor = colors.backgrounds?.card || '#f9fafb';
                                    }}
                                >
                                    {/* Item Image */}
                                    {item.imageUrl && (
                                        <div className="relative overflow-hidden rounded-xl mb-3">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-48 object-cover"
                                            />
                                            {/* Popular badge with tertiary brand color */}
                                            {item.popular && (
                                                <span
                                                    className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
                                                    style={{
                                                        backgroundColor: colors.brand?.tertiary || '#10b981',
                                                        color: colors.text?.inverse || '#ffffff'
                                                    }}
                                                >
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Item Name - Primary Text */}
                                    <h3
                                        className="font-bold text-lg mb-2"
                                        style={{
                                            color: colors.text?.primary || '#111827'
                                        }}
                                    >
                                        {item.name}
                                    </h3>

                                    {/* Item Description - Secondary Text */}
                                    <p
                                        className="text-sm mb-3 line-clamp-2"
                                        style={{
                                            color: colors.text?.secondary || '#6b7280'
                                        }}
                                    >
                                        {item.description}
                                    </p>

                                    {/* Price and Add Button */}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-xl font-bold"
                                            style={{
                                                color: colors.brand?.primary || '#4f46e5'
                                            }}
                                        >
                                            ${item.price.toFixed(2)}
                                        </span>

                                        <button
                                            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-lg"
                                            style={{
                                                backgroundColor: colors.brand?.primary || '#4f46e5',
                                                color: colors.text?.inverse || '#ffffff'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItem(item);
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Dietary info - Tertiary Text */}
                                    {item.dietary && item.dietary.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {item.dietary.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-0.5 rounded"
                                                    style={{
                                                        color: colors.text?.tertiary || '#9ca3af',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: colors.borders?.medium || '#d1d5db'
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
