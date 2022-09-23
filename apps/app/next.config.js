const nextTranslate = require('next-translate');
const withTM = require("next-transpile-modules")(["@ethereum-tag-service/ui"]);

/**
 * @type {import('next').NextConfig}
 **/
 const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextTranslate(withTM(nextConfig));
