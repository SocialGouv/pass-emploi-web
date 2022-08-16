import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { unDetailJeune, uneMetadonneeFavoris } from 'fixtures/jeune'
import { mockedJeunesService } from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import { JeunesService } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DetailsJeune>', () => {
  let jeunesService: JeunesService
  const metadonneesFavoris = uneMetadonneeFavoris()

  beforeEach(() => {
    jeunesService = mockedJeunesService()
  })

  it("devrait afficher les informations de la fiche d'une jeune", () => {
    // Given
    const jeune = unDetailJeune({
      isActivated: true,
      urlDossier: 'https://dossier-milo.fr',
    })

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        structureConseiller={StructureConseiller.MILO}
        onDossierMiloClick={() => {}}
        metadonneesFavoris={metadonneesFavoris}
      />,
      { customDependances: { jeunesService } }
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
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        structureConseiller={StructureConseiller.MILO}
        onDossierMiloClick={() => {}}
        metadonneesFavoris={metadonneesFavoris}
      />,
      { customDependances: { jeunesService } }
    )

    // Then
    expect(screen.queryByTitle('e-mail')).toBeNull()
  })

  it("n'affiche pas le lien vers le dossier si le jeune n'en a pas", () => {
    // Given
    const jeune = unDetailJeune({ urlDossier: undefined })

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        structureConseiller={StructureConseiller.MILO}
        onDossierMiloClick={() => {}}
        metadonneesFavoris={metadonneesFavoris}
      />,
      { customDependances: { jeunesService } }
    )

    // Then
    expect(screen.queryByText('Dossier jeune i-Milo')).toBeNull()
  })

  it('affiche les informations des favoris', () => {
    // Given
    const jeune = unDetailJeune()
    const metadonneesFavori = uneMetadonneeFavoris()

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        structureConseiller={StructureConseiller.MILO}
        onDossierMiloClick={() => {}}
        metadonneesFavoris={metadonneesFavori}
      />,
      { customDependances: { jeunesService } }
    )

    // Then
    expect(screen.getByText(/Offres/)).toBeInTheDocument()
    expect(screen.getByText(/Recherches sauvegardées/)).toBeInTheDocument()
    expect(screen.getByText('Alternance :')).toBeInTheDocument()
    expect(screen.getByText('Immersion :')).toBeInTheDocument()
    expect(screen.getByText('Service civique :')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Voir la liste des favoris' })
    ).toHaveAttribute('href', '/mes-jeunes/jeune-1/favoris')
  })

  it('n’affiche pas de lien pour la liste des favoris quand le jeune n’a pas autorisé le partage', () => {
    // Given
    const jeune = unDetailJeune()
    const metadonneesFavoris = uneMetadonneeFavoris({
      autoriseLePartage: false,
    })

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        structureConseiller={StructureConseiller.MILO}
        onDossierMiloClick={() => {}}
        metadonneesFavoris={metadonneesFavoris}
      />,
      { customDependances: { jeunesService } }
    )

    // Then
    expect(() => screen.getByText('Voir la liste des favoris')).toThrow()
  })

  describe('pour un jeune Pôle Emploi qui n’a pas d’identifiant partenaire', () => {
    beforeEach(() => {
      const jeune = unDetailJeune({
        idPartenaire: undefined,
      })

      renderWithContexts(
        <DetailsJeune
          jeune={jeune}
          structureConseiller={StructureConseiller.POLE_EMPLOI}
          onDossierMiloClick={() => {}}
          metadonneesFavoris={metadonneesFavoris}
        />,
        { customDependances: { jeunesService } }
      )
    })

    it('permet l’ajout de l’identifiant', () => {
      expect(screen.getByText('Identifiant Pôle Emploi :')).toBeInTheDocument()
      expect(screen.getByText('-')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Ajouter identifiant pôle emploi' })
      ).toBeInTheDocument()
    })

    describe('au clic sur le bouton Ajouter', () => {
      beforeEach(async () => {
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Ajouter identifiant pôle emploi',
          })
        )
      })

      // TODO-917 KO
      it('affiche une pop-in pour ajouter un identifiant', async () => {
        expect(
          screen.getByText('Ajoutez l’identifiant Pôle Emploi du jeune')
        ).toBeInTheDocument()
        expect(
          screen.getByLabelText(
            'Identifiant Pôle Emploi (10 caractères maximum)'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', {
            name: 'Enregistrer',
          })
        ).toHaveAttribute('disabled')
      })

      // TODO-917 KO
      it(' lors du clic sur Enregistrer, appelle le service et revient sur le détail du jeune', async () => {
        // Given
        await userEvent.type(
          screen.getByLabelText(
            'Identifiant Pôle Emploi (10 caractères maximum)'
          ),
          '12345'
        )

        // When
        await userEvent.type(
          screen.getByRole('button', {
            name: 'Enregistrer',
          }),
          '12345'
        )

        // Then
        // TODO-917 call service
        expect(
          screen.getByText('L’identifiant Pôle Emploi a bien été mis à jour')
        ).toBeInTheDocument()
      })
    })
  })

  it('permet la modification d’un identifiant partenaire pour un jeune Pôle Emploi qui en a déjà un', () => {
    // Given
    const jeune = unDetailJeune({
      idPartenaire: '12345',
    })

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        structureConseiller={StructureConseiller.POLE_EMPLOI}
        onDossierMiloClick={() => {}}
        metadonneesFavoris={metadonneesFavoris}
      />,
      { customDependances: { jeunesService } }
    )

    // Then
    expect(screen.getByText('Identifiant Pôle Emploi :')).toBeInTheDocument()
    expect(screen.getByText('12345')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Modifier identifiant pôle emploi' })
    ).toBeInTheDocument()
  })

  it('ne permet pas l’ajout d’un identifiant partenaire pour un jeune Mission Locale', () => {
    // Given
    const jeune = unDetailJeune({
      idPartenaire: undefined,
    })

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        structureConseiller={StructureConseiller.MILO}
        onDossierMiloClick={() => {}}
        metadonneesFavoris={metadonneesFavoris}
      />,
      { customDependances: { jeunesService } }
    )

    // Then
    expect(() => screen.getByText('Identifiant Pôle Emploi :')).toThrow()
    expect(() =>
      screen.getByRole('button', { name: 'Ajouter identifiant pôle emploi' })
    ).toThrow()
  })
})
