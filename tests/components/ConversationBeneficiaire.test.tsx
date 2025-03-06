import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import React, { ReactElement } from 'react'

import ConversationBeneficiaire from 'components/chat/ConversationBeneficiaire'
import {
  desConseillersBeneficiaire,
  unBeneficiaireChat,
} from 'fixtures/beneficiaire'
import { desMessagesParJour, unMessage } from 'fixtures/message'
import { ConseillerHistorique } from 'interfaces/beneficiaire'
import { ByDay, fromConseiller, Message } from 'interfaces/message'
import { deleteFichier, uploadFichier } from 'services/fichiers.service'
import {
  getChatCredentials,
  modifierMessage,
  observeDerniersMessages,
  observeJeuneReadingDate,
  rechercherMessagesConversation,
  sendNouveauMessage,
  setReadByConseiller,
  supprimerMessage,
} from 'services/messages.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { toShortDate } from 'utils/date'

jest.mock('services/messages.service')
jest.mock('services/fichiers.service')

describe('<ConversationBeneficiaire />', () => {
  const beneficiaireChat = unBeneficiaireChat()

  let conseillersBeneficiaires: ConseillerHistorique[]
  let rerender: (children: ReactElement) => void
  const messagesParJour = desMessagesParJour()
  let unsubscribe: () => void
  beforeEach(async () => {
    conseillersBeneficiaires = desConseillersBeneficiaire()
    unsubscribe = jest.fn()
    ;(getChatCredentials as jest.Mock).mockResolvedValue({
      token: 'tokenFirebase',
      cleChiffrement: 'cleChiffrement',
    })
    ;(observeJeuneReadingDate as jest.Mock).mockImplementation(
      (_: string, fn: (date: DateTime) => void) => {
        fn(DateTime.now())
        return () => {}
      }
    )
    ;(observeDerniersMessages as jest.Mock).mockImplementation(
      (_idChat, _cle, pages, fn: (messages: ByDay<Message>) => void) => {
        const messagesPagines = messagesParJour.days.map((jour) => ({
          ...jour,
        }))
        messagesPagines[0].messages = [
          unMessage({ id: 'message-page-' + Math.min(pages, 2) }),
          ...messagesPagines[0].messages,
        ]
        fn({ length: 10, days: messagesPagines })
        return unsubscribe
      }
    )
    ;(sendNouveauMessage as jest.Mock).mockResolvedValue(undefined)
    ;(uploadFichier as jest.Mock).mockResolvedValue({
      id: 'id-fichier',
      nom: 'imageupload.png',
    })
    ;(deleteFichier as jest.Mock).mockResolvedValue(undefined)

    const renderResult = await renderWithContexts(
      <ConversationBeneficiaire
        beneficiaireChat={beneficiaireChat}
        conseillers={conseillersBeneficiaires}
        onBack={jest.fn()}
        shouldFocusOnFirstRender={false}
      />
    )
    rerender = renderResult.rerender
  })

  it('s’abonne au message de la conversation', async () => {
    // Then
    expect(observeDerniersMessages).toHaveBeenCalledWith(
      beneficiaireChat,
      'cleChiffrement',
      { pages: 1, taillePage: 10 },
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

    // Then
    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect(observeDerniersMessages).toHaveBeenCalledWith(
      beneficiaireChat,
      'cleChiffrement',
      { pages: 2, taillePage: 10 },
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

    // Then
    expect(screen.getByText('Aucun message plus ancien')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Voir messages plus anciens' })
    ).not.toBeInTheDocument()
  })

  it('marque la conversation en "lu"', async () => {
    // Then
    expect(setReadByConseiller).toHaveBeenCalledWith(beneficiaireChat.chatId)
  })

  it('s’abonne à "jeuneReading"', async () => {
    // Then
    expect(observeJeuneReadingDate).toHaveBeenCalledWith(
      beneficiaireChat.chatId,
      expect.any(Function)
    )
  })

  it('supprime les inputs qui ont commencé a étre saisis (fichier et texte) quand la conversation est actualisée', async () => {
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

    const newBeneficiaireChat = unBeneficiaireChat({ chatId: 'new-jeune-chat' })
    rerender(
      <ConversationBeneficiaire
        beneficiaireChat={newBeneficiaireChat}
        conseillers={conseillersBeneficiaires}
        onBack={jest.fn()}
        shouldFocusOnFirstRender={false}
      />
    )
    // Then
    expect(() => screen.getByText('imageupload.png')).toThrow()
    expect(screen.getByLabelText('Message à envoyer')).toHaveValue('')
    expect(
      screen.getByRole('button', { name: 'Envoyer le message' })
    ).toHaveAttribute('disabled')
  })

  const cases = messagesParJour.days.map((messagesDUnJour) => [messagesDUnJour])
  describe.each(cases)('Pour chaque jour avec message', (messagesDUnJour) => {
    it(`affiche la date (${toShortDate(messagesDUnJour.date)})`, () => {
      // Then
      expect(
        screen.getByText(`Le ${toShortDate(messagesDUnJour.date)}`)
      ).toBeInTheDocument()
    })

    const casesMessages = messagesDUnJour.messages.map((message) => [message])
    describe.each(casesMessages)('pour chaque message', (message) => {
      it(`affiche le contenu du message ${message.id}`, () => {
        // Then
        expect(
          screen.getByText(
            (_, element) =>
              message.content ===
              element?.textContent?.trim().replaceAll(/\s+/g, ' ')
          )
        ).toBeInTheDocument()
      })

      it('affiche le nom complet de l’émetteur', () => {
        // Then
        const messageItem = screen.getByTestId(message.id)
        if (fromConseiller(message)) {
          const conseiller = conseillersBeneficiaires.find(
            (conseiller) => conseiller.id === message.conseillerId
          )
          expect(
            within(messageItem).getByText(
              `${conseiller!.prenom} ${conseiller!.nom}`,
              { exact: false }
            )
          ).toBeInTheDocument()
        } else {
          expect(
            within(messageItem).getByText(
              `${beneficiaireChat.prenom} ${beneficiaireChat.nom}`,
              { exact: false }
            )
          ).toBeInTheDocument()
        }
      })
    })
  })

  it('permet de supprimer un message', async () => {
    // When
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Voir les actions possibles pour votre message du 22 décembre 2021 à 0 heure 0',
      })
    )
    await userEvent.click(
      screen.getByRole('button', { name: /Supprimer le message/ })
    )

    // Then
    expect(supprimerMessage).toHaveBeenCalledWith(
      'idChat',
      messagesParJour.days[0].messages[0],
      'cleChiffrement'
    )

    // When
    await userEvent.click(
      screen
        .getAllByRole('button', {
          name: /Voir les actions possibles pour votre message/,
        })
        .at(-1)!
    )
    await userEvent.click(
      screen.getByRole('button', { name: /Supprimer le message/ })
    )

    // Then
    expect(supprimerMessage).toHaveBeenCalledWith(
      'idChat',
      messagesParJour.days.at(-2)!.messages.at(0)!,
      'cleChiffrement'
    )
  })

  describe('modification de message', () => {
    let input: HTMLInputElement
    const dernierMessageDuConseiller = messagesParJour.days
      .at(-2)!
      .messages.at(0)!
    beforeEach(async () => {
      // Given
      input = screen.getByRole('textbox')
      await userEvent.click(
        screen
          .getAllByRole('button', {
            name: /Voir les actions possibles pour votre message/,
          })
          .at(-1)!
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Modifier le message/ })
      )
    })

    it('prépare le message à modifier dans la zone de saisie', async () => {
      // Then
      expect(screen.getByText('Modifier le message')).toBeInTheDocument()
      expect(input).toHaveValue(dernierMessageDuConseiller.content)
      expect(input).toHaveFocus()
    })

    it('permet de modifier un message', async () => {
      // Given
      await userEvent.type(input, 'nouveau contenu')

      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Envoyer la modification du message',
        })
      )

      // Then
      expect(modifierMessage).toHaveBeenCalledWith(
        'idChat',
        dernierMessageDuConseiller,
        dernierMessageDuConseiller.content + 'nouveau contenu',
        'cleChiffrement'
      )
      expect(screen.queryByText('Modifier le message')).not.toBeInTheDocument()
      expect(input).toHaveValue('')
    })

    it('permet d’annuler la modification d’un message', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Annuler la modification du message',
        })
      )

      // Then
      expect(screen.queryByText('Modifier le message')).not.toBeInTheDocument()
      expect(input).toHaveValue('')
    })
  })

  describe('lien externe', () => {
    it('indique la présence d’un lien externe dans le message s’il en a un', () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: 'https://www.pass-emploi.com/ (nouvelle fenêtre)',
        })
      ).toBeInTheDocument()
    })

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
      await act(async () => {
        messageInput.focus()
      })

      // Then
      expect(setReadByConseiller).toHaveBeenCalledWith(beneficiaireChat.chatId)
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
        beneficiaireChat: beneficiaireChat,
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
      expect(uploadFichier).toHaveBeenCalledWith(['beneficiaire-1'], [], file)
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
      message = screen.getByText(
        'Decrypted: Je vous partage cette offre'
      ).parentElement!
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
      message = screen.getByText(
        'Decrypted: Je vous partage cet événement'
      ).parentElement!
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
          name: 'Voir l’événement Un atelier (nouvelle fenêtre)',
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
          name: 'Voir l’événement emploi Un événement emploi (nouvelle fenêtre)',
        })
      ).toHaveAttribute('href', 'https://www.lala.com')
    })
  })

  describe("quand on reçoit un message de partage d'une session milo", () => {
    let message: HTMLElement
    beforeEach(() => {
      message = screen.getByText(
        'Decrypted: Bonjour, je vous partage une session milo afin d’avoir votre avis'
      ).parentElement!
    })

    it('affiche le titre de la session', async () => {
      // Then
      expect(getByDescriptionTerm('Titre de la session :')).toHaveTextContent(
        'Une session milo'
      )
    })

    it('affiche le lien de la session', async () => {
      // Then
      expect(
        within(message).getByRole('link', {
          name: 'Voir les détails de la session Une session milo (nouvelle fenêtre)',
        })
      ).toHaveAttribute('href', '/agenda/sessions/id-session-milo')
    })
  })

  describe('permet de rechercher un message', () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Accéder aux actions de votre messagerie',
        })
      )
    })

    it('affiche un bouton pour rechercher un message', async () => {
      expect(
        screen.getByRole('button', {
          name: 'Rechercher un message',
        })
      ).toBeInTheDocument()
    })

    describe('au clic sur le bouton', () => {
      it('affiche un formulaire de recherche', async () => {
        //Given
        const rechercheBtn = screen.getByRole('button', {
          name: 'Rechercher un message',
        })

        //When
        await userEvent.click(rechercheBtn)

        //Then
        expect(
          screen.getByRole('textbox', {
            name: '* Rechercher dans la conversation',
          })
        ).toBeInTheDocument()
      })
    })

    describe('quand on remplit le formulaire', () => {
      let formInput: HTMLInputElement
      let submitBtn: HTMLButtonElement

      beforeEach(async () => {
        const rechercheBtn = screen.getByRole('button', {
          name: 'Rechercher un message',
        })
        await userEvent.click(rechercheBtn)

        formInput = screen.getByRole('textbox', {
          name: '* Rechercher dans la conversation',
        })
        submitBtn = screen.getByRole('button', {
          name: 'Rechercher des messages',
        })
      })

      it('recherche un mot-clé', async () => {
        //Given
        const formInput = screen.getByRole('textbox', {
          name: '* Rechercher dans la conversation',
        })

        const submitBtn = screen.getByRole('button', {
          name: 'Rechercher des messages',
        })

        //When
        await userEvent.type(formInput, 'tchoupi')
        await userEvent.click(submitBtn)

        //Then
        expect(rechercherMessagesConversation).toHaveBeenCalledWith(
          beneficiaireChat.id,
          'tchoupi',
          'cleChiffrement'
        )
      })

      describe('s’il n’y a pas de résultat', () => {
        it('affiche un état vide', async () => {
          ;(rechercherMessagesConversation as jest.Mock).mockResolvedValue([])

          //When
          await userEvent.type(formInput, 'tchoupi')
          await userEvent.click(submitBtn)

          //Then
          expect(
            screen.getByText('Aucun résultat trouvé pour cette recherche')
          ).toBeInTheDocument()
        })
      })

      describe('s’il y a des résultats', () => {
        beforeEach(async () => {
          const now = DateTime.fromISO('2024-05-24')
          jest.spyOn(DateTime, 'now').mockReturnValue(now)
          ;(rechercherMessagesConversation as jest.Mock).mockResolvedValue([
            {
              message: unMessage({
                content: 'tchoupi vs trotro',
                sentBy: 'conseiller',
                creationDate: DateTime.now().minus({ day: 2 }),
              }),
              matches: [{ match: [0, 6], key: 'content' }],
            },
            {
              message: unMessage({
                content: 'tchoupi est plus beau que l’âne trotro',
                sentBy: 'jeune',
                creationDate: DateTime.now().minus({ day: 1 }),
              }),
              matches: [{ match: [0, 6], key: 'content' }],
            },
          ])

          await userEvent.type(formInput, 'tchoupi')
          await userEvent.click(submitBtn)
        })

        it('affiche le nombre de résultats', async () => {
          expect(screen.getByText('2 résultats trouvés')).toBeInTheDocument()
        })
        it('affiche le contenu des messages', async () => {
          const markedElements = screen.getAllByText('tchoupi', {
            selector: 'mark',
          })
          expect(markedElements.length).toEqual(2)
          expect(screen.getByText('Le 22/05/2024')).toBeInTheDocument()
          expect(screen.getByText('Le 23/05/2024')).toBeInTheDocument()
        })
      })
    })
  })

  it('permet de masquer la messagerie', async () => {
    //Given
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Accéder aux actions de votre messagerie',
      })
    )

    const masquerBtn = screen.getByRole('button', {
      name: 'Masquer la messagerie',
    })

    //When
    await userEvent.click(masquerBtn)

    //Then
    expect(() =>
      screen.getByRole('button', { name: 'Voir messages plus anciens' })
    ).toThrow()
    expect(() =>
      screen.getByRole('button', { name: 'Envoyer le message' })
    ).toThrow()

    expect(
      screen.getByText('Vous avez désactivé l’affichage de la messagerie')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Rendre visible la messagerie' })
    ).toBeInTheDocument()
  })
})
