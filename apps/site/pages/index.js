import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen px-6">
      <Head>
        <title>Ethereum Tag Service</title>
        <meta name="description" content="An experimental EVM based content tagging service" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className="max-w-sm py-6 my-auto space-y-6 text-slate-600">
        <div className="flex items-center justify-center">
          <svg
            className="w-8 h-8 text-slate-800"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
          >
            <path
              fill="currentColor"
              d="M0 50 50 0H0v50zm100 50V50l-50 50h50zM50 0l50 50V0H50zM19.9 84.9c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.3 5 5z"
            />
          </svg>
          <span className="inline-flex ml-2.5 text-xl font-medium text-slate-900">
            Ethereum Tag Service
          </span>
        </div>
        <h1 className="sr-only">Ethereum Tag Service</h1>

        <p>Ethereum Tag Service (ETS) is an experimental EVM based content tagging service, aimed at Web3 developers, running in alpha/testnet phase on the Polygon Blockchain.</p>
        <p>In ETS, tags, content tagging & tagging data are fully composable units & services. This treatment preserves data integrity, provenance & attribution across the projects and users that consume the service.</p>

        <div className="flex justify-center space-x-6">
          <a href="https://app.ets.xyz" className="text-slate-500 hover:text-slate-600" target="_blank">
            <span className="sr-only"></span>
            <svg className="w-9 h-9 -mt-1 -mr-1" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.75 6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75Z" />
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.75 15.25V9.75" />
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.25 15.25V9.75" />
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15.25V12.75" />
            </svg>
          </a>
          <a href="https://github.com/ethereum-tag-service/ets#readme" className="text-slate-500 hover:text-slate-600" target="_blank">
            <span className="sr-only"></span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          <a href="https://twitter.com/etsxyz" className="text-slate-500 hover:text-slate-600" target="_blank">
            <span className="sr-only"></span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </a>

          <a href="https://etsxyz.substack.com/" className="text-slate-500 hover:text-slate-600" target="_blank">
            <span className="sr-only"></span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
            </svg>
          </a>

        </div>
      </main>
    </div>
  )
}
