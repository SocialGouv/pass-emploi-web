
import { useEffect, useState } from 'react';

import firebase from "firebase/app";
import "firebase/firestore";

import Conversation from 'components/layouts/Conversation'
import { Jeune, JeuneChat } from 'interfaces';
import {formatDayAndHourDate} from 'utils/date';
import EmptyMessagesImage from '../../assets/icons/empty_messages.svg'

import styles from 'styles/components/Layouts.module.css'

import FbCheckIcon from '../../assets/icons/fb_check.svg'
import FbCheckFillIcon from '../../assets/icons/fb_check_fill.svg'

type ChatBoxProps = {
  db: firebase.firestore.Firestore
}

const defaultJeune:JeuneChat = {
  id:'',
  firstName: '',
  lastName: '',
  seenByConseiller: true,
  newConseillerMessageCount: 0,
  lastMessageContent: '',
  lastMessageSentBy: 'conseiller',
  lastMessageSentAt: new firebase.firestore.Timestamp(1562524200,  0)
}


export default function ChatBox({db}: ChatBoxProps) {
  const [jeunes, setJeunes] = useState<JeuneChat[]>([])
  const [selectedJeune, setSelectedJeune] = useState<JeuneChat>(defaultJeune)
  
  const isInChatRoom = () => Boolean(selectedJeune === defaultJeune)

  useEffect(() => {
    async function fetchData(): Promise<Jeune[]> {
      const res = await fetch(`${process.env.API_ENDPOINT}/conseiller/jeunes`)
      return await res.json()
    }

    async function fetchFirebaseData(data: Jeune[]): Promise<JeuneChat[]>{
      let promises:Promise<JeuneChat>[] = []

      data.map(async (jeune: Jeune, index: number) => {

        const newPromise = new Promise<JeuneChat>((resolve, reject) => {

          db.collection('chat').where('jeuneId','==',jeune.id).onSnapshot((querySnapshot) => {
            querySnapshot.docs.forEach((doc) => {

              if(!doc.exists){
                return
              }
  
              const newJeuneChat:JeuneChat = {
                ...data[index],
                chatId:doc.id,
                seenByConseiller: doc.data().seenByConseiller === false ? false : true, // when undefined seenByConseiller will be true
                newConseillerMessageCount: doc.data().newConseillerMessageCount,
                lastMessageContent: doc.data().lastMessageContent || defaultJeune.lastMessageContent,
                lastMessageSentAt: doc.data().lastMessageSentAt || defaultJeune.lastMessageSentAt,
                lastMessageSentBy: doc.data().lastMessageSentBy || defaultJeune.lastMessageSentBy
              }

              resolve(newJeuneChat)
          });
          }, reject)
        });

        promises.push(newPromise)
      })
      
    return await Promise.all(promises).then((jeunesChats) => jeunesChats)
    }

    fetchData().then((data) => {
      fetchFirebaseData(data).then((dataWithChatId)=> setJeunes(dataWithChatId))
    })

  },[db])

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
                    <span className='h4-semi text-bleu_nuit w-full mb-[7px]'>
                      {jeune.firstName} {jeune.lastName}
                      {!jeune.seenByConseiller && <span className='text-violet text-xs border px-[7px] py-[5px] float-right rounded-x_small'>Nouveau message</span>}
                    </span>
                    <span className='text-sm text-bleu_nuit mb-[8px]'> {jeune.lastMessageSentBy === 'conseiller' ? 'Vous' : jeune.firstName} : {jeune.lastMessageContent}</span>
                    <span className='text-xxs-italic text-bleu_nuit self-end flex'>
                      <span className='mr-[7px]'>{formatDayAndHourDate(jeune.lastMessageSentAt.toDate())} </span>
                      {jeune.seenByConseiller ? <FbCheckIcon  focusable="false" aria-hidden="true" /> : <FbCheckFillIcon  focusable="false" aria-hidden="true" />}
                    </span>
                  </button>
                </li>
            ))}
          </ul>
        </>
      }
  
     </article>
   )
 }