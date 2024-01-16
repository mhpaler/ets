import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body className="min-h-screen bg-gradient-to-b from-base-200 to-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

{/*
export default class MyDocument extends Document {
  render() {
    const pageProps = this.props?.__NEXT_DATA__?.props?.pageProps;
    return (
      <Html>
        <Head />
        <body className="drawer min-h-screen bg-base-200 lg:drawer-open">
          <DrawerToggle />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
*/}
