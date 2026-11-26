"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, ExternalLink, QrCode, Utensils } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function DashboardHero({ restaurantName, restaurantId, menuItems }) {
    const reduceMotion = useReducedMotion();
    const dishes = menuItems.filter(item => item.isAvailable !== false).slice(0, 2);
    return (
        <div className="relative p-10 rounded-[3rem] bg-zinc-900 overflow-hidden shadow-2xl">
            {/* Animated Decorative Elements */}
            <motion.div 
                animate={reduceMotion ? { scale: 1, rotate: 0 } : {
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0]
                }}
                transition={reduceMotion ? { duration: 0 } : { duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" 
            />
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <motion.div 
                        initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Intelligence Active</span>
                    </motion.div>

                    <motion.h1 
                        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-black italic tracking-tighter text-white leading-none"
                    >
                        Welcome back to<br />
                        <span className="text-indigo-300">{restaurantName}</span>
                    </motion.h1>

                    <motion.p
                        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-white/50 font-medium max-w-md leading-relaxed"
                    >
                        Manage your menu, customize your brand, and share your digital experience with customers.
                    </motion.p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link href={`/menu/${restaurantId}`} target="_blank" className="flex items-center gap-3 bg-white text-zinc-900 text-[10px] font-black uppercase tracking-widest py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                                <ExternalLink className="w-4 h-4" />
                                Launch Live Menu
                        </Link>
                        <Link href="/dashboard/qr" className="flex items-center gap-3 bg-white/10 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest py-4 px-8 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md">
                                <QrCode className="w-4 h-4" />
                                Get QR Codes
                        </Link>
                    </div>
                </div>

                <motion.div 
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                >
                    <Link href="/dashboard/settings" className="group mx-auto block max-w-sm rounded-3xl border border-white/15 bg-zinc-800 p-5 text-white shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300 lg:me-0">
                        <span className="flex items-center gap-2 text-sm font-semibold"><Sparkles aria-hidden="true" className="size-4 text-indigo-300" /> Menu preview</span>
                        {dishes.length ? (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {dishes.map(dish => (
                                    <div key={dish._id}>
                                        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-zinc-700">
                                            {dish.imageUrl ? (
                                                <Image src={dish.imageUrl} alt="" fill sizes="160px" className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105" />
                                            ) : <Utensils aria-hidden="true" className="absolute inset-0 m-auto size-6 text-zinc-300" />}
                                        </div>
                                        <span className="mt-2 block truncate text-sm font-medium">{dish.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="my-6 text-sm text-zinc-300">Available dishes will appear here when you add them to your menu.</p>}
                        <span className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-sm font-semibold">
                            Enter Design Studio <ArrowRight aria-hidden="true" className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
                        </span>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
