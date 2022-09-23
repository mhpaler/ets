const withTM = require("next-transpile-modules")([
  "@ethereum-tag-service/ui"
]);
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
  unstable_staticImage: true
});

/**
 * @type {import('next').NextConfig}
 **/
 const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/explorer',
        destination: 'https://stage.app.ets.xyz/',
        permanent: false,
        basePath: false
      },
    ]
  },
};

module.exports = withNextra(withTM(nextConfig));
