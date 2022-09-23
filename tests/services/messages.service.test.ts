import { DateTime } from 'luxon'

import { ApiClient } from 'clients/api.client'
import { FirebaseClient } from 'clients/firebase.client'
import {
  desItemsJeunes,
  unChat,
  uneBaseJeune,
  unJeuneChat,
} from 'fixtures/jeune'
import { desMessages, desMessagesParJour } from 'fixtures/message'
import { unDetailOffre } from 'fixtures/offre'
import { Chat, JeuneChat, JeuneFromListe } from 'interfaces/jeune'
import { Message, MessagesOfADay } from 'interfaces/message'
import { DetailOffreEmploi } from 'interfaces/offre-emploi'
import { MessagesFirebaseAndApiService } from 'services/messages.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ChatCrypto } from 'utils/chat/chatCrypto'

jest.mock('clients/firebase.client')
jest.mock('utils/chat/chatCrypto')
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
    accessToken: 'accessToken',
  })),
}))

describe('MessagesFirebaseAndApiService', () => {
  let firebaseClient: FirebaseClient
  let apiClient: ApiClient
  let messagesService: MessagesFirebaseAndApiService
  let accessToken: string
  let cleChiffrement: string

  beforeEach(async () => {
    // Given
    firebaseClient = new FirebaseClient()
    apiClient = new FakeApiClient()
    messagesService = new MessagesFirebaseAndApiService(
      firebaseClient,
      new ChatCrypto(),
      apiClient
    )
    accessToken = 'accessToken'
    cleChiffrement = 'cleChiffrement'
  })

  describe('.signIn', () => {
    it('calls firebase signin', async () => {
      // Given
      const firebaseToken = 'firebaseToken'

      // When
      await messagesService.signIn(firebaseToken)

      // Then
      expect(firebaseClient.signIn).toHaveBeenCalledWith(firebaseToken)
    })
  })

  describe('.signOut', () => {
    it('calls firebase signout', async () => {
      // When
      await messagesService.signOut()

      // Then
      expect(firebaseClient.signOut).toHaveBeenCalled()
    })
  })

  describe('.setReadByConseiller', () => {
    it('updates chat in firebase', async () => {
      // Given
      const now = DateTime.now()
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      const jeuneChat = unJeuneChat()

      // When
      await messagesService.setReadByConseiller(jeuneChat.chatId)

      // Then
      expect(firebaseClient.updateChat).toHaveBeenCalledWith(jeuneChat.chatId, {
        seenByConseiller: true,
        lastConseillerReading: now,
      })
    })
  })

  describe('.toggleFlag', () => {
    it('updates chat in firebase', async () => {
      // Given
      const jeuneChat = unJeuneChat()

      // When
      await messagesService.toggleFlag(jeuneChat.chatId, false)

      // Then
      expect(firebaseClient.updateChat).toHaveBeenCalledWith(jeuneChat.chatId, {
        flaggedByConseiller: false,
      })
    })
  })

  describe('.observeConseillerChats', () => {
    let updateChats: (chats: Chat[]) => void
    beforeEach(async () => {
      // Given
      const now = DateTime.now()
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      updateChats = jest.fn()

      // When
      await messagesService.observeConseillerChats(
        cleChiffrement,
        [
          { ...uneBaseJeune({ id: 'jeune-1' }), isActivated: true },
          { ...uneBaseJeune({ id: 'jeune-2' }), isActivated: false },
          { ...uneBaseJeune({ id: 'jeune-3' }), isActivated: true },
        ],
        updateChats
      )
    })

    it('finds chat in firebase', async () => {
      // Then
      expect(
        firebaseClient.findAndObserveChatsDuConseiller
      ).toHaveBeenCalledWith('id-conseiller', expect.any(Function))
    })

    it('calls provided callback with new jeuneChat built from found chat', async () => {
      // Then
      expect(updateChats).toHaveBeenCalledWith([
        { ...uneBaseJeune({ id: 'jeune-1' }), isActivated: true, ...unChat() },
        { ...uneBaseJeune({ id: 'jeune-2' }), isActivated: false, ...unChat() },
        { ...uneBaseJeune({ id: 'jeune-3' }), isActivated: true, ...unChat() },
      ])
    })
  })

  describe('.observeMessages', () => {
    let idChat: string
    let onMessages: (messagesGroupesParJour: MessagesOfADay[]) => void
    beforeEach(async () => {
      // Given
      ;(firebaseClient.observeMessagesDuChat as jest.Mock).mockImplementation(
        (idChat: string, fn: (messages: Message[]) => void) => fn(desMessages())
      )
      idChat = 'idChat'
      onMessages = jest.fn()

      // When
      await messagesService.observeMessages(idChat, cleChiffrement, onMessages)
    })

    it('subscribes to chat messages in firebase', async () => {
      // Then
      expect(firebaseClient.observeMessagesDuChat).toHaveBeenCalledWith(
        idChat,
        expect.any(Function)
      )
    })

    it('calls provided callback with decrypted messages grouped by day', async () => {
      // Then
      expect(onMessages).toHaveBeenCalledWith(desMessagesParJour())
    })
  })

  describe('.observeJeuneReadingDate', () => {
    let idChat: string
    let jeuneReadingDate: DateTime
    let onJeuneReadingDate: (date: DateTime) => void
    beforeEach(async () => {
      // Given
      jeuneReadingDate = DateTime.local(2022, 1, 12)
      ;(firebaseClient.observeChat as jest.Mock).mockImplementation(
        (idChat: string, fn: (chat: Chat) => void) =>
          fn(unChat({ lastJeuneReading: jeuneReadingDate }))
      )
      idChat = 'idChat'
      onJeuneReadingDate = jest.fn()

      // When
      await messagesService.observeJeuneReadingDate(idChat, onJeuneReadingDate)
    })

    it('subscribes to chat in firebase', async () => {
      // Then
      expect(firebaseClient.observeChat).toHaveBeenCalledWith(
        idChat,
        expect.any(Function)
      )
    })

    it('calls provided callback with chat lastJeuneReadingDate', async () => {
      // Then
      expect(onJeuneReadingDate).toHaveBeenCalledWith(jeuneReadingDate)
    })
  })

  describe('.messagesNotRead', () => {
    it('retourne nombre de messages nons lus par les jeunes', async () => {
      // Given
      const idsJeunes: string[] = ['jeune-1', 'jeune-2', 'jeune-3']

      //When
      const actual = await messagesService.countMessagesNotRead(idsJeunes)

      //Then
      expect(firebaseClient.getChatsDuConseiller).toHaveBeenCalledWith(
        'id-conseiller'
      )
      expect(actual).toEqual({
        ['jeune-1']: 1,
        ['jeune-2']: 1,
        ['jeune-3']: 1,
      })
    })

    it("quand un jeune n'a pas de chat, retourne 0", async () => {
      //Given
      ;(firebaseClient.getChatsDuConseiller as jest.Mock).mockResolvedValue({})

      //When
      const actual = await messagesService.countMessagesNotRead([
        'jeune-1',
        'jeune-2',
        'jeune-3',
      ])

      //Then
      expect(actual).toEqual({
        'jeune-1': 0,
        'jeune-2': 0,
        'jeune-3': 0,
      })
    })
  })

  describe('.sendNouveauMessage', () => {
    let jeuneChat: JeuneChat
    let newMessage: string
    const now = DateTime.now()
    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      jeuneChat = unJeuneChat()
      newMessage = 'nouveauMessage'
      // When
    })

    describe('sans piece jointe', () => {
      beforeEach(async () => {
        await messagesService.sendNouveauMessage({
          jeuneChat,
          newMessage,
          cleChiffrement,
        })
      })
      it('adds a new message to firebase', async () => {
        // Then
        expect(firebaseClient.addMessage).toHaveBeenCalledWith({
          idChat: jeuneChat.chatId,
          idConseiller: 'id-conseiller',
          message: {
            encryptedText: `Encrypted: ${newMessage}`,
            iv: `IV: ${newMessage}`,
          },
          date: now,
        })
      })

      it('updates chat in firebase', async () => {
        // Then
        expect(firebaseClient.updateChat).toHaveBeenCalledWith(
          jeuneChat.chatId,
          {
            lastMessageContent: `Encrypted: ${newMessage}`,
            lastMessageIv: `IV: ${newMessage}`,
            lastMessageSentAt: now,
            lastMessageSentBy: 'conseiller',
            newConseillerMessageCount: jeuneChat.newConseillerMessageCount + 1,
            seenByConseiller: true,
            lastConseillerReading: now,
          }
        )
      })

      it('notifies of a new message', async () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          `/conseillers/id-conseiller/jeunes/notify-messages`,
          { idsJeunes: [jeuneChat.id] },
          accessToken
        )
      })

      it('tracks new message', async () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          '/evenements',
          {
            type: 'MESSAGE_ENVOYE',
            emetteur: {
              type: 'CONSEILLER',
              structure: 'POLE_EMPLOI',
              id: 'id-conseiller',
            },
          },
          accessToken
        )
      })
    })

    describe('avec piece jointe', () => {
      beforeEach(async () => {
        await messagesService.sendNouveauMessage({
          jeuneChat,
          newMessage,
          infoPieceJointe: { id: 'fake-id', nom: 'fake-nom' },
          cleChiffrement,
        })
      })

      it('adds a new message to firebase', async () => {
        // Then
        expect(firebaseClient.addMessage).toHaveBeenCalledWith({
          idChat: jeuneChat.chatId,
          idConseiller: 'id-conseiller',
          message: {
            encryptedText: `Encrypted: ${newMessage}`,
            iv: `IV: ${newMessage}`,
          },
          infoPieceJointe: { id: 'fake-id', nom: 'Encrypted: fake-nom' },
          date: now,
        })
      })

      it('tracks new message', async () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          '/evenements',
          {
            type: 'MESSAGE_ENVOYE_PJ',
            emetteur: {
              type: 'CONSEILLER',
              structure: 'POLE_EMPLOI',
              id: 'id-conseiller',
            },
          },
          accessToken
        )
      })
    })
  })

  describe('.sendNouveauMessageGroupe', () => {
    let destinataires: JeuneFromListe[]
    let idsJeunes: string[]
    let chats: { [idJeune: string]: Chat }
    let newMessageGroupe: string
    const now = DateTime.now()
    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      destinataires = desItemsJeunes()
      idsJeunes = destinataires.map(({ id }) => id)
      newMessageGroupe = 'nouveau message groupé'

      // When
      chats = idsJeunes.reduce((mappedChats, idJeune) => {
        mappedChats[idJeune] = unChat({ chatId: `chat-${idJeune}` })
        return mappedChats
      }, {} as { [idJeune: string]: Chat })
      ;(firebaseClient.getChatsDuConseiller as jest.Mock).mockResolvedValue(
        chats
      )
    })

    describe('sans piece jointe', () => {
      beforeEach(async () => {
        await messagesService.sendNouveauMessageGroupe({
          idsDestinataires: idsJeunes,
          newMessage: newMessageGroupe,
          cleChiffrement,
        })
      })

      it('ajoute un nouveau message à firebase pour chaque destinataire', () => {
        // Then
        expect(firebaseClient.getChatsDuConseiller).toHaveBeenCalledWith(
          'id-conseiller'
        )

        Object.values(chats).forEach((chat) => {
          expect(firebaseClient.addMessage).toHaveBeenCalledWith({
            idChat: chat.chatId,
            idConseiller: 'id-conseiller',
            message: {
              encryptedText: `Encrypted: ${newMessageGroupe}`,
              iv: `IV: ${newMessageGroupe}`,
            },
            date: now,
          })
        })
      })

      it('met à jour le chat dans firebase pour chaque destinataire', () => {
        expect(firebaseClient.getChatsDuConseiller).toHaveBeenCalledWith(
          'id-conseiller'
        )
        // Then
        Object.values(chats).forEach((chat) => {
          expect(firebaseClient.updateChat).toHaveBeenCalledWith(chat.chatId, {
            lastMessageContent: `Encrypted: ${newMessageGroupe}`,
            lastMessageIv: `IV: ${newMessageGroupe}`,
            lastMessageSentAt: now,
            lastMessageSentBy: 'conseiller',
            newConseillerMessageCount: chat.newConseillerMessageCount + 1,
            seenByConseiller: false,
            lastConseillerReading: DateTime.fromMillis(0),
          })
        })
      })

      it('notifie envoi de message pour chaque destinataire', () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          `/conseillers/id-conseiller/jeunes/notify-messages`,
          { idsJeunes: idsJeunes },
          accessToken
        )
      })

      it('tracks nouveau message groupé', () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          '/evenements',
          {
            type: 'MESSAGE_ENVOYE_MULTIPLE',
            emetteur: {
              type: 'CONSEILLER',
              structure: 'POLE_EMPLOI',
              id: 'id-conseiller',
            },
          },
          accessToken
        )
      })
    })

    describe('avec piece jointe', () => {
      beforeEach(async () => {
        await messagesService.sendNouveauMessageGroupe({
          idsDestinataires: idsJeunes,
          newMessage: newMessageGroupe,
          cleChiffrement,
          infoPieceJointe: { id: 'fake-id', nom: 'fake-nom' },
        })
      })

      it('ajoute un nouveau message à firebase pour chaque destinataire', () => {
        // Then
        expect(firebaseClient.getChatsDuConseiller).toHaveBeenCalledWith(
          'id-conseiller'
        )

        Object.values(chats).forEach((chat) => {
          expect(firebaseClient.addMessage).toHaveBeenCalledWith({
            idChat: chat.chatId,
            idConseiller: 'id-conseiller',
            message: {
              encryptedText: `Encrypted: ${newMessageGroupe}`,
              iv: `IV: ${newMessageGroupe}`,
            },
            date: now,
            infoPieceJointe: { id: 'fake-id', nom: 'Encrypted: fake-nom' },
          })
        })
      })

      it('tracks nouveau message groupé avec piece jointe', () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          '/evenements',
          {
            type: 'MESSAGE_ENVOYE_MULTIPLE_PJ',
            emetteur: {
              type: 'CONSEILLER',
              structure: 'POLE_EMPLOI',
              id: 'id-conseiller',
            },
          },
          accessToken
        )
      })
    })
  })

  describe('.partagerOffre', () => {
    let destinataires: JeuneFromListe[]
    let idsJeunes: string[]
    let chats: { [idJeune: string]: Chat }
    let newMessageGroupe: string
    let offre: DetailOffreEmploi
    const now = DateTime.now()
    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      destinataires = desItemsJeunes()
      idsJeunes = destinataires.map(({ id }) => id)
      newMessageGroupe = 'Regarde cette offre qui pourrait t’intéresser.'
      offre = unDetailOffre()

      chats = idsJeunes.reduce((mappedChats, idJeune) => {
        mappedChats[idJeune] = unChat({ chatId: `chat-${idJeune}` })
        return mappedChats
      }, {} as { [idJeune: string]: Chat })
      ;(firebaseClient.getChatsDuConseiller as jest.Mock).mockResolvedValue(
        chats
      )

      await messagesService.partagerOffre({
        offre,
        idsDestinataires: idsJeunes,
        message: newMessageGroupe,
        cleChiffrement,
      })
    })

    it('récupère les chats du conseiler', () => {
      // Then
      expect(firebaseClient.getChatsDuConseiller).toHaveBeenCalledWith(
        'id-conseiller'
      )
    })

    it('ajoute un nouveau message à firebase pour chaque destinataire', () => {
      // Then

      Object.values(chats).forEach((chat) => {
        expect(firebaseClient.addMessageOffre).toHaveBeenCalledWith({
          offre,
          idChat: chat.chatId,
          idConseiller: 'id-conseiller',
          message: {
            encryptedText: `Encrypted: ${newMessageGroupe}`,
            iv: `IV: ${newMessageGroupe}`,
          },
          date: now,
        })
      })
    })

    it('met à jour le chat dans firebase pour chaque destinataire', () => {
      // Then
      Object.values(chats).forEach((chat) => {
        expect(firebaseClient.updateChat).toHaveBeenCalledWith(chat.chatId, {
          lastMessageContent: `Encrypted: ${newMessageGroupe}`,
          lastMessageIv: `IV: ${newMessageGroupe}`,
          lastMessageSentAt: now,
          lastMessageSentBy: 'conseiller',
          newConseillerMessageCount: chat.newConseillerMessageCount + 1,
          //seenByConseiller: false,
          //lastConseillerReading: DateTime.fromMillis(0),
        })
      })
    })

    it('notifie envoi de message pour chaque destinataire', () => {
      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        `/conseillers/id-conseiller/jeunes/notify-messages`,
        { idsJeunes: idsJeunes },
        accessToken
      )
    })

    it('tracks partage d’offre', () => {
      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        '/evenements',
        {
          type: 'MESSAGE_OFFRE_PARTAGEE',
          emetteur: {
            type: 'CONSEILLER',
            structure: 'POLE_EMPLOI',
            id: 'id-conseiller',
          },
        },
        accessToken
      )
    })
  })
})
