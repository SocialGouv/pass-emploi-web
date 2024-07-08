import { screen } from '@testing-library/dom'
import { act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import React from 'react'

import EmargementRdvPage from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import { unEvenement } from 'fixtures/evenement'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { unDetailSession } from 'fixtures/session'
import renderWithContexts from 'tests/renderWithContexts'
import { toFrenchDateTime } from 'utils/date'
expect.extend(toHaveNoViolations)

describe('<EmargementRdvPage>', () => {
  let container: HTMLElement
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
    beforeEach(async () => {
      //When
      await act(async () => {
        ;({ container } = renderWithContexts(
          <EmargementRdvPage
            evenement={acAEmarger}
            agence='Montastruc-la-Conseillère'
          />
        ))
      })
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche les informations de l’ac', async () => {
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
    beforeEach(async () => {
      //When
      await act(async () => {
        ;({ container } = renderWithContexts(
          <EmargementRdvPage
            evenement={sessionAEmarger}
            agence='Montastruc-la-Conseillère'
          />
        ))
      })
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche les informations de la session', async () => {
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
