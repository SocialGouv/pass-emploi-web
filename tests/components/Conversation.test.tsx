import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import React from 'react'

import Conversation from 'components/chat/Conversation'
import { desConseillersJeune, unJeuneChat } from 'fixtures/jeune'
import { desMessagesParJour, unMessage } from 'fixtures/message'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { ByDay, Message } from 'interfaces/message'
import { deleteFichier, uploadFichier } from 'services/fichiers.service'
import {
  observeDerniersMessages,
  observeJeuneReadingDate,
  sendNouveauMessage,
  setReadByConseiller,
} from 'services/messages.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { toShortDate } from 'utils/date'

jest.mock('services/messages.service')
jest.mock('services/fichiers.service')

describe('<Conversation />', () => {
  let jeuneChat: JeuneChat

  let conseillersJeunes: ConseillerHistorique[]
  let rerender: (children: JSX.Element) => void
  const messagesParJour = desMessagesParJour()
  let unsubscribe: () => void
  beforeEach(async () => {
    jeuneChat = unJeuneChat()
    conseillersJeunes = desConseillersJeune()
    unsubscribe = jest.fn()
    ;(observeJeuneReadingDate as jest.Mock).mockImplementation(
      (idChat: string, fn: (date: DateTime) => void) => {
        fn(DateTime.now())
        return () => {}
      }
    )
    ;(observeDerniersMessages as jest.Mock).mockImplementation(
      (_idChat, _cle, pages, fn: (messages: ByDay<Message>[]) => void) => {
        const messagesPagines = messagesParJour.map((jour) => ({ ...jour }))
        messagesPagines[0].messages = [
          unMessage({ id: 'message-page-' + Math.min(pages, 2) }),
          ...messagesPagines[0].messages,
        ]
        fn(messagesPagines)
        return unsubscribe
      }
    )
    ;(sendNouveauMessage as jest.Mock).mockResolvedValue(undefined)
    ;(uploadFichier as jest.Mock).mockResolvedValue({
      id: 'id-fichier',
      nom: 'imageupload.png',
    })
    ;(deleteFichier as jest.Mock).mockResolvedValue(undefined)

    await act(async () => {
      const renderResult = renderWithContexts(
        <Conversation
          jeuneChat={jeuneChat}
          conseillers={conseillersJeunes}
          onBack={jest.fn()}
        />
      )
      rerender = renderResult.rerender
    })
  })

  it('s’abonne au message de la conversation', async () => {
    // Then
    expect(observeDerniersMessages).toHaveBeenCalledWith(
      jeuneChat.chatId,
      'cleChiffrement',
      1,
      expect.any(Function)
    )
  })

  it('permet de charger des messages plus anciens', async () => {
    // When
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Voir messages plus anciens',
      })
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Voir messages plus anciens',
      })
    )

    // Then
    expect(unsubscribe).toHaveBeenCalledTimes(2)
    expect(observeDerniersMessages).toHaveBeenCalledWith(
      jeuneChat.chatId,
      'cleChiffrement',
      2,
      expect.any(Function)
    )

    expect(observeDerniersMessages).toHaveBeenCalledWith(
      jeuneChat.chatId,
      'cleChiffrement',
      3,
      expect.any(Function)
    )
  })

  it('informe qu’il n’y a pas de messages plus anciens', async () => {
    // When
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Voir messages plus anciens',
      })
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Voir messages plus anciens',
      })
    )

    // Then
    expect(screen.getByText('Aucun message plus ancien')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Voir messages plus anciens' })
    ).not.toBeInTheDocument()
  })

  it('marque la conversation en "lu"', async () => {
    // Then
    expect(setReadByConseiller).toHaveBeenCalledWith(jeuneChat.chatId)
  })

  it('s’abonne à "jeuneReading"', async () => {
    // Then
    expect(observeJeuneReadingDate).toHaveBeenCalledWith(
      jeuneChat.chatId,
      expect.any(Function)
    )
  })

  it('supprime les inputs qui ont commencé a étre saisis (fichier et texte) quand il est rechanger', async () => {
    // Given
    const file = new File(['un contenu'], 'imageupload.png', {
      type: 'image/png',
    })
    const fileInput = screen.getByLabelText('Ajouter une pièce jointe')
    const messageInput = screen.getByPlaceholderText(
      'Écrivez votre message ici...'
    )
    await userEvent.upload(fileInput, file, { applyAccept: false })
    await userEvent.type(messageInput, 'TOTO')

    const newJeuneChat = unJeuneChat({ chatId: 'new-jeune-chat' })
    rerender(
      <Conversation
        jeuneChat={newJeuneChat}
        conseillers={conseillersJeunes}
        onBack={jest.fn()}
      />
    )
    // Then
    expect(() => screen.getByText('imageupload.png')).toThrow()
    expect(screen.getByLabelText('Message à envoyer')).toHaveValue('')
    expect(
      screen.getByRole('button', { name: 'Envoyer le message' })
    ).toHaveAttribute('disabled')
  })

  const cases = messagesParJour.map((messagesDUnJour) => [messagesDUnJour])
  describe.each(cases)('Pour chaque jour avec message', (messagesDUnJour) => {
    it(`affiche la date (${toShortDate(messagesDUnJour.date)})`, () => {
      // Then
      expect(
        screen.getByText(`Le ${toShortDate(messagesDUnJour.date)}`)
      ).toBeInTheDocument()
    })

    const casesMessages: Message[] = []
    messagesDUnJour.messages.map((message) => casesMessages.push(message))

    for (let messageN = 0; messageN < casesMessages.length - 1; messageN++) {
      it(`affiche le contenu du message`, () => {
        // Then
        expect(
          screen.getByText(casesMessages[messageN].content)
        ).toBeInTheDocument()
      })
    }

    it.each(casesMessages)(
      `affiche le nom complet du conseiller`,
      (message) => {
        // Then
        const messageItem = screen.getByTestId(message.id)
        const conseiller = conseillersJeunes.find(
          (conseiller) => conseiller.id === message.conseillerId
        )
        expect(
          within(messageItem).getByText(
            `${conseiller?.prenom} ${conseiller?.nom}`,
            { exact: false }
          )
        ).toBeInTheDocument()
      }
    )
  })

  it('indique la présence d’un lien externe dans le message s’il en a un', () => {
    // Then
    expect(
      screen.getByRole('link', {
        name: 'https://www.pass-emploi.com/ (nouvelle fenêtre)',
      })
    ).toBeInTheDocument()
  })

  describe('au clic ouvre une boîte de dialogue de confirmation', () => {
    it('continue et redirige vers un lien externe', async () => {
      // Given
      const modaleConfirmation = jest
        .spyOn(window, 'confirm')
        .mockImplementation(() => {
          return true
        })
      const open = jest.spyOn(window, 'open').mockImplementation()
      const lienRedirection = screen.getByText(/https/)

      // When
      await userEvent.click(lienRedirection)

      // Then
      expect(modaleConfirmation).toHaveBeenCalledTimes(1)
      expect(open).toHaveBeenCalledWith(
        'https://www.pass-emploi.com/',
        '_blank',
        'noopener, noreferrer'
      )
    })

    it('annule et ne redirige pas vers un lien externe', async () => {
      // Given
      const modaleConfirmation = jest
        .spyOn(window, 'confirm')
        .mockImplementation(() => {
          return false
        })
      const open = jest.spyOn(window, 'open').mockImplementation()
      const lienRedirection = screen.getByText(/https/)

      // When
      await userEvent.click(lienRedirection)

      // Then
      expect(modaleConfirmation).toHaveBeenCalledTimes(1)
      expect(open).toHaveBeenCalledTimes(0)
    })
  })

  describe('quand on envoie un message', () => {
    let messageInput: HTMLInputElement
    beforeEach(() => {
      messageInput = screen.getByPlaceholderText('Écrivez votre message ici...')
    })

    it('marque la conversation en "lu"', async () => {
      // When
      await act(() => {
        messageInput.focus()
      })

      // Then
      expect(setReadByConseiller).toHaveBeenCalledWith(jeuneChat.chatId)
    })

    it('envoie un nouveau message', async () => {
      // Given
      const newMessage = 'Ceci est un nouveau message du conseiller'
      const submitButton = screen.getByRole('button', { name: /Envoyer/ })

      // When
      await userEvent.type(messageInput, newMessage)
      await userEvent.click(submitButton)

      // Then
      expect(sendNouveauMessage).toHaveBeenCalledWith({
        jeuneChat: jeuneChat,
        newMessage: newMessage,
        cleChiffrement: 'cleChiffrement',
      })
    })
  })

  describe('quand on crée un message avec une pièce jointe', () => {
    let fileInput: HTMLInputElement
    let file: File
    let submitButton: HTMLButtonElement
    beforeEach(async () => {
      // Given
      file = new File(['un contenu'], 'imageupload.png')

      fileInput = screen.getByLabelText('Ajouter une pièce jointe')
      submitButton = screen.getByRole('button', { name: /Envoyer/ })

      // When
      await userEvent.upload(fileInput, file, { applyAccept: false })
    })

    it('téléverse un fichier et affiche son nom en cas de succès', async () => {
      // Given
      // Then
      expect(screen.getByText('imageupload.png')).toBeInTheDocument()
      expect(
        screen.getByLabelText('Supprimer la pièce jointe imageupload.png')
      ).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('disabled', '')
      expect(uploadFichier).toHaveBeenCalledWith(['jeune-1'], [], file)
    })

    it('on peut supprimer la pièce jointe ', async () => {
      // Given
      const boutonDeleteFichier = screen.getByLabelText(
        'Supprimer la pièce jointe imageupload.png'
      )
      // When
      await userEvent.click(boutonDeleteFichier)
      // Then
      expect(deleteFichier).toHaveBeenCalledWith('id-fichier')
      expect(() => screen.getByText('imageupload.png')).toThrow()
    })

    it('création d’un message avec une pièce jointe', async () => {
      await userEvent.click(submitButton)

      // Then
      expect(sendNouveauMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          infoPieceJointe: { id: 'id-fichier', nom: 'imageupload.png' },
        })
      )
    })
  })

  describe("quand on reçoit un message de partage d'offre", () => {
    let message: HTMLElement
    beforeEach(() => {
      message = screen.getByText('Decrypted: Je vous partage cette offre')
        .parentElement!
    })

    it("affiche le titre de l'offre", async () => {
      // Then
      expect(
        within(message).getByText((content, element) => {
          return (
            element!.tagName.toLowerCase() === 'p' &&
            content.startsWith('Une offre')
          )
        })
      ).toBeInTheDocument()
    })

    it("affiche le lien de l'offre", async () => {
      // Then
      expect(
        within(message).getByRole('link', {
          name: /Voir l’offre/,
        })
      ).toHaveAttribute('href', '/offres/emploi/id-offre')
    })
  })

  describe("quand on reçoit un message de partage d'événement", () => {
    let message: HTMLElement
    beforeEach(() => {
      message = screen.getByText('Decrypted: Je vous partage cet événement')
        .parentElement!
    })

    it("affiche le titre de l'événement", async () => {
      // Then
      expect(getByDescriptionTerm('Titre de l’événement :')).toHaveTextContent(
        'Un atelier'
      )
    })

    it("affiche la date de l'événement", async () => {
      // Then
      expect(getByDescriptionTerm('Date de l’événement :')).toHaveTextContent(
        'le 22/12/2021'
      )
    })

    it("affiche le lien de l'événement", async () => {
      // Then
      expect(
        within(message).getByRole('link', {
          name: 'Voir l’événement',
        })
      ).toHaveAttribute('href', '/mes-jeunes/edition-rdv?idRdv=id-evenement')
    })
  })

  describe("quand on reçoit un message de partage d'événement emploi", () => {
    let message: HTMLElement
    beforeEach(() => {
      message = screen.getByText(
        'Decrypted: Bonjour, je vous partage un événement afin d’avoir votre avis'
      ).parentElement!
    })

    it("affiche le titre de l'événement emploi", async () => {
      // Then
      expect(
        getByDescriptionTerm('Titre de l’événement emploi :')
      ).toHaveTextContent('Un événement emploi')
    })

    it("affiche le lien de l'événement emploi", async () => {
      // Then
      expect(
        within(message).getByRole('link', {
          name: 'https://www.lala.com (nouvelle fenêtre)',
        })
      ).toHaveAttribute('href', 'https://www.lala.com')
    })
  })
})
