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
    expect(screen.getByText("Profil en cours d'activation")).toBeInTheDocument()
    expect(screen.getByText('kenji.jirac@email.fr')).toBeInTheDocument()
    expect(screen.getByTitle('e-mail')).toBeInTheDocument()
    expect(screen.getByText('07/12/2021')).toBeInTheDocument()
  })

  it("n'affiche pas le mail si le jeune n'en a pas", () => {
    const jeune = unJeune()
    delete jeune.email

    render(<DetailsJeune jeune={jeune} />)

    expect(screen.queryByTitle('e-mail')).toBeNull()
  })

  it("n'affiche pas la date si le jeune n'en a pas", () => {
    const jeune = unJeune()
    delete jeune.creationDate

    render(<DetailsJeune jeune={jeune} />)

    expect(() => screen.getByText('07/12/2021')).toThrow()
  })
})
