import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import AlertDisplayer from 'components/layouts/AlertDisplayer'
import ChatRoom from 'components/chat/ChatRoom'
import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { mockedJeunesService, mockedMessagesService } from 'fixtures/services'
import { BaseJeune, ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import renderWithSession from 'tests/renderWithSession'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('components/chat/Conversation', () =>
  jest.fn(({ jeuneChat }) => <>conversation-{jeuneChat.id}</>)
)
jest.mock('components/layouts/AlertDisplayer', () => jest.fn(() => <></>))

describe('<ChatRoom />', () => {
  const jeunes: BaseJeune[] = desItemsJeunes().map(extractBaseJeune)
  let jeunesChats: JeuneChat[]
  let jeunesService: JeunesService
  let messagesService: MessagesService
  let conseillers: ConseillerHistorique[]
  beforeEach(async () => {
    jeunesService = mockedJeunesService({
      getConseillersDuJeune: jest.fn((_) => Promise.resolve(conseillers)),
    })
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
    beforeEach(async () => {
      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ jeunesService, messagesService }}>
            <CurrentJeuneProvider>
              <ChatRoom jeunesChats={jeunesChats} />
            </CurrentJeuneProvider>
          </DIProvider>
        )
      })
    })

    it('affiche les alertes sur petit ??cran', () => {
      expect(AlertDisplayer).toHaveBeenCalledWith(
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

    describe('quand on s??lectionne un jeune', () => {
      const [jeuneSelectionne, jeunePasSelectionne] = jeunes
      beforeEach(async () => {
        // Given
        const goToConversation = screen
          .getByText(jeuneSelectionne.prenom, {
            exact: false,
          })
          .closest('button')

        // When
        await userEvent.click(goToConversation!)
      })

      it('affiche la conversation du jeune', async () => {
        // Then
        expect(
          screen.getByText(`conversation-${jeuneSelectionne.id}`)
        ).toBeInTheDocument()
      })

      it("n'affiche pas les autres chats", async () => {
        // Then
        expect(() =>
          screen.getByText(`conversation-${jeunePasSelectionne.id}`)
        ).toThrow()
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

  describe('r??action au contexte du jeune', () => {
    it('affiche le chat du jeune courant', async () => {
      // When
      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ jeunesService, messagesService }}>
            <CurrentJeuneProvider idJeune={jeunes[2].id}>
              <ChatRoom jeunesChats={jeunesChats} />
            </CurrentJeuneProvider>
          </DIProvider>
        )
      })

      // Then
      expect(
        screen.getByText(`conversation-${jeunes[2].id}`)
      ).toBeInTheDocument()
    })
  })

  describe("quand le conseiller n'a pas de jeunes", () => {
    it('affiche un message informatif', async () => {
      // When
      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ jeunesService, messagesService }}>
            <CurrentJeuneProvider>
              <ChatRoom jeunesChats={[]} />
            </CurrentJeuneProvider>
          </DIProvider>
        )
      })

      // Then
      expect(
        screen.getByText(
          'Vous devriez avoir des jeunes inscrits pour discuter avec eux'
        )
      ).toBeInTheDocument()
    })
  })
})
