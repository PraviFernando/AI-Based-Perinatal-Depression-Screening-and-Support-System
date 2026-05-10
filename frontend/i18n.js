import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './locals/en/translation_en.json';
import translationSI from './locals/si/translation_si.json';

const resources = {
    en: { translation: translationEN },
    si: { translation: translationSI },
    
};

i18n
    .use(LanguageDetector)        // Auto-detect browser language
    .use(initReactI18next)        // Pass i18n instance to react-i18next
    .init({
        resources,
        lng: 'si',                // Force Sinhala
        fallbackLng: 'si',        // Default language if detection fails
        supportedLngs: ['si'],    // Restrict to Sinhala only

        interpolation: {
            escapeValue: false,   // React already escapes by default
        },

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],   // Remember user's language choice
        },
    });

export default i18n;