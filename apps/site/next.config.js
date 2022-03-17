const withTM = require("next-transpile-modules")([
  "@ets/ui"
]);
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
});

/**
 * @type {import('next').NextConfig}
 **/
 const nextConfig = {
  reactStrictMode: true,
};

module.exports = withNextra(withTM(nextConfig));
