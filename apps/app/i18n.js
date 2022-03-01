const formatters = {
const buildFormatter = require('react-timeago/lib/formatters/buildFormatter').default;
const timeagoEn = require('react-timeago/lib/language-strings/en').default;
const timeagoEs = require('react-timeago/lib/language-strings/es').default;

  en: new Intl.NumberFormat("en-EN"),
  es: new Intl.NumberFormat("es-ES"),
};

module.exports = {
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
      if (format === 'number') return formatters[lang].format(value);
      return value;
    }
  }
}
