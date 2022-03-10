
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
          loop: true,
          cursor: "█",
          delay: 200,
        }}

        onInit={(typewriter) => {
          typewriter.changeDelay(1)
          .pasteString('<strong>$: </strong>')
          .pauseFor(2500)
          .changeDelay(15)
          .pasteString('<span style="color: #27ae60;">curl</span> -X POST \\')
          .pasteString('<br/>')
          .pasteString('https://api.defender.openzeppelin.com/autotasks/dd926715-eeae-4b44-878d-e38b98eaa936/runs/webhook/27171d67-f8a8-46f4-8c81-e422b183e08c/BuUZJpsPrmjdP45hah85fj \\')
          .pasteString('<br/>')
          .pasteString('-H <span style="color: orange;">\'Content-type: application/json; charset=utf-8\'</span> \\')
          .pasteString('<br/>')
          .pasteString('--data <span style="color: orange;">\'{ "tag": "#leather" }\'</span>')
          .pauseFor(1000)
          .pasteString('<br/>')
          .changeDelay(500)
          .pauseFor(500)
          .typeString('...')
          .pauseFor(250)
          .deleteChars(3)
          .typeString('...')
          .pauseFor(250)
          .deleteChars(3)
          .typeString('...')
          .pauseFor(250)
          .deleteChars(3)
          .typeString('...')
          .pauseFor(250)
          .deleteChars(3)
          .pasteString('<br/>')
          .pasteString('#magic minted by 0x9a37...5c94 via 0x9a37...5c94')
          .pasteString('<br/>')
          .pasteString('<strong>$: </strong>')
          .pauseFor(4500)
          
          
          // .deleteAll(1)
          
          // mint and tag
          // .pasteString('<strong>$: </strong>')
          // .pauseFor(2500)
          // .changeDelay(15)
          // .pasteString('<span style="color: #27ae60;">curl</span> -X POST \\')
          // .pasteString('<br/>')
          // .pasteString('https://api.defender.openzeppelin.com/autotasks/dd926715-eeae-4b44-878d-e38b98eaa936/runs/webhook/27171d67-f8a8-46f4-8c81-e422b183e08c/BuUZJpsPrmjdP45hah85fj \\')
          // .pasteString('<br/>')
          // .pasteString('-H <span style="color: orange;">\'Content-type: application/json; charset=utf-8\'</span> \\')
          // .pasteString('<br/>')
          // .pasteString('--data <span style="color: orange;">\'{ "tag": "#leather", "targetURI":  }\'</span>')
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

          .start();
        }}
      />
    </div>
  )
}
