import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../layouts/default';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
  );
}
