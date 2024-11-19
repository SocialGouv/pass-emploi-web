import { Timestamp } from 'firebase/firestore'
import { DateTime } from 'luxon'

import { apiPost } from 'clients/api.client'
import {
  addMessage,
  addMessageImportant,
  deleteMessageImportant,
  findAndObserveChatsDuConseiller,
  findMessageImportant,
  FirebaseMessageImportant,
  getChatDuBeneficiaire,
  getChatsDuConseiller,
  getIdLastMessage,
  getMessagesGroupe,
  getMessagesPeriode,
  observeChat,
  observeDerniersMessagesDuChat,
  rechercherMessages,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  updateChat,
  updateMessage,
} from 'clients/firebase.client'
import { uneAction } from 'fixtures/action'
import {
  desItemsBeneficiaires,
  unBeneficiaireChat,
  unChat,
  uneBaseBeneficiaire,
} from 'fixtures/beneficiaire'
import {
  desMessagesAntechronologiques,
  desMessagesListeDeDiffusionParJour,
  desMessagesListeDiffusion,
  desMessagesParJour,
  unMessage,
} from 'fixtures/message'
import { unDetailOffreEmploi } from 'fixtures/offre'
import {
  BeneficiaireEtChat,
  BeneficiaireFromListe,
  Chat,
} from 'interfaces/beneficiaire'
import { ByDay, Message } from 'interfaces/message'
import { DetailOffreEmploi } from 'interfaces/offre'
import {
  commenterAction,
  countMessagesNotRead,
  desactiverMessageImportant,
  getMessageImportant,
  getMessagesDuMemeJour,
  getMessagesListeDeDiffusion,
  modifierMessage,
  observeConseillerChats,
  observeDerniersMessages,
  observeJeuneReadingDate,
  partagerOffre,
  rechercherMessagesConversation,
  sendNouveauMessage,
  sendNouveauMessageGroupe,
  sendNouveauMessageImportant,
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
      const beneficiaireChat = unBeneficiaireChat()

      // When
      await setReadByConseiller(beneficiaireChat.chatId)

      // Then
      expect(updateChat).toHaveBeenCalledWith(beneficiaireChat.chatId, {
        seenByConseiller: true,
        lastConseillerReading: now,
      })
    })
  })

  describe('.toggleFlag', () => {
    it('updates chat in firebase', async () => {
      // Given
      const beneficiaireChat = unBeneficiaireChat()

      // When
      await toggleFlag(beneficiaireChat.chatId, false)

      // Then
      expect(updateChat).toHaveBeenCalledWith(beneficiaireChat.chatId, {
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
          fn({
            'beneficiaire-1': unChat(),
            'beneficiaire-2': unChat(),
            'beneficiaire-3': unChat(),
          })
      )

      // When
      await observeConseillerChats(
        cleChiffrement,
        [
          { ...uneBaseBeneficiaire({ id: 'beneficiaire-1' }) },
          { ...uneBaseBeneficiaire({ id: 'beneficiaire-2' }) },
          { ...uneBaseBeneficiaire({ id: 'beneficiaire-3' }) },
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

    it('calls provided callback with new beneficiaireChat built from found chat', async () => {
      // Then
      expect(updateChats).toHaveBeenCalledWith([
        { ...uneBaseBeneficiaire({ id: 'beneficiaire-1' }), ...unChat() },
        { ...uneBaseBeneficiaire({ id: 'beneficiaire-2' }), ...unChat() },
        { ...uneBaseBeneficiaire({ id: 'beneficiaire-3' }), ...unChat() },
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
      messagesGroupesParJour: ByDay<Message>
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
      observeDerniersMessages(
        idChat,
        cleChiffrement,
        { pages: 2, taillePage: 10 },
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
      const idsJeunes: string[] = [
        'beneficiaire-1',
        'beneficiaire-2',
        'beneficiaire-3',
      ]
      ;(getChatsDuConseiller as jest.Mock).mockResolvedValue({
        'beneficiaire-1': unChat({ chatId: `chat-beneficiaire-1` }),
        'beneficiaire-2': unChat({ chatId: `chat-beneficiaire-2` }),
        'beneficiaire-3': unChat({ chatId: `chat-beneficiaire-3` }),
      })

      //When
      const actual = await countMessagesNotRead(idsJeunes)

      //Then
      expect(getChatsDuConseiller).toHaveBeenCalledWith('idConseiller')
      expect(actual).toEqual({
        ['beneficiaire-1']: 1,
        ['beneficiaire-2']: 1,
        ['beneficiaire-3']: 1,
      })
    })

    it("quand un jeune n'a pas de chat, retourne 0", async () => {
      //Given
      ;(getChatsDuConseiller as jest.Mock).mockResolvedValue({})

      //When
      const actual = await countMessagesNotRead([
        'beneficiaire-1',
        'beneficiaire-2',
        'beneficiaire-3',
      ])

      //Then
      expect(actual).toEqual({
        'beneficiaire-1': 0,
        'beneficiaire-2': 0,
        'beneficiaire-3': 0,
      })
    })
  })

  describe('.sendNouveauMessage', () => {
    let beneficiaireChat: BeneficiaireEtChat
    let newMessage: string
    const now = DateTime.now()
    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      beneficiaireChat = unBeneficiaireChat()
      newMessage = 'nouveauMessage'
      // When
    })

    describe('sans piece jointe', () => {
      beforeEach(async () => {
        await sendNouveauMessage({
          beneficiaireChat,
          newMessage,
          cleChiffrement,
        })
      })
      it('adds a new message to firebase', async () => {
        // Then
        expect(addMessage).toHaveBeenCalledWith(beneficiaireChat.chatId, {
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
        expect(updateChat).toHaveBeenCalledWith(beneficiaireChat.chatId, {
          lastMessageContent: `Encrypted: ${newMessage}`,
          lastMessageIv: `IV: ${newMessage}`,
          lastMessageSentAt: now,
          lastMessageSentBy: 'conseiller',
          newConseillerMessageCount:
            beneficiaireChat.newConseillerMessageCount + 1,
          seenByConseiller: true,
          lastConseillerReading: now,
        })
      })

      it('notifies of a new message', async () => {
        // Then
        expect(apiPost).toHaveBeenCalledWith(
          `/conseillers/idConseiller/jeunes/notify-messages`,
          { idsJeunes: [beneficiaireChat.id] },
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
              structure: 'MILO',
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
          beneficiaireChat,
          newMessage,
          infoPieceJointe: { id: 'fake-id', nom: 'fake-nom' },
          cleChiffrement,
        })
      })

      it('adds a new message to firebase', async () => {
        // Then
        expect(addMessage).toHaveBeenCalledWith(beneficiaireChat.chatId, {
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
              structure: 'MILO',
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
      idsBeneficiaires = desItemsBeneficiaires().map(({ id }) => id)
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

  describe('.sendNouveauMessageImportant', () => {
    let newMessage: string
    let idConseiller: string
    const now = DateTime.now()
    const demain = DateTime.now().plus({ day: 1 })
    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      newMessage = 'nouveauMessageImportant'
      idConseiller = 'id-conseiller'
      // When
    })

    it('déclare un nouveau message important dans firebase', async () => {
      //When
      await sendNouveauMessageImportant({
        cleChiffrement,
        idConseiller,
        newMessage,
        dateDebut: now,
        dateFin: demain,
      })

      // Then
      expect(addMessageImportant).toHaveBeenCalledWith({
        idConseiller: 'id-conseiller',
        message: {
          encryptedText: `Encrypted: ${newMessage}`,
          iv: `IV: ${newMessage}`,
        },
        dateDebut: now,
        dateFin: demain,
      })
    })
  })

  describe('.desactiverMessageImportant', () => {
    const idMessageImportant = 'id-message-important'

    it('supprime le message important dans firebase', async () => {
      //When
      await desactiverMessageImportant(idMessageImportant)

      // Then
      expect(deleteMessageImportant).toHaveBeenCalledWith(idMessageImportant)
    })
  })

  describe('.getMessageImportant', () => {
    it('récupère le messsage important depuis firebase', async () => {
      //Given
      const messageSnapshot: FirebaseMessageImportant & { id: string } = {
        id: 'document-id',
        idConseiller: 'idConseiller',
        iv: 'iv-message',
        content: 'contenu-message',
        dateDebut: Timestamp.fromMillis(
          DateTime.fromISO('2024-04-25').toMillis()
        ),
        dateFin: Timestamp.fromMillis(
          DateTime.fromISO('2024-04-26').toMillis()
        ),
      }

      const expectedMessage = {
        id: 'document-id',
        message: 'Decrypted: contenu-message',
        dateDebut: '2024-04-25',
        dateFin: '2024-04-26',
      }

      ;(findMessageImportant as jest.Mock).mockResolvedValue(messageSnapshot)

      //When
      const message = await getMessageImportant('cleChiffrement')

      //Then
      expect(findMessageImportant).toHaveBeenCalledWith('idConseiller')
      expect(message).toEqual(expectedMessage)
    })
  })

  describe('.partagerOffre', () => {
    let destinataires: BeneficiaireFromListe[]
    let idsJeunes: string[]
    let chats: { [idJeune: string]: Chat }
    let newMessageGroupe: string
    let offre: DetailOffreEmploi
    const now = DateTime.now()
    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      destinataires = desItemsBeneficiaires()
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
            structure: 'MILO',
            id: 'idConseiller',
          },
        },
        accessToken
      )
    })
  })

  describe('.envoyerCommentaireAction', () => {
    const chat = unChat()
    const newMessage =
      'Peux-tu me détailler quelles recherches tu as faites stp ?'
    const action = uneAction()
    const now = DateTime.now()
    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      ;(getChatDuBeneficiaire as jest.Mock).mockResolvedValue(chat)

      await commenterAction({
        action,
        idDestinataire: 'idBeneficiaire',
        message: newMessage,
        cleChiffrement,
      })
    })

    it('récupère le chat du bénéficiaire avec son conseiller', () => {
      // Then
      expect(getChatDuBeneficiaire).toHaveBeenCalledWith(
        'idConseiller',
        'idBeneficiaire'
      )
    })

    it('ajoute un nouveau message à firebase', () => {
      // Then

      expect(addMessage).toHaveBeenCalledWith(chat.chatId, {
        action,
        idConseiller: 'idConseiller',
        message: {
          encryptedText: `Encrypted: ${newMessage}`,
          iv: `IV: ${newMessage}`,
        },
        date: now,
      })
    })

    it('met à jour le chat dans firebase', () => {
      // Then
      expect(updateChat).toHaveBeenCalledWith(chat.chatId, {
        lastMessageContent: `Encrypted: ${newMessage}`,
        lastMessageIv: `IV: ${newMessage}`,
        lastMessageSentAt: now,
        lastMessageSentBy: 'conseiller',
        newConseillerMessageCount: chat.newConseillerMessageCount + 1,
      })
    })

    it('notifie envoi de message', () => {
      // Then
      expect(apiPost).toHaveBeenCalledWith(
        `/conseillers/idConseiller/jeunes/notify-messages`,
        { idsJeunes: ['idBeneficiaire'] },
        accessToken
      )
    })

    it('tracks partage d’offre', () => {
      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/evenements',
        {
          type: 'MESSAGE_ACTION_COMMENTEE',
          emetteur: {
            type: 'CONSEILLER',
            structure: 'MILO',
            id: 'idConseiller',
          },
        },
        accessToken
      )
    })
  })

  describe('.supprimerMessage', () => {
    const beneficiaireChat = unBeneficiaireChat()
    const message = unMessage()
    const now = DateTime.now()
    beforeEach(async () => {
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
    })

    it('marque le message comme supprimé', async () => {
      // When
      await supprimerMessage(beneficiaireChat.chatId, message, cleChiffrement)

      // Then
      expect(updateMessage).toHaveBeenCalledWith(
        beneficiaireChat.chatId,
        message.id,
        {
          message: 'Encrypted: (message supprimé)',
          date: now,
          oldMessage: `Encrypted: content`,
          status: 'deleted',
        }
      )
    })

    it('met à jour la conversation si le dernier message est supprimé', async () => {
      //Given
      ;(getIdLastMessage as jest.Mock).mockResolvedValue(message.id)

      // When
      await supprimerMessage(beneficiaireChat.chatId, message, cleChiffrement)

      // Then
      expect(updateChat).toHaveBeenCalledWith(beneficiaireChat.chatId, {
        lastMessageContent: 'Encrypted: (message supprimé)',
      })
    })

    it('track la suppression du message', async () => {
      // When
      await supprimerMessage(beneficiaireChat.chatId, message, cleChiffrement)

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/evenements',
        {
          type: 'MESSAGE_SUPPRIME',
          emetteur: {
            type: 'CONSEILLER',
            structure: 'MILO',
            id: 'idConseiller',
          },
        },
        accessToken
      )
    })
  })

  describe('.modifierMessage', () => {
    const beneficiaireChat = unBeneficiaireChat()
    const message = unMessage()
    const now = DateTime.now()
    beforeEach(async () => {
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
    })

    it('modifie le message', async () => {
      // When
      await modifierMessage(
        beneficiaireChat.chatId,
        message,
        'nouveau contenu',
        cleChiffrement
      )

      // Then
      expect(updateMessage).toHaveBeenCalledWith(
        beneficiaireChat.chatId,
        message.id,
        {
          message: 'Encrypted: nouveau contenu',
          date: now,
          oldMessage: `Encrypted: content`,
          status: 'edited',
        }
      )
    })

    it('met à jour la conversation si le dernier message est modifié', async () => {
      //Given
      ;(getIdLastMessage as jest.Mock).mockResolvedValue(message.id)

      // When
      await modifierMessage(
        beneficiaireChat.chatId,
        message,
        'nouveau contenu',
        cleChiffrement
      )

      // Then
      expect(updateChat).toHaveBeenCalledWith(beneficiaireChat.chatId, {
        lastMessageContent: 'Encrypted: nouveau contenu',
      })
    })

    it('track la modification du message', async () => {
      // Given
      await modifierMessage(
        beneficiaireChat.chatId,
        message,
        'nouveau contenu',
        cleChiffrement
      )

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/evenements',
        {
          type: 'MESSAGE_MODIFIE',
          emetteur: {
            type: 'CONSEILLER',
            structure: 'MILO',
            id: 'idConseiller',
          },
        },
        accessToken
      )
    })
  })

  describe('.rechercherMessagesConversation', () => {
    let beneficiaireChat: BeneficiaireEtChat
    let recherche: string
    const now = DateTime.fromISO('2024-04-24')

    beforeEach(() => {
      beneficiaireChat = unBeneficiaireChat()
      recherche = 'tchoupi'

      jest.spyOn(DateTime, 'now').mockReturnValue(now)

      const resultatRecherche = [
        {
          message: unMessage({
            content: 'tchoupi',
            infoPiecesJointes: [
              { id: 'id-pj', nom: 'tchoupi.jpg', statut: 'valide' },
            ],
          }),
          matches: [{ match: [0, 1], key: 'content' }],
        },
      ]
      ;(rechercherMessages as jest.Mock).mockResolvedValue(resultatRecherche)
    })

    it('recherche un mot clé', async () => {
      //When
      await rechercherMessagesConversation(
        beneficiaireChat.chatId,
        recherche,
        cleChiffrement
      )

      //Then
      expect(rechercherMessages).toHaveBeenCalledWith(
        accessToken,
        beneficiaireChat.chatId,
        recherche
      )
    })

    it('retourne les résultats', async () => {
      //Given
      const resultatDechiffre = {
        message: unMessage({
          content: 'Decrypted: tchoupi',
          infoPiecesJointes: [
            { id: 'id-pj', nom: 'Decrypted: tchoupi.jpg', statut: 'valide' },
          ],
        }),
        matches: [{ match: [0, 1], key: 'content' }],
      }

      //When
      const resultats = await rechercherMessagesConversation(
        beneficiaireChat.chatId,
        recherche,
        cleChiffrement
      )

      //Then
      expect(resultats).toEqual([resultatDechiffre])
    })
  })

  describe('.getMessagesDuJour', () => {
    it('recupere tous les messages du jour d’une conversation', async () => {
      // Given
      const message = unMessage()
      ;(getMessagesPeriode as jest.Mock).mockResolvedValue([
        { ...message, content: 'contenu du message' },
      ])

      // When
      const messages = await getMessagesDuMemeJour(
        'id-chat',
        message,
        'cle-chiffrement'
      )

      // Then
      expect(getMessagesPeriode).toHaveBeenCalledWith(
        'id-chat',
        message.creationDate.startOf('day'),
        message.creationDate.endOf('day')
      )
      expect(messages).toEqual([
        { ...message, content: 'Decrypted: contenu du message' },
      ])
    })
  })
})
