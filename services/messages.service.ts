import { DateTime } from 'luxon'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

import { apiPost } from 'clients/api.client'
import {
  addMessage,
  addMessageImportant,
  CreateFirebaseMessage,
  CreateFirebaseMessageWithOffre,
  findAndObserveChatsDuConseiller,
  getChatsDuConseiller,
  getMessageImportantSnapshot,
  getMessagesGroupe,
  observeChat,
  observeDerniersMessagesDuChat,
  signIn as _signIn,
  signOut as _signOut,
  updateChat,
  updateMessage,
} from 'clients/firebase.client'
import { UserType } from 'interfaces/conseiller'
import { InfoFichier } from 'interfaces/fichier'
import { BaseJeune, Chat, JeuneChat } from 'interfaces/jeune'
import {
  ByDay,
  ChatCredentials,
  Message,
  MessageListeDiffusion,
  TypeMessage,
} from 'interfaces/message'
import { BaseOffre } from 'interfaces/offre'
import { decrypt, encrypt, encryptWithCustomIv } from 'utils/chat/chatCrypto'
import { toShortDate } from 'utils/date'

type FormNouveauMessage = {
  newMessage: string
  cleChiffrement: string
  infoPieceJointe?: InfoFichier
}

export type FormNouveauMessageIndividuel = FormNouveauMessage & {
  jeuneChat: JeuneChat
}
export type FormNouveauMessageImportant = {
  newMessage: string
  cleChiffrement: string
  idConseiller: string
  dateDebut: DateTime
  dateFin: DateTime
  idMessageImportant?: string
}
export type FormNouveauMessageGroupe = FormNouveauMessage & {
  idsBeneficiaires: string[]
  idsListesDeDiffusion: string[]
}

type FormPartageOffre = {
  offre: BaseOffre
  idsDestinataires: string[]
  cleChiffrement: string
  message: string
}

export type MessageImportantPreRempli = {
  id: string
  dateDebut: string
  dateFin: string
  message: string
}

type MessageType =
  | 'MESSAGE_ENVOYE'
  | 'MESSAGE_ENVOYE_PJ'
  | 'MESSAGE_ENVOYE_MULTIPLE'
  | 'MESSAGE_ENVOYE_MULTIPLE_PJ'
  | 'MESSAGE_OFFRE_PARTAGEE'
  | 'MESSAGE_MODIFIE'
  | 'MESSAGE_SUPPRIME'

export async function getChatCredentials(): Promise<ChatCredentials> {
  const session = await getSession()
  const {
    content: { token, cle: cleChiffrement },
  } = await apiPost<{
    token: string
    cle: string
  }>('/auth/firebase/token', {}, session!.accessToken)
  return { token: token, cleChiffrement }
}

export async function signIn(token: string): Promise<void> {
  await _signIn(token)
}

export async function signOut(): Promise<void> {
  await _signOut()
}

export async function setReadByConseiller(idChat: string): Promise<void> {
  await updateChat(idChat, {
    seenByConseiller: true,
    lastConseillerReading: DateTime.now(),
  })
}

export async function toggleFlag(
  idChat: string,
  flagged: boolean
): Promise<void> {
  await updateChat(idChat, {
    flaggedByConseiller: flagged,
  })
}

export async function observeConseillerChats(
  cleChiffrement: string,
  jeunes: BaseJeune[],
  updateChats: (chats: JeuneChat[]) => void
): Promise<() => void> {
  const session = await getSession()
  return findAndObserveChatsDuConseiller(
    session!.user.id,
    (chats: { [idJeune: string]: Chat }) => {
      const newChats = jeunes
        .filter((jeune) => Boolean(chats[jeune.id]))
        .map((jeune) => {
          const chat = chats[jeune.id]
          const newJeuneChat: JeuneChat = {
            ...jeune,
            ...chat,
            lastMessageContent: chat.lastMessageIv
              ? decrypt(
                  {
                    encryptedText: chat.lastMessageContent ?? '',
                    iv: chat.lastMessageIv,
                  },
                  cleChiffrement
                )
              : chat.lastMessageContent,
          }
          return newJeuneChat
        })

      updateChats(newChats)
    }
  )
}

