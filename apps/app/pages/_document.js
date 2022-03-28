import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    const pageProps = this.props?.__NEXT_DATA__?.props?.pageProps;
    return (
      <Html>
        <Head />
        <body className={
          pageProps.isDark ? 'dark-mode' : 'light-mode',
          'selection:bg-sky-200 selection:text-sky-700 font-inter'
        }>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
