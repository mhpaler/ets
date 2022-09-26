module.exports = {
  plugins: [require("prettier-plugin-solidity")],
  overrides: [
    {
      files: "*.sol",
      options: {
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        singleQuote: false,
        semi: false,
        bracketSpacing: true,
        explicitTypes: "always",
      },
    },
    {
      files: ["*.js", "*.ts"],
      options: {
        trailingComma: "all",
        tabWidth: 2,
        semi: true,
        singleQuote: false,
        printWidth: 120,
        quoteProps: "preserve",
      },
    },
    {
      files: "*.md",
      options: {
        tabWidth: 4,
      },
    },
  ],
};
