import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" data-theme="ets">
        <Head />
        <body>
          <Main />
          <NextScript />
          <div id="portal-root" />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
