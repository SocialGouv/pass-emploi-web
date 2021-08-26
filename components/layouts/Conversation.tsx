import { useEffect, useRef, useState } from "react";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { Jeune } from 'interfaces';

import styles from 'styles/components/Layouts.module.css'

import SendIcon from '../../assets/icons/btn_send.svg'
import ChevronLeftIcon from '../../assets/icons/chevron_left.svg'

type ConversationProps = {
  db: any
  jeune: Jeune
}

//TODO: move to models

type Message = {
  id: string
  content: string
  creationDate: any
  sentBy: string
}

type DailyMessages = {
  date: Date,
  messages: Message[]
}

//TODO: move to utils
const datesAreOnSameDay = (firstDate: Date, secondDate: Date) =>
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate();

const formatDayDate = (date: Date) => 
{
  const day = (date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())
  const month = (date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

const formatHourMinuteDate = (date: Date) => `${date.getHours()}:${date.getMinutes()}`

export default function Conversation({db, jeune}: ConversationProps) {

  const [newMessage, setNewMessage] = useState('');
  const [dailyMessages, setDailyMessages] = useState<DailyMessages[]>([]);

  const dummySpace = useRef<HTMLElement>(null);

  

  // when form is submitted
  const handleSubmit = (e: any) => {
    e.preventDefault();

    db.collection("chat").doc(jeune.chatId).collection('messages').add({ //TODO chatId
      content: newMessage,
      creationDate: firebase.firestore.FieldValue.serverTimestamp(),
      sentBy: 'conseiller',
    });

    setNewMessage('');

    if(dummySpace && dummySpace.current) {
      // scroll down the chat
      dummySpace.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // automatically check db for new messages
  useEffect(() => {
    db.collection('chat').doc(jeune.chatId).collection('messages')
      .orderBy('creationDate')
      .onSnapshot((querySnapShot: any) => {
        // get all documents from collection with id
        const data = querySnapShot.docs.map((doc: any) => ({
          ...doc.data(),
          id: doc.id,
        }));
//TEST SANDRA
        let currentMessages: Message[] = [...data]
        
        let tmpdate:Date = currentMessages[0].creationDate.toDate()
        let tmpDateMessages: DailyMessages[] = [{date:tmpdate, messages:[]}]
        let tmpDateMessagesIndex = 0

        currentMessages.forEach((message: Message, index: number) => {
          if(datesAreOnSameDay(tmpdate, message.creationDate.toDate())){
            tmpDateMessages[tmpDateMessagesIndex].messages.push(message)
          }else{
            tmpdate = message.creationDate.toDate()
            tmpDateMessagesIndex++
            tmpDateMessages.push({date:tmpdate, messages:[]})
          }
        });

        setDailyMessages(tmpDateMessages)
//done test

      });
  }, [db, jeune.chatId]);

   return (
     <>

      <div className={styles.conversationTitleConainer}>
        <button>
          <ChevronLeftIcon role="img" focusable="false" aria-label="Retour sur ma messagerie"/>
        </button>
        <h2 className='h2-semi'>Discuter avec {jeune.firstName}</h2>
      </div>

      <ul className={styles.messages}>
        {dailyMessages.map((dailyMessage: DailyMessages) => (
          <li key={dailyMessage.date.getTime()} >

            <div className={`text-md text-bleu ${styles.day}`}>
              Le {formatDayDate(dailyMessage.date)}
            </div>

            <ul>
              {dailyMessage.messages.map((message: Message) => (
                <li key={message.id} >
                    <p className={`text-md ${message.sentBy === 'conseiller' ? styles.sentMessage : styles.receivedMessage}`}>
                      {message.content}
                    </p>
                    <p className='text-xs text-bleu_nuit' style={{textAlign: message.sentBy === 'conseiller' ? 'right':'left'}}>
                      à {formatHourMinuteDate(message.creationDate.toDate())}
                    </p>
                </li>
              ))}
            </ul>
            
          </li>
        ))}
      </ul>

      <section ref={dummySpace} />

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={newMessage}
          className='text-md text-bleu_nuit'
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez votre message ici..."
        />

        <button type="submit" disabled={!newMessage}>
          <SendIcon aria-hidden="true" focusable="false" />
        </button>
      </form>
    
     </>
   )
 }