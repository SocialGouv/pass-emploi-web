import { DateTime } from 'luxon'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

import { apiPost } from 'clients/api.client'
import {
  addMessage,
  addMessageImportant,
  CreateFirebaseMessage,
  CreateFirebaseMessageCommentaireAction,
  CreateFirebaseMessagePartageOffre,
  deleteMessageImportant,
  findAndObserveChatsDuConseiller,
  getChatsDuConseiller,
  getIdLastMessage,
  findMessageImportant,
  getMessagesGroupe,
  getMessagesPeriode,
  observeChat,
  observeDerniersMessagesDuChat,
  rechercherMessages,
  signIn as _signIn,
  signOut as _signOut,
  updateChat,
  updateMessage,
  getChatDuBeneficiaire,
} from 'clients/firebase.client'
import { Action } from 'interfaces/action'
import {
  BaseBeneficiaire,
  BeneficiaireEtChat,
  Chat,
} from 'interfaces/beneficiaire'
import { UserType } from 'interfaces/conseiller'
import { InfoFichier } from 'interfaces/fichier'
import {
  ByDay,
  ChatCredentials,
  Message,
  MessageListeDiffusion,
  MessageRechercheMatch,
  OfDay,
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
  beneficiaireChat: BeneficiaireEtChat
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

type PartageOffre = {
  offre: BaseOffre
  idsDestinataires: string[]
  cleChiffrement: string
  message: string
}

type PartageAction = {
  action: Action
  idDestinataire: string
  cleChiffrement: string
  message: string
}

export type MessageImportantPreRempli = {
  id: string
  dateDebut: string
  dateFin: string
  message: string
}

type MessageTypeEvenement =
  | 'MESSAGE_ENVOYE'
  | 'MESSAGE_ENVOYE_PJ'
  | 'MESSAGE_ENVOYE_MULTIPLE'
  | 'MESSAGE_ENVOYE_MULTIPLE_PJ'
  | 'MESSAGE_OFFRE_PARTAGEE'
  | 'MESSAGE_MODIFIE'
  | 'MESSAGE_SUPPRIME'
  | 'MESSAGE_IMPORTANT_MODIFIE'
  | 'MESSAGE_IMPORTANT_SUPPRIME'
  | 'MESSAGE_ACTION_COMMENTEE'

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
  jeunes: BaseBeneficiaire[],
  updateChats: (chats: BeneficiaireEtChat[]) => void
): Promise<() => void> {
  const session = await getSession()
  return findAndObserveChatsDuConseiller(
    session!.user.id,
    (chats: { [idJeune: string]: Chat }) => {
      const newChats = jeunes
        .filter((jeune) => Boolean(chats[jeune.id]))
        .map((jeune) => {
          const chat = chats[jeune.id]
          const newJeuneChat: BeneficiaireEtChat = {
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
  beneficiaireEtChat: BeneficiaireEtChat,
  cleChiffrement: string,
  { pages, taillePage }: { pages: number; taillePage: number },
  onMessagesGroupesParJour: (messagesGroupesParJour: ByDay<Message>) => void
): () => void {
  return observeDerniersMessagesDuChat(
    beneficiaireEtChat,
    pages * taillePage,
    (messagesAntechronologiques: Message[]) => {
      const messagesGroupesParJour: ByDay<Message> = grouperMessagesParJour(
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
): Promise<ByDay<MessageListeDiffusion>> {
  const session = await getSession()
  const messages = await getMessagesGroupe(session!.user.id, idListeDiffusion)

  return grouperMessagesParJour(messages, cleChiffrement)
}

export async function rechercherMessagesConversation(
  idBeneficiaire: string,
  recherche: string,
  cleChiffrement: string
): Promise<Array<{ message: Message; matches: MessageRechercheMatch[] }>> {
  const session = await getSession()
  const resultatsRecherche = await rechercherMessages(
    session!.accessToken,
    idBeneficiaire,
    recherche
  )

  return resultatsRecherche.map(({ matches, message }) => {
    if (!message.iv) return { message, matches }
    return {
      message: {
        ...message,
        ...decryptContentAndFilename(
          {
            iv: message.iv,
            content: message.content,
            infoPiecesJointes: message.infoPiecesJointes,
          },
          cleChiffrement
        ),
      },
      matches,
    }
  })
}

export async function getMessageImportant(
  cleChiffrement: string
): Promise<MessageImportantPreRempli | undefined> {
  const session = await getSession()
  const messageImportant = await findMessageImportant(session!.user.id)
  if (!messageImportant) return

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

  return { message: contenu, dateDebut, dateFin, id: messageImportant.id }
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

export async function getMessagesDuMemeJour(
  beneficiaireEtChat: BeneficiaireEtChat,
  messageSource: Message,
  cleChiffrement: string
): Promise<Message[]> {
  const debut = messageSource.creationDate.startOf('day')
  const fin = messageSource.creationDate.endOf('day')

  const messages = await getMessagesPeriode(beneficiaireEtChat, debut, fin)
  return messages.map((message) => {
    if (!message.iv) return message
    return {
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
  })
}

export async function sendNouveauMessage({
  cleChiffrement,
  infoPieceJointe,
  beneficiaireChat,
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

  let type: MessageTypeEvenement = 'MESSAGE_ENVOYE'
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
    addMessage(beneficiaireChat.chatId, nouveauMessage),
    updateChat(beneficiaireChat.chatId, {
      lastMessageContent: encryptedMessage.encryptedText,
      lastMessageIv: encryptedMessage.iv,
      lastMessageSentAt: now,
      lastMessageSentBy: UserType.CONSEILLER.toLowerCase(),
      newConseillerMessageCount: beneficiaireChat.newConseillerMessageCount + 1,
      seenByConseiller: true,
      lastConseillerReading: now,
    }),
  ])

  await Promise.all([
    notifierNouveauMessage(
      session!.user.id,
      [beneficiaireChat.id],
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
}: FormNouveauMessageImportant): Promise<MessageImportantPreRempli> {
  const encryptedMessage = encrypt(newMessage, cleChiffrement)

  const id = await addMessageImportant({
    idConseiller: idConseiller,
    dateDebut: dateDebut,
    dateFin: dateFin,
    message: encryptedMessage,
    idMessageImportant: idMessageImportant,
  })

  const { user, accessToken } = (await getSession())!
  evenementMessage(
    'MESSAGE_IMPORTANT_MODIFIE',
    user.structure,
    user.id,
    accessToken
  )

  return {
    id,
    dateDebut: dateDebut.toISODate(),
    dateFin: dateFin.toISODate(),
    message: newMessage,
  }
}

export async function desactiverMessageImportant(
  idMessageImportant: string
): Promise<void> {
  await deleteMessageImportant(idMessageImportant)
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
}: PartageOffre) {
  const session = await getSession()
  const now = DateTime.now()
  const encryptedMessage = encrypt(message, cleChiffrement)
  const nouveauMessage: CreateFirebaseMessagePartageOffre = {
    idConseiller: session!.user.id,
    message: encryptedMessage,
    offre: offre,
    date: now,
  }

  await envoyerPartageOffre(idsDestinataires, nouveauMessage, session!)
}

export async function commenterAction({
  cleChiffrement,
  idDestinataire,
  message,
  action,
}: PartageAction): Promise<void> {
  const session = await getSession()
  const now = DateTime.now()
  const encryptedMessage = encrypt(message, cleChiffrement)
  const nouveauMessage: CreateFirebaseMessageCommentaireAction = {
    idConseiller: session!.user.id,
    message: encryptedMessage,
    action,
    date: now,
  }

  await envoyerCommentaireAction(idDestinataire, nouveauMessage, session!)
}

export async function modifierMessage(
  chatId: string,
  message: Message,
  nouveauContenu: string,
  cleChiffrement: string
): Promise<Message> {
  const status = 'edited'
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
    status,
  })

  const idLastMessage = await getIdLastMessage(chatId)
  if (idLastMessage === message.id) {
    await updateChat(chatId, { lastMessageContent: nouveauMessage })
  }

  const { user, accessToken } = (await getSession())!
  evenementMessage('MESSAGE_MODIFIE', user.structure, user.id, accessToken)

  return { ...message, content: nouveauContenu, status }
}

export async function supprimerMessage(
  chatId: string,
  message: Message,
  cleChiffrement: string
): Promise<Message> {
  const messageSuppression = '(message supprimé)'
  const nouveauMessage = message.iv
    ? encryptWithCustomIv(messageSuppression, cleChiffrement, message.iv)
    : messageSuppression
  const oldMessage = message.iv
    ? encryptWithCustomIv(message.content, cleChiffrement, message.iv)
    : message.content
  const status = 'deleted'

  await updateMessage(chatId, message.id, {
    message: nouveauMessage,
    oldMessage,
    date: DateTime.now(),
    status,
  })

  const idLastMessage = await getIdLastMessage(chatId)
  if (idLastMessage === message.id) {
    await updateChat(chatId, { lastMessageContent: nouveauMessage })
  }

  const { user, accessToken } = (await getSession())!
  evenementMessage('MESSAGE_SUPPRIME', user.structure, user.id, accessToken)

  return { ...message, content: messageSuppression, status }
}

async function envoyerPartageOffre(
  idsDestinataires: string[],
  nouveauMessage: CreateFirebaseMessagePartageOffre,
  session: Session
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
          lastMessageSentAt: nouveauMessage.date,
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
      'MESSAGE_OFFRE_PARTAGEE',
      session.user.structure,
      session.user.id,
      session.accessToken
    ),
  ])
}

async function envoyerCommentaireAction(
  idDestinataire: string,
  nouveauMessage: CreateFirebaseMessageCommentaireAction,
  session: Session
) {
  const chat = await getChatDuBeneficiaire(session.user.id, idDestinataire)
  if (!chat) throw new Error('Conversation non trouvée')

  await Promise.all([
    addMessage(chat.chatId, nouveauMessage),
    updateChat(chat.chatId, {
      lastMessageContent: nouveauMessage.message.encryptedText,
      lastMessageIv: nouveauMessage.message.iv,
      lastMessageSentAt: nouveauMessage.date,
      lastMessageSentBy: UserType.CONSEILLER.toLowerCase(),
      newConseillerMessageCount: chat.newConseillerMessageCount + 1,
    }),
  ])

  await Promise.all([
    notifierNouveauMessage(
      session!.user.id,
      [idDestinataire],
      session!.accessToken
    ),
    evenementMessage(
      'MESSAGE_ACTION_COMMENTEE',
      session!.user.structure,
      session!.user.id,
      session!.accessToken
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
  type: MessageTypeEvenement,
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
): ByDay<T> {
  const messagesByDay: { [day: string]: OfDay<T> } = {}

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

  return { length: messages.length, days: Object.values(messagesByDay) }
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
