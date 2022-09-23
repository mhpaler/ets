import Document, { Html, Head, Main, NextScript } from 'next/document';
import { classNames } from '../utils/classNames';

export default class MyDocument extends Document {
  render() {
    const pageProps = this.props?.__NEXT_DATA__?.props?.pageProps;
    return (
      <Html>
        <Head />
        <body className={classNames(
          'selection:bg-sky-200 selection:text-sky-700 font-inter',
          pageProps.isDark ? 'dark-mode' : 'light-mode',
        )}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
