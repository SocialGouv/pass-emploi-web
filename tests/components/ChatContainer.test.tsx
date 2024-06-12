import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import ChatContainer from 'components/chat/ChatContainer'
import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { BaseJeune, ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { getConseillersDuJeuneClientSide } from 'services/jeunes.service'
import { getListesDeDiffusionClientSide } from 'services/listes-de-diffusion.service'
import { getMessageImportant } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')
jest.mock('services/messages.service')
jest.mock('services/listes-de-diffusion.service')
jest.mock('components/chat/ConversationBeneficiaire', () =>
  // eslint-disable-next-line react/display-name
  ({ jeuneChat }: { jeuneChat: JeuneChat }) => <>conversation-{jeuneChat.id}</>
)
jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))

describe('<ChatContainer />', () => {
  const jeunes: BaseJeune[] = desItemsJeunes().map(extractBaseJeune)
  let jeunesChats: JeuneChat[]

  let conseillers: ConseillerHistorique[]
  beforeEach(async () => {
    ;(getConseillersDuJeuneClientSide as jest.Mock).mockResolvedValue(
      conseillers
    )
    ;(getListesDeDiffusionClientSide as jest.Mock).mockResolvedValue(
      desListesDeDiffusion()
    )
    ;(getMessageImportant as jest.Mock).mockResolvedValue(undefined)
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

  describe('Messagerie', () => {
    it('affiche la messagerie', async () => {
      // When
      await act(async () => {
        renderWithContexts(
          <ChatContainer
            jeunesChats={jeunesChats}
            menuState={[false, () => {}]}
          />,
          {}
        )
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
      await act(async () => {
        renderWithContexts(
          <ChatContainer
            jeunesChats={jeunesChats}
            menuState={[false, () => {}]}
          />,
          {
            customCurrentJeune: { id: jeunes[2].id },
          }
        )
      })
    })

    it('affiche le chat du jeune courant', async () => {
      // Then
      expect(
        screen.getByText(`conversation-${jeunes[2].id}`)
      ).toBeInTheDocument()
    })

    it("n'affiche pas les autres chats", async () => {
      // Then
      expect(() => screen.getByText(`conversation-${jeunes[0].id}`)).toThrow()
      expect(() => screen.getByText(`conversation-${jeunes[1].id}`)).toThrow()
    })
  })

  describe('listes de diffusion', () => {
    beforeEach(async () => {
      await act(async () => {
        renderWithContexts(
          <ChatContainer jeunesChats={[]} menuState={[false, () => {}]} />,
          {}
        )
      })
    })

    it('permet d’accéder aux messages envoyés aux listes de diffusion', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Voir mes listes de diffusion',
        })
      )

      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Mes listes de diffusion',
        })
      ).toBeInTheDocument()
    })

    it('ne charge les listes de diffusion qu’une fois', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: /mes listes de diffusion/ })
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Retour sur ma messagerie' })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /mes listes de diffusion/ })
      )

      // Then
      expect(getListesDeDiffusionClientSide).toHaveBeenCalledTimes(1)
    })
  })
})
