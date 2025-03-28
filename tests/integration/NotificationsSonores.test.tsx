import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'

import ProfilPage from 'app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage'
import {
  desItemsBeneficiaires,
  unBeneficiaireChat,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import {
  BeneficiaireEtChat,
  BeneficiaireFromListe,
  IdentiteBeneficiaire,
} from 'interfaces/beneficiaire'
import { getBeneficiairesDuConseillerClientSide } from 'services/beneficiaires.service'
import { observeConseillerChats, signIn } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { ChatsProvider } from 'utils/chat/chatsContext'

jest.mock('services/messages.service')
jest.mock('services/beneficiaires.service')
jest.mock('services/conseiller.service')
jest.mock('components/chat/ChatRoom', () => jest.fn(() => <></>))
jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))

const mockAudio = jest.fn()
// @ts-expect-error simplistic mock for tests
global.Audio = class FakeAudio {
  play = mockAudio
}

describe('Intégration notifications sonores', () => {
  let updateChatsRef: (chats: BeneficiaireEtChat[]) => void
  const jeunes: BeneficiaireFromListe[] = desItemsBeneficiaires()

  beforeEach(async () => {
    const now = DateTime.now()
    jest.spyOn(DateTime, 'now').mockReturnValue(now)
    ;(usePathname as jest.Mock).mockReturnValue('/path/to/page')
    ;(signIn as jest.Mock).mockResolvedValue(undefined)
    ;(observeConseillerChats as jest.Mock).mockImplementation(
      (_cleChiffrement, jeunes, fn) => {
        updateChatsRef = fn
        updateChatsRef(
          jeunes.map((jeune: IdentiteBeneficiaire) =>
            unBeneficiaireChat({
              ...jeune,
              chatId: `chat-${jeune.id}`,
              seenByConseiller: true,
            })
          )
        )
        return Promise.resolve(() => {})
      }
    )
    ;(getBeneficiairesDuConseillerClientSide as jest.Mock).mockResolvedValue(
      jeunes
    )
  })

  describe('quand le conseiller active ses notification', () => {
    it("il reçoit bien une notification lors d'un nouveau message.", async () => {
      // Given
      await renderWithNotificationsSonores(false)
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
      await renderWithNotificationsSonores(true)
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

async function renderWithNotificationsSonores(notificationsSonores: boolean) {
  await renderWithContexts(
    <ChatsProvider>
      <ProfilPage referentielMissionsLocales={[]} />
    </ChatsProvider>,
    {
      customConseiller: unConseiller({
        notificationsSonores: notificationsSonores,
      }),
    }
  )
}

async function toggleNotifications() {
  await userEvent.click(
    screen.getByRole<HTMLInputElement>('switch', {
      name: 'Recevoir des notifications sonores pour la réception de nouveaux messages',
    })
  )
}

async function unNouveauMessageArrive(
  updateChatsRef: (chat: BeneficiaireEtChat[]) => void,
  jeunes: BeneficiaireFromListe[]
) {
  await act(async () => {
    const [first, ...autres] = jeunes
    updateChatsRef([
      unBeneficiaireChat({
        ...first,
        lastMessageSentBy: 'jeune',
        chatId: `chat-${first.id}`,
        lastMessageContent: 'Ceci est tellement nouveau, donne moi de la notif',
      }),
      ...autres.map((jeune) =>
        unBeneficiaireChat({
          ...jeune,
          chatId: `chat-${jeune.id}`,
          seenByConseiller: true,
        })
      ),
    ])
  })
}
