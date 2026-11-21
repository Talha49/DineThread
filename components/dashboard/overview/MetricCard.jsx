"use client";

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MetricCard({ title, value, unit, trend, trendValue, icon: Icon, color = 'indigo', sparkline }) {
    // Normalize real daily counts to 0-100 bar heights - no sparkline is
    // rendered at all unless real numbers are passed in (see dashboard/page.jsx).
    const bars = sparkline?.length
        ? (() => {
            const max = Math.max(...sparkline, 1);
            return sparkline.map((v) => Math.max(8, Math.round((v / max) * 100)));
        })()
        : null;

    const colorClasses = {
        indigo: "from-indigo-500/20 to-blue-500/20 text-indigo-600",
        purple: "from-purple-500/20 to-pink-500/20 text-purple-600",
        orange: "from-orange-500/20 to-red-500/20 text-orange-600",
        emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-600"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative p-6 rounded-[2.5rem] bg-white border-2 border-zinc-50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
        >
            {/* Background Glow */}
            <div className={cn(
                "absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br opacity-50 blur-3xl transition-opacity group-hover:opacity-80",
                colorClasses[color]
            )} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                        "p-3 rounded-2xl bg-gradient-to-br shadow-sm",
                        colorClasses[color]
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full",
                            trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trendValue}%
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black italic tracking-tighter text-zinc-900">{value}</span>
                        {unit && <span className="text-xs font-bold text-zinc-400">{unit}</span>}
                    </div>
                </div>

                {/* Last 7 days, real counts only - no data in, no bars shown */}
                {bars && (
                    <div className="mt-4 flex items-end gap-1 h-8">
                        {bars.map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                className={cn(
                                    "flex-1 rounded-full transition-colors",
                                    i === bars.length - 1 ? "bg-zinc-900" : "bg-zinc-100 group-hover:bg-zinc-200"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
