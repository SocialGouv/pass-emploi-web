import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import { desMessagesListeDeDiffusionParJour } from 'fixtures/message'
import { mockedMessagesService } from 'fixtures/services'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { ByDay, MessageListeDiffusion } from 'interfaces/message'
import { MessagesService } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { TIME_24_A11Y_SEPARATOR, toFrenchFormat, toShortDate } from 'utils/date'

describe('<MessagesListeDeDiffusion />', () => {
  let messages: ByDay<MessageListeDiffusion>[]
  let messagesService: MessagesService
  let listeDeDiffusion: ListeDeDiffusion
  let afficherDetailMessage: (message: MessageListeDiffusion) => void
  beforeEach(async () => {
    // Given
    messages = desMessagesListeDeDiffusionParJour()
    messagesService = mockedMessagesService({
      getMessagesListeDeDiffusion: jest.fn(async () => messages),
    })
    listeDeDiffusion = uneListeDeDiffusion()
    afficherDetailMessage = jest.fn()

    // When
    await act(async () => {
      await renderWithContexts(
        <MessagesListeDeDiffusion
          liste={listeDeDiffusion}
          onAfficherDetailMessage={afficherDetailMessage}
          onBack={() => {}}
        />,
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

  it('permet d’accéder au détail d’un message', async () => {
    // Then
    messages.forEach((jour) => {
      const listeMessages = screen.getByRole('list', {
        description: `Le ${toShortDate(jour.date)}`,
      })

      jour.messages.forEach(({ creationDate }) => {
        const creationTime = toFrenchFormat(
          creationDate,
          TIME_24_A11Y_SEPARATOR
        )

        expect(
          within(listeMessages).getByRole('button', {
            name: `Voir le détail du message du ${toShortDate(
              creationDate
            )} à ${creationTime}`,
          })
        )
      })
    })
  })

  it('affiche le détail d’un message', async () => {
    // Given
    const message = messages[0].messages[0]
    const creationTime = toFrenchFormat(
      message.creationDate,
      TIME_24_A11Y_SEPARATOR
    )

    // When
    await userEvent.click(
      screen.getByRole('button', {
        name: `Voir le détail du message du ${toShortDate(
          message.creationDate
        )} à ${creationTime}`,
      })
    )

    // Then
    expect(afficherDetailMessage).toHaveBeenCalledWith(message)
  })
})
