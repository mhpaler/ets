
import Typewriter from 'typewriter-effect';
import styles from "./animation.module.css";

export default function animation() {
  return (
    <div className={styles.terminal}>
      <Typewriter
        options={{
          //strings: ['Hello', 'World'],
          autoStart: true,
          deleteSpeed: 3,
          loop: true,
          cursor: "█",
          delay: 200,
        }}

        onInit={(typewriter) => {
          typewriter.changeDelay(1)

          // mint and tag
          .pasteString('<strong>$: </strong>', null)
          .typeString('<span class="text-slate-400"># Tag an NFT with <span class="text-pink-600">#3dAnimation</span></span>')
          .pasteString('<br/>', null)
          .pasteString('<strong>$: </strong>', null)
          .pauseFor(2500)
          .changeDelay(15)
          .pasteString('<span style="color: #27ae60;">curl</span> -X POST \\', null)
          .pasteString('<br/>', null)
          .pasteString('https://api.ets.xyz/v0/tagTarget \\', null)
          .pasteString('<br/>', null)
          .pasteString('-H <span style="color: orange;">\'Content-type: application/json; charset=utf-8\'</span> \\', null)
          .pasteString('<br/>', null)
          .pasteString('--data <span style="color: orange;">\'{ "tag": "#3dAnimation", "targetType": "nft-evm", "targetURI": "0x8ee9a60cb5c0e7db414031856cb9e0f1f05988d1|3061|1" }\'</span>', null)
          .pauseFor(1000)
          .pasteString('<br/>', null)
          .changeDelay(500)
          .pauseFor(500)
          .typeString('.........')
          .deleteChars(9)
          .pasteString('<br/>', null)
          .pasteString('<span class="text-pink-600">#3dAnimation</span> minted by 0xe9fb...e1e9 via 0xe9fb...e1e9', null)
          .pasteString('<br/>', null)
          .pauseFor(250)
          .changeDelay(50)
          .pasteString('target 0932001...(nft-evm) tagged with <span class="text-pink-600">#3dAnimation</span> by 0xe9fb...e1e9 via 0xe9fb...e1e9', null)
          .pasteString('<br/>', null)
          .pasteString('<strong>$: </strong>', null)
          .pauseFor(4500)

          .deleteAll(1)

          // Graph QL Query
          .pasteString('<strong>$: </strong>', null)
          .changeDelay(1)
          .typeString('<span class="text-slate-400"># Fetch most recently tagged NFT for Publisher 0xe9fb...e1e9')
          .pasteString('<br/>', null)
          .pasteString('<strong>$: </strong>', null)
          .pauseFor(2500)
          .changeDelay(15)
          .pasteString('<span style="color: #27ae60;">curl</span> -X POST \\', null)
          .pasteString('<br/>', null)
          .pasteString('https://api.thegraph.com/subgraphs/name/hashtag-protocol/hashtag-polygon-mumbai \\', null)
          .pasteString('<br/>', null)
          .pasteString('-H <span style="color: orange;">\'Content-type: application/json; charset=utf-8\'</span> \\', null)
          .pasteString('<br/>', null)
          .pasteString('--data <span style="color: orange;">\'{ "query": "{ tags(first: 1, orderBy: timestamp, orderDirection: desc, where: { publisher: \"0xe9fbc1a1925f6f117211c59b89a55b576182e1e9\" }) { hashtag nftContract nftId nftChainId tagger } }" }\'</span>', null)
          .pauseFor(1000)
          .pasteString('<br/>', null)
          .changeDelay(500)
          .pauseFor(500)
          .typeString('...')
          .deleteChars(3)
          .pasteString('<br/>', null)
          .pasteString('{"data":{ "tags":[{ "hashtag":"#3dAnimation", "nftContract":"0x8ee9a60cb5c0e7db414031856cb9e0f1f05988d1", "nftId":"3061", "nftChainId":"1", "tagger":"0xe9fbc1a1925f6f117211c59b89a55b576182e1e9" }]}}', null)
          .pasteString('<br/>', null)
          .pasteString('<strong>$: </strong>', null)
          .pauseFor(4500)

          .start();
        }}
      />
    </div>
  )
}
