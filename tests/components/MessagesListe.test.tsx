import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessagesListe from 'components/chat/MessagesListe'
import React from 'react'

import { uneListe } from 'fixtures/listes'
import { desMessagesListeParJour } from 'fixtures/message'
import { Liste } from 'interfaces/liste'
import { ByDay, MessageListe } from 'interfaces/message'
import { getMessagesListe } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { toShortDate } from 'utils/date'

jest.mock('services/messages.service')

describe('<MessagesListe />', () => {
  let messages: ByDay<MessageListe>

  let liste: Liste
  let afficherDetailMessage: (message: MessageListe) => void
  beforeEach(async () => {
    // Given
    messages = desMessagesListeParJour()
    ;(getMessagesListe as jest.Mock).mockResolvedValue(messages)
    liste = uneListe()
    afficherDetailMessage = jest.fn()

    // When
    await renderWithContexts(
      <MessagesListe
        liste={liste}
        onAfficherDetailMessage={afficherDetailMessage}
        onBack={() => {}}
      />
    )
  })

  it('charge les messages envoyé à la liste', async () => {
    // Then
    expect(getMessagesListe).toHaveBeenCalledTimes(1)
    expect(getMessagesListe).toHaveBeenCalledWith(liste.id, 'cleChiffrement')
  })

  it('affiche les messages groupés par jour', async () => {
    // Then
    const listeJours = screen.getByRole('list', {
      description: 'Messages envoyés à la liste',
    })
    messages.days.forEach((jour) => {
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
    messages.days.forEach((jour) => {
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
    const message = messages.days[0].messages[0]
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
