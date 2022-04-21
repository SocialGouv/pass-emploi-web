import { act, screen, waitFor } from '@testing-library/react'
import ChatRoom from 'components/layouts/ChatRoom'
import { desJeunes, unJeuneChat } from 'fixtures/jeune'
import { ConseillerHistorique, Jeune, JeuneChat } from 'interfaces/jeune'
import React from 'react'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import renderWithSession from '../renderWithSession'
import { DIProvider } from 'utils/injectionDependances'
import { JeunesService } from 'services/jeunes.service'
import { mockedJeunesService } from 'fixtures/services'

jest.mock('components/layouts/Conversation', () =>
  jest.fn(({ jeuneChat }) => <>conversation-{jeuneChat.id}</>)
)

describe('<ChatRoom />', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })
  const jeunes: Jeune[] = desJeunes()
  let jeunesChats: JeuneChat[]
  let jeunesService: JeunesService
  let conseillers: ConseillerHistorique[]
  beforeEach(async () => {
    jeunesService = mockedJeunesService({
      getConseillersDuJeune: jest.fn((_) => Promise.resolve(conseillers)),
    })
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
          <DIProvider dependances={{ jeunesService }}>
            <CurrentJeuneProvider>
              <ChatRoom jeunesChats={jeunesChats} />
            </CurrentJeuneProvider>
          </DIProvider>
        )
      })
    })

    it('devrait avoir le lien multidestination', () => {
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
          screen.getByText(`${jeune.firstName} ${jeune.lastName}`)
        ).toBeInTheDocument()
      })
    })

    describe('quand on sélectionne un jeune', () => {
      const [jeuneSelectionne, jeunePasSelectionne] = jeunes
      beforeEach(async () => {
        // Given
        const goToConversation = screen
          .getByText(jeuneSelectionne.firstName, {
            exact: false,
          })
          .closest('button')

        // When
        await act(() => goToConversation!.click())
      })

      it('affiche la conversation du jeune', async () => {
        // Then
        await waitFor(() =>
          expect(
            screen.getByText(`conversation-${jeuneSelectionne.id}`)
          ).toBeInTheDocument()
        )
      })

      it("n'affiche pas les autres chats", async () => {
        // Then
        expect(() =>
          screen.getByText(`conversation-${jeunePasSelectionne.id}`)
        ).toThrow()
      })
    })
  })

  describe('réaction au contexte du jeune', () => {
    it('affiche le chat du jeune courant', async () => {
      // When
      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ jeunesService }}>
            <CurrentJeuneProvider jeune={jeunes[2]}>
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
          <DIProvider dependances={{ jeunesService }}>
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
