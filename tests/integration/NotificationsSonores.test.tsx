import { act, screen, waitFor } from '@testing-library/react'

import Layout from 'components/layouts/Layout'
import { unConseiller } from 'fixtures/conseiller'
import { desJeunes, unJeuneChat } from 'fixtures/jeune'
import {
  mockedConseillerService,
  mockedJeunesService,
  mockedMessagesService,
} from 'fixtures/services'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import Profil from 'pages/profil'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import renderWithSession from 'tests/renderWithSession'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('components/layouts/Sidebar', () => jest.fn(() => <></>))
jest.mock('components/layouts/ChatRoom', () => jest.fn(() => <></>))
jest.mock('components/AppHead', () => jest.fn(() => <></>))
jest.useFakeTimers()

const mockAudio = jest.fn()
global.Audio = jest.fn().mockImplementation(() => ({
  play: mockAudio,
}))

describe('Intégration notifications sonores', () => {
  let updateChatRef: (jeuneChat: JeuneChat) => void
  const jeunes: Jeune[] = desJeunes()
  let jeunesService: JeunesService
  let conseillerService: ConseillerService
  let messagesService: MessagesService
  beforeEach(async () => {
    jest.setSystemTime(new Date())

    jeunesService = mockedJeunesService()
    conseillerService = mockedConseillerService()
    messagesService = mockedMessagesService({
      signIn: jest.fn(() => Promise.resolve()),
      observeJeuneChat: jest.fn((_, jeune, _cle, fn) => {
        updateChatRef = fn
        updateChatRef(
          unJeuneChat({
            ...jeunes[0],
            chatId: `chat-${jeunes[0].id}`,
            seenByConseiller: true,
          })
        )
        return () => {}
      }),
    })
  })

  describe("quand le conseiller n'avait pas activé ses notifications sonores…", () => {
    beforeEach(async () => {
      ;(jeunesService.getJeunesDuConseiller as jest.Mock).mockResolvedValue(
        jeunes
      )

      await act(async () => {
        await renderWithSession(
          <DIProvider
            dependances={{ jeunesService, conseillerService, messagesService }}
          >
            <ConseillerProvider
              conseiller={unConseiller({ notificationsSonores: false })}
            >
              <Layout>
                <Profil structureConseiller={'MILO'} pageTitle={'Profil'} />
              </Layout>
            </ConseillerProvider>
          </DIProvider>
        )
      })
    })

    describe("puis qu'il les active…", () => {
      beforeEach(async () => {
        const toggleNotification =
          screen.getByRole<HTMLInputElement>('checkbox')
        await act(async () => {
          toggleNotification.click()
        })
      })

      it("il reçoit bien une notification lors d'un nouveau message.", async () => {
        // When
        await act(async () => {
          updateChatRef(
            unJeuneChat({
              ...jeunes[0],
              lastMessageSentBy: 'jeune',
              chatId: `chat-${jeunes[0].id}`,
              lastMessageContent:
                'Ceci est tellement nouveau, donne moi de la notif',
            })
          )
        })

        // Then
        await waitFor(() => {
          expect(mockAudio).toHaveBeenCalled()
        })
      })
    })
  })
})
