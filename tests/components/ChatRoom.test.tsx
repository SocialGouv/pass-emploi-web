import { act, screen, waitFor } from '@testing-library/react'
import ChatRoom from 'components/layouts/ChatRoom'
import { desJeunes, unJeuneChat } from 'fixtures/jeune'
import { mockedJeunesService, mockedMessagesService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import { Session } from 'next-auth'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

jest.mock('components/layouts/Conversation', () =>
  jest.fn(({ jeuneChat }) => <>conversation-{jeuneChat.id}</>)
)
jest.useFakeTimers()

beforeEach(async () => {
  jest.setSystemTime(new Date())
})

describe('<ChatRoom />', () => {
  const jeunes: Jeune[] = desJeunes()
  let jeunesService: JeunesService
  let messagesService: MessagesService
  let conseiller: Session.HydratedUser
  let accessToken: string
  let tokenChat: string
  beforeEach(async () => {
    jeunesService = mockedJeunesService()
    messagesService = mockedMessagesService({
      signIn: jest.fn(() => Promise.resolve()),
      observeJeuneChat: jest.fn(
        (idConseiller: string, jeune: Jeune, fn: (chat: JeuneChat) => void) => {
          if (jeune.id === 'jeune-3') {
            fn(
              unJeuneChat({
                ...jeune,
                chatId: `chat-${jeune.id}`,
                seenByConseiller: false,
              })
            )
          } else {
            fn(
              unJeuneChat({
                ...jeune,
                chatId: `chat-${jeune.id}`,
                seenByConseiller: true,
              })
            )
          }
          return () => {}
        }
      ),
    })
    conseiller = {
      id: 'idConseiller',
      name: 'Taverner',
      email: 'fake@mail.com',
      structure: UserStructure.POLE_EMPLOI,
      estConseiller: true,
      estSuperviseur: false,
    }
    accessToken = 'accessToken'
    tokenChat = 'tokenChat'
  })

  describe('quand le conseiller a des jeunes', () => {
    beforeEach(async () => {
      ;(jeunesService.getJeunesDuConseiller as jest.Mock).mockResolvedValue(
        jeunes
      )

      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ jeunesService, messagesService }}>
            <CurrentJeuneProvider>
              <ChatRoom />
            </CurrentJeuneProvider>
          </DIProvider>,
          { user: conseiller, firebaseToken: tokenChat }
        )
      })
    })

    it('fetch conseiller list of jeune', async () => {
      // Then
      expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
        conseiller.id,
        accessToken
      )
    })

    it('sign into chat', async () => {
      // Then
      expect(messagesService.signIn).toHaveBeenCalled()
    })

    it('devrait avoir le lien multidestination', () => {
      // Then
      expect(
        screen.getByRole('link', { name: 'Message multi-destinataires' })
      ).toBeInTheDocument()
    })

    describe('pour chaque jeune', () => {
      const cases = jeunes.map((jeune) => [jeune])
      it.each(cases)('subscribes to chat', async (jeune) => {
        // Then
        expect(messagesService.observeJeuneChat).toHaveBeenCalledWith(
          conseiller.id,
          jeune,
          expect.any(Function)
        )
      })

      it.each(cases)('affiche le chat', (jeune) => {
        // Then
        expect(
          screen.getByText(`${jeune.firstName} ${jeune.lastName}`)
        ).toBeInTheDocument()
      })

      it('affiche les jeunes dans le bon ordre', () => {
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
          "Maria D'Aböville-Muñoz François"
        )
        expect(screen.getAllByRole('listitem')[1]).toHaveTextContent(
          'Kenji Jirac'
        )
        expect(screen.getAllByRole('listitem')[2]).toHaveTextContent(
          'Nadia Sanfamiye'
        )
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
      // Given
      ;(jeunesService.getJeunesDuConseiller as jest.Mock).mockResolvedValue(
        jeunes
      )

      // When
      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ jeunesService, messagesService }}>
            <CurrentJeuneProvider jeune={jeunes[2]}>
              <ChatRoom />
            </CurrentJeuneProvider>
          </DIProvider>,
          { user: conseiller, firebaseToken: tokenChat }
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
      // Given
      ;(jeunesService.getJeunesDuConseiller as jest.Mock).mockResolvedValue([])

      // When
      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ jeunesService, messagesService }}>
            <CurrentJeuneProvider>
              <ChatRoom />
            </CurrentJeuneProvider>
          </DIProvider>,
          { user: conseiller, firebaseToken: tokenChat }
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
