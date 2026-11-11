"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/Button";
import { Menu, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/store/useTranslation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/components/providers/AuthProvider';

export function Navbar({ user }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const effectiveUser = user || authUser;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('nav.features'), href: '#features' },
        { name: t('nav.themes'), href: '#themes' },
        { name: t('nav.pricing'), href: '#pricing' },
        { name: t('nav.contact'), href: '/contact' },
    ];

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4",
            isScrolled ? "bg-white/80 backdrop-blur-xl shadow-sm" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter uppercase text-zinc-900">Davoriq</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href}
                            className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <LanguageSwitcher />
                    {effectiveUser ? (
                        <Link href="/dashboard">
                            <Button className="rounded-full px-8 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                {t('nav.dashboard')}
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest">{t('nav.login')}</Button>
                            </Link>
                            <Link href="/signup">
                                <Button className="rounded-full px-8 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                    {t('nav.signup')}
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button 
                    className="md:hidden p-2 text-zinc-900"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-[2rem] shadow-2xl border border-zinc-100 p-8 flex flex-col gap-6 md:hidden animate-in fade-in slide-in-from-top-4">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-lg font-black uppercase tracking-widest text-zinc-900 border-b border-zinc-50 pb-4"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 pt-4">
                        <LanguageSwitcher className="mx-auto mb-2" />
                        {effectiveUser ? (
                            <Link href="/dashboard" className="w-full">
                                <Button className="w-full rounded-2xl h-14 font-black uppercase shadow-xl shadow-primary/20">{t('nav.dashboard')}</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="w-full">
                                    <Button variant="outline" className="w-full rounded-2xl h-14 font-black uppercase">{t('nav.login')}</Button>
                                </Link>
                                <Link href="/signup" className="w-full">
                                    <Button className="w-full rounded-2xl h-14 font-black uppercase shadow-xl shadow-primary/20">{t('nav.signup')}</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
