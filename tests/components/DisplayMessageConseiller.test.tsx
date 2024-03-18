import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import React from 'react'

import DisplayMessageConseiller from 'components/chat/DisplayMessageConseiller'
import { unConseiller } from 'fixtures/conseiller'
import { unMessage } from 'fixtures/message'
import { StructureConseiller } from 'interfaces/conseiller'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DiplayMessageConseiller />', () => {
  const nomConseiller = 'johnny boi'
  const customConseiller = unConseiller({
    structure: StructureConseiller.MILO,
    firstName: 'johnny',
    lastName: 'boi',
    id: 'id-conseiller',
  })
  const message = unMessage({
    sentBy: 'conseiller',
    content: 'coucou',
    conseillerId: customConseiller.id,
    creationDate: DateTime.fromISO('2024-04-12T05:21'),
  })
  const supprimerMessage = jest.fn()
  const modifierMessage = jest.fn()

  describe('', () => {
    beforeEach(async () => {
      //When
      await act(async () => {
        renderWithContexts(
          <DisplayMessageConseiller
            message={message}
            conseillerNomComplet={nomConseiller}
            lastSeenByJeune={message.creationDate.plus({ day: 1 })}
            isConseillerCourant={message.conseillerId === customConseiller.id}
            onSuppression={supprimerMessage}
            onModification={modifierMessage}
          />
        )
      })
    })

    it('affiche un message envoyé par le conseiller connecté', async () => {
      // Then
      expect(screen.getByText('Vous')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /Supprimer/ })
      ).not.toBeInTheDocument()
    })

    it('permet de supprimer le message', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Voir les actions possibles pour votre message du 12 avril 2024 à 5 heure 21',
        })
      )
      await userEvent.click(screen.getByRole('button', { name: /Supprimer/ }))

      // Then
      expect(supprimerMessage).toHaveBeenCalledWith()
    })

    it('permet de modifier le message', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Voir les actions possibles pour votre message du 12 avril 2024 à 5 heure 21',
        })
      )
      await userEvent.click(screen.getByRole('button', { name: /Modifier/ }))

      // Then
      expect(modifierMessage).toHaveBeenCalledWith()
    })
  })

  it('affiche un message supprimé', async () => {
    // Given
    const message = unMessage({ status: 'deleted' })

    // When
    await act(async () => {
      renderWithContexts(
        <DisplayMessageConseiller
          message={message}
          conseillerNomComplet='Nils Tavernier'
          lastSeenByJeune={DateTime.now()}
          isConseillerCourant={true}
          onSuppression={async () => {}}
          onModification={async () => {}}
        />
      )
    })

    // Then
    expect(
      screen.getByText('Vous avez supprimé ce message')
    ).toBeInTheDocument()
    expect(screen.queryByText(message.content)).not.toBeInTheDocument()
  })

  it('affiche un message modifié', async () => {
    // Then
    expect(true).toEqual(false)
  })
})
