import Head from 'next/head';

export default function Home() {

  return (
    <div className="antialiased text-slate-700">
      <Head>
        <title>Hashtag Protocol</title>
        <meta name="description" content="Hashtag Protocol is now Ethereum Tag Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex items-center justify-center h-screen text-center">
        <div className="px-8">

          <div className="flex items-center mb-8">
            <div className="">
              <svg className="w-16 h-16 text-slate-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 204">
                <g fill="none">
                  <path fill="currentColor" d="M59.2 0 95.2 0 91.46 36 55.46 36M143.2 0 179.2 0 175.46 36 139.46 36M54.84 42 90.84 42 87.1 78 51.1 78M12.84 42 48.84 42 45.1 78 9.1 78M138.84 42 174.84 42 171.1 78 135.1 78M180.84 42 216.84 42 213.1 78 177.1 78M4.11 126 40.11 126 36.37 162 .37 162M172.11 126 208.11 126 204.37 162 168.37 162"/>
                  <path fill="currentColor" d="M50.47 84 86.47 84 82.73 120 46.73 120M134.47 84 170.47 84 166.73 120 130.73 120"/>
                  <path fill="currentColor" d="M46.11 126 82.11 126 78.37 162 42.37 162"/>
                  <path fill="currentColor" d="M96.84 42 132.84 42 129.1 78 93.1 78M88.11 126 124.11 126 120.37 162 84.37 162"/>
                  <path fill="currentColor" d="M130.11 126 166.11 126 162.37 162 126.37 162M41.74 168 77.74 168 74 204 38 204M125.74 168 161.74 168 158 204 122 204"/>
                </g>
              </svg>
            </div>

            <div>
              <svg className="w-12 h-12 mx-4 text-slate-300" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" d="M13.75 6.75L19.25 12L13.75 17.25"></path>
                <path stroke="currentColor" strokeWidth="2" d="M19 12H4.75"></path>
              </svg>
            </div>

            <div>
              <svg className="w-16 h-16 text-slate-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <path fill="currentColor" d="M0 50 50 0H0v50zm100 50V50l-50 50h50zM50 0l50 50V0H50zM19.9 84.9c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.3 5 5z"/>
              </svg>
            </div>
          </div>

          <div className="text-lg">
            Hashtag Protocol is now<br />
            Ethereum Tag Service
          </div>
        </div>
      </main>
    </div>
  )
}
