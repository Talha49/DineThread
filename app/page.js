"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Sparkles, ArrowRight, Play, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/marketing/Navbar";
import { Features } from "@/components/marketing/Features";
import { Pricing } from "@/components/marketing/Pricing";
import { Footer } from "@/components/marketing/Footer";
import { useTranslation } from "@/store/useTranslation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home({ user }) {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const effectiveUser = user || authUser;
  const primaryCtaHref = effectiveUser ? "/dashboard" : "/signup";

  const reducedMotion = useReducedMotion();
  const walkthrough = useRef(null);
  useEffect(() => {
    const video = walkthrough.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function syncPlayback() {
      if (preference.matches) video.pause();
      else video.play().catch(() => {}); // Native playback controls handle blocked autoplay.
    }
    syncPlayback();
    preference.addEventListener("change", syncPlayback);
    return () => preference.removeEventListener("change", syncPlayback);
  }, []);
  return (
    <div className="min-h-screen [--color-primary:#4338ca] text-zinc-900 bg-white selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar user={user} />

      <section className="dt-intro relative px-4">
        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <h1 className="dt-headline font-black italic uppercase">
            {t('home.hero.title_1')}<br />
            <span>{t('home.hero.title_2')}</span>
          </h1>
          <p className="dt-summary">{t('home.hero.subtitle')}</p>
          <div className="dt-actions">
            <Link href={primaryCtaHref} className="dt-action dt-action-primary">
              {effectiveUser ? t('nav.dashboard') : t('home.hero.cta_primary')}
              <ArrowRight aria-hidden="true" className="size-5 rtl:rotate-180" />
            </Link>
            <a href="#how-it-works" className="dt-action dt-action-secondary">
              <Play aria-hidden="true" className="size-4 fill-current rtl:rotate-180" />
              {t('home.hero.cta_secondary')}
            </a>
          </div>
          <div id="how-it-works" className="dt-walkthrough">
            <video ref={walkthrough} controls muted playsInline loop preload="metadata"
              poster="/dashboard-showcase.png" aria-label={t("accessibility.walkthrough")}>
              <source src="/inro.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="workflow" className="scroll-mt-20 py-24 px-4 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="block text-[11px] font-black uppercase tracking-[0.4em] text-primary" role="doc-subtitle">{t('home.workflow.tag')}</span>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
              {t('home.workflow.title_1')} <br />
              <span className="text-zinc-600">{t('home.workflow.title_2')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: t('home.workflow.steps.0.title'),
                desc: t('home.workflow.steps.0.desc'),
                icon: "📋"
              },
              {
                step: "02",
                title: t('home.workflow.steps.1.title'),
                desc: t('home.workflow.steps.1.desc'),
                icon: "🍔"
              },
              {
                step: "03",
                title: t('home.workflow.steps.2.title'),
                desc: t('home.workflow.steps.2.desc'),
                icon: "🎨"
              },
              {
                step: "04",
                title: t('home.workflow.steps.3.title'),
                desc: t('home.workflow.steps.3.desc'),
                icon: "⚡"
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 relative group hover:border-primary/20 transition-all">
                <div className="text-4xl mb-6">{item.icon}</div>
                <div className="absolute top-8 right-8 rtl:left-8 rtl:right-auto text-xs font-bold uppercase tracking-wide text-indigo-700">{item.step}</div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-3 text-zinc-900">{item.title}</h4>
                <p className="text-base font-medium text-zinc-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-10 rounded-[3rem] bg-zinc-900 text-white relative overflow-hidden">
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <h4 className="text-2xl font-black italic tracking-tighter uppercase">{t('home.workflow.why_optimize')}</h4>
                   <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                     {t('home.workflow.why_desc')}
                   </p>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wide">{t('home.workflow.benefits.0')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wide">{t('home.workflow.benefits.1')}</span>
                      </div>
                   </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                   <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <span className="text-xs font-bold uppercase tracking-wide text-zinc-300">{t('home.workflow.table.feature')}</span>
                      <span className="text-xs font-bold uppercase tracking-wide text-zinc-300">{t('home.workflow.table.status')}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold">{t('home.workflow.table.rows.0')}</span>
                      <span className="text-[9px] font-black uppercase px-2 py-1 bg-primary text-white rounded-md">{t('home.workflow.table.live')}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold">{t('home.workflow.table.rows.1')}</span>
                      <span className="text-[9px] font-black uppercase px-2 py-1 bg-primary text-white rounded-md">{t('home.workflow.table.live')}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold">{t('home.workflow.table.rows.2')}</span>
                      <span className="text-[9px] font-black uppercase px-2 py-1 bg-primary text-white rounded-md">{t('home.workflow.table.live')}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <Features />

      {/* Visual DNA Showcase */}
      <section id="themes" className="scroll-mt-20 py-24 px-4 bg-zinc-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[150px] translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8">
            <span className="block text-[11px] font-black uppercase tracking-[0.4em] text-indigo-300" role="doc-subtitle">{t('home.automation.tag')}</span>
            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-[0.9]">
              {t('home.automation.title_1')} <br />
              <span className="text-zinc-300">{t('home.automation.title_2')}</span>
            </h2>
            <p className="text-lg text-zinc-300 font-medium leading-relaxed">
              {t('home.automation.desc')}
            </p>
            <ul className="space-y-4">
              {[0, 1, 2, 3].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/70">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-black uppercase tracking-widest">{t(`home.automation.features.${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <motion.div 
              initial={false}
              whileInView={{ rotate: 0 }}
              className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl border-[16px] border-white/5"
            >
              <Image
                src="/seasonal-showcase.png"
                width={1024}
                height={1024}
                sizes="(min-width: 1280px) 600px, (min-width: 1024px) 45vw, 100vw"
                alt=""
                className="w-full h-auto"
              />
            </motion.div>
            {/* Floaties */}
            <motion.div 
              initial={false}
              whileInView={reducedMotion ? undefined : { y: [6, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="absolute -right-10 rtl:-left-10 rtl:-right-auto top-20 p-6 bg-white rounded-3xl shadow-2xl z-20"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto rounded-3xl md:rounded-[4rem] bg-zinc-900 px-5 py-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 blur-[100px]" />
           <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-white">
                {t('home.cta.title_1')} <br /> {t('home.cta.title_2')}
              </h2>
              <p className="max-w-xl mx-auto text-zinc-300 text-lg font-medium">
                {t('home.cta.subtitle')}
              </p>
              <div className="flex justify-center gap-4">
                 <Link href={primaryCtaHref} className="dt-action dt-action-primary">
                     {effectiveUser ? t('nav.dashboard') : t('home.cta.btn')}
                     <ArrowRight aria-hidden="true" className="size-5 rtl:rotate-180" />
                 </Link>
              </div>
              <div className="flex items-center justify-center gap-8 pt-8">
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 rtl:ml-2" /> {t('home.cta.trial')}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4 rtl:ml-2" /> {t('home.cta.no_card')}
                  </div>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
