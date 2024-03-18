import { DateTime } from 'luxon'

import { apiPost } from 'clients/api.client'
import {
  addMessage,
  findAndObserveChatsDuConseiller,
  getChatsDuConseiller,
  getMessagesGroupe,
  observeChat,
  observeDerniersMessagesDuChat,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  updateChat,
  updateMessage,
} from 'clients/firebase.client'
import {
  desItemsJeunes,
  unChat,
  uneBaseJeune,
  unJeuneChat,
} from 'fixtures/jeune'
import {
  desMessagesAntechronologiques,
  desMessagesListeDeDiffusionParJour,
  desMessagesListeDiffusion,
  desMessagesParJour,
  unMessage,
} from 'fixtures/message'
import { unDetailOffreEmploi } from 'fixtures/offre'
import { Chat, JeuneChat, JeuneFromListe } from 'interfaces/jeune'
import { ByDay, Message } from 'interfaces/message'
import { DetailOffreEmploi } from 'interfaces/offre'
import {
  countMessagesNotRead,
  getMessagesListeDeDiffusion,
  observeConseillerChats,
  observeDerniersMessages,
  observeJeuneReadingDate,
  partagerOffre,
  sendNouveauMessage,
  sendNouveauMessageGroupe,
  setReadByConseiller,
  signIn,
  signOut,
  supprimerMessage,
  toggleFlag,
} from 'services/messages.service'

jest.mock('clients/api.client')
jest.mock('clients/firebase.client')
jest.mock('utils/chat/chatCrypto')

