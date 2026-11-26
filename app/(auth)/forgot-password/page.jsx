"use client";

import { useTranslation } from "@/store/useTranslation";
import Link from "next/link";
import { SupportEmail } from "@/components/marketing/SupportEmail";

export default function AccountHelpPage() {
    const { t } = useTranslation();
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-900">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8">
                <h1 className="text-2xl font-bold">{t("support.accountTitle")}</h1>
                <p className="my-4 text-zinc-700">
                    {t("support.accountBody")}
                </p>
                <SupportEmail subject={t("support.accountSubject")} />
                <Link href="/login" className="mt-8 block w-fit text-sm font-semibold underline underline-offset-4">
                    {t("support.back")}
                </Link>
            </div>
        </main>
    );
}
