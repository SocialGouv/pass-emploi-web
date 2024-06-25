import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import React from 'react'

import ClotureSession from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/cloture/ClotureSessionPage'
import { unDetailSession } from 'fixtures/session'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { AlerteParam } from 'referentiel/alerteParam'
import { cloreSession } from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/sessions.service')
jest.mock('services/conseiller.service')

describe('Cloture Session', () => {
  let session = unDetailSession({
    session: {
      ...unDetailSession().session,
      statut: StatutAnimationCollective.AClore,
    },
    inscriptions: [
      {
        idJeune: 'beneficiaire-1',
        nom: 'Beau',
        prenom: 'Harry',
        statut: 'INSCRIT',
      },
      {
        idJeune: 'beneficiaire-2',
        nom: 'BE',
        prenom: 'Linda',
        statut: 'REFUS_JEUNE',
      },
    ],
  })

  let inscriptionsInitiales = session.inscriptions.map((inscription) => {
    return { idJeune: inscription.idJeune, statut: inscription.statut }
  })

  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let routerPush: jest.Mock
  let routerRefresh: jest.Mock

  beforeEach(async () => {
    alerteSetter = jest.fn()
    routerPush = jest.fn()
    routerRefresh = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
      refresh: routerRefresh,
    })

    // When
    renderWithContexts(
      <ClotureSession
        session={session}
        inscriptionsInitiales={inscriptionsInitiales}
        returnTo='/agenda/sessions/id-session'
      />,
      {
        customAlerte: { alerteSetter },
      }
    )
  })

  it('affiche les bénéficiaires de la session', async () => {
    // THEN
    for (const jeune of session.inscriptions) {
      expect(
        screen.getByText(`${jeune.prenom} ${jeune.nom}`)
      ).toBeInTheDocument()
    }
  })

  it('afficher un bouton pour clore la session', async () => {
    // THEN
    expect(
      screen.getByRole('button', {
        name: 'Clore la session',
      })
    ).toBeInTheDocument()
  })

  it('permet de sélectionner les bénéficiaires', async () => {
    // When - Then
    for (const jeune of session.inscriptions) {
      const ligneJeune = screen.getByRole('checkbox', {
        name: `${jeune.prenom} ${jeune.nom}`,
      })

      await userEvent.click(ligneJeune)
      expect(ligneJeune).toBeChecked()

      await userEvent.click(ligneJeune)
      expect(ligneJeune).not.toBeChecked()
    }
  })

  it('permet de sélectionner tous les bénéficiaires d’un coup', async () => {
    // Given
    const toutSelectionnerCheckbox = screen.getByLabelText(/Tout sélectionner/)
    expect(toutSelectionnerCheckbox).not.toBeChecked()

    // When
    await userEvent.click(toutSelectionnerCheckbox)

    // Then
    expect(toutSelectionnerCheckbox).toBeChecked()
  })

  describe('au clic sur le bouton "Clore la session', () => {
    beforeEach(async () => {
      // Given
      await userEvent.click(
        screen.getByText(session.inscriptions[0].prenom, {
          exact: false,
        })
      )
      await userEvent.click(
        screen.getByText(session.inscriptions[1].prenom, {
          exact: false,
        })
      )

      // When
      const clore = screen.getByRole('button', { name: 'Clore la session' })
      expect(clore).toBeInTheDocument()
      await userEvent.click(clore)
    })

    it('clôt la session', async () => {
      // Then
      expect(cloreSession).toHaveBeenCalledWith('1', 'session-1', [
        {
          idJeune: 'beneficiaire-1',
          statut: 'PRESENT',
        },
        {
          idJeune: 'beneficiaire-2',
          statut: 'PRESENT',
        },
      ])
    })

    it('affiche un message de succès', async () => {
      // Then
      expect(alerteSetter).toHaveBeenCalledWith(AlerteParam.clotureSession)
    })

    it('redirige vers le détail de la session', async () => {
      // Then
      expect(routerPush).toHaveBeenCalledWith(
        expect.stringMatching('/agenda/sessions/id-session')
      )
    })
  })
})
