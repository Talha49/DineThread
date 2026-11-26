"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTranslation } from "@/store/useTranslation";

export function Footer() {
    const { t } = useTranslation();
    const links = [
        ["/#features", t("nav.features")],
        ["/#themes", t("nav.themes")],
        ["/#pricing", t("nav.pricing")],
        ["/contact", t("nav.contact")],
    ];

    return (
        <footer className="bg-zinc-900 px-4 py-12 text-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8">
                <Link href="/" className="flex items-center gap-2 text-xl font-black italic tracking-tight">
                    <Sparkles aria-hidden="true" className="h-5 w-5" /> DineThread
                </Link>
                <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
                    {links.map(([href, label]) => (
                        <Link key={href} href={href} className="text-sm font-semibold text-zinc-200 hover:underline">
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
