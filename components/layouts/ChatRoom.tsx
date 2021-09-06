
import { useEffect, useState } from 'react';

import {db} from 'utils/firebase'
import firebase from "firebase/app";
import "firebase/firestore";

import Conversation from 'components/layouts/Conversation'
import { Jeune, JeuneChat } from 'interfaces';
import {formatDayAndHourDate} from 'utils/date';
import EmptyMessagesImage from '../../assets/icons/empty_messages.svg'

import styles from 'styles/components/Layouts.module.css'

type ChatBoxProps = {
}

const defaultJeune:JeuneChat = {
  id:'',
  firstName: '',
  lastName: '',
  seenByConseiller: false,
  seenByJeune: false,
  lastMessageContent: '',
  lastMessageSentBy: '',
  lastMessageSentAt: new firebase.firestore.Timestamp(1562524200,  0)
}


export default function ChatBox({}: ChatBoxProps) {
  const [jeunes, setJeunes] = useState<JeuneChat[]>([])
  const [selectedJeune, setSelectedJeune] = useState<JeuneChat>(defaultJeune)
  
  const isInChatRoom = () => Boolean(selectedJeune === defaultJeune)

  useEffect(() => {
    async function fetchData(): Promise<Jeune[]> {
      const res = await fetch(`${process.env.API_ENDPOINT}/conseiller/jeunes`)
      return await res.json()
    }

    async function fetchFirebaseData(data: Jeune[]): Promise<JeuneChat[]>{
      let jeunesChats:JeuneChat[] = []

      await Promise.all(data.map(async (jeune: Jeune, index: number) => {
        await db.collection('chat').where('jeuneId','==',jeune.id).get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if(doc.exists){

              const newJeuneChat:JeuneChat = {
                ...data[index],
                chatId:doc.id,
                seenByConseiller: doc.data().seenByConseiller,
                seenByJeune: doc.data().seenByJeune,
                lastMessageContent: doc.data().lastMessageContent,
                lastMessageSentAt: doc.data().lastMessageSentAt,
                lastMessageSentBy: doc.data().lastMessageSentBy
              }

              jeunesChats.push(newJeuneChat)
            }
        });
        })
      }))
      return jeunesChats
    }

    fetchData().then((data) => {
      fetchFirebaseData(data).then((dataWithChatId)=> setJeunes(dataWithChatId))
    })
  },[])
    
   return (
     <article  className={styles.chatRoom}>

      {!isInChatRoom() &&  
        <Conversation onBack={() => setSelectedJeune(defaultJeune)} db={db} jeune={selectedJeune}/> 
      }

      {isInChatRoom() && 
        <>
          <h2 className={`h2-semi text-bleu_nuit ${styles.chatroomTitle}`}>Ma messagerie</h2>

          {!jeunes?.length && <div className={styles.conversations}> 
            <EmptyMessagesImage focusable="false" aria-hidden="true" className='m-auto mt-[50px] mb-[50px]' /> 
            <p className='text-md-semi text-bleu_nuit text-center ml-[50px] mr-[50px]'>Vous devriez avoir des jeunes inscrits pour discuter avec eux </p>
          </div>}

          <ul className={styles.conversations}>  
            {jeunes.map((jeune: JeuneChat) => (
              jeune.chatId && 
                <li key={jeune.id}>
                  <button onClick={() => setSelectedJeune(jeune)}>
                    <span className='h4-semi text-bleu_nuit' style={{marginBottom:'7px'}}>{jeune.firstName} {jeune.lastName}</span>
                    <span>Nouveau message</span>
                    <span className='text-sm text-bleu_nuit' style={{marginBottom:'8px'}}> {jeune.lastMessageSentBy === 'conseiller' ? 'Vous' : jeune.firstName} : {jeune.lastMessageContent}</span>
                    <span className='text-xxs-italic text-bleu_nuit' style={{alignSelf:'flex-end'}}>{formatDayAndHourDate(jeune.lastMessageSentAt.toDate())} </span>
                  </button>
                </li>
            ))}
          </ul>
        </>
      }
  
     </article>
   )
 }