export function observeDerniersMessages(
  idChat: string,
  cleChiffrement: string,
  pages: number,
  onMessagesGroupesParJour: (messagesGroupesParJour: ByDay<Message>[]) => void
): () => void {
  const NB_MESSAGES_PAR_PAGE = 10
  return observeDerniersMessagesDuChat(
    idChat,
    pages * NB_MESSAGES_PAR_PAGE,
    (messagesAntechronologiques: Message[]) => {
      const messagesGroupesParJour: ByDay<Message>[] = grouperMessagesParJour(
        [...messagesAntechronologiques].reverse(),
        cleChiffrement
      )
      onMessagesGroupesParJour(messagesGroupesParJour)
    }
  )
}

export function observeJeuneReadingDate(
  idChat: string,
  onJeuneReadingDate: (date: DateTime) => void
): () => void {
  return observeChat(idChat, (chat: Chat) => {
    const lastJeuneReadingDate = chat.lastJeuneReading
    if (lastJeuneReadingDate) {
      onJeuneReadingDate(lastJeuneReadingDate)
    }
  })
}

export async function getMessagesListeDeDiffusion(
  idListeDiffusion: string,
  cleChiffrement: string
): Promise<ByDay<MessageListeDiffusion>[]> {
  const session = await getSession()
  const messages = await getMessagesGroupe(session!.user.id, idListeDiffusion)

  return grouperMessagesParJour(messages, cleChiffrement)
}

export async function getMessageImportant(
  idConseiller: string,
  cleChiffrement: string
): Promise<MessageImportantPreRempli | undefined> {
  const snapshot = await getMessageImportantSnapshot(idConseiller)
  if (!snapshot) return

  const messageImportant = snapshot.data()

  if (messageImportant) {
    const contenu = decrypt(
      { encryptedText: messageImportant.content, iv: messageImportant.iv },
      cleChiffrement
    )
    const dateFin = DateTime.fromMillis(
      messageImportant.dateFin.toMillis()
    ).toISODate()
    const dateDebut = DateTime.fromMillis(
      messageImportant.dateDebut.toMillis()
    ).toISODate()

    return { message: contenu, dateDebut, dateFin, id: snapshot.id }
  }
}

export async function countMessagesNotRead(
  idsJeunes: string[]
): Promise<{ [idJeune: string]: number }> {
  const session = await getSession()

  const chats = await getChatsDuConseiller(session!.user.id)
  return idsJeunes.reduce(
    (mappedCounts, idJeune) => {
      mappedCounts[idJeune] = chats[idJeune]?.newConseillerMessageCount ?? 0
      return mappedCounts
    },
    {} as { [idJeune: string]: number }
  )
}

export async function sendNouveauMessage({
  cleChiffrement,
  infoPieceJointe,
  jeuneChat,
  newMessage,
}: FormNouveauMessageIndividuel) {
  const now = DateTime.now()
  const encryptedMessage = encrypt(newMessage, cleChiffrement)
  const session = await getSession()

  const nouveauMessage: CreateFirebaseMessage = {
    idConseiller: session!.user.id,
    message: encryptedMessage,
    date: now,
  }

  let type: MessageType = 'MESSAGE_ENVOYE'
  if (infoPieceJointe) {
    nouveauMessage.infoPieceJointe = {
      ...infoPieceJointe,
      nom: encryptWithCustomIv(
        infoPieceJointe.nom,
        cleChiffrement,
        encryptedMessage.iv
      ),
    }
    type = 'MESSAGE_ENVOYE_PJ'
  }

  await Promise.all([
    addMessage(jeuneChat.chatId, nouveauMessage),
    updateChat(jeuneChat.chatId, {
      lastMessageContent: encryptedMessage.encryptedText,
      lastMessageIv: encryptedMessage.iv,
      lastMessageSentAt: now,
      lastMessageSentBy: UserType.CONSEILLER.toLowerCase(),
      newConseillerMessageCount: jeuneChat.newConseillerMessageCount + 1,
      seenByConseiller: true,
      lastConseillerReading: now,
    }),
  ])

  await Promise.all([
    notifierNouveauMessage(
      session!.user.id,
      [jeuneChat.id],
      session!.accessToken
    ),
    evenementMessage(
      type,
      session!.user.structure,
      session!.user.id,
      session!.accessToken
    ),
  ])
}

