import { act, waitFor } from '@testing-library/react'
import Layout from 'components/layouts/Layout'
import { desJeunes, unJeuneChat } from 'fixtures/jeune'
import { mockedJeunesService, mockedMessagesService } from 'fixtures/services'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'
import AppHead from 'components/AppHead'

jest.mock('components/layouts/Sidebar', () => jest.fn(() => <></>))
jest.mock('components/layouts/ChatRoom', () => jest.fn(() => <></>))
jest.mock('components/AppHead', () => jest.fn(() => <></>))

describe('<Layout />', () => {
  const jeunes: Jeune[] = desJeunes()
  let jeunesService: JeunesService
  let messagesService: MessagesService
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
  })

  describe('quand le conseiller a des jeunes', () => {
    beforeEach(async () => {
      ;(jeunesService.getJeunesDuConseiller as jest.Mock).mockResolvedValue(
        jeunes
      )

      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ jeunesService, messagesService }}>
            <Layout>
              <FakeComponent pageTitle='un titre' />
            </Layout>
          </DIProvider>
        )
      })
    })

    it('fetch conseiller list of jeune', async () => {
      // Then
      expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
        '1',
        'accessToken'
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
          '1',
          jeune,
          expect.any(Function)
        )
      })
    })

    it('paramètre la balise head en fonction des messages non lus', async () => {
      // Then
      await waitFor(() => {
        expect(AppHead).toHaveBeenCalledWith(
          {
            hasMessageNonLu: true,
            titre: 'un titre',
          },
          {}
        )
      })
    })
  })
})

function FakeComponent(_: { pageTitle: string }) {
  return <></>
}
