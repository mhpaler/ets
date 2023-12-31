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

      <main className="max-w-sm py-6 my-auto space-y-6">
        <div className="flex items-center justify-center mt-10 mb-14">
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

        <p className="font-medium">ETS is a permissionless protocol for writing immutable tagging records to an EVM blockchain.</p>


        <p>In simpler terms, an ETS tagging record is a record of "who tagged what, with what, where, when & why."</p>

        <p>Technically, a tagging record is similar to a DNS record, but unlike DNS, ETS allows a name or "tag" to be used across multiple records. This is possible in part because tags are Non-Fungible Tokens (NFTs), which means that each tag has a unique identification number.</p>

        <p>When a user writes a new tagging record that includes existing tags, the system will reference their unique token IDs. If a new tag is used, the system will create a new token for that tag.</p>

        <p>There are no restrictions on the use of tokenized tags, and any client can use any tag at any time. Tokenization is used to track origin attribution and rewards given to participants.</p>

        <p>This approach to tagging is unique to ETS and allows for new treatments of tags, including origin attribution, tag ownership, platform-agnostic tag reuse, and tagging cash flows such as sponsorships and rewards.</p>

        <p>All tagging records create a public tag graph that can be queried by any client in any dimension defined by the core ETS tagging record schema.</p>

        <div className="flex justify-center space-x-4 pt-5 pb-20">
          <a href="https://app.ets.xyz" target="_blank">
            <button className="bg-transparent text-sm hover:bg-pink-500 text-pink-700 hover:text-white py-2 px-4 border border-pink-500 hover:border-transparent rounded">
              Explorer
            </button>
          </a>
          <a href="https://github.com/ethereum-tag-service/ets#readme" target="_blank">
            <button className="bg-transparent text-sm hover:bg-pink-500 text-pink-700 hover:text-white py-2 px-4 border border-pink-500 hover:border-transparent rounded">
              Github
            </button>
          </a>
          <a href="https://discord.gg/dDWenbVEEQ" target='_blank'>
            <button className="bg-transparent text-sm hover:bg-pink-500 text-pink-700 hover:text-white py-2 px-4 border border-pink-500 hover:border-transparent rounded">
              Discord
            </button>
          </a>
        </div>
      </main>
    </div >
  )
}
