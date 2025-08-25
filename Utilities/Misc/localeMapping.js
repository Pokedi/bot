const SUPPORTED_LOCALES = ['en', 'fr', 'es-ES', 'pt-BR', 'de'];
const DEFAULT_LOCALE = 'en';

export default function localeMapping(locale) {
    if (!locale) return DEFAULT_LOCALE;

    // Exact match first
    if (SUPPORTED_LOCALES.includes(locale)) {
        return locale;
    }

    // Fallback by language code (e.g. en-US -> en)
    const base = locale.split('-')[0];
    if (SUPPORTED_LOCALES.includes(base)) {
        return base;
    }

    // Default if nothing matches
    return DEFAULT_LOCALE;
}