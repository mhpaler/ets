const buildFormatter = require('react-timeago/lib/formatters/buildFormatter').default;
const timeagoEn = require('react-timeago/lib/language-strings/en').default;
const timeagoEs = require('react-timeago/lib/language-strings/es').default;

const numberFormatters = {
  en: new Intl.NumberFormat("en-EN"),
  es: new Intl.NumberFormat("es-ES"),
};

module.exports = {
  numberFormatters: numberFormatters,
  timeagoFormatters: {
    'en': buildFormatter(timeagoEn),
    'es': buildFormatter(timeagoEs),
  },
  locales: ['en', 'es'],
  defaultLocale: 'en',
  pages: {
    '*': ['common'],
    '/404': ['error'],
  },
  interpolation: {
    format: (value, format, lang) => {
      if (format === 'number') return numberFormatters[lang].format(value);
      return value;
    }
  }
}