export async function sendNouveauMessageImportant({
  cleChiffrement,
  idConseiller,
  newMessage,
  dateDebut,
  dateFin,
  idMessageImportant,
}: FormNouveauMessageImportant) {
  const encryptedMessage = encrypt(newMessage, cleChiffrement)

  await addMessageImportant({
    idConseiller: idConseiller,
    dateDebut: dateDebut,
    dateFin: dateFin,
    message: encryptedMessage,
    idMessageImportant: idMessageImportant,
  })
}

export async function sendNouveauMessageGroupe({
  cleChiffrement,
  idsBeneficiaires,
  idsListesDeDiffusion,
  infoPieceJointe,
  newMessage,
}: FormNouveauMessageGroupe) {
  const session = await getSession()
  const encryptedMessage = encrypt(newMessage, cleChiffrement)

  let encryptedPieceJointe
  if (infoPieceJointe) {
    encryptedPieceJointe = {
      ...infoPieceJointe,
      nom: encryptWithCustomIv(
        infoPieceJointe.nom,
        cleChiffrement,
        encryptedMessage.iv
      ),
    }
  }

  await apiPost(
    '/messages',
    {
      message: encryptedMessage.encryptedText,
      iv: encryptedMessage.iv,
      idsBeneficiaires: idsBeneficiaires,
      idsListesDeDiffusion,
      idConseiller: session!.user.id,
      infoPieceJointe: encryptedPieceJointe ? encryptedPieceJointe : undefined,
    },
    session!.accessToken
  )
}

export async function partagerOffre({
  cleChiffrement,
  idsDestinataires,
  message,
  offre,
}: FormPartageOffre) {
  const session = await getSession()
  const now = DateTime.now()
  const encryptedMessage = encrypt(message, cleChiffrement)
  const nouveauMessage: CreateFirebaseMessageWithOffre = {
    idConseiller: session!.user.id,
    message: encryptedMessage,
    offre: offre,
    date: now,
  }

  await envoyerPartageOffre(
    idsDestinataires,
    nouveauMessage,
    'MESSAGE_OFFRE_PARTAGEE',
    session!,
    now
  )
}

export async function modifierMessage(
  chatId: string,
  message: Message,
  nouveauContenu: string,
  cleChiffrement: string,
  { isLastMessage }: { isLastMessage: boolean } = { isLastMessage: false }
) {
  {
    const nouveauMessage = message.iv
      ? encryptWithCustomIv(nouveauContenu, cleChiffrement, message.iv)
      : nouveauContenu
    const oldMessage = message.iv
      ? encryptWithCustomIv(message.content, cleChiffrement, message.iv)
      : message.content

    await updateMessage(chatId, message.id, {
      message: nouveauMessage,
      oldMessage,
      date: DateTime.now(),
      status: 'edited',
    })

    if (isLastMessage) {
      await updateChat(chatId, { lastMessageContent: nouveauMessage })
    }

    const { user, accessToken } = (await getSession())!
    evenementMessage('MESSAGE_MODIFIE', user.structure, user.id, accessToken)
  }
}

export async function supprimerMessage(
  chatId: string,
  message: Message,
  cleChiffrement: string,
  { isLastMessage }: { isLastMessage: boolean } = { isLastMessage: false }
) {
  const messageSuppression = '(message supprimé)'
  const nouveauMessage = message.iv
    ? encryptWithCustomIv(messageSuppression, cleChiffrement, message.iv)
    : messageSuppression
  const oldMessage = message.iv
    ? encryptWithCustomIv(message.content, cleChiffrement, message.iv)
    : message.content

  await updateMessage(chatId, message.id, {
    message: nouveauMessage,
    oldMessage,
    date: DateTime.now(),
    status: 'deleted',
  })

  if (isLastMessage) {
    await updateChat(chatId, { lastMessageContent: nouveauMessage })
  }

  const { user, accessToken } = (await getSession())!
  evenementMessage('MESSAGE_SUPPRIME', user.structure, user.id, accessToken)
}

