"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play, CheckCircle2, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
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

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background Decorative Blurs */}
        <div className="absolute rtl:left-0 rtl:right-auto rtl:-translate-x-1/2 top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute rtl:right-0 rtl:left-auto rtl:translate-x-1/2 bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-100 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('home.hero.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase text-zinc-900 leading-[0.9] mb-8"
          >
            {t('home.hero.title_1')} <br />
            <span className="text-zinc-300">{t('home.hero.title_2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 font-medium leading-relaxed mb-12"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href={primaryCtaHref}>
              <Button size="lg" className="h-16 px-10 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 group">
                {t('home.hero.cta_primary')} <ArrowRight className="ml-3 rtl:mr-3 rtl:ml-0 rtl:rotate-180 w-5 h-5 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform" />
              </Button>
            </Link>
            <button className="h-16 px-10 rounded-2xl bg-zinc-50 border-2 border-zinc-100 text-[12px] font-black uppercase tracking-[0.2em] text-zinc-900 flex items-center gap-3 hover:bg-zinc-100 transition-all">
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                <Play className="w-3 h-3 text-white ml-0.5 rtl:mr-0.5 rtl:ml-0 rtl:rotate-180" />
              </div>
              {t('home.hero.cta_secondary')}
            </button>
          </motion.div>

          {/* Video / Dashboard Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-20 relative max-w-6xl mx-auto rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-[12px] border-zinc-50 bg-zinc-900 group"
          >
            <div className="aspect-video relative overflow-hidden">
               <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-contain"
               >
                 <source src="/inro.mp4" type="video/mp4" />
               </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="block text-[11px] font-black uppercase tracking-[0.4em] text-primary" role="doc-subtitle">{t('home.workflow.tag')}</span>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
              {t('home.workflow.title_1')} <br />
              <span className="text-zinc-400">{t('home.workflow.title_2')}</span>
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
              <div key={i} className="bg-white p-8 rounded-[3rem] border-2 border-zinc-100 relative group hover:border-primary/20 transition-all">
                <div className="text-4xl mb-6">{item.icon}</div>
                <div className="absolute top-8 right-8 rtl:left-8 rtl:right-auto text-[10px] font-black uppercase tracking-widest text-primary/30">{item.step}</div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-3 text-zinc-900">{item.title}</h4>
                <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-10 rounded-[3rem] bg-zinc-900 text-white relative overflow-hidden">
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <h4 className="text-2xl font-black italic tracking-tighter uppercase">{t('home.workflow.why_optimize')}</h4>
                   <p className="text-sm text-white/60 font-medium leading-relaxed">
                     {t('home.workflow.why_desc')}
                   </p>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('home.workflow.benefits.0')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('home.workflow.benefits.1')}</span>
                      </div>
                   </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                   <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('home.workflow.table.feature')}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('home.workflow.table.status')}</span>
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

      {/* Social Proof */}
      <section className="py-20 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="text-xl font-black italic tracking-tighter uppercase">Marriott</div>
          <div className="text-xl font-black italic tracking-tighter uppercase">Hilton</div>
          <div className="text-xl font-black italic tracking-tighter uppercase">Four Seasons</div>
          <div className="text-xl font-black italic tracking-tighter uppercase">Ritz-Carlton</div>
          <div className="text-xl font-black italic tracking-tighter uppercase">Nobu</div>
        </div>
      </section>

      <Features />

      {/* Visual DNA Showcase */}
      <section className="py-24 px-4 bg-zinc-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[150px] translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8">
            <span className="block text-[11px] font-black uppercase tracking-[0.4em] text-primary" role="doc-subtitle">{t('home.automation.tag')}</span>
            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-[0.9]">
              {t('home.automation.title_1')} <br />
              <span className="text-white/20">{t('home.automation.title_2')}</span>
            </h2>
            <p className="text-lg text-white/50 font-medium leading-relaxed">
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
              initial={{ rotate: -5 }}
              whileInView={{ rotate: 0 }}
              className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl border-[16px] border-white/5"
            >
              <img 
                src="/seasonal-showcase.png" 
                alt="Davoriq Digital QR Menu Software Interface Showcase" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Floaties */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-10 rtl:-left-10 rtl:-right-auto top-20 p-6 bg-white rounded-3xl shadow-2xl z-20"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* Trust Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-primary fill-primary" />)}
          </div>
          <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-zinc-900">
            {t('home.testimonial.quote')}
          </h3>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 overflow-hidden" />
            <div className="text-left rtl:text-right">
                <p className="font-black uppercase tracking-widest text-sm">{t('home.testimonial.author')}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('home.testimonial.role')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto rounded-[4rem] bg-zinc-900 p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 blur-[100px]" />
           <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-white">
                {t('home.cta.title_1')} <br /> {t('home.cta.title_2')}
              </h2>
              <p className="max-w-xl mx-auto text-white/50 text-lg font-medium">
                {t('home.cta.subtitle')}
              </p>
              <div className="flex justify-center gap-4">
                 <Link href={primaryCtaHref}>
                   <Button size="lg" className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
                     {t('home.cta.btn')}
                   </Button>
                 </Link>
              </div>
              <div className="flex items-center justify-center gap-8 pt-8">
                  <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 rtl:ml-2" /> {t('home.cta.trial')}
                  </div>
                  <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
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