describe('MessagesFirebaseAndApiService', () => {
  let accessToken: string
  let cleChiffrement: string

  beforeEach(async () => {
    // Given
    accessToken = 'accessToken'
    cleChiffrement = 'cleChiffrement'
  })

  describe('.signIn', () => {
    it('calls firebase signin', async () => {
      // Given
      const firebaseToken = 'firebaseToken'

      // When
      await signIn(firebaseToken)

      // Then
      expect(firebaseSignIn).toHaveBeenCalledWith(firebaseToken)
    })
  })

  describe('.signOut', () => {
    it('calls firebase signout', async () => {
      // When
      await signOut()

      // Then
      expect(firebaseSignOut).toHaveBeenCalled()
    })
  })

  describe('.setReadByConseiller', () => {
    it('updates chat in firebase', async () => {
      // Given
      const now = DateTime.now()
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      const jeuneChat = unJeuneChat()

      // When
      await setReadByConseiller(jeuneChat.chatId)

      // Then
      expect(updateChat).toHaveBeenCalledWith(jeuneChat.chatId, {
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
      await toggleFlag(jeuneChat.chatId, false)

      // Then
      expect(updateChat).toHaveBeenCalledWith(jeuneChat.chatId, {
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
      ;(findAndObserveChatsDuConseiller as jest.Mock).mockImplementation(
        (
          _idConseiller: string,
          fn: (chats: { [idJeune: string]: Chat }) => void
        ) =>
          fn({ 'jeune-1': unChat(), 'jeune-2': unChat(), 'jeune-3': unChat() })
      )

      // When
      await observeConseillerChats(
        cleChiffrement,
        [
          { ...uneBaseJeune({ id: 'jeune-1' }) },
          { ...uneBaseJeune({ id: 'jeune-2' }) },
          { ...uneBaseJeune({ id: 'jeune-3' }) },
        ],
        updateChats
      )
    })

    it('finds chat in firebase', async () => {
      // Then
      expect(findAndObserveChatsDuConseiller).toHaveBeenCalledWith(
        'idConseiller',
        expect.any(Function)
      )
    })

    it('calls provided callback with new jeuneChat built from found chat', async () => {
      // Then
      expect(updateChats).toHaveBeenCalledWith([
        { ...uneBaseJeune({ id: 'jeune-1' }), ...unChat() },
        { ...uneBaseJeune({ id: 'jeune-2' }), ...unChat() },
        { ...uneBaseJeune({ id: 'jeune-3' }), ...unChat() },
      ])
    })
  })

  describe('.getMessagesListeDeDiffusion', () => {
    it('retourne les messages de la liste de diffusion', async () => {
      // Given
      ;(getMessagesGroupe as jest.Mock).mockResolvedValue(
        desMessagesListeDiffusion()
      )

      // When
      const actual = await getMessagesListeDeDiffusion(
        'id-liste',
        cleChiffrement
      )

      // Then
      expect(getMessagesGroupe).toHaveBeenCalledWith('idConseiller', 'id-liste')
      expect(actual).toEqual(desMessagesListeDeDiffusionParJour())
    })
  })

  describe('.observeDerniersMessages', () => {
    let idChat: string
    let onMessagesAntechronologiques: (
      messagesGroupesParJour: ByDay<Message>[]
    ) => void
    beforeEach(async () => {
      // Given
      ;(observeDerniersMessagesDuChat as jest.Mock).mockImplementation(
        (
          idChat: string,
          nbMessages: number,
          fn: (messages: Message[]) => void
        ) => fn(desMessagesAntechronologiques())
      )
      idChat = 'idChat'
      onMessagesAntechronologiques = jest.fn()

      // When
      await observeDerniersMessages(
        idChat,
        cleChiffrement,
        2,
        onMessagesAntechronologiques
      )
    })

    it('subscribes to chat messages in firebase', async () => {
      // Then
      expect(observeDerniersMessagesDuChat).toHaveBeenCalledWith(
        idChat,
        20,
        expect.any(Function)
      )
    })

    it('calls provided callback with decrypted messages grouped by day', async () => {
      // Then
      expect(onMessagesAntechronologiques).toHaveBeenCalledWith(
        desMessagesParJour()
      )
    })
  })

  describe('.observeJeuneReadingDate', () => {
    let idChat: string
    let jeuneReadingDate: DateTime
    let onJeuneReadingDate: (date: DateTime) => void
    beforeEach(async () => {
      // Given
      jeuneReadingDate = DateTime.local(2022, 1, 12)
      ;(observeChat as jest.Mock).mockImplementation(
        (idChat: string, fn: (chat: Chat) => void) =>
          fn(unChat({ lastJeuneReading: jeuneReadingDate }))
      )
      idChat = 'idChat'
      onJeuneReadingDate = jest.fn()

      // When
      await observeJeuneReadingDate(idChat, onJeuneReadingDate)
    })

    it('subscribes to chat in firebase', async () => {
      // Then
      expect(observeChat).toHaveBeenCalledWith(idChat, expect.any(Function))
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
      ;(getChatsDuConseiller as jest.Mock).mockResolvedValue({
        'jeune-1': unChat({ chatId: `chat-jeune-1` }),
        'jeune-2': unChat({ chatId: `chat-jeune-2` }),
        'jeune-3': unChat({ chatId: `chat-jeune-3` }),
      })

      //When
      const actual = await countMessagesNotRead(idsJeunes)

      //Then
      expect(getChatsDuConseiller).toHaveBeenCalledWith('idConseiller')
      expect(actual).toEqual({
        ['jeune-1']: 1,
        ['jeune-2']: 1,
        ['jeune-3']: 1,
      })
    })

    it("quand un jeune n'a pas de chat, retourne 0", async () => {
      //Given
      ;(getChatsDuConseiller as jest.Mock).mockResolvedValue({})

      //When
      const actual = await countMessagesNotRead([
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
        await sendNouveauMessage({
          jeuneChat,
          newMessage,
          cleChiffrement,
        })
      })
      it('adds a new message to firebase', async () => {
        // Then
        expect(addMessage).toHaveBeenCalledWith(jeuneChat.chatId, {
          idConseiller: 'idConseiller',
          message: {
            encryptedText: `Encrypted: ${newMessage}`,
            iv: `IV: ${newMessage}`,
          },
          date: now,
        })
      })

      it('updates chat in firebase', async () => {
        // Then
        expect(updateChat).toHaveBeenCalledWith(jeuneChat.chatId, {
          lastMessageContent: `Encrypted: ${newMessage}`,
          lastMessageIv: `IV: ${newMessage}`,
          lastMessageSentAt: now,
          lastMessageSentBy: 'conseiller',
          newConseillerMessageCount: jeuneChat.newConseillerMessageCount + 1,
          seenByConseiller: true,
          lastConseillerReading: now,
        })
      })

      it('notifies of a new message', async () => {
        // Then
        expect(apiPost).toHaveBeenCalledWith(
          `/conseillers/idConseiller/jeunes/notify-messages`,
          { idsJeunes: [jeuneChat.id] },
          accessToken
        )
      })

      it('tracks new message', async () => {
        // Then
        expect(apiPost).toHaveBeenCalledWith(
          '/evenements',
          {
            type: 'MESSAGE_ENVOYE',
            emetteur: {
              type: 'CONSEILLER',
              structure: 'PASS_EMPLOI',
              id: 'idConseiller',
            },
          },
          accessToken
        )
      })
    })

    describe('avec piece jointe', () => {
      beforeEach(async () => {
        await sendNouveauMessage({
          jeuneChat,
          newMessage,
          infoPieceJointe: { id: 'fake-id', nom: 'fake-nom' },
          cleChiffrement,
        })
      })

      it('adds a new message to firebase', async () => {
        // Then
        expect(addMessage).toHaveBeenCalledWith(jeuneChat.chatId, {
          idConseiller: 'idConseiller',
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
        expect(apiPost).toHaveBeenCalledWith(
          '/evenements',
          {
            type: 'MESSAGE_ENVOYE_PJ',
            emetteur: {
              type: 'CONSEILLER',
              structure: 'PASS_EMPLOI',
              id: 'idConseiller',
            },
          },
          accessToken
        )
      })
    })
  })

  describe('.sendNouveauMessageGroupe', () => {
    let idsBeneficiaires: string[]
    let idsListesDeDiffusion: string[]
    let newMessageGroupe: string
    beforeEach(async () => {
      // Given
      idsBeneficiaires = desItemsJeunes().map(({ id }) => id)
      idsListesDeDiffusion = ['liste-1', 'liste-2']
      newMessageGroupe = 'nouveau message groupé'
    })

    it('envoie un nouveau message sans pièce jointe pour tous les destinataires', async () => {
      // When
      await sendNouveauMessageGroupe({
        idsBeneficiaires: idsBeneficiaires,
        idsListesDeDiffusion,
        newMessage: newMessageGroupe,
        cleChiffrement,
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/messages',
        {
          idConseiller: 'idConseiller',
          idsBeneficiaires,
          idsListesDeDiffusion,
          message: `Encrypted: ${newMessageGroupe}`,
          iv: `IV: ${newMessageGroupe}`,
        },
        accessToken
      )
    })

    it('envoie un nouveau message avec pièce jointe pour tous les destinataires', async () => {
      // When
      await sendNouveauMessageGroupe({
        idsBeneficiaires: idsBeneficiaires,
        idsListesDeDiffusion,
        newMessage: newMessageGroupe,
        cleChiffrement,
        infoPieceJointe: { id: 'fake-id', nom: 'fake-nom' },
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/messages',
        {
          idConseiller: 'idConseiller',
          idsBeneficiaires,
          idsListesDeDiffusion,
          message: `Encrypted: ${newMessageGroupe}`,
          iv: `IV: ${newMessageGroupe}`,
          infoPieceJointe: { id: 'fake-id', nom: 'Encrypted: fake-nom' },
        },
        accessToken
      )
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
      offre = unDetailOffreEmploi()

      chats = idsJeunes.reduce(
        (mappedChats, idJeune) => {
          mappedChats[idJeune] = unChat({ chatId: `chat-${idJeune}` })
          return mappedChats
        },
        {} as { [idJeune: string]: Chat }
      )
      ;(getChatsDuConseiller as jest.Mock).mockResolvedValue(chats)

      await partagerOffre({
        offre,
        idsDestinataires: idsJeunes,
        message: newMessageGroupe,
        cleChiffrement,
      })
    })

    it('récupère les chats du conseiler', () => {
      // Then
      expect(getChatsDuConseiller).toHaveBeenCalledWith('idConseiller')
    })

    it('ajoute un nouveau message à firebase pour chaque destinataire', () => {
      // Then

      Object.values(chats).forEach((chat) => {
        expect(addMessage).toHaveBeenCalledWith(chat.chatId, {
          offre,
          idConseiller: 'idConseiller',
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
        expect(updateChat).toHaveBeenCalledWith(chat.chatId, {
          lastMessageContent: `Encrypted: ${newMessageGroupe}`,
          lastMessageIv: `IV: ${newMessageGroupe}`,
          lastMessageSentAt: now,
          lastMessageSentBy: 'conseiller',
          newConseillerMessageCount: chat.newConseillerMessageCount + 1,
        })
      })
    })

    it('notifie envoi de message pour chaque destinataire', () => {
      // Then
      expect(apiPost).toHaveBeenCalledWith(
        `/conseillers/idConseiller/jeunes/notify-messages`,
        { idsJeunes: idsJeunes },
        accessToken
      )
    })

    it('tracks partage d’offre', () => {
      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/evenements',
        {
          type: 'MESSAGE_OFFRE_PARTAGEE',
          emetteur: {
            type: 'CONSEILLER',
            structure: 'PASS_EMPLOI',
            id: 'idConseiller',
          },
        },
        accessToken
      )
    })
  })

  describe('.supprimerMessage', () => {
    const jeuneChat = unJeuneChat()
    const message = unMessage()
    const now = DateTime.now()
    beforeEach(async () => {
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
    })

    it('marque le message comme supprimé', async () => {
      // When
      await supprimerMessage(jeuneChat.chatId, message, cleChiffrement)

      // Then
      expect(updateMessage).toHaveBeenCalledWith(jeuneChat.chatId, message.id, {
        message: 'Encrypted: (message supprimé)',
        date: now,
        oldMessage: `Encrypted: content`,
        status: 'deleted',
      })
    })

    it('met à jour la conversation si le dernier message est supprimé', async () => {
      // When
      await supprimerMessage(jeuneChat.chatId, message, cleChiffrement, {
        isLastMessage: true,
      })

      // Then
      expect(updateChat).toHaveBeenCalledWith(jeuneChat.chatId, {
        lastMessageContent: 'Encrypted: (message supprimé)',
      })
    })
  })
})
