"use client";

import { useTranslation } from "@/store/useTranslation";
import { Mail } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { SupportEmail } from "@/components/marketing/SupportEmail";

export default function ContactPage() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <Navbar />
            <main className="mx-auto max-w-3xl px-5 pt-32 pb-24 md:pt-40">
                <h1 className="text-5xl font-black italic tracking-tight">{t("support.title")}</h1>
                <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-7 md:p-10">
                    <Mail aria-hidden="true" className="mb-4 h-7 w-7 text-indigo-700" />
                    <h2 className="text-xl font-bold">{t("support.emailTeam")}</h2>
                    <p className="my-3 max-w-prose text-zinc-700">
                        {t("support.contactBody")}
                    </p>
                    <SupportEmail subject={t("support.enquirySubject")} />
                </div>
            </main>
            <Footer />
        </div>
    );
}
