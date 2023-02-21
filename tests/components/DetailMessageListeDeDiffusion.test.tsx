import { act, screen, within } from '@testing-library/react'
import { DateTime } from 'luxon'

import { DetailMessageListeDeDiffusion } from 'components/chat/DetailMessageListeDeDiffusion'
import { unMessageListeDiffusion } from 'fixtures/message'
import { mockedJeunesService } from 'fixtures/services'
import { MessageListeDiffusion } from 'interfaces/message'
import { JeunesService } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

describe('DetailMessageListeDeDiffusion', () => {
  let message: MessageListeDiffusion
  let jeunesService: JeunesService
  beforeEach(async () => {
    // Given
    jest
      .spyOn(DateTime, 'now')
      .mockReturnValue(DateTime.fromISO('2022-09-01T14:00:00.000+02:00'))
    message = unMessageListeDiffusion({
      idsDestinataires: ['id-destinataire-1', 'id-destinataire-2'],
    })
    jeunesService = mockedJeunesService({
      asdfasdf: jest.fn(async () => [
        {
          id: 'id-destinataire-1',
          prenom: 'Marie',
          nom: 'Curie',
        },
        { id: 'id-destinataire-2', prenom: 'Ada', nom: 'Lovelace' },
      ]),
    })

    // When
    await act(async () => {
      renderWithContexts(<DetailMessageListeDeDiffusion message={message} />, {
        customDependances: { jeunesService },
      })
    })
  })

  it('affiche la date du message', async () => {
    // Then
    expect(screen.getByText('Le 01/09/2022')).toBeInTheDocument()
  })

  it('affiche le contenu du message', async () => {
    // Then
    expect(screen.getByText(message.content)).toBeInTheDocument()
  })

  it('affiche l’heure du message', async () => {
    // Then
    expect(screen.getByText('Envoyé à 14h00')).toBeInTheDocument()
  })

  it('affiche les destinataires du message', async () => {
    // Then
    expect(jeunesService.asdfasdf).toHaveBeenCalledWith([
      'id-destinataire-1',
      'id-destinataire-2',
    ])

    const destinataires = screen.getByRole('list', {
      description: 'Destinataires du message',
    })
    expect(within(destinataires).getAllByRole('listitem')).toHaveLength(2)
    expect(within(destinataires).getByText('Marie Curie')).toBeInTheDocument()
    expect(within(destinataires).getByText('Ada Lovelace')).toBeInTheDocument()
  })
})
