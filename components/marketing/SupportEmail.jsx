import { useTranslation } from "@/store/useTranslation";

export function SupportEmail({ subject }) {
    const { t } = useTranslation();
    const address = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
    if (!address) {
        return <p className="text-sm text-zinc-600">{t("support.unavailable")}</p>;
    }

    return (
        <a href={`mailto:${address}?subject=${encodeURIComponent(subject)}`}
            className="inline-block max-w-full break-all rounded text-base font-semibold text-indigo-700 underline underline-offset-4 focus-visible:outline-2">
            {address}
        </a>
    );
}
