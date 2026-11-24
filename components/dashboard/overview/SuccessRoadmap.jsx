"use client";

import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap, Target, Palette, Box } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SuccessRoadmap({ restaurant, totalCategories = 0, totalItems = 0, totalScans = 0, totalVisits = 0 }) {
    const hasVisuals = !!restaurant?.experienceConfig?.designSystem?.config;

    const steps = [
        {
            title: "Build the Core",
            desc: "Create categories and add your signature items.",
            icon: Box,
            link: "/dashboard/menu",
            completed: totalCategories > 0 && totalItems > 0
        },
        {
            title: "Design Studio",
            desc: "Set up your brand colors and visual layout.",
            icon: Palette,
            link: "/dashboard/settings",
            completed: hasVisuals
        },
        {
            title: "Launch & Scale",
            desc: "Print your QR codes and put them on tables.",
            icon: Target,
            link: "/dashboard/qr",
            completed: totalScans > 0
        },
        {
            title: "Track Performance",
            desc: "Get your first visitor to see it in Menu Visits.",
            icon: Zap,
            link: "/dashboard",
            completed: totalVisits > 0
        }
    ];

    // Own progress, from these exact 4 steps - not the unrelated Menu Health
    // score, which used to be passed in here and could read "100%" while
    // half these steps were still unchecked right below it.
    const progress = Math.round((steps.filter((s) => s.completed).length / steps.length) * 100);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-zinc-900">Success Roadmap</h3>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Scale your restaurant experience</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black italic text-primary">{progress}%</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Completed</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500",
                                step.completed 
                                    ? "bg-zinc-50 border-zinc-100 opacity-60" 
                                    : "bg-white border-zinc-50 hover:border-zinc-200 hover:shadow-xl"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className={cn(
                                    "p-3 rounded-2xl shadow-sm",
                                    step.completed ? "bg-zinc-200 text-zinc-500" : "bg-zinc-900 text-white"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                {step.completed ? (
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                ) : (
                                    <Link href={step.link}>
                                        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                )}
                            </div>

                            <div className="mt-4">
                                <h4 className={cn(
                                    "text-lg font-black tracking-tight",
                                    step.completed ? "text-zinc-400" : "text-zinc-900"
                                )}>
                                    {step.title}
                                </h4>
                                <p className={cn(
                                    "text-xs font-medium leading-relaxed",
                                    step.completed ? "text-zinc-300" : "text-zinc-500"
                                )}>
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
