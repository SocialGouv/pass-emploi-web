import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'

import Layout from 'components/layouts/Layout'
import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import {
  mockedConseillerService,
  mockedJeunesService,
  mockedMessagesService,
} from 'fixtures/services'
import { JeuneChat, JeuneFromListe } from 'interfaces/jeune'
import Profil from 'pages/profil'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('components/layouts/Sidebar', () => jest.fn(() => <></>))
jest.mock('components/chat/ChatRoom', () => jest.fn(() => <></>))
jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))
jest.mock('components/AppHead', () => jest.fn(() => <></>))

const mockAudio = jest.fn()
// @ts-ignore
global.Audio = class FakeAudio {
  play = mockAudio
}

describe('Intégration notifications sonores', () => {
  let updateChatsRef: (chats: JeuneChat[]) => void
  const jeunes: JeuneFromListe[] = desItemsJeunes()
  let jeunesService: JeunesService
  let conseillerService: ConseillerService
  let messagesService: MessagesService
  beforeEach(async () => {
    const now = DateTime.now()
    jest.spyOn(DateTime, 'now').mockReturnValue(now)
    ;(useRouter as jest.Mock).mockReturnValue({
      asPath: '/path/to/page',
      route: '/path/to/page',
    })

    jeunesService = mockedJeunesService()
    conseillerService = mockedConseillerService()
    messagesService = mockedMessagesService({
      signIn: jest.fn(() => Promise.resolve()),
      observeConseillerChats: jest.fn((_cleChiffrement, jeunes, fn) => {
        updateChatsRef = fn
        updateChatsRef(
          jeunes.map((jeune) =>
            unJeuneChat({
              ...jeune,
              chatId: `chat-${jeune.id}`,
              seenByConseiller: true,
            })
          )
        )
        return Promise.resolve(() => {})
      }),
    })
    ;(
      jeunesService.getJeunesDuConseillerClientSide as jest.Mock
    ).mockResolvedValue(jeunes)
  })

  describe('quand le conseiller active ses notification', () => {
    it("il reçoit bien une notification lors d'un nouveau message.", async () => {
      // Given
      await act(() => {
        renderWithNotificationsSonores(
          jeunesService,
          conseillerService,
          messagesService,
          false
        )
      })
      await unNouveauMessageArrive(updateChatsRef, jeunes)
      expect(mockAudio).toHaveBeenCalledTimes(0)

      // When
      await toggleNotifications()
      await unNouveauMessageArrive(updateChatsRef, jeunes)

      // Then
      expect(mockAudio).toHaveBeenCalledTimes(1)
    })
  })

  describe('quand le conseiller désactive ses notification', () => {
    it("il ne reçoit pas de notification lors d'un nouveau message.", async () => {
      // Given
      await act(() => {
        renderWithNotificationsSonores(
          jeunesService,
          conseillerService,
          messagesService,
          true
        )
      })
      await unNouveauMessageArrive(updateChatsRef, jeunes)
      expect(mockAudio).toHaveBeenCalledTimes(1)

      // When
      await toggleNotifications()
      await unNouveauMessageArrive(updateChatsRef, jeunes)

      // Then
      expect(mockAudio).toHaveBeenCalledTimes(1)
    })
  })
})

function renderWithNotificationsSonores(
  jeunesService: JeunesService,
  conseillerService: ConseillerService,
  messagesService: MessagesService,
  notificationsSonores: boolean
) {
  renderWithContexts(
    <Layout>
      <Profil referentielAgences={[]} pageTitle={'Profil'} />
    </Layout>,
    {
      customDependances: { jeunesService, conseillerService, messagesService },
      customConseiller: unConseiller({
        notificationsSonores: notificationsSonores,
      }),
    }
  )
}

async function toggleNotifications() {
  await userEvent.click(
    screen.getByRole<HTMLInputElement>('checkbox', {
      name: /notifications sonores/,
    })
  )
}

async function unNouveauMessageArrive(
  updateChatsRef: (chat: JeuneChat[]) => void,
  jeunes: JeuneFromListe[]
) {
  await act(async () => {
    const [first, ...autres] = jeunes
    updateChatsRef([
      unJeuneChat({
        ...first,
        lastMessageSentBy: 'jeune',
        chatId: `chat-${first.id}`,
        lastMessageContent: 'Ceci est tellement nouveau, donne moi de la notif',
      }),
      ...autres.map((jeune) =>
        unJeuneChat({
          ...jeune,
          chatId: `chat-${jeune.id}`,
          seenByConseiller: true,
        })
      ),
    ])
  })
}
