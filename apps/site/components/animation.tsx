
import Typewriter from 'typewriter-effect';
import styles from "./animation.module.css";

export default () => {
  return (
    <div className={styles.terminal}>
      <Typewriter
        options={{
          //strings: ['Hello', 'World'],
          autoStart: true,
          deleteSpeed: 3,
          //loop: true,
          cursor: "█",
          delay: 200,
        }}

        onInit={(typewriter) => {
          typewriter.changeDelay(1)
          // .pasteString('<strong>$: </strong>')
          // .pauseFor(2500)
          // .changeDelay(15)
          // .pasteString('<span style="color: #27ae60;">curl</span> -X POST \\')
          // .pasteString('<br/>')
          // .pasteString('https://api.defender.openzeppelin.com/autotasks/dd926715-eeae-4b44-878d-e38b98eaa936/runs/webhook/27171d67-f8a8-46f4-8c81-e422b183e08c/BuUZJpsPrmjdP45hah85fj \\')
          // .pasteString('<br/>')
          // .pasteString('-H <span style="color: orange;">\'Content-type: application/json; charset=utf-8\'</span> \\')
          // .pasteString('<br/>')
          // .pasteString('--data <span style="color: orange;">\'{ "tag": "#leather" }\'</span>')
          // .pauseFor(1000)
          // .pasteString('<br/>')
          // .changeDelay(500)
          // .pauseFor(500)
          // .typeString('...')
          // .pauseFor(250)
          // .deleteChars(3)
          // .typeString('...')
          // .pauseFor(250)
          // .deleteChars(3)
          // .typeString('...')
          // .pauseFor(250)
          // .deleteChars(3)
          // .typeString('...')
          // .pauseFor(250)
          // .deleteChars(3)
          // .pasteString('<br/>')
          // .pasteString('#magic minted by 0x9a37...5c94 via 0x9a37...5c94')
          // .pasteString('<br/>')
          // .pasteString('<strong>$: </strong>')
          // .pauseFor(4500)
          // 
          // 
          // .deleteAll(1)
          
          // mint and tag
          .pasteString('<strong>$: </strong>', null)
          .pauseFor(2500)
          .changeDelay(15)
          .pasteString('<span style="color: #27ae60;">curl</span> -X POST \\', null)
          .pasteString('<br/>', null)
          .pasteString('https://api.defender.openzeppelin.com/autotasks/dd926715-eeae-4b44-878d-e38b98eaa936/runs/webhook/27171d67-f8a8-46f4-8c81-e422b183e08c/BuUZJpsPrmjdP45hah85fj \\', null)
          .pasteString('<br/>', null)
          .pasteString('-H <span style="color: orange;">\'Content-type: application/json; charset=utf-8\'</span> \\', null)
          .pasteString('<br/>', null)
          .pasteString('--data <span style="color: orange;">\'{ "tag": "#3dAnimation", "targetType": "nft-evm", "targetURI": "0x8ee9a60cb5c0e7db414031856cb9e0f1f05988d1|3061|1" }\'</span>', null)
          .pauseFor(1000)
          .pasteString('<br/>', null)
          .changeDelay(500)
          .pauseFor(500)
          .typeString('...')
          .pauseFor(250)
          .deleteChars(3)
          .typeString('...')
          .pauseFor(250)
          .deleteChars(3)
          .typeString('..')
          .deleteChars(2)
          .pasteString('<br/>', null)
          .pasteString('#3dAnimation minted by 0x9a37...5c94 via 0x9a37...5c94', null)
          .pasteString('<br/>', null)
          .pauseFor(250)
          .changeDelay(50)
          .pasteString('target 0932001...(nft-evm) tagged with #3dAnimation by 0x9a37...5c94 via 0x9a37...5c94', null)
          .pasteString('<br/>', null)
          .pasteString('<strong>$: </strong>', null)
          .pauseFor(4500)

          .start();
        }}
      />
    </div>
  )
}
