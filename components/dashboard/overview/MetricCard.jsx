"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MetricCard({ title, value, unit, trend, trendValue, icon: Icon, color = 'indigo', sparkline }) {
    const reduceMotion = useReducedMotion();
    const peak = Math.max(1, ...(sparkline || []).map(day => day.count));

    const colorClasses = {
        indigo: "from-indigo-500/20 to-blue-500/20 text-indigo-600",
        purple: "from-purple-500/20 to-pink-500/20 text-purple-600",
        orange: "from-orange-500/20 to-red-500/20 text-orange-600",
        emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-600"
    };

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={reduceMotion ? undefined : { y: -5 }}
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
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-1">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black italic tracking-tighter text-zinc-900">{value}</span>
                        {unit && <span className="text-xs font-bold text-zinc-600">{unit}</span>}
                    </div>
                </div>

                {sparkline?.length > 0 && (
                    <figure className="mt-3 text-zinc-600">
                        <figcaption className="mb-1.5 text-xs font-medium">Visits over the last 7 days</figcaption>
                        <ol className="flex h-8 items-end gap-1.5 border-b border-zinc-300">
                            {sparkline.map(({ date, count }) => (
                                <li key={date} title={date + ' · ' + count} className="flex h-full flex-1 items-end justify-center">
                                    <span className="sr-only">{date}, {count} visits</span>
                                    <span aria-hidden="true" className={cn('w-full max-w-3 rounded-t-sm', count ? 'bg-teal-700' : 'bg-zinc-300')}
                                        style={{ height: count ? Math.max(5, count / peak * 100) + '%' : '1px' }} />
                                </li>
                            ))}
                        </ol>
                    </figure>
                )}
            </div>
        </motion.div>
    );
}
