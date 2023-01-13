import { act, screen, within } from '@testing-library/react'
import React from 'react'

import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import { desMessagesListeDeDiffusionParJour } from 'fixtures/message'
import { mockedMessagesService } from 'fixtures/services'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { ByDay, MessageListeDiffusion } from 'interfaces/message'
import { MessagesService } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { toShortDate } from 'utils/date'

describe('<MessagesListeDeDiffusion />', () => {
  let messages: ByDay<MessageListeDiffusion>[]
  let messagesService: MessagesService
  let listeDeDiffusion: ListeDeDiffusion
  beforeEach(async () => {
    // Given
    messages = desMessagesListeDeDiffusionParJour()
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
      listeDeDiffusion.id,
      'cleChiffrement'
    )
  })

  it('affiche les messages groupés par jour', async () => {
    // Then
    const listeJours = screen.getByRole('list', {
      description: 'Messages envoyés à la liste de diffusion',
    })
    messages.forEach((jour) => {
      expect(
        within(listeJours).getByText(`Le ${toShortDate(jour.date)}`)
      ).toBeInTheDocument()

      const listeMessages = screen.getByRole('list', {
        description: `Le ${toShortDate(jour.date)}`,
      })
      jour.messages.forEach((message) => {
        expect(
          within(listeMessages).getByText(message.content)
        ).toBeInTheDocument()
      })
    })
  })
})
