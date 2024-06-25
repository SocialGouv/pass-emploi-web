import { screen } from '@testing-library/dom'
import { act } from '@testing-library/react'
import React from 'react'

import EmargementRdvPage from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import { unEvenement } from 'fixtures/evenement'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { unDetailSession } from 'fixtures/session'
import renderWithContexts from 'tests/renderWithContexts'
import { toFrenchDateTime } from 'utils/date'

describe('<EmargementRdvPage>', () => {
  const beneficiaire = uneBaseBeneficiaire({ nom: 'LeRoi', prenom: 'Babar' })
  const acAEmarger = unEvenement({
    titre: 'Meeting de la famille Pirate',
    organisme: 'Tchoupi SARL',
    jeunes: [beneficiaire],
  })
  const sessionAEmarger = unDetailSession()

  beforeEach(async () => {
    jest.spyOn(window, 'print').mockImplementation(() => {
      return true
    })
  })

  describe('quand l’événement est une ac', () => {
    it('affiche les informations de l’ac', async () => {
      //When
      await act(async () => {
        renderWithContexts(
          <EmargementRdvPage
            evenement={acAEmarger}
            agence='Montastruc-la-Conseillère'
          />
        )
      })

      //Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
        'Mission Locale de Montastruc-la-Conseillère'
      )
      expect(screen.getByText('Tchoupi SARL')).toBeInTheDocument()
      expect(
        screen.getByText(toFrenchDateTime(acAEmarger.date))
      ).toBeInTheDocument()
      expect(
        screen.getByText(`${beneficiaire.prenom} ${beneficiaire.nom}`)
      ).toBeInTheDocument()
    })
  })

  describe('quand l’événement est une session', () => {
    it('affiche les informations de la session', async () => {
      //When
      await act(async () => {
        renderWithContexts(
          <EmargementRdvPage
            evenement={sessionAEmarger}
            agence='Montastruc-la-Conseillère'
          />
        )
      })

      //Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
        'Mission Locale de Montastruc-la-Conseillère'
      )
      expect(
        screen.getByText(sessionAEmarger.session.animateur)
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          toFrenchDateTime(sessionAEmarger.session.dateHeureDebut)
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          `${sessionAEmarger.inscriptions[0].prenom} ${sessionAEmarger.inscriptions[0].nom}`
        )
      ).toBeInTheDocument()
    })
  })

  it('affiche la modale d’impression de la page', async () => {
    //When
    await act(async () => {
      renderWithContexts(
        <EmargementRdvPage
          evenement={acAEmarger}
          agence='Montastruc-la-Conseillère'
        />
      )
    })

    //Then
    expect(window.print).toHaveBeenCalledWith()
  })
})
