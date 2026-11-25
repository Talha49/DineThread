"use client";

import Link from 'next/link';
import { Sparkles, Twitter, Instagram, Github, Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from '@/store/useTranslation';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-zinc-900 text-white pt-24 pb-12 px-4 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute rtl:right-0 rtl:-left-auto -left-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-zinc-900 shadow-xl">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-black italic tracking-tighter uppercase text-white">Davoriq</span>
                        </Link>
                        <p className="text-sm text-white/50 font-medium leading-relaxed max-w-xs">
                            {t('footer.description')}
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                <Twitter className="w-4 h-4 text-white/50 hover:text-white" />
                            </Link>
                            <Link href="#" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                <Instagram className="w-4 h-4 text-white/50 hover:text-white" />
                            </Link>
                            <Link href="#" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                <Github className="w-4 h-4 text-white/50 hover:text-white" />
                            </Link>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">{t('footer.platform')}</h5>
                        <ul className="space-y-4">
                            {['visual_dna', 'seasonal_engine', 'ai_intelligence', 'pricing', 'api_docs'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-primary transition-colors">
                                        {t(`footer.links.${item}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">{t('footer.company')}</h5>
                        <ul className="space-y-4">
                            {['about_us', 'case_studies', 'partners', 'contact', 'terms'].map((item) => (
                                <li key={item}>
                                    <Link 
                                        href={item === 'contact' ? '/contact' : '#'} 
                                        className="text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-primary transition-colors"
                                    >
                                        {t(`footer.links.${item}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">{t('footer.contact')}</h5>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-white/60">
                                <Mail className="w-4 h-4" />
                                <span className="text-[11px] font-bold">hello@smartmenu.ai</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/60">
                                <MapPin className="w-4 h-4" />
                                <span className="text-[11px] font-bold">London, United Kingdom</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/60">
                                <Phone className="w-4 h-4" />
                                <span className="text-[11px] font-bold">+44 (0) 20 7946 0958</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                        {t('footer.rights')}
                    </p>
                    <div className="flex gap-8">
                        <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white">{t('footer.privacy')}</Link>
                        <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white">{t('footer.security')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
