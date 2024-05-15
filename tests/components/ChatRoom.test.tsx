import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import React from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { BaseJeune, JeuneChat } from 'interfaces/jeune'
import {
  getMessageImportant,
  sendNouveauMessageImportant,
  toggleFlag,
} from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/messages.service')
jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))
jest.mock('components/Modal')

describe('<ChatRoom />', () => {
  const jeunes: BaseJeune[] = desItemsJeunes().map(extractBaseJeune)
  let jeunesChats: JeuneChat[]

  beforeEach(async () => {
    jeunesChats = [
      unJeuneChat({
        ...jeunes[0],
        chatId: `chat-${jeunes[0].id}`,
        seenByConseiller: true,
      }),
      unJeuneChat({
        ...jeunes[1],
        chatId: `chat-${jeunes[1].id}`,
        seenByConseiller: true,
      }),
      unJeuneChat({
        ...jeunes[2],
        chatId: `chat-${jeunes[2].id}`,
        seenByConseiller: false,
      }),
    ]
  })

  describe('quand le conseiller veut configurer un message important', () => {
    let accederConversation: (idJeune: string) => void
    beforeEach(async () => {
      accederConversation = jest.fn()
    })

    it('affiche une pastille si un message est configuré', async () => {
      //Given
      ;(getMessageImportant as jest.Mock).mockResolvedValue({
        message: 'contenu du message',
        dateDebut: DateTime.now().toISODate(),
        dateFin: DateTime.now().plus({ day: 1 }).toISODate(),
        id: 'id-message',
      })

      //When
      await act(async () => {
        renderWithContexts(
          <ChatRoom
            jeunesChats={jeunesChats}
            showMenu={false}
            onAccesConversation={accederConversation}
            onAccesListesDiffusion={() => {}}
            onOuvertureMenu={() => {}}
          />,
          {
            customConseiller: unConseiller({ id: 'id-conseiller' }),
          }
        )
      })

      //Then
      expect(
        screen.getByText('Un message important est déjà configuré')
      ).toBeInTheDocument()
    })

    it('n’affiche pas de pastille s’il n’y a pas de message configuré', async () => {
      //Given
      ;(getMessageImportant as jest.Mock).mockResolvedValue({
        message: 'contenu du message',
        dateDebut: DateTime.now().minus({ day: 2 }).toISODate(),
        dateFin: DateTime.now().minus({ day: 1 }).toISODate(),
        id: 'id-message',
      })

      //When
      await act(async () => {
        renderWithContexts(
          <ChatRoom
            jeunesChats={jeunesChats}
            showMenu={false}
            onAccesConversation={accederConversation}
            onAccesListesDiffusion={() => {}}
            onOuvertureMenu={() => {}}
          />,
          {
            customConseiller: unConseiller({ id: 'id-conseiller' }),
          }
        )
      })

      //Then
      expect(() =>
        screen.getByText('Un message important est déjà configuré')
      ).toThrow()
    })

    it('affiche un bouton pour configurer son message', async () => {
      //When
      await act(async () => {
        renderWithContexts(
          <ChatRoom
            jeunesChats={jeunesChats}
            showMenu={false}
            onAccesConversation={accederConversation}
            onAccesListesDiffusion={() => {}}
            onOuvertureMenu={() => {}}
          />,
          {
            customConseiller: unConseiller({ id: 'id-conseiller' }),
          }
        )
      })

      //Then
      expect(
        screen.getByRole('button', { name: 'Configurer un message important' })
      ).toBeInTheDocument()
    })

    describe('quand le conseiller clique sur le bouton', () => {
      describe('quand le conseiller veut créer un nouveau message important', () => {
        let inputDateDebut: HTMLInputElement
        let inputDateFin: HTMLInputElement
        let inputMessage: HTMLTextAreaElement
        let submitBtn: HTMLButtonElement

        beforeEach(async () => {
          //Given
          ;(getMessageImportant as jest.Mock).mockResolvedValue({
            undefined,
          })

          await act(async () => {
            renderWithContexts(
              <ChatRoom
                jeunesChats={jeunesChats}
                showMenu={false}
                onAccesConversation={accederConversation}
                onAccesListesDiffusion={() => {}}
                onOuvertureMenu={() => {}}
              />,
              {
                customConseiller: unConseiller({ id: 'id-conseiller' }),
              }
            )
          })

          const now = DateTime.fromISO('2024-04-24')
          jest.spyOn(DateTime, 'now').mockReturnValue(now)

          const boutonSettings = screen.getByRole('button', {
            name: 'Configurer un message important',
          })

          await userEvent.click(boutonSettings)
          inputDateDebut = screen.getByLabelText('Date de début')
          inputDateFin = screen.getByLabelText('Date de fin')
          inputMessage = screen.getByLabelText(/Message/)
          submitBtn = screen.getByRole('button', { name: 'Envoyer' })
        })

        it('permet de remplir un formulaire pour ajouter un message important', async () => {
          //Given
          const messageImportant =
            'Actuellement en congés, je ne peux pas vous répondre.'

          //When
          await userEvent.type(inputDateDebut, '2024-04-24')
          await userEvent.type(inputDateFin, '2024-04-30')
          await userEvent.type(inputMessage, messageImportant)
          await userEvent.click(submitBtn)

          //Then
          expect(sendNouveauMessageImportant).toHaveBeenCalledWith({
            cleChiffrement: 'cleChiffrement',
            dateDebut: DateTime.fromISO('2024-04-24'),
            dateFin: DateTime.fromISO('2024-04-30'),
            idConseiller: 'id-conseiller',
            newMessage: messageImportant,
          })
        })

        describe('gère les messages d’erreur', () => {
          it('quand les champs sont vides', async () => {
            //When
            await userEvent.click(inputDateDebut)
            await userEvent.click(inputDateFin)
            await userEvent.click(inputMessage)
            await userEvent.click(submitBtn)

            //Then
            expect(
              screen.getByText(
                'Le champ “Date de début” est vide. Renseignez une date de début.'
              )
            ).toBeInTheDocument()
            expect(
              screen.getByText(
                'Le champ “Date de fin” est vide. Renseignez une date de fin.'
              )
            ).toBeInTheDocument()
            expect(
              screen.getByText(
                'Le champ “Message” est vide. Renseignez un message.'
              )
            ).toBeInTheDocument()
          })
        })
      })

      describe('quand le conseiller veut mettre à jour son message important', () => {
        it('pré-remplit le formulaire', async () => {
          //Given
          ;(getMessageImportant as jest.Mock).mockResolvedValue({
            message: 'contenu-message',
            dateDebut: '2024-04-24',
            dateFin: '2024-04-25',
            id: 'id-document',
          })

          //When
          await act(async () => {
            renderWithContexts(
              <ChatRoom
                jeunesChats={jeunesChats}
                showMenu={false}
                onAccesConversation={accederConversation}
                onAccesListesDiffusion={() => {}}
                onOuvertureMenu={() => {}}
              />,
              {
                customConseiller: unConseiller({ id: 'id-conseiller' }),
              }
            )
          })

          const boutonSettings = screen.getByRole('button', {
            name: 'Configurer un message important',
          })

          await userEvent.click(boutonSettings)

          const inputDateDebut = screen.getByLabelText('Date de début')
          const inputDateFin = screen.getByLabelText('Date de fin')
          const inputMessage = screen.getByLabelText(/Message/)

          //Then
          expect(inputDateDebut).toHaveProperty('defaultValue', '2024-04-24')
          expect(inputDateFin).toHaveProperty('defaultValue', '2024-04-25')
          expect(inputMessage).toHaveProperty('value', 'contenu-message')
        })
      })
    })
  })

  describe('quand le conseiller a des jeunes', () => {
    let accederConversation: (idJeune: string) => void
    beforeEach(async () => {
      accederConversation = jest.fn()
      renderWithContexts(
        <ChatRoom
          jeunesChats={jeunesChats}
          showMenu={false}
          onAccesConversation={accederConversation}
          onAccesListesDiffusion={() => {}}
          onOuvertureMenu={() => {}}
        />,
        {}
      )
    })

    it('affiche les alertes sur petit écran', () => {
      expect(AlerteDisplayer).toHaveBeenCalledWith(
        { hideOnLargeScreen: true },
        {}
      )
    })

    it('devrait avoir le lien message multidestinataires', () => {
      // Then
      expect(
        screen.getByRole('link', { name: 'Message multi-destinataires' })
      ).toBeInTheDocument()
    })

    describe('pour chaque jeune', () => {
      const cases = jeunes.map((jeune) => [jeune])
      it.each(cases)('affiche le chat de %j', (jeune) => {
        // Then
        expect(
          screen.getByText(`${jeune.prenom} ${jeune.nom}`)
        ).toBeInTheDocument()
      })
    })

    describe('quand on sélectionne un jeune', () => {
      it('affiche la conversation du jeune', async () => {
        const [jeuneSelectionne] = jeunes
        // Given
        const goToConversation = screen
          .getByText(jeuneSelectionne.prenom, {
            exact: false,
          })
          .closest('button')

        // When
        await userEvent.click(goToConversation!)

        // Then
        expect(accederConversation).toHaveBeenCalledTimes(1)
        expect(accederConversation).toHaveBeenCalledWith(jeuneSelectionne.id)
      })
    })

    describe("quand on clique sur le flag d'une conversation", () => {
      it('change son suivi', async () => {
        // Given
        const [jeune] = jeunes
        const conversationCard = screen
          .getByText(jeune.prenom, {
            exact: false,
          })
          .closest('div')
        const flagConversation = within(conversationCard!).getByRole(
          'checkbox',
          { name: /Ne plus suivre/ }
        )

        // When
        await userEvent.click(flagConversation!)

        // Then
        expect(toggleFlag).toHaveBeenCalledWith(`chat-${jeune.id}`, false)
      })
    })
  })

  describe("quand le conseiller n'a pas de jeunes", () => {
    it('affiche un message informatif', async () => {
      // When
      renderWithContexts(
        <ChatRoom
          jeunesChats={[]}
          showMenu={false}
          onAccesConversation={() => {}}
          onAccesListesDiffusion={() => {}}
          onOuvertureMenu={() => {}}
        />,
        {}
      )

      // Then
      expect(screen.getByText('Vous pouvez échanger :')).toBeInTheDocument()
      expect(
        screen.getByText('directement avec un bénéficiaire')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'en envoyant un message à plusieurs bénéficiaires simultanément'
        )
      ).toBeInTheDocument()
    })
  })

  // FIXME: mock le resizeWindow
  xdescribe('quand on est sur un écran à partir de 600 px', () => {
    it('affiche une barre de recherches pour filtrer les conversations avec les bénéficiaires', () => {
      // Given
      renderWithContexts(
        <ChatRoom
          jeunesChats={jeunesChats}
          showMenu={false}
          onAccesConversation={() => {}}
          onAccesListesDiffusion={() => {}}
          onOuvertureMenu={() => {}}
        />,
        {}
      )

      // When
      resizeWindow(800)

      // Then
      expect(screen.getByTestId('form-chat')).toBeInTheDocument()
    })
  })
})

const resizeWindow = (x: number) => {
  window = Object.assign(window, { innerWidth: x })
  window.dispatchEvent(new Event('resize'))
}
