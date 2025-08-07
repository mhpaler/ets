const nextTranslate = require("next-translate-plugin");
const withTM = require("next-transpile-modules")([
  "@rainbow-me/rainbowkit",
  "@vanilla-extract/dynamic",
  "@vanilla-extract/sprinkles",
]);

const withWebpack = (nextConfig = {}) => {
  return {
    ...nextConfig,
    webpack: (config, { dev }) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      });
      config.resolve.fallback = { fs: false, net: false, tls: false };
      config.externals.push("pino-pretty", "lokijs", "encoding");

      // Strip console statements in production builds
      if (!dev) {
        // Apply custom Terser options to remove console statements
        if (config.optimization?.minimizer) {
          const TerserPlugin = require("terser-webpack-plugin");

          // Replace all existing minimizers with our custom configuration
          config.optimization.minimizer = config.optimization.minimizer.map((plugin) => {
            if (plugin.constructor.name === "TerserPlugin") {
              return new TerserPlugin({
                terserOptions: {
                  compress: {
                    drop_console: true,
                    drop_debugger: true,
                  },
                },
              });
            }
            return plugin;
          });
        }
      }

      return config;
    },
  };
};

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: "loose",
  },
  // Enable SWC minification with console dropping in production
  swcMinify: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"], // Keep console.error in production for debugging
          }
        : false,
  },
};

module.exports = nextTranslate(withWebpack(withTM(nextConfig)));
