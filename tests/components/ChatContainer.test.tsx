import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import ChatContainer from 'components/chat/ChatContainer'
import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import {
  mockedJeunesService,
  mockedListesDeDiffusionService,
  mockedMessagesService,
} from 'fixtures/services'
import { BaseJeune, ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import { MessagesService } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('components/chat/Conversation', () =>
  // eslint-disable-next-line react/display-name
  ({ jeuneChat }: { jeuneChat: JeuneChat }) => <>conversation-{jeuneChat.id}</>
)
jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))

describe('<ChatContainer />', () => {
  const jeunes: BaseJeune[] = desItemsJeunes().map(extractBaseJeune)
  let jeunesChats: JeuneChat[]
  let jeunesService: JeunesService
  let messagesService: MessagesService
  let listesDeDiffusionService: ListesDeDiffusionService
  let conseillers: ConseillerHistorique[]
  beforeEach(async () => {
    jeunesService = mockedJeunesService({
      getConseillersDuJeuneClientSide: jest.fn((_) =>
        Promise.resolve(conseillers)
      ),
    })
    messagesService = mockedMessagesService()
    listesDeDiffusionService = mockedListesDeDiffusionService({
      getListesDeDiffusionClientSide: jest.fn(async () =>
        desListesDeDiffusion()
      ),
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

  describe('Messagerie', () => {
    it('affiche la messagerie', async () => {
      // When
      renderWithContexts(<ChatContainer jeunesChats={jeunesChats} />, {
        customDependances: {
          jeunesService,
          messagesService,
          listesDeDiffusionService,
        },
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
        renderWithContexts(<ChatContainer jeunesChats={jeunesChats} />, {
          customDependances: { jeunesService, messagesService },
          customCurrentJeune: { id: jeunes[2].id },
        })
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
      renderWithContexts(<ChatContainer jeunesChats={[]} />, {
        customDependances: {
          jeunesService,
          messagesService,
          listesDeDiffusionService,
        },
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
      expect(
        listesDeDiffusionService.getListesDeDiffusionClientSide
      ).toHaveBeenCalledTimes(1)
    })
  })
})

const resizeWindow = (x: number) => {
  window = Object.assign(window, { innerWidth: x })
  window.dispatchEvent(new Event('resize'))
}
