/**
 * Script qui permet de copier la BDD firebase vers une autre avec le contenu des messages cryptés. Voici les étapes
 * 1- Enlevez temporairement les règles dans firebase
 * 2- Créez une nouvelle collection (au même niveau que l'ancienne) dans firebase et nommez-là "chat"
 * 3- Changez le nom des variables dans ce fichier en fonction du nom de l'ancienne collection (collectionNameOld) et la nouvelle (collectionNameNew)
 * 4- Changez la variable encryptionKey pour mettre la bonne clée d'encodage
 * 5- Lancez le projet web 'yarn dev'
 * 5b- Bien attendre que toutes les requêtes à firebase soient terminées
 * 6- Voilà! Vous devriez avoir une copie de votre ancienne collection avec des données encodées
 * 7- Remettez les règles firebase
 */

import {
  Firestore,
  collection,
  getDocs,
  setDoc,
  doc,
  DocumentReference,
  CollectionReference,
} from 'firebase/firestore'
import { useEffect } from 'react'
import { ChatCrypto } from 'utils/chat/chatCrypto'

const collectionNameOld = 'staging-chat'
const collectionNameNew = 'chat'

type ChatBoxProps = {
  db: Firestore
}

export default function ChatBox({ db }: ChatBoxProps) {
  let encodage: ChatCrypto = new ChatCrypto()

  async function truc() {
    const oldChats = collection(db, collectionNameOld)
    const newChats = collection(db, collectionNameNew)

    const querySnapshot = await getDocs(oldChats)
    for (const docOld of querySnapshot.docs) {
      const dataDoc = docOld.data()
      if (dataDoc?.lastMessageContent && !dataDoc.lastMessageIv) {
        const encryptedData = encodage.encrypt(dataDoc.lastMessageContent)

        //LastMessageContent
        await setDoc(doc(newChats, docOld.id), {
          ...dataDoc,
          lastMessageContent: encryptedData.encryptedText,
          lastMessageIv: encryptedData.iv,
        })
      } else {
        await setDoc(doc(newChats, docOld.id), {
          ...dataDoc,
        })
      }

      //Messages
      const oldMessagesChatRef = collection(
        getChatReference(db, docOld.id, collectionNameOld),
        'messages'
      )
      if (oldMessagesChatRef) {
        const newMessagesChatRef = collection(
          getChatReference(db, docOld.id, collectionNameNew),
          'messages'
        )
        const querySnapshotMessage = await getDocs(oldMessagesChatRef)
        for (const messageOld of querySnapshotMessage.docs) {
          const messageDoc = messageOld.data()
          if (messageDoc?.content && !messageDoc.iv) {
            const encryptedMessage = encodage.encrypt(messageDoc.content)

            await setDoc(doc(newMessagesChatRef, messageOld.id), {
              ...messageDoc,
              content: encryptedMessage.encryptedText,
              iv: encryptedMessage.iv,
            })
          } else {
            await setDoc(doc(newMessagesChatRef, messageOld.id), {
              ...messageDoc,
            })
          }
        }
      }
    }
  }

  useEffect(() => {
    truc()
  }, [])

  return <></>
}

function getChatReference(
  db: Firestore,
  docId: string,
  collectionName: string
): DocumentReference<any> {
  return doc<any>(
    collection(db, collectionName) as CollectionReference<any>,
    docId
  )
}
