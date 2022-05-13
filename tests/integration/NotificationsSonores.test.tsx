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

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ asPath: '/path/to/page' })),
}))
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
    ;(jeunesService.getJeunesDuConseiller as jest.Mock).mockResolvedValue(
      jeunes
    )
  })

  describe('quand le conseiller active ses notification', () => {
    it("il reçoit bien une notification lors d'un nouveau message.", async () => {
      // Given
      await act(async () => {
        await renderWithNotificationsSonores(
          jeunesService,
          conseillerService,
          messagesService,
          false
        )
      })
      await unNouveauMessageArrive(updateChatRef, jeunes)
      await waitFor(() => {
        expect(mockAudio).toHaveBeenCalledTimes(0)
      })

      // When
      await toggleNotifications()
      await unNouveauMessageArrive(updateChatRef, jeunes)

      // Then
      await waitFor(() => {
        expect(mockAudio).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('quand le conseiller désactive ses notification', () => {
    it("il ne reçoit pas de notification lors d'un nouveau message.", async () => {
      // Given
      await act(async () => {
        await renderWithNotificationsSonores(
          jeunesService,
          conseillerService,
          messagesService,
          true
        )
      })
      await unNouveauMessageArrive(updateChatRef, jeunes)
      await waitFor(() => {
        expect(mockAudio).toHaveBeenCalledTimes(1)
      })

      // When
      await toggleNotifications()
      await unNouveauMessageArrive(updateChatRef, jeunes)

      // Then
      await waitFor(() => {
        expect(mockAudio).toHaveBeenCalledTimes(1)
      })
    })
  })
})

async function renderWithNotificationsSonores(
  jeunesService: JeunesService,
  conseillerService: ConseillerService,
  messagesService: MessagesService,
  notificationsSonores: boolean
) {
  await renderWithSession(
    <DIProvider
      dependances={{ jeunesService, conseillerService, messagesService }}
    >
      <ConseillerProvider
        conseiller={unConseiller({
          notificationsSonores: notificationsSonores,
        })}
      >
        <Layout>
          <Profil structureConseiller={'MILO'} pageTitle={'Profil'} />
        </Layout>
      </ConseillerProvider>
    </DIProvider>
  )
}

async function toggleNotifications() {
  const toggleNotifications = screen.getByRole<HTMLInputElement>('checkbox', {
    name: /notifications sonores/,
  })
  await act(async () => {
    toggleNotifications.click()
  })
}

async function unNouveauMessageArrive(
  updateChatRef: (jeuneChat: JeuneChat) => void,
  jeunes: Jeune[]
) {
  await act(async () => {
    updateChatRef(
      unJeuneChat({
        ...jeunes[0],
        lastMessageSentBy: 'jeune',
        chatId: `chat-${jeunes[0].id}`,
        lastMessageContent: 'Ceci est tellement nouveau, donne moi de la notif',
      })
    )
  })
}
