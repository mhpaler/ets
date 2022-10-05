import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="selection:bg-sky-200 selection:text-sky-700 font-inter w-96 flex items-center justify-center h-screen mx-auto">
      <Head>
        <title>Ethereum Tag Service</title>
        <meta name="description" content="An experimental EVM based content tagging service" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className="mx-auto py-6">
        <div>
          <Link href="/">
            <a>
              {/* <svg fill="currentColor" className="h-8 text-slate-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 294 100">
                  <path d="M129.1 16.2h45.7v10.3h-34v17.3h33.3v10.3h-33.3v18.5h34v10.3h-45.7V16.2zm73.6 10.3h-20.2V16.2h52.1v10.3h-20.2v56.4h-11.7V26.5zm43.5 38c4.6 4.9 11.8 9.2 21.1 9.2 9.6 0 13.4-4.7 13.4-9.1 0-6-7.1-7.8-15.2-9.9-10.9-2.7-23.7-5.9-23.7-20 0-11 9.7-19.5 24.3-19.5 10.4 0 18.8 3.3 25 9.3l-6.7 8.7c-5.2-5.2-12.3-7.6-19.3-7.6-6.9 0-11.3 3.3-11.3 8.3 0 5.2 6.8 6.9 14.7 8.9 11 2.8 24.1 6.2 24.1 20.7 0 11.1-7.8 20.6-25.8 20.6-12.3 0-21.2-4.3-27.1-10.6l6.5-9zM0 49.7l50-50H0v50zm100 50v-50l-50 50h50zM50-.3l50 50v-50H50z" />
                  <circle cx="14.9" cy="84.7" r="5" />
                </svg> */}
              <div className="relative flex items-center">
                <svg
                  className="h-8 text-slate-800"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                >
                  <path
                    fill="currentColor"
                    d="M0 50 50 0H0v50zm100 50V50l-50 50h50zM50 0l50 50V0H50zM19.9 84.9c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.3 5 5z"
                  />
                </svg>
                <span className=" xl:inline-flex ml-2.5 text-xl font-medium text-slate-900">
                  Ethereum Tag Service
                </span>
              </div>
              <h1 className="sr-only">Ethereum Tag Service</h1>
            </a>
          </Link>
        </div>

        <div className="text-slate-600">
          <p className="mt-6 mb-6">Ethereum Tag Service (ETS) is an experimental EVM based content tagging service, aimed at Web3 developers, running in alpha/testnet phase on the Polygon Blockchain.</p>
          <p className="mt-6 mb-6">In ETS, tags, content tagging & tagging data are fully composable units & services. This treatment preserves data integrity, provenance & attribution across the projects and users that consume the service.</p>
          <p className="mt-6 mb-6">The mission for ETS is connecting people, places and things across Web3.</p>
          <div className="md:justify-between pt-4">
            <div className="flex justify-center space-x-6 md:order-2">
              <a href="https://github.com/ethereum-tag-service/ets#readme" className="text-slate-600 hover:text-slate-500" target="_blank">
                <span className="sr-only"></span>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a href="https://discord.com/invite/EyTJFRm" className="text-slate-600 hover:text-slate-500" target="_blank">
                <span className="sr-only"></span>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
              <a href="https://twitter.com/etsxyz" className="text-slate-600 hover:text-slate-500" target="_blank">
                <span className="sr-only"></span>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>

              <a href="https://hashtagprotocol.substack.com/" className="text-slate-600 hover:text-slate-500" target="_blank">
                <span className="sr-only"></span>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                </svg>
              </a>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
