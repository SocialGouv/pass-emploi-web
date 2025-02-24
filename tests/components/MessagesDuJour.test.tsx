import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import React from 'react'

import MessagesDuJour from 'components/chat/MessagesDuJour'
import { unBeneficiaireChat } from 'fixtures/beneficiaire'
import { unMessage } from 'fixtures/message'
import { Message } from 'interfaces/message'
import {
  getMessagesDuMemeJour,
  modifierMessage,
  supprimerMessage,
} from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/messages.service')

describe('<MessagesDuJour />', () => {
  const conversation = unBeneficiaireChat()
  const messageSelectionne = unMessage({
    id: 'message-selectionne',
    creationDate: DateTime.fromISO('2023-04-12T05:21'),
  })
  const messages: Message[] = [messageSelectionne]
  beforeEach(async () => {
    // Given
    ;(getMessagesDuMemeJour as jest.Mock).mockResolvedValue(messages)
    ;(supprimerMessage as jest.Mock).mockResolvedValue(messageSelectionne)
    ;(modifierMessage as jest.Mock).mockResolvedValue(messageSelectionne)

    // When
    await renderWithContexts(
      <MessagesDuJour
        beneficiaireEtChat={conversation}
        messageSelectionne={messageSelectionne}
        beneficiaireNomComplet='Kenji Jirac'
        idConseiller='id-conseiller'
        getConseillerNomComplet={() => 'Nils Tavernier'}
      />
    )
  })

  it('charge les messages du même jour que le message sélectionné', async () => {
    // Then
    expect(getMessagesDuMemeJour).toHaveBeenCalledTimes(1)
    expect(getMessagesDuMemeJour).toHaveBeenCalledWith(
      conversation,
      messageSelectionne,
      'cleChiffrement'
    )
  })

  it('affiche les messages récupérés', async () => {
    // Then
    const listeMessages = screen.getByRole('list', {
      description: 'Messages du 12/04/2023',
    })
    messages.forEach((message) => {
      expect(
        within(listeMessages).getByText(message.content)
      ).toBeInTheDocument()
    })
  })

  it('permet de supprimer le message', async () => {
    // When
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Voir les actions possibles pour votre message du 12 avril 2023 à 5 heure 21',
      })
    )
    await userEvent.click(screen.getByRole('button', { name: /Supprimer/ }))

    // Then
    expect(supprimerMessage).toHaveBeenCalledWith(
      conversation.chatId,
      messageSelectionne,
      'cleChiffrement'
    )
  })

  it('permet de modifier le message', async () => {
    // Given
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Voir les actions possibles pour votre message du 12 avril 2023 à 5 heure 21',
      })
    )
    await userEvent.click(screen.getByRole('button', { name: /Modifier/ }))

    // When
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Message à envoyer' }),
      'tagazoc'
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Envoyer la modification du message' })
    )

    // Then
    expect(modifierMessage).toHaveBeenCalledWith(
      conversation.chatId,
      messageSelectionne,
      messageSelectionne.content + 'tagazoc',
      'cleChiffrement'
    )
    expect(
      screen.queryByRole('button', { name: /Modifier/ })
    ).not.toBeInTheDocument()
  })
})
