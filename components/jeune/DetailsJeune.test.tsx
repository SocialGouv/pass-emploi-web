import React from 'react'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { Jeune } from 'interfaces'
import { unJeune } from 'fixtures/jeune'
import { DetailsJeune } from './DetailsJeune'
import { RdvJeune } from 'interfaces/rdv'
import { uneListeDeRdvJeune } from 'fixtures/rendez-vous'

describe('<DetailsJeune>', () => {
  let jeune: Jeune
  let rdv: RdvJeune[]

  it("devrait afficher les informations de la fiche d'une jeune", () => {
    jeune = unJeune()
    rdv = uneListeDeRdvJeune()
    render(<DetailsJeune jeune={jeune} rdv={rdv} />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${jeune.firstName} ${jeune.lastName}`,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('jeune-1')).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous (2)')).toBeInTheDocument()
    expect(screen.getByText('21/10/2021 (10:00 - 30 min)')).toBeInTheDocument()
    expect(screen.getByText('Par téléphone')).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous avec Rama')).toBeInTheDocument()
  })
})
