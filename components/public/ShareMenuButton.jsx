"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { useTranslation } from "@/store/useTranslation";
import { cn } from "@/lib/utils";

export function ShareMenuButton({ menuPath, title, className }) {
    const { t } = useTranslation();
    const [feedback, setFeedback] = useState("");
    const [manualUrl, setManualUrl] = useState("");
    async function share() {
        const url = new URL(menuPath, window.location.origin).href;
        setFeedback("");
        setManualUrl("");
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                return;
            } catch (error) {
                if (error.name === "AbortError") return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            setFeedback(t("live_menu.link_copied"));
        } catch {
            setManualUrl(url);
        }
    }

    return (
        <div>
            <button type="button" onClick={share} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2", className)}>
                <Share2 aria-hidden="true" className="size-4" /> {t("live_menu.share_menu")}
            </button>
            <span role="status" className="block text-sm text-foreground">{feedback}</span>
            {manualUrl && <label className="mt-2 block text-sm text-foreground">{t("live_menu.copy_link")}
                <input readOnly value={manualUrl} onFocus={event => event.target.select()} className="mt-1 block w-full rounded border bg-background p-2 text-foreground" />
            </label>}
        </div>
    );
}
