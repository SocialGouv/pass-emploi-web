import { act, screen, within } from '@testing-library/react'
import React from 'react'

import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import { desMessagesListeDiffusion } from 'fixtures/message'
import { mockedMessagesService } from 'fixtures/services'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { MessageListeDiffusion } from 'interfaces/message'
import { MessagesService } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

describe('<MessagesListeDeDiffusion />', () => {
  let messages: MessageListeDiffusion[]
  let messagesService: MessagesService
  let listeDeDiffusion: ListeDeDiffusion
  beforeEach(async () => {
    // Given
    messages = desMessagesListeDiffusion()
    messagesService = mockedMessagesService({
      getMessagesListeDeDiffusion: jest.fn(async () => messages),
    })
    listeDeDiffusion = uneListeDeDiffusion()

    // When
    await act(async () => {
      await renderWithContexts(
        <MessagesListeDeDiffusion liste={listeDeDiffusion} />,
        {
          customDependances: { messagesService },
        }
      )
    })
  })

  it('charge les messages envoyé à la liste de diffusion', async () => {
    // Then
    expect(messagesService.getMessagesListeDeDiffusion).toHaveBeenCalledTimes(1)
    expect(messagesService.getMessagesListeDeDiffusion).toHaveBeenCalledWith(
      'cleChiffrement',
      listeDeDiffusion.id
    )
  })

  it('affiche les messages', async () => {
    // Then
    const listeMessages = screen.getByRole('list')
    expect(within(listeMessages).getAllByRole('listitem')).toHaveLength(
      messages.length
    )
    messages.forEach((message) => {
      expect(
        within(listeMessages).getByText(message.content)
      ).toBeInTheDocument()
    })
  })
})
