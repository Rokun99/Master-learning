import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import { getDB } from '../storage';
import { de } from '../locales/de';
import { en } from '../locales/en';

const locales = { de, en };
export type Language = keyof typeof locales;

interface TranslationContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextType>({
    lang: 'de',
    setLang: () => {},
    t: (key) => key,
});

export const useTranslation = () => useContext(TranslationContext);

const getNestedValue = (obj: any, key: string): string | undefined => {
    // This is a simplified getter that assumes a flat structure based on your JSON.
    // For deeply nested keys like 'course.1.title', you'd need a more complex recursive function.
    // However, your current locales seem to be flat with dot-notation keys.
    return obj?.[key];
};

export const TranslationProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Language>('de');

    const setLang = async (newLang: Language) => {
        if (locales[newLang]) {
            setLangState(newLang);
            const db = await getDB();
            await db.put('settings', newLang, 'language');
        }
    };

    const t = (key: string, replacements?: Record<string, string | number>) => {
        let translation = getNestedValue(locales[lang], key) || getNestedValue(locales['de'], key) || key;
        
        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                const regex = new RegExp(`{{${rKey}}}`, 'g');
                translation = translation.replace(regex, String(replacements[rKey]));
            });
        }
        return translation;
    };

    return React.createElement(TranslationContext.Provider, { value: { lang, setLang, t } }, children);
};