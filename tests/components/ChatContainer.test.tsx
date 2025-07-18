import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { getListesClientSide } from 'services/listes.service'

import ChatContainer from 'components/chat/ChatContainer'
import {
  desItemsBeneficiaires,
  unBeneficiaireChat,
} from 'fixtures/beneficiaire'
import { desListes } from 'fixtures/listes'
import {
  BeneficiaireEtChat,
  extractBaseBeneficiaire,
  IdentiteBeneficiaire,
} from 'interfaces/beneficiaire'
import { getConseillersDuJeuneClientSide } from 'services/beneficiaires.service'
import { getMessageImportant } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/messages.service')
jest.mock('services/listes.service')
jest.mock('components/chat/ConversationBeneficiaire', () =>
  // eslint-disable-next-line react/display-name
  ({ beneficiaireChat }: { beneficiaireChat: BeneficiaireEtChat }) => (
    <>conversation-{beneficiaireChat.id}</>
  )
)
jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))

describe('<ChatContainer />', () => {
  const beneficiaires: IdentiteBeneficiaire[] = desItemsBeneficiaires().map(
    extractBaseBeneficiaire
  )
  let beneficiairesChats: BeneficiaireEtChat[]

  beforeEach(async () => {
    ;(getConseillersDuJeuneClientSide as jest.Mock).mockResolvedValue([])
    ;(getListesClientSide as jest.Mock).mockResolvedValue(desListes())
    ;(getMessageImportant as jest.Mock).mockResolvedValue(undefined)
    beneficiairesChats = [
      unBeneficiaireChat({
        ...beneficiaires[0],
        chatId: `chat-${beneficiaires[0].id}`,
        seenByConseiller: true,
      }),
      unBeneficiaireChat({
        ...beneficiaires[1],
        chatId: `chat-${beneficiaires[1].id}`,
        seenByConseiller: true,
      }),
      unBeneficiaireChat({
        ...beneficiaires[2],
        chatId: `chat-${beneficiaires[2].id}`,
        seenByConseiller: false,
      }),
    ]
  })

  describe('Messagerie', () => {
    it('affiche la messagerie', async () => {
      // When
      await renderWithContexts(<ChatContainer onShowMenu={() => {}} />, {
        customChats: beneficiairesChats,
      })

      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Messagerie',
        })
      ).toBeInTheDocument()
    })
  })

  describe('Conversation', () => {
    beforeEach(async () => {
      // When
      await renderWithContexts(<ChatContainer onShowMenu={() => {}} />, {
        customChats: beneficiairesChats,
        customCurrentConversation: {
          value: beneficiairesChats[2],
        },
      })
    })

    it('affiche le chat du beneficiaire courant', async () => {
      // Then
      expect(
        screen.getByText(`conversation-${beneficiaires[2].id}`)
      ).toBeInTheDocument()
    })

    it("n'affiche pas les autres chats", async () => {
      // Then
      expect(() =>
        screen.getByText(`conversation-${beneficiaires[0].id}`)
      ).toThrow()
      expect(() =>
        screen.getByText(`conversation-${beneficiaires[1].id}`)
      ).toThrow()
    })
  })

  describe('listes', () => {
    beforeEach(async () => {
      await renderWithContexts(<ChatContainer onShowMenu={() => {}} />, {
        customChats: [],
      })
    })

    it('permet d’accéder aux messages envoyés aux listes', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Voir mes listes',
        })
      )

      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Mes listes',
        })
      ).toBeInTheDocument()
    })

    it('ne charge les listes qu’une fois', async () => {
      // When
      await userEvent.click(screen.getByRole('button', { name: /mes listes/ }))
      await userEvent.click(
        screen.getByRole('button', { name: 'Retour sur ma messagerie' })
      )
      await userEvent.click(screen.getByRole('button', { name: /mes listes/ }))

      // Then
      expect(getListesClientSide).toHaveBeenCalledTimes(1)
    })
  })
})
