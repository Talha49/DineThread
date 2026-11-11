"use client";

/**
 * Polymorphic Menu Item Cards
 * 
 * 4 card variants that adapt to themeConfig:
 * - HorizontalCard: Image left, content right (default)
 * - VerticalCard: Image top, content bottom (Instagram-style)
 * - OverlayCard: Image background, content overlay
 * - MinimalCard: Text-only, compact
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Main MenuItem Component (Polymorphic)
 * Selects card variant based on themeConfig
 */
export function MenuItem({ item, theme, onClick, variant }) {
    const tConfig = theme?.config || theme;
    const layout = variant || tConfig?.menuItem?.layout || 'horizontal';

    const CardComponent = {
        horizontal: HorizontalCard,
        vertical: VerticalCard,
        overlay: OverlayCard,
        minimal: MinimalCard,
        featured: MagazineCard,
        compact: HorizontalCard // Fallback for bento compact
    }[layout] || HorizontalCard;

    return <CardComponent item={item} theme={theme} onClick={onClick} />;
}

/**
 * Horizontal Card
 * Image left, content right - classic restaurant menu style
 */
export function HorizontalCard({ item, theme, onClick }) {
    const tConfig = theme?.config || theme;
    const [imageLoaded, setImageLoaded] = useState(false);

    const cardRadius = tConfig?.borders?.radius?.[tConfig?.menuItem?.card?.borderRadius] || 16;
    const cardShadow = tConfig?.shadows?.[tConfig?.menuItem?.card?.shadow] || '0 2px 4px rgba(0,0,0,0.05)';
    const cardBg = tConfig?.colors?.backgrounds?.card || '#FFFFFF';
    const imageEnabled = tConfig?.menuItem?.image?.enabled !== false && item.imageUrl;

    // AI Intelligence - Heatmap
    const showHeatmap = tConfig?.intelligence?.heatmap?.showPreview;
    const isPopular = showHeatmap && (item.name.toLowerCase().includes('signature') || item.name.toLowerCase().includes('special') || Math.random() > 0.8);

    return (
        <motion.div
            onClick={onClick}
            className={cn(
                "group flex items-center gap-4 cursor-pointer transition-all duration-300 relative",
                isPopular && "ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            )}
            style={{
                backgroundColor: cardBg,
                borderRadius: `var(--theme-radius, ${cardRadius}px)`,
                boxShadow: `var(--theme-shadow, ${cardShadow})`,
                padding: `${tConfig?.menuItem?.card?.padding || 16}px`,
                backdropFilter: `blur(var(--theme-glass-blur, 0px))`,
                opacity: `var(--theme-glass-opacity, 1)`
            }}
            whileHover={{
                scale: tConfig?.menuItem?.card?.hoverEffect === 'scale' ? 1.02 : 1,
                y: tConfig?.menuItem?.card?.hoverEffect === 'lift' ? -4 : 0,
                boxShadow: tConfig?.menuItem?.card?.hoverEffect === 'glow'
                    ? `0 8px 20px ${tConfig?.colors?.brand?.primary}40`
                    : cardShadow
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Image */}
            {imageEnabled && (
                <div
                    className="flex-shrink-0 overflow-hidden"
                    style={{
                        width: tConfig?.menuItem?.image?.position === 'left' ? '120px' : '80px',
                        height: tConfig?.menuItem?.image?.position === 'left' ? '120px' : '80px',
                        borderRadius: `${tConfig?.borders?.radius?.[tConfig?.menuItem?.image?.borderRadius] || 12}px`
                    }}
                >
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className={cn(
                            "w-full h-full transition-all duration-500",
                            `object-${tConfig?.menuItem?.image?.objectFit || 'cover'}`,
                            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110",
                            "group-hover:scale-110"
                        )}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3
                        className="font-bold line-clamp-2"
                        style={{
                            fontSize: `var(--text-item-name, ${tConfig?.typography?.sizes?.itemName || 18}px)`,
                            color: tConfig?.colors?.text?.primary,
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 'var(--font-heading-weight)',
                            lineHeight: 'var(--line-height-tight)',
                            letterSpacing: 'var(--letter-spacing-tight)'
                        }}
                    >
                        {item.name}
                    </h3>
                    {isPopular && (
                        <div className="bg-amber-400 text-amber-950 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-2 h-2" />
                            HOT
                        </div>
                    )}
                </div>

                {item.description && (
                    <p
                        className="line-clamp-2"
                        style={{
                            fontSize: `var(--text-item-desc, ${tConfig?.typography?.sizes?.itemDescription || 14}px)`,
                            color: tConfig?.colors?.text?.secondary,
                            fontFamily: 'var(--font-body)',
                            lineHeight: 'var(--line-height-relaxed)',
                            letterSpacing: 'var(--letter-spacing-normal)'
                        }}
                    >
                        {item.description}
                    </p>
                )}
            </div>

            {/* Price */}
            <div
                className="flex-shrink-0"
                style={{
                    fontSize: `var(--text-price, ${tConfig?.typography?.sizes?.price || 18}px)`,
                    color: tConfig?.colors?.brand?.primary,
                    fontWeight: 'var(--font-heading-weight)',
                    fontFamily: 'var(--font-heading)'
                }}
            >
                ${item.price}
            </div>
        </motion.div>
    );
}

/**
 * Vertical Card
 * Image top, content bottom - Instagram/Pinterest style
 */
export function VerticalCard({ item, theme, onClick }) {
    const tConfig = theme?.config || theme;
    const [imageLoaded, setImageLoaded] = useState(false);

    const cardRadius = tConfig?.borders?.radius?.[tConfig?.menuItem?.card?.borderRadius] || 16;
    const cardShadow = tConfig?.shadows?.[tConfig?.menuItem?.card?.shadow] || '0 4px 6px rgba(0,0,0,0.1)';
    const cardBg = tConfig?.colors?.backgrounds?.card || '#FFFFFF';
    const imageEnabled = tConfig?.menuItem?.image?.enabled !== false && item.imageUrl;

    // AI Intelligence - Heatmap
    const showHeatmap = tConfig?.intelligence?.heatmap?.showPreview;
    const isPopular = showHeatmap && (item.name.toLowerCase().includes('signature') || item.name.toLowerCase().includes('special') || Math.random() > 0.85);

    return (
        <motion.div
            onClick={onClick}
            className={cn(
                "group cursor-pointer overflow-hidden transition-all duration-300 relative",
                isPopular && "ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            )}
            style={{
                backgroundColor: cardBg,
                borderRadius: `var(--theme-radius, ${cardRadius}px)`,
                boxShadow: `var(--theme-shadow, ${cardShadow})`,
                backdropFilter: `blur(var(--theme-glass-blur, 0px))`,
                opacity: `var(--theme-glass-opacity, 1)`
            }}
            whileHover={{
                scale: tConfig?.menuItem?.card?.hoverEffect === 'scale' ? 1.03 : 1,
                y: tConfig?.menuItem?.card?.hoverEffect === 'lift' ? -6 : 0,
                boxShadow: tConfig?.menuItem?.card?.hoverEffect === 'glow'
                    ? `0 8px 20px ${tConfig?.colors?.brand?.primary}40`
                    : cardShadow
            }}
            whileTap={{ scale: 0.97 }}
        >
            {/* Image */}
            {imageEnabled && (
                <div
                    className="overflow-hidden"
                    style={{ aspectRatio: tConfig?.menuItem?.image?.aspectRatio || '4/3' }}
                >
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className={cn(
                            "w-full h-full transition-all duration-500",
                            `object-${tConfig?.menuItem?.image?.objectFit || 'cover'}`,
                            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110",
                            "group-hover:scale-105"
                        )}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                    />
                </div>
            )}

            {/* Content */}
            <div style={{ padding: `${tConfig?.menuItem?.card?.padding ?? 20}px` }}>
                <h3
                    className="font-bold line-clamp-2 mb-2"
                    style={{
                        fontSize: `var(--text-item-name, ${tConfig?.typography?.sizes?.itemName || 20}px)`,
                        color: tConfig?.colors?.text?.primary,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 'var(--font-heading-weight)',
                        lineHeight: 'var(--line-height-tight)',
                        letterSpacing: 'var(--letter-spacing-tight)'
                    }}
                >
                    {item.name}
                </h3>

                {item.description && (
                    <p
                        className="line-clamp-3 mb-3"
                        style={{
                            fontSize: `var(--text-item-desc, ${tConfig?.typography?.sizes?.itemDescription || 14}px)`,
                            color: tConfig?.colors?.text?.secondary,
                            fontFamily: 'var(--font-body)',
                            lineHeight: 'var(--line-height-relaxed)',
                            letterSpacing: 'var(--letter-spacing-normal)'
                        }}
                    >
                        {item.description}
                    </p>
                )}

                {/* Price */}
                <div
                    className="font-bold"
                    style={{
                        fontSize: `var(--text-price, ${tConfig?.typography?.sizes?.price || 20}px)`,
                        color: tConfig?.colors?.brand?.primary,
                        fontWeight: 'var(--font-heading-weight)',
                        fontFamily: 'var(--font-heading)'
                    }}
                >
                    ${item.price}
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Overlay Card
 * Image background with content overlay - dramatic presentation
 */
export function OverlayCard({ item, theme, onClick }) {
    const tConfig = theme?.config || theme;
    const [imageLoaded, setImageLoaded] = useState(false);

    const cardRadius = tConfig?.borders?.radius?.[tConfig?.menuItem?.card?.borderRadius] || 16;
    const cardShadow = tConfig?.shadows?.[tConfig?.menuItem?.card?.shadow] || '0 8px 16px rgba(0,0,0,0.2)';
    const imageEnabled = tConfig?.menuItem?.image?.enabled !== false && item.imageUrl;

    // AI Intelligence - Heatmap
    const showHeatmap = tConfig?.intelligence?.heatmap?.showPreview;
    const isPopular = showHeatmap && (item.name.toLowerCase().includes('signature') || item.name.toLowerCase().includes('special') || Math.random() > 0.9);

    return (
        <motion.div
            onClick={onClick}
            className={cn(
                "group relative cursor-pointer overflow-hidden transition-all duration-300",
                isPopular && "ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
            )}
            style={{
                borderRadius: `var(--theme-radius, ${cardRadius}px)`,
                boxShadow: `var(--theme-shadow, ${cardShadow})`,
                aspectRatio: tConfig?.menuItem?.image?.aspectRatio || '4/3',
                minHeight: '250px'
            }}
            whileHover={{
                scale: tConfig?.menuItem?.card?.hoverEffect === 'scale' ? 1.02 : 1,
                y: tConfig?.menuItem?.card?.hoverEffect === 'lift' ? -4 : 0
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Background Image */}
            {imageEnabled ? (
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={cn(
                        "absolute inset-0 w-full h-full transition-all duration-700",
                        `object-${tConfig?.menuItem?.image?.objectFit || 'cover'}`,
                        imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110",
                        "group-hover:scale-110"
                    )}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />
            ) : (
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: tConfig?.colors?.brand?.primary }}
                />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div
                className="absolute inset-0 flex flex-col justify-end text-white"
                style={{ padding: `${tConfig?.menuItem?.card?.padding ?? 24}px` }}
            >
                <h3
                    className="font-bold line-clamp-2 mb-2"
                    style={{
                        fontSize: `var(--text-item-name, ${tConfig?.typography?.sizes?.itemName || 22}px)`,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 'var(--font-heading-weight)',
                        lineHeight: 'var(--line-height-tight)',
                        letterSpacing: 'var(--letter-spacing-tight)'
                    }}
                >
                    {item.name}
                </h3>

                {item.description && (
                    <p
                        className="line-clamp-2 mb-3 text-white/90"
                        style={{
                            fontSize: `var(--text-item-desc, ${tConfig?.typography?.sizes?.itemDescription || 14}px)`,
                            fontFamily: 'var(--font-body)',
                            lineHeight: 'var(--line-height-relaxed)',
                            letterSpacing: 'var(--letter-spacing-normal)'
                        }}
                    >
                        {item.description}
                    </p>
                )}

                {/* Price Badge */}
                <div
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full font-bold self-start"
                    style={{
                        fontSize: `var(--text-price, ${tConfig?.typography?.sizes?.price || 18}px)`,
                        backgroundColor: tConfig?.colors?.brand?.primary,
                        color: 'white',
                        fontWeight: 'var(--font-heading-weight)'
                    }}
                >
                    ${item.price}
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Minimal Card
 * Text-only, compact - for high-density menus
 */
export function MinimalCard({ item, theme, onClick }) {
    const tConfig = theme?.config || theme;
    return (
        <motion.div
            onClick={onClick}
            className="group cursor-pointer border-b transition-all duration-200 py-4"
            style={{
                borderColor: tConfig?.colors?.borders?.light || '#E5E7EB'
            }}
            whileHover={{
                backgroundColor: tConfig?.colors?.backgrounds?.card || '#F9FAFB',
                paddingLeft: '8px'
            }}
        >
            <div className="flex items-baseline justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3
                        className="font-semibold line-clamp-1"
                        style={{
                            fontSize: `var(--text-item-name, ${tConfig?.typography?.sizes?.itemName || 16}px)`,
                            color: tConfig?.colors?.text?.primary,
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 'var(--font-heading-weight)',
                            lineHeight: 'var(--line-height-tight)',
                            letterSpacing: 'var(--letter-spacing-tight)'
                        }}
                    >
                        {item.name}
                    </h3>

                    {item.description && (
                        <p
                            className="line-clamp-1 mt-1"
                            style={{
                                fontSize: `var(--text-item-desc, ${tConfig?.typography?.sizes?.itemDescription || 13}px)`,
                                color: tConfig?.colors?.text?.secondary,
                                fontFamily: 'var(--font-body)',
                                lineHeight: 'var(--line-height-relaxed)',
                                letterSpacing: 'var(--letter-spacing-normal)'
                            }}
                        >
                            {item.description}
                        </p>
                    )}
                </div>

                {/* Price */}
                <div
                    className="flex-shrink-0 font-bold"
                    style={{
                        fontSize: `var(--text-price, ${tConfig?.typography?.sizes?.price || 16}px)`,
                        color: tConfig?.colors?.brand?.primary,
                        fontWeight: 'var(--font-heading-weight)',
                        fontFamily: 'var(--font-heading)'
                    }}
                >
                    ${item.price}
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Magazine Card
 * High-end editorial style for featured items
 */
export function MagazineCard({ item, theme, onClick }) {
    const tConfig = theme?.config || theme;
    const [imageLoaded, setImageLoaded] = useState(false);

    const cardRadius = tConfig?.borders?.radius?.[tConfig?.menuItem?.card?.borderRadius] || 32;
    const cardShadow = tConfig?.shadows?.[tConfig?.menuItem?.card?.shadow] || '0 20px 40px rgba(0,0,0,0.1)';
    const cardBg = tConfig?.colors?.backgrounds?.card || '#FFFFFF';

    // AI Intelligence - Heatmap
    const showHeatmap = tConfig?.intelligence?.heatmap?.showPreview;
    const isPopular = showHeatmap && (item.name.toLowerCase().includes('signature') || item.name.toLowerCase().includes('special') || Math.random() > 0.7);

    return (
        <motion.div
            onClick={onClick}
            className={cn(
                "group relative h-full w-full cursor-pointer overflow-hidden flex flex-col transition-all duration-700",
                isPopular && "ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
            )}
            style={{
                backgroundColor: cardBg,
                borderRadius: `var(--theme-radius, ${cardRadius}px)`,
                boxShadow: `var(--theme-shadow, ${cardShadow})`,
                backdropFilter: `blur(var(--theme-glass-blur, 0px))`,
                opacity: `var(--theme-glass-opacity, 1)`
            }}
            whileHover={{ 
                y: tConfig?.menuItem?.card?.hoverEffect === 'lift' ? -8 : 0,
                scale: tConfig?.menuItem?.card?.hoverEffect === 'scale' ? 1.02 : 1
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Heatmap Badge */}
            {isPopular && (
                <div className="absolute top-4 right-4 z-20 bg-amber-400 text-amber-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    Top Seller
                </div>
            )}

            {/* Immersive Image */}
            <div className="relative flex-1 overflow-hidden">
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={cn(
                        "w-full h-full transition-all duration-1000",
                        `object-${tConfig?.menuItem?.image?.objectFit || 'cover'}`,
                        imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110",
                        "group-hover:scale-110"
                    )}
                    onLoad={() => setImageLoaded(true)}
                />
                {/* Price Tag */}
                <div 
                    className="absolute top-6 left-6 px-6 py-2 rounded-2xl text-white font-black italic text-lg shadow-2xl flex flex-col"
                    style={{ 
                        backgroundColor: tConfig?.colors?.brand?.primary,
                        fontWeight: 'var(--font-heading-weight)',
                        fontFamily: 'var(--font-heading)'
                    }}
                >
                    <span className="leading-none">${item.price}</span>
                    {tConfig?.intelligence?.dynamicPricing?.enabled && (
                        <span className="text-[10px] opacity-60 line-through decoration-white/40">${(item.price * 1.2).toFixed(2)}</span>
                    )}
                </div>
            </div>

            {/* Editorial Content */}
            <div className="space-y-3" style={{ padding: `${tConfig?.menuItem?.card?.padding ?? 32}px` }}>
                <h3
                    className="font-black italic uppercase"
                    style={{
                        fontSize: `var(--text-item-name, 32px)`,
                        color: tConfig?.colors?.text?.primary,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 'var(--font-heading-weight)',
                        lineHeight: 'var(--line-height-tight)',
                        letterSpacing: 'var(--letter-spacing-tight)'
                    }}
                >
                    {item.name}
                </h3>
                <p
                    className="line-clamp-2 text-zinc-500 font-medium"
                    style={{
                        fontSize: `var(--text-item-desc, 14px)`,
                        fontFamily: 'var(--font-body)',
                        lineHeight: 'var(--line-height-relaxed)',
                        letterSpacing: 'var(--letter-spacing-normal)'
                    }}
                >
                    {item.description}
                </p>
                <div className="pt-4 flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-zinc-900" />
                    <span 
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        Discover More
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
