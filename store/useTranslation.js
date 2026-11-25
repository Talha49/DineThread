import { useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from '@/locales/en.json';
import no from '@/locales/no.json';
import sv from '@/locales/sv.json';
import da from '@/locales/da.json';
import tr from '@/locales/tr.json';
import ar from '@/locales/ar.json';

const dictionaries = { en, no, sv, da, tr, ar };

export const LANGUAGES = [
    { code: 'en', name: 'English', dir: 'ltr', flag: '🇬🇧' },
    { code: 'no', name: 'Norsk', dir: 'ltr', flag: '🇳🇴' },
    { code: 'sv', name: 'Svenska', dir: 'ltr', flag: '🇸🇪' },
    { code: 'da', name: 'Dansk', dir: 'ltr', flag: '🇩🇰' },
    { code: 'tr', name: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
    { code: 'ar', name: 'العربية', dir: 'rtl', flag: '🇸🇦' }
];

export const useTranslationStore = create(
    persist(
        (set, get) => ({
            language: 'en',
            
            setLanguage: (language) => set({ language }),
            
            // Core translation function t('nav.features')
            t: (key, language = get().language) => {
                const dict = dictionaries[language] || dictionaries['en'];
                const keys = key.split('.');
                
                // Attempt to find translation in selected language
                let val = dict;
                for (const k of keys) {
                    if (val && typeof val === 'object' && k in val) {
                        val = val[k];
                    } else {
                        val = undefined;
                        break;
                    }
                }

                if (val !== undefined) return val;

                // Fallback to English if key missing
                let fallbackVal = dictionaries['en'];
                for (const fbK of keys) {
                    if (fallbackVal && typeof fallbackVal === 'object' && fbK in fallbackVal) {
                        fallbackVal = fallbackVal[fbK];
                    } else {
                        return key; // Absolute fallback is returning the key itself
                    }
                }
                return fallbackVal || key;
            }
        }),
        {
            name: 'smartmenu-language',
            skipHydration: true,
        }
    )
);

// Custom hook to ensure React components re-render when language changes
export function useTranslation() {
    const language = useTranslationStore(state => state.language);
    const setLanguage = useTranslationStore(state => state.setLanguage);
    const translate = useTranslationStore(state => state.t);
    // A section still hydrating must translate with its own React snapshot.
    const t = useCallback(key => translate(key, language), [translate, language]);
    return { language, setLanguage, t };
}
