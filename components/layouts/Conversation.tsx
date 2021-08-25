import styles from 'styles/components/Layouts.module.css'


import { useEffect, useRef, useState } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { Jeune } from 'interfaces';

type DiscussionProps = {
  db: any
  jeune: Jeune
}

type Message = {
  id: string
  content: string
  creationDate: Date
  sentBy: string
}

export default function Discussion({db, jeune}: DiscussionProps) {

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);

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
      .limit(100)
      .onSnapshot((querySnapShot: any) => {
        // get all documents from collection with id
        const data = querySnapShot.docs.map((doc: any) => ({
          ...doc.data(),
          id: doc.id,
        }));

        //   update state
        setMessages(data);
      });
  }, [db, jeune.chatId]);

   return (
     <>
     <h2 className={`h2-semi ${styles.discussionTitle}`}>Discuter avec {jeune.firstName}</h2>

     <ul>
       {console.log(messages)}
        {messages.map((message: Message) => (

          
          <li key={message.id} className={message.sentBy === 'conseiller' ? styles.sentMessage : styles.receivedMessage}>
              <p className='text-md'>{message.content}</p>
          </li>
        ))}
      </ul>


      <section ref={dummySpace} />

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez votre message ici..."
        />

        <button type="submit" disabled={!newMessage}>
          Send
        </button>
      </form>
     </>
   )
 }