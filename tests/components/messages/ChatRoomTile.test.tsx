import { act, screen } from '@testing-library/react'
import React from 'react'

import { ChatRoomTile } from 'components/messages/ChatRoomTile'
import { unItemJeune, unJeuneChat } from 'fixtures/jeune'
import { mockedMessagesService } from 'fixtures/services'
import { JeuneChat } from 'interfaces/jeune'
import { MessagesService } from 'services/messages.service'
import renderWithSession from 'tests/renderWithSession'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { DIProvider } from 'utils/injectionDependances'

describe('<ChatRoomTile />', () => {
  let messagesService: MessagesService
  const unJeune = unItemJeune()
  let jeuneChat: JeuneChat

  beforeEach(async () => {
    messagesService = mockedMessagesService()
    jeuneChat = unJeuneChat({
      ...unJeune,
      chatId: `chat-${unJeune.id}`,
      seenByConseiller: true,
    })
  })

  describe('quand la conversation est suivie', () => {
    it('affiche un flag et permet de ne plus la suivre', async () => {
      // When
      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ messagesService }}>
            <CurrentJeuneProvider idJeune={unJeune.id}>
              <ChatRoomTile jeuneChat={jeuneChat} />
            </CurrentJeuneProvider>
          </DIProvider>
        )
      })

      // Then
      expect(
        screen.getByTitle(`Ne plus suivre la conversation`)
      ).toBeInTheDocument()
    })
  })
})
