import { screen, within } from '@testing-library/react'
import DetailMessageListe from 'components/chat/DetailMessageListe'
import { DateTime } from 'luxon'

import { unBeneficiaireChat } from 'fixtures/beneficiaire'
import { unMessageListe } from 'fixtures/message'
import { IdentiteBeneficiaire } from 'interfaces/beneficiaire'
import { MessageListe } from 'interfaces/message'
import { getIdentitesBeneficiairesClientSide } from 'services/beneficiaires.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')

describe('DetailMessageListe', () => {
  let message: MessageListe

  beforeEach(async () => {
    // Given
    jest
      .spyOn(DateTime, 'now')
      .mockReturnValue(DateTime.fromISO('2022-09-01T14:00:00.000+02:00'))
    message = unMessageListe({
      idsDestinataires: ['id-destinataire-1', 'id-destinataire-2'],
    })
    const destinataire1: IdentiteBeneficiaire = {
      id: 'id-destinataire-1',
      prenom: 'Marie',
      nom: 'Curie',
    }
    const destinataire2: IdentiteBeneficiaire = {
      id: 'id-destinataire-2',
      prenom: 'Ada',
      nom: 'Lovelace',
    }
    ;(getIdentitesBeneficiairesClientSide as jest.Mock).mockResolvedValue([
      destinataire1,
      destinataire2,
    ])

    // When
    await renderWithContexts(
      <DetailMessageListe
        message={message}
        onBack={() => {}}
        chats={[
          unBeneficiaireChat({
            ...destinataire1,
            lastJeuneReading: message.creationDate.plus({ day: 1 }),
          }),
          unBeneficiaireChat({
            ...destinataire2,
            lastJeuneReading: message.creationDate.minus({ day: 1 }),
          }),
        ]}
      />
    )
  })

  it('affiche le contenu du message', async () => {
    // Then
    expect(screen.getByText(message.content)).toBeInTheDocument()
  })

  it('affiche l’heure du message', async () => {
    // Then
    expect(screen.getByText('Envoyé à 14:00')).toBeInTheDocument()
  })

  it('affiche les destinataires du message', async () => {
    // Then
    expect(getIdentitesBeneficiairesClientSide).toHaveBeenCalledWith([
      'id-destinataire-1',
      'id-destinataire-2',
    ])

    const destinataires = screen.getByRole('list', {
      description: 'Destinataires du message',
    })
    expect(within(destinataires).getAllByRole('listitem')).toHaveLength(2)
    expect(
      getByTextContent('Lu par Marie Curie', destinataires)
    ).toBeInTheDocument()
    expect(
      getByTextContent('Non lu par Ada Lovelace', destinataires)
    ).toBeInTheDocument()
  })

  it('affiche la date du message', async () => {
    // Then
    expect(screen.getByText('Le 01/09/2022')).toBeInTheDocument()
  })
})
