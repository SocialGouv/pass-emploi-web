import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'

import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { unDetailJeune } from 'fixtures/jeune'

describe('<DetailsJeune>', () => {
  it("devrait afficher les informations de la fiche d'une jeune", () => {
    // Given
    const jeune = unDetailJeune({
      isActivated: true,
      urlDossier: 'https://dossier-milo.fr',
    })

    // When
    render(<DetailsJeune jeune={jeune} onDossierMiloClick={() => {}} />)

    // Then
    expect(() =>
      screen.getByText('pas encore connecté', { exact: false })
    ).toThrow()
    expect(screen.getByText('kenji.jirac@email.fr')).toBeInTheDocument()
    expect(screen.getByText('Dossier jeune i-Milo')).toHaveAttribute(
      'href',
      'https://dossier-milo.fr'
    )
    expect(screen.getByLabelText('07/12/2021')).toBeInTheDocument()
  })

  it("n'affiche pas le mail si le jeune n'en a pas", () => {
    // Given
    const jeune = unDetailJeune()
    delete jeune.email

    // When
    render(<DetailsJeune jeune={jeune} onDossierMiloClick={() => {}} />)

    // Then
    expect(screen.queryByTitle('e-mail')).toBeNull()
  })

  it("n'affiche pas le lien vers le dossier si le jeune n'en a pas", () => {
    // Given
    const jeune = unDetailJeune({ urlDossier: undefined })

    // When
    render(<DetailsJeune jeune={jeune} onDossierMiloClick={() => {}} />)

    // Then
    expect(screen.queryByText('Dossier jeune i-Milo')).toBeNull()
  })
  it('affiche les informations des favoris', () => {
    // Given
    const jeune = unDetailJeune({})

    // When

    // Then
    expect(screen.getByText('Offres')).toBeInTheDocument()
    expect(screen.getByText('Recherche sauvegardées')).toBeInTheDocument()
  })
})
