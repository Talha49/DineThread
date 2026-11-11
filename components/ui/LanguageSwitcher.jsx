"use client";

import { useState, useRef, useEffect } from 'react';
import { useTranslation, LANGUAGES } from '@/store/useTranslation';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className, position = "bottom" }) {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage } = useTranslation();
    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent hydration mismatch by returning null until mounted
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
                aria-label="Switch language"
            >
                <Globe className="w-4 h-4 text-zinc-500" />
                <span className="hidden sm:inline-block uppercase tracking-wider text-[10px] font-black">
                    {currentLang.code}
                </span>
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute right-0 rtl:left-0 rtl:right-auto w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in",
                    position === "top" ? "bottom-full mb-2 slide-in-from-bottom-2" : "top-full mt-2 slide-in-from-top-2"
                )}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span>{lang.flag}</span>
                                <span className={cn(
                                    "text-sm font-medium", 
                                    language === lang.code ? "text-primary" : "text-zinc-600 dark:text-zinc-300"
                                )}>
                                    {lang.name}
                                </span>
                            </div>
                            {language === lang.code && <Check className="w-4 h-4 text-primary" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
