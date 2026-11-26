"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/store/useTranslation';

export function VisitHistory({ days }) {
    const { language, t } = useTranslation();
    const chart = useRef(null);
    const inView = useInView(chart, { once: true, amount: 0.5 });
    const peak = Math.max(0, ...days.map(day => day.count));
    const weekday = new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' });
    const dateLabel = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' });
    return (
        <figure ref={chart} className="dt-history" data-in-view={inView}>
            <figcaption>{t(peak ? 'dashboard.overview.metrics.week' : 'dashboard.overview.metrics.empty_week')}</figcaption>
            <ol>
                {days.map(({ date, count }) => {
                    const day = new Date(date);
                    const description = dateLabel.format(day) + ' · ' + t('dashboard.overview.metrics.visits') + ' ' + count.toLocaleString(language);
                    return (
                        <li key={date} title={description}>
                            <span className="sr-only">{description}</span>
                            <div className="dt-history-track" aria-hidden="true">
                                <span className={count ? 'dt-history-bar' : 'dt-history-zero'}
                                    style={count ? { height: (count / peak * 100) + '%' } : undefined} />
                            </div>
                            <time dateTime={date} aria-hidden="true">{weekday.format(day)}</time>
                        </li>
                    );
                })}
            </ol>
        </figure>
    );
}

export function MetricCard({ title, value, unit, trend, trendValue, icon: Icon, color = 'indigo', children }) {
    const colorClasses = {
        indigo: "from-indigo-500/20 to-blue-500/20 text-indigo-600",
        purple: "from-purple-500/20 to-pink-500/20 text-purple-600",
        orange: "from-orange-500/20 to-red-500/20 text-orange-600",
        emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-600"
    };

    return (
        <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="dt-metric group relative rounded-3xl bg-white border border-zinc-200 shadow-sm overflow-hidden"
        >
            {/* Background Glow */}
            <div className={cn(
                "absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br opacity-50 blur-3xl transition-opacity group-hover:opacity-80",
                colorClasses[color]
            )} />

            <div className="relative z-10 flex flex-col h-full">
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
                    <h3 className="text-sm font-bold text-zinc-700 mb-1">{title}</h3>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                        <span className="text-3xl font-black italic tracking-tighter text-zinc-900">{value}</span>
                        {unit && <span className="text-xs font-bold text-zinc-600">{unit}</span>}
                    </div>
                </div>

                {children}
            </div>
        </motion.div>
    );
}
