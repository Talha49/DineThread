"use client";

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ExternalLink, QrCode } from 'lucide-react';
import Link from 'next/link';

export function DashboardHero({ restaurantName, restaurantId }) {
    return (
        <div className="relative p-10 rounded-[3rem] bg-zinc-900 overflow-hidden shadow-2xl">
            {/* Animated Decorative Elements */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" 
            />
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Intelligence Active</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-black italic tracking-tighter text-white leading-none"
                    >
                        Welcome back to<br />
                        <span className="text-primary">{restaurantName}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-white/50 font-medium max-w-md leading-relaxed"
                    >
                        Manage your menu, customize your brand, and share your digital experience with customers.
                    </motion.p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link href={`/menu/${restaurantId}`} target="_blank">
                            <button className="flex items-center gap-3 bg-white text-zinc-900 text-[10px] font-black uppercase tracking-widest py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                                <ExternalLink className="w-4 h-4" />
                                Launch Live Menu
                            </button>
                        </Link>
                        <Link href="/dashboard/qr">
                            <button className="flex items-center gap-3 bg-white/10 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest py-4 px-8 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md">
                                <QrCode className="w-4 h-4" />
                                Get QR Codes
                            </button>
                        </Link>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="hidden lg:block relative"
                >
                    <div className="aspect-square w-full max-w-[320px] ml-auto bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-[3rem] border-4 border-white/5 shadow-2xl p-6 flex flex-col justify-between group cursor-pointer hover:border-primary/30 transition-all duration-700 overflow-hidden">
                        {/* Visual DNA Preview Mockup */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Visual DNA 2.0</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                            <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <div className="h-20 rounded-2xl bg-white/5" />
                                <div className="h-20 rounded-2xl bg-white/5" />
                            </div>
                        </div>

                        <Link href="/dashboard/settings/branding" className="relative z-10 mt-6 flex items-center justify-between group/link">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Enter Design Studio</span>
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center group-hover/link:translate-x-2 transition-transform">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
