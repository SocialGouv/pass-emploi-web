import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { unJeune } from 'fixtures/jeune'
import React from 'react'

describe('<DetailsJeune>', () => {
  it("devrait afficher les informations de la fiche d'une jeune", () => {
    const jeune = unJeune()
    render(<DetailsJeune jeune={jeune} />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${jeune.firstName} ${jeune.lastName}`,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('jeune-1')).toBeInTheDocument()
  })
})
