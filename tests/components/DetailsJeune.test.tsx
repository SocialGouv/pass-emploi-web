import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { unJeune } from 'fixtures/jeune'
import { Jeune } from 'interfaces/jeune'

describe('<DetailsJeune>', () => {
  it("devrait afficher les informations de la fiche d'une jeune", () => {
    // Given
    const jeune = unJeune({ isActivated: true })

    // When
    render(<DetailsJeune jeune={jeune} />)

    // Then
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${jeune.firstName} ${jeune.lastName}`,
      })
    ).toBeInTheDocument()
    expect(() =>
      screen.getByText('pas encore connecté', { exact: false })
    ).toThrow()
    expect(screen.getByText('kenji.jirac@email.fr')).toBeInTheDocument()
    expect(screen.getByTitle('e-mail')).toBeInTheDocument()
    expect(screen.getByText('07/12/2021')).toBeInTheDocument()
  })

  it("n'affiche pas le mail si le jeune n'en a pas", () => {
    // Given
    const jeune = unJeune()
    delete jeune.email

    // When
    render(<DetailsJeune jeune={jeune} />)

    // Then
    expect(screen.queryByTitle('e-mail')).toBeNull()
  })

  describe("quand le jeune ne s'est jamais connecté", () => {
    let jeune: Jeune
    beforeEach(() => {
      // Given
      jeune = unJeune({ isActivated: false })

      // When
      render(<DetailsJeune jeune={jeune} />)
    })

    it("affiche l'information", () => {
      // Then
      expect(
        screen.getByText('pas encore connecté', { exact: false })
      ).toBeInTheDocument()
    })

    it('permet de le supprimer', () => {
      // Then
      const link = screen.getByText('Supprimer ce jeune')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        `/mes-jeunes/${jeune.id}/suppression`
      )
    })
  })
})
