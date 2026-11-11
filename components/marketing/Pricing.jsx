"use client";

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { cn } from '@/lib/utils';

import { useTranslation } from '@/store/useTranslation';

export function Pricing() {
    const { t } = useTranslation();
    const plans = [
        {
            name: t('home.pricing.plans.0.name'),
            price: t('home.pricing.plans.0.price'),
            desc: t('home.pricing.plans.0.desc'),
            icon: Shield,
            features: [0, 1, 2, 3, 4].map(i => t(`home.pricing.plans.0.features.${i}`)),
            cta: t('home.pricing.plans.0.cta'),
            popular: false
        },
        {
            name: t('home.pricing.plans.1.name'),
            price: t('home.pricing.plans.1.price'),
            period: t('home.pricing.plans.1.period'),
            desc: t('home.pricing.plans.1.desc'),
            icon: Zap,
            features: [0, 1, 2, 3, 4, 5].map(i => t(`home.pricing.plans.1.features.${i}`)),
            cta: t('home.pricing.plans.1.cta'),
            popular: true,
            popularLabel: t('home.pricing.plans.1.popular')
        },
        {
            name: t('home.pricing.plans.2.name'),
            price: t('home.pricing.plans.2.price'),
            period: t('home.pricing.plans.2.period'),
            desc: t('home.pricing.plans.2.desc'),
            icon: Sparkles,
            features: [0, 1, 2, 3, 4, 5].map(i => t(`home.pricing.plans.2.features.${i}`)),
            cta: t('home.pricing.plans.2.cta'),
            popular: false
        }
    ];

    return (
        <section id="pricing" className="py-24 px-4 bg-zinc-50 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">{t('home.pricing.tag')}</h2>
                    <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
                        {t('home.pricing.title_1')} <br />
                        <span className="text-zinc-400">{t('home.pricing.title_2')}</span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "relative p-10 rounded-[3rem] flex flex-col transition-all duration-500",
                                plan.popular
                                    ? "bg-zinc-900 text-white shadow-2xl scale-105 z-10"
                                    : "bg-white text-zinc-900 border-2 border-zinc-100"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-10 rtl:left-10 rtl:right-auto -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                                    {plan.popularLabel}
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                                    plan.popular ? "bg-white/10" : "bg-zinc-100"
                                )}>
                                    <plan.icon className={cn("w-6 h-6", plan.popular ? "text-primary" : "text-zinc-900")} />
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-tight mb-2">{plan.name}</h4>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black italic tracking-tighter">{plan.price}</span>
                                    {plan.period && <span className="text-lg font-bold text-zinc-500">{plan.period}</span>}
                                </div>
                                <p className={cn("mt-4 text-sm font-medium", plan.popular ? "text-white/50" : "text-zinc-500")}>
                                    {plan.desc}
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                            plan.popular ? "bg-white/10 text-primary" : "bg-zinc-900 text-white"
                                        )}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-wide opacity-80">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className={cn(
                                    "w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all",
                                    plan.popular
                                        ? "bg-primary hover:bg-indigo-500 shadow-xl shadow-primary/40"
                                        : "bg-zinc-900 hover:bg-zinc-800 text-white"
                                )}
                            >
                                {plan.cta}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
