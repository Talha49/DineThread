"use client";

import { useEffect } from "react";
import { LANGUAGES, useTranslationStore } from "@/store/useTranslation";

export function LanguageSync() {
    const language = useTranslationStore(state => state.language);

    useEffect(() => {
        useTranslationStore.persist?.rehydrate();
    }, []);

    useEffect(() => {
        const selected = LANGUAGES.find(option => option.code === language) || LANGUAGES[0];
        document.documentElement.lang = selected.code;
        document.documentElement.dir = selected.dir;
    }, [language]);

    return null;
}
