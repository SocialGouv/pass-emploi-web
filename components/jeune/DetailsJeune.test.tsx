import React from 'react'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { Jeune } from 'interfaces'
import { unJeune } from 'fixtures/jeune'
import { DetailsJeune } from './DetailsJeune'

describe('<DetailsJeune>', () => {
  let jeune: Jeune

  it("devrait afficher les informations de la fiche d'une jeune", () => {
    jeune = unJeune()
    render(
      <DetailsJeune
        id={jeune.id}
        firstName={jeune.firstName}
        lastName={jeune.lastName}
      />
    )
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${jeune.firstName} ${jeune.lastName}`,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('jeune-1')).toBeInTheDocument()
  })
})
