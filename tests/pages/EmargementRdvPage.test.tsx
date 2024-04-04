import { screen } from '@testing-library/dom'
import { act } from '@testing-library/react'
import React from 'react'

import EmargementRdvPage from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import { unEvenement } from 'fixtures/evenement'
import { uneBaseJeune } from 'fixtures/jeune'
import renderWithContexts from 'tests/renderWithContexts'
import { toFrenchDateTime } from 'utils/date'

describe('<DetailsJeune>', () => {
  const beneficiaire = uneBaseJeune({ nom: 'LeRoi', prenom: 'Babar' })
  const evenementAEmarger = unEvenement({
    titre: 'Meeting de la famille Pirate',
    createur: { id: 'id-createur', prenom: 'Charles', nom: 'Dupont' },
    jeunes: [beneficiaire],
  })

  beforeEach(async () => {
    jest.spyOn(window, 'print').mockImplementation(() => {
      return true
    })

    await act(async () => {
      renderWithContexts(<EmargementRdvPage evenement={evenementAEmarger} />)
    })
  })

  it('affiche les informations de l’évènement', async () => {
    expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
      'Meeting de la famille Pirate'
    )
    expect(screen.getByText('Charles Dupont')).toBeInTheDocument()
    expect(
      screen.getByText(toFrenchDateTime(evenementAEmarger.date))
    ).toBeInTheDocument()
    expect(
      screen.getByText(`${beneficiaire.prenom} ${beneficiaire.nom}`)
    ).toBeInTheDocument()
  })

  it('affiche la modale d’impression de la page', async () => {
    expect(window.print).toHaveBeenCalledWith()
  })
})
