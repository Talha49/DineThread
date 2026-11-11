"use client";

/**
 * Menu Item Detail Modal
 * MARKET-READY: Complete theme color integration
 */

import { useEffect } from "react";
import { X, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/store/useTranslation";

export function MenuItemDetail({ item, isOpen, onClose, themeColors }) {
    const { t } = useTranslation();
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!item) return null;

    const colors = themeColors || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 backdrop-blur-xl"
                        style={{
                            backgroundColor: `${colors.backgrounds?.page || '#000000'}cc`
                        }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: "100%", opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                        className="relative w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[85vh] md:rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row m-0 md:m-4"
                        style={{
                            backgroundColor: colors.backgrounds?.elevated || '#ffffff',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: colors.borders?.medium || '#d1d5db'
                        }}
                    >
                        {/* Close button */}
                        <div className="absolute top-6 right-6 z-20 hidden md:block">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full backdrop-blur-md"
                                style={{
                                    backgroundColor: `${colors.backgrounds?.card || '#ffffff'}cc`,
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: colors.borders?.light || '#e5e7eb',
                                    color: colors.text?.primary || '#111827'
                                }}
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="absolute top-6 left-6 z-20 md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full backdrop-blur-md"
                                style={{
                                    backgroundColor: `${colors.backgrounds?.card || '#ffffff'}80`,
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: colors.borders?.light || '#e5e7eb',
                                    color: colors.text?.primary || '#111827'
                                }}
                                onClick={onClose}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Image Section */}
                        <div
                            className="w-full md:w-1/2 h-[45%] md:h-auto relative group"
                            style={{
                                backgroundColor: colors.backgrounds?.card || '#f9fafb'
                            }}
                        >
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">
                                    🍽️
                                </div>
                            )}
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                            />

                            {item.isFeatured && (
                                <div
                                    className="absolute bottom-6 left-6 px-4 py-2 rounded-full backdrop-blur-md text-[10px] font-black tracking-[0.2em] flex items-center gap-2"
                                    style={{
                                        backgroundColor: colors.brand?.tertiary || '#10b981',
                                        color: colors.text?.inverse || '#ffffff',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: 'rgba(255,255,255,0.2)'
                                    }}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {t('live_menu.our_signature')}
                                </div>
                            )}
                        </div>

                        {/* Text Section */}
                        <div
                            className="flex-1 p-8 md:p-12 flex flex-col overflow-y-auto"
                            style={{
                                backgroundColor: colors.backgrounds?.elevated || '#ffffff'
                            }}
                        >
                            <div className="flex-1">
                                <div className="flex flex-col gap-2 mb-6 md:mb-8">
                                    <span
                                        className="text-[10px] font-black tracking-[0.3em] uppercase"
                                        style={{
                                            color: colors.brand?.primary || '#4f46e5'
                                        }}
                                    >
                                        {item.category}
                                    </span>
                                    <h2
                                        className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight md:leading-none"
                                        style={{
                                            color: colors.text?.primary || '#111827'
                                        }}
                                    >
                                        {item.name}
                                    </h2>
                                </div>

                                <p
                                    className="text-sm md:text-base leading-relaxed font-medium mb-8 md:mb-12 antialiased"
                                    style={{
                                        color: colors.text?.secondary || '#6b7280'
                                    }}
                                >
                                    {item.description || "A masterfully crafted selection from our kitchen, prepared with only the finest ingredients and a passion for flavor."}
                                </p>

                                <div className="space-y-4 mb-8 md:mb-0">
                                    <div
                                        className="flex items-center gap-3 text-[10px] font-black tracking-widest uppercase"
                                        style={{
                                            color: colors.text?.tertiary || '#9ca3af'
                                        }}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        {t('live_menu.in_stock')}
                                    </div>
                                </div>
                            </div>

                            <div
                                className="pt-8 md:pt-10 flex flex-wrap items-end justify-between gap-6 mt-6 md:mt-10"
                                style={{
                                    borderTop: `1px solid ${colors.borders?.light || '#e5e7eb'}`
                                }}
                            >
                                <div className="flex flex-col min-w-[120px]">
                                    <span
                                        className="text-[10px] font-black uppercase tracking-widest mb-1"
                                        style={{
                                            color: colors.text?.tertiary || '#9ca3af'
                                        }}
                                    >
                                        {t('live_menu.price_value')}
                                    </span>
                                    <div
                                        className="text-3xl md:text-5xl font-black tracking-tighter whitespace-nowrap"
                                        style={{
                                            color: colors.brand?.primary || '#4f46e5'
                                        }}
                                    >
                                        <span className="text-base md:text-xl align-top mr-0.5">$</span>
                                        {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <Button
                                    className="h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl flex-grow md:flex-grow-0"
                                    style={{
                                        backgroundColor: colors.brand?.primary || '#4f46e5',
                                        color: colors.text?.inverse || '#ffffff'
                                    }}
                                    onClick={onClose}
                                >
                                    {t('live_menu.dismiss')}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
