import '../styles/globals.css';
import 'nextra-theme-docs/style.css';

// Trigger a build
export default function Nextra({ Component, pageProps }) {
  return <Component {...pageProps} />
}
