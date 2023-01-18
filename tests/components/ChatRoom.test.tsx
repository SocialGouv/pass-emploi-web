import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { mockedMessagesService } from 'fixtures/services'
import { BaseJeune, JeuneChat } from 'interfaces/jeune'
import { MessagesService } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))

describe('<ChatRoom />', () => {
  const jeunes: BaseJeune[] = desItemsJeunes().map(extractBaseJeune)
  let jeunesChats: JeuneChat[]
  let messagesService: MessagesService
  beforeEach(async () => {
    messagesService = mockedMessagesService()
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
        {
          customDependances: { messagesService },
        }
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
        expect(messagesService.toggleFlag).toHaveBeenCalledWith(
          `chat-${jeune.id}`,
          false
        )
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
        {
          customDependances: { messagesService },
        }
      )

      // Then
      expect(
        screen.getByText(
          'Vous devriez avoir des jeunes inscrits pour discuter avec eux'
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
        {
          customDependances: { messagesService },
        }
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
