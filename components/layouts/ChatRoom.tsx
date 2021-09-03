
import { useEffect, useState } from 'react';

import {db} from 'utils/firebase'

import Conversation from 'components/layouts/Conversation'
import { Jeune } from 'interfaces';

import EmptyMessagesImage from '../../assets/icons/empty_messages.svg'

import styles from 'styles/components/Layouts.module.css'

type ChatBoxProps = {
}

const defaultJeune:Jeune = {
  id:'',
  firstName: '',
  lastName: '',
}


export default function ChatBox({}: ChatBoxProps) {
  const [jeunes, setJeunes] = useState<Jeune[]>([])
  const [selectedJeune, setSelectedJeune] = useState<Jeune>(defaultJeune)
  
  const isInChatRoom = () => Boolean(selectedJeune === defaultJeune)

  useEffect(() => {
    async function fetchData(): Promise<Jeune[]> {
      const res = await fetch(`${process.env.API_ENDPOINT}/conseiller/jeunes`)
      return await res.json()
    }

    async function fetchFirebaseData(data: Jeune[]): Promise<Jeune[]>{
      await Promise.all(data.map(async (jeune: Jeune, index: number) => {
        await db.collection('chat').where('jeuneId','==',jeune.id).get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if(doc.exists){
              console.log(doc.data())
              data[index] = {
                ...data[index],
                chatId:doc.id
              }
            }
        });
        })
      }))
      return data
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
            {jeunes.map((jeune: Jeune) => (
              jeune.chatId && 
                <li key={jeune.id}>
                  <button onClick={() => setSelectedJeune(jeune)}>
                    <span className='h4-semi text-bleu_nuit' style={{marginBottom:'7px'}}>{jeune.firstName} {jeune.lastName}</span>
                    <span className='text-sm text-bleu_nuit' style={{marginBottom:'8px'}}>Vous: Pensez à mettre à jour votre CV</span>
                    <span className='text-xxs-italic text-bleu_nuit' style={{alignSelf:'flex-end'}}>le 09 août à 09h52</span>
                  </button>
                </li>
            ))}
          </ul>
        </>
      }
  
     </article>
   )
 }