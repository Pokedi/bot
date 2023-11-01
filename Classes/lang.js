import { I18n } from "i18n";
import path from "path";

const __dirname = path.resolve(path.join(' '));

const config = {
    locales: ["en", "pt-BR"],
    defaultLocale: 'en',
    directory: path.join(__dirname, '../Modules/Locales/')
}

const i18n = new I18n(config);

function createLocale() {
    return new I18n(config);
}

export { i18n, createLocale };


