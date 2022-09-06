module.exports = {
  overrides: [
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
  ],
};