async function envoyerPartageOffre(
  idsDestinataires: string[],
  nouveauMessage: CreateFirebaseMessageWithOffre,
  type: MessageType,
  session: Session,
  date: DateTime
) {
  const chats = await getChatsDuConseiller(session.user.id)
  const chatsDestinataires = Object.entries(chats)
    .filter(([idJeune]) => idsDestinataires.includes(idJeune))
    .map(([_, chat]) => chat)

  await Promise.all([
    chatsDestinataires.map((chat) =>
      Promise.all([
        addMessage(chat.chatId, nouveauMessage),
        updateChat(chat.chatId, {
          lastMessageContent: nouveauMessage.message.encryptedText,
          lastMessageIv: nouveauMessage.message.iv,
          lastMessageSentAt: date,
          lastMessageSentBy: UserType.CONSEILLER.toLowerCase(),
          newConseillerMessageCount: chat.newConseillerMessageCount + 1,
        }),
      ])
    ),
  ])

  await Promise.all([
    notifierNouveauMessage(
      session.user.id,
      idsDestinataires,
      session.accessToken
    ),
    evenementMessage(
      type,
      session.user.structure,
      session.user.id,
      session.accessToken
    ),
  ])
}

async function notifierNouveauMessage(
  idConseiller: string,
  idsJeunes: string[],
  accessToken: string
): Promise<void> {
  await apiPost(
    `/conseillers/${idConseiller}/jeunes/notify-messages`,
    { idsJeunes: idsJeunes },
    accessToken
  )
}

async function evenementMessage(
  type: MessageType,
  structure: string,
  idConseiller: string,
  accessToken: string
): Promise<void> {
  await apiPost(
    '/evenements',
    {
      type,
      emetteur: {
        type: UserType.CONSEILLER,
        structure: structure,
        id: idConseiller,
      },
    },
    accessToken
  )
}

function grouperMessagesParJour<T extends Message | MessageListeDiffusion>(
  messages: T[],
  cleChiffrement: string
): ByDay<T>[] {
  const messagesByDay: { [day: string]: ByDay<T> } = {}

  messages
    .filter((message) => message.type !== TypeMessage.NOUVEAU_CONSEILLER)
    .forEach((message) => {
      if (message.iv) {
        message = {
          ...message,
          ...decryptContentAndFilename(
            {
              iv: message.iv,
              content: message.content,
              infoPiecesJointes: message.infoPiecesJointes,
            },
            cleChiffrement
          ),
        }
      }

      const day = toShortDate(message.creationDate)
      const messagesOfDay = messagesByDay[day] ?? {
        date: message.creationDate,
        messages: [],
      }
      messagesOfDay.messages.push(message)
      messagesByDay[day] = messagesOfDay
    })

  return Object.values(messagesByDay)
}

function decryptContentAndFilename(
  message: { iv: string; content: string; infoPiecesJointes?: InfoFichier[] },
  cleChiffrement: string
): { content: string; infoPiecesJointes?: InfoFichier[] } {
  const iv = message.iv
  const decryptedMessage: {
    content: string
    infoPiecesJointes?: InfoFichier[]
  } = {
    content: decrypt({ encryptedText: message.content, iv }, cleChiffrement),
  }

  if (message.infoPiecesJointes?.length) {
    decryptedMessage.infoPiecesJointes = message.infoPiecesJointes.map(
      ({ id, nom, statut }) => ({
        id,
        nom: decrypt({ encryptedText: nom, iv }, cleChiffrement),
        statut,
      })
    )
  }

  return decryptedMessage
}
