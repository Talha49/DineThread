"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/store/useTranslation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/components/providers/AuthProvider';

const loginLink = "inline-flex items-center justify-center border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 focus-visible:bg-zinc-100 font-bold transition-colors";

export function Navbar({ user }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleRef = useRef(null);
    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const effectiveUser = user || authUser;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('nav.features'), href: '/#features' },
        { name: t('nav.themes'), href: '/#themes' },
        { name: t('nav.pricing'), href: '/#pricing' },
        { name: t('nav.contact'), href: '/contact' },
    ];

    return (
        <nav onKeyDown={(event) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
                toggleRef.current?.focus();
            }
        }} onBlur={(event) => {
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setIsMobileMenuOpen(false);
        }} className={cn(
            "dt-nav fixed top-0 inset-x-0 z-50 border-b px-4 py-3 text-zinc-900 transition-colors md:px-8",
            isScrolled || isMobileMenuOpen ? "border-zinc-200 bg-white/95 shadow-sm backdrop-blur-md" : "border-transparent bg-white/95"
        )}>
            <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr] gap-4">
                {/* Logo */}
                <Link href="/" className="flex w-fit items-center gap-2 group">
                    <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl motion-safe:group-hover:rotate-6 motion-safe:transition-transform">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter uppercase text-zinc-900">DineThread</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href}
                            className="dt-nav-link text-sm font-bold text-zinc-700 hover:text-zinc-900 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="hidden lg:flex justify-self-end items-center gap-3">
                    <LanguageSwitcher />
                    {effectiveUser ? (
                        <Link href="/dashboard" className="dt-nav-action">{t('nav.dashboard')}</Link>
                    ) : (
                        <>
                            <Link href="/login" className={cn(loginLink, "h-11 rounded-full px-5 text-sm")}>
                                {t('nav.login')}
                            </Link>
                            <Link href="/signup" className="dt-nav-action">{t('nav.signup')}</Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button 
                    ref={toggleRef}
                    className="lg:hidden justify-self-end grid size-11 place-items-center rounded-xl text-zinc-900 hover:bg-zinc-100"
                    aria-label={t(isMobileMenuOpen ? 'accessibility.closeNavigation' : 'accessibility.openNavigation')}
                    aria-controls={isMobileMenuOpen ? 'mobile-navigation' : undefined}
                    aria-expanded={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div id="mobile-navigation" className="absolute top-full inset-x-4 mt-2 max-h-[calc(100dvh-5rem)] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-zinc-200 p-5 flex flex-col gap-1 lg:hidden dt-drawer">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-lg px-3 py-3 text-base font-bold text-zinc-900 hover:bg-zinc-100"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 pt-4">
                        <LanguageSwitcher className="mx-auto mb-2" />
                        {effectiveUser ? (
                            <Link href="/dashboard" className="dt-nav-action w-full">{t('nav.dashboard')}</Link>
                        ) : (
                            <>
                                <Link href="/login" className={cn(loginLink, "w-full h-14 rounded-2xl text-sm")}>
                                    {t('nav.login')}
                                </Link>
                                <Link href="/signup" className="dt-nav-action w-full">{t('nav.signup')}</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
