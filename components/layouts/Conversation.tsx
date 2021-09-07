import { useEffect, useRef, useState } from "react";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { Jeune, Message, DailyMessages, ListDailyMessages } from 'interfaces';
import { dateIsToday, formatDayDate, formatHourMinuteDate } from 'utils/date';

import styles from 'styles/components/Layouts.module.css'

import SendIcon from '../../assets/icons/btn_send.svg'
import ChevronLeftIcon from '../../assets/icons/chevron_left.svg'

type ConversationProps = {
  db: any
  jeune: Jeune
  onBack: any
}

const todayOrDate = (date: Date) =>  dateIsToday(date) ? "Aujourd'hui" : `Le ${formatDayDate(date)}`

export default function Conversation({db, jeune, onBack}: ConversationProps) {

  const [newMessage, setNewMessage] = useState('');
  const [dailyMessages, setDailyMessages] = useState<DailyMessages[]>([]);

  const dummySpace = useRef<HTMLLIElement>(null);

  // when form is submitted
  const handleSubmit = (e: any) => {
    e.preventDefault();

    const firestoreNow = firebase.firestore.FieldValue.serverTimestamp()

    db.collection("chat").doc(jeune.chatId).collection('messages').add({
      content: newMessage,
      creationDate: firestoreNow,
      sentBy: 'conseiller',
    });

    db.collection("chat").doc(jeune.chatId).update({
      seenByConseiller: true,
      newConseillerMessageCount: firebase.firestore.FieldValue.increment(1),
      lastMessageContent: newMessage,
      lastMessageSentAt: firestoreNow,
      lastMessageSentBy: 'conseiller'
    });

    setNewMessage('');

    if(dummySpace && dummySpace.current) {
      dummySpace.current.scrollIntoView(true);
    }
  };

  // automatically check db for new messages
  useEffect(() => {
    let currentMessages: Message[]

    db.collection('chat').doc(jeune.chatId).collection('messages')
      .orderBy('creationDate')
      .onSnapshot((querySnapShot: any) => {
        // get all documents from collection with id
        const data = querySnapShot.docs.map((doc: any) => ({
          ...doc.data(),
          id: doc.id,
        }));

        currentMessages = [...data]
        
        if(!currentMessages || !currentMessages[currentMessages.length -1]?.creationDate){
          return
        }

        setDailyMessages(new ListDailyMessages(currentMessages).dailyMessages)
        
      });

      db.collection("chat").doc(jeune.chatId).update({
        seenByConseiller: true,
      });
      
  }, [db, jeune.chatId]);

   return (
     <>

      <div className={styles.conversationTitleConainer}>
        <button onClick={onBack}>
          <ChevronLeftIcon role="img" focusable="false" aria-label="Retour sur ma messagerie"/>
        </button>
        <h2 className='h2-semi'>Discuter avec {jeune.firstName}</h2>
      </div>

      <ul className={styles.messages}>
        {dailyMessages.map((dailyMessage: DailyMessages, dailyIndex:number) => (
          <li key={dailyMessage.date.getTime()} >

            <div className={`text-md text-bleu ${styles.day}`}>
            <span>{todayOrDate(dailyMessage.date)}</span>
             {/* { dateIsToday(dailyMessage.date) && <span>Aujourd&rsquo;hui</span>}
             { !dateIsToday(dailyMessage.date) && <span>Le {formatDayDate(dailyMessage.date)}</span>} */}
            </div>

            <ul>
              {dailyMessage.messages.map((message: Message, index: number) => (
                <li key={message.id} >
                    <p className={`text-md ${message.sentBy === 'conseiller' ? styles.sentMessage : styles.receivedMessage}`}>
                      {message.content}
                    </p>
                    <p className='text-xs text-bleu_nuit' style={{textAlign: message.sentBy === 'conseiller' ? 'right':'left'}}>
                      à {formatHourMinuteDate(message.creationDate.toDate())}
                    </p>

                    {((dailyIndex === (dailyMessages.length -1))&&(index === (dailyMessage.messages.length -1))) &&<section ref={dummySpace} />    
                    }
                </li>
              ))}
            </ul>
            
          </li>
        ))}
      </ul>

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