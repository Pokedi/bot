import i18n from "i18n";

i18n.configure({
    locales: ['en', 'fr', 'es-ES', 'pt-BR', 'de'],
    directory: process.cwd() + '/Modules/Locales',
    defaultLocale: 'en',
    // register: global,
    objectNotation: true
});

export default i18n;