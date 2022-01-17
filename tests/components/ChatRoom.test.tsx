import { act, screen } from '@testing-library/react'
import ChatRoom from 'components/layouts/ChatRoom'
import Conversation from 'components/layouts/Conversation'
import { desJeunes, unJeuneChat } from 'fixtures/jeune'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

jest.mock('components/layouts/Conversation', () => jest.fn(() => <></>))
jest.useFakeTimers()

beforeEach(async () => {
  jest.setSystemTime(new Date())
})

describe('<ChatRoom />', () => {
  const jeunes: Jeune[] = desJeunes()
  let jeunesService: JeunesService
  let messagesService: MessagesService
  let conseiller: { id: string; name: string; structure: string }
  let accessToken: string
  let tokenChat: string
  beforeEach(async () => {
    jeunesService = {
      createCompteJeunePoleEmploi: jest.fn(),
      getJeuneDetails: jest.fn(),
      getJeunesDuConseiller: jest.fn(),
    }
    messagesService = {
      observeJeuneChat: jest.fn(
        (idConseiller: string, jeune: Jeune, fn: (chat: JeuneChat) => void) => {
          fn(unJeuneChat({ ...jeune, chatId: `chat-${jeune.id}` }))
          return () => {}
        }
      ),
      observeJeuneReadingDate: jest.fn(),
      observeMessages: jest.fn(),
      sendNouveauMessage: jest.fn(),
      setReadByConseiller: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    }
    conseiller = {
      id: 'idConseiller',
      name: 'Taverner',
      structure: UserStructure.POLE_EMPLOI,
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
            <ChatRoom />
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
        goToConversation!.click()
      })

      it('affiche la conversation du jeune', async () => {
        // Then
        expect(Conversation).toHaveBeenCalledWith(
          {
            jeuneChat: unJeuneChat({
              ...jeuneSelectionne,
              chatId: `chat-${jeuneSelectionne.id}`,
            }),
            onBack: expect.any(Function),
          },
          {}
        )
      })

      it("n'affiche pas les autres chats", async () => {
        // Then
        expect(() =>
          screen.getByText(jeunePasSelectionne.firstName, { exact: false })
        ).toThrow()
      })
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
            <ChatRoom />
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
