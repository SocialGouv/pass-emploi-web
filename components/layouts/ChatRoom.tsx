import Conversation from 'components/layouts/Conversation'
import {db} from 'utils/firebase'
import { Jeune } from 'interfaces';

import styles from 'styles/components/Layouts.module.css'

type ChatBoxProps = {
}

export default function ChatBox({}: ChatBoxProps) {
  const fakeJeune:Jeune = {
    id:'fake-id',
    firstName: 'Kenji',
    lastName: 'Jirac',
    chatId: 'Yjj6wxbiCnQcptcJD6zN',
  }


   return (
     <article  className={styles.chatRoom}>

      <Conversation db={db} jeune={fakeJeune}/>
       {/* <h2>Ma messagerie</h2>

       <ul>
         <li>
           <button></button>Kenji Girac
         </li>
       </ul> */}
     </article>
   )
 }