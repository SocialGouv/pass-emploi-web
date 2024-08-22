import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import { desMessagesListeDeDiffusionParJour } from 'fixtures/message'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { ByDay, MessageListeDiffusion } from 'interfaces/message'
import { getMessagesListeDeDiffusion } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { toShortDate } from 'utils/date'

jest.mock('services/messages.service')

describe('<MessagesListeDeDiffusion />', () => {
  let messages: ByDay<MessageListeDiffusion>[]

  let listeDeDiffusion: ListeDeDiffusion
  let afficherDetailMessage: (message: MessageListeDiffusion) => void
  beforeEach(async () => {
    // Given
    messages = desMessagesListeDeDiffusionParJour()
    ;(getMessagesListeDeDiffusion as jest.Mock).mockResolvedValue(messages)
    listeDeDiffusion = uneListeDeDiffusion()
    afficherDetailMessage = jest.fn()

    // When
    await act(async () => {
      renderWithContexts(
        <MessagesListeDeDiffusion
          liste={listeDeDiffusion}
          onAfficherDetailMessage={afficherDetailMessage}
          onBack={() => {}}
        />
      )
    })
  })

  it('charge les messages envoyé à la liste de diffusion', async () => {
    // Then
    expect(getMessagesListeDeDiffusion).toHaveBeenCalledTimes(1)
    expect(getMessagesListeDeDiffusion).toHaveBeenCalledWith(
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
        const creationTime = creationDate.toFormat("H 'heure' m")

        expect(
          within(listeMessages).getByRole('button', {
            name: `Voir les destinataires du message du ${toShortDate(
              creationDate
            )} à ${creationTime}`,
          })
        ).toBeInTheDocument()
      })
    })
  })

  it('affiche le détail d’un message', async () => {
    // Given
    const message = messages[0].messages[0]
    const creationTime = message.creationDate.toFormat("H 'heure' m")

    // When
    await userEvent.click(
      screen.getByRole('button', {
        name: `Voir les destinataires du message du ${toShortDate(
          message.creationDate
        )} à ${creationTime}`,
      })
    )

    // Then
    expect(afficherDetailMessage).toHaveBeenCalledWith(message)
  })
})
