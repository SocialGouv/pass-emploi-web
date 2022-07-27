import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'

import { RecherchesSauvegardees } from '../../interfaces/jeune'
import getByDefinitionTerm from '../querySelector'

import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { unDetailJeune, uneRechercheSauvegardee } from 'fixtures/jeune'

describe('<DetailsJeune>', () => {
  const recherchesSauvegardees = uneRechercheSauvegardee()

  it("devrait afficher les informations de la fiche d'une jeune", () => {
    // Given
    const jeune = unDetailJeune({
      isActivated: true,
      urlDossier: 'https://dossier-milo.fr',
    })

    // When
    render(
      <DetailsJeune
        jeune={jeune}
        onDossierMiloClick={() => {}}
        recherchesSauvegardees={recherchesSauvegardees}
      />
    )

    // Then
    expect(() =>
      screen.getByText('pas encore connecté', { exact: false })
    ).toThrow()
    expect(screen.getByText('kenji.jirac@email.fr')).toBeInTheDocument()
    expect(screen.getByText('Dossier jeune i-Milo')).toHaveAttribute(
      'href',
      'https://dossier-milo.fr'
    )
    expect(screen.getByText('07/12/2021')).toBeInTheDocument()
  })

  it("n'affiche pas le mail si le jeune n'en a pas", () => {
    // Given
    const jeune = unDetailJeune()
    delete jeune.email

    // When
    render(
      <DetailsJeune
        jeune={jeune}
        onDossierMiloClick={() => {}}
        recherchesSauvegardees={recherchesSauvegardees}
      />
    )

    // Then
    expect(screen.queryByTitle('e-mail')).toBeNull()
  })

  it("n'affiche pas le lien vers le dossier si le jeune n'en a pas", () => {
    // Given
    const jeune = unDetailJeune({ urlDossier: undefined })

    // When
    render(
      <DetailsJeune
        jeune={jeune}
        onDossierMiloClick={() => {}}
        recherchesSauvegardees={recherchesSauvegardees}
      />
    )

    // Then
    expect(screen.queryByText('Dossier jeune i-Milo')).toBeNull()
  })

  it('affiche les informations des favoris', () => {
    // Given
    const jeune = unDetailJeune()
    const recherchesSauvegardees = uneRechercheSauvegardee()

    // When
    render(
      <DetailsJeune
        jeune={jeune}
        onDossierMiloClick={() => {}}
        recherchesSauvegardees={recherchesSauvegardees}
      />
    )

    // Then
    expect(screen.getByText(/Offres/)).toBeInTheDocument()
    expect(screen.getByText(/Recherches sauvegardées/)).toBeInTheDocument()
    expect(getByDefinitionTerm('Offres :')).toHaveTextContent('12')
  })
})
