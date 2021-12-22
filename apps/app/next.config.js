const withTM = require("next-transpile-modules")(["@ets/ui"]);

module.exports = withTM({
  reactStrictMode: true,
});
