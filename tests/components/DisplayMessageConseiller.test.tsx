import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import React from 'react'

import DisplayMessageConseiller from 'components/chat/DisplayMessageConseiller'
import { unConseiller } from 'fixtures/conseiller'
import { unMessage } from 'fixtures/message'
import { StructureConseiller } from 'interfaces/conseiller'
import { TypeMessage } from 'interfaces/message'
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
    creationDate: DateTime.fromISO('2023-04-12T05:21'),
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
            isEnCoursDeModification={false}
          />
        )
      })
    })

    it('affiche un message envoyé par le conseiller connecté', async () => {
      // Then
      expect(screen.getByText('Vous')).toBeInTheDocument()
      expect(screen.getByText('· Lu')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /Supprimer/ })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /Modifier/ })
      ).not.toBeInTheDocument()
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
      expect(supprimerMessage).toHaveBeenCalledWith()
    })

    it('permet de modifier le message', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Voir les actions possibles pour votre message du 12 avril 2023 à 5 heure 21',
        })
      )
      await userEvent.click(screen.getByRole('button', { name: /Modifier/ }))

      // Then
      expect(modifierMessage).toHaveBeenCalledWith()
      expect(
        screen.queryByRole('button', { name: /Modifier/ })
      ).not.toBeInTheDocument()
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
          onModification={() => {}}
          isEnCoursDeModification={false}
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
    // Given
    const message = unMessage({ status: 'edited' })

    // When
    await act(async () => {
      renderWithContexts(
        <DisplayMessageConseiller
          message={message}
          conseillerNomComplet='Nils Tavernier'
          lastSeenByJeune={DateTime.now().plus({ minute: 1 })}
          isConseillerCourant={true}
          onSuppression={async () => {}}
          onModification={() => {}}
          isEnCoursDeModification={false}
        />
      )
    })

    // Then
    expect(screen.getByText('· Modifié')).toBeInTheDocument()
    expect(screen.queryByText('· Lu')).not.toBeInTheDocument()
  })

  describe('quand le message est un résultat de recherche', () => {
    it('affiche le contenu surligné', async () => {
      //GIVEN
      const messageRecherche = unMessage({
        sentBy: 'conseiller',
        content: 'Hello, tu as pensé à envoyer ton CV ?',
        conseillerId: customConseiller.id,
      })

      //WHEN
      await act(async () => {
        renderWithContexts(
          <DisplayMessageConseiller
            message={messageRecherche}
            conseillerNomComplet={nomConseiller}
            isConseillerCourant={message.conseillerId === customConseiller.id}
            estResultatDeRecherche={true}
            highlight={{ match: [0, 4], key: 'content' }}
            isEnCoursDeModification={false}
            onAllerAuMessage={() => {}}
          />
        )
      })

      //THEN
      const markedElements = screen.getAllByText('Hello', {
        selector: 'mark',
      })
      expect(markedElements.length).toEqual(1)
    })

    it('affiche le nom de la pj surligné', async () => {
      //GIVEN
      const messageRecherche = unMessage({
        sentBy: 'conseiller',
        content: 'Hello, tu as pensé à envoyer ton CV ?',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'toto.jpg',
            statut: 'valide',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
        conseillerId: customConseiller.id,
      })

      //WHEN
      await act(async () => {
        renderWithContexts(
          <DisplayMessageConseiller
            message={messageRecherche}
            conseillerNomComplet={nomConseiller}
            isConseillerCourant={message.conseillerId === customConseiller.id}
            isEnCoursDeModification={false}
            highlight={{ match: [0, 3], key: 'piecesJointes.nom' }}
            estResultatDeRecherche={true}
            onAllerAuMessage={() => {}}
          />
        )
      })

      //THEN
      const markedElements = screen.getAllByText('toto', {
        selector: 'mark',
      })
      expect(markedElements.length).toEqual(1)
    })
  })
})
