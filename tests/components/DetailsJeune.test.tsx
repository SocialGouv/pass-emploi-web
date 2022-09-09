import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'

import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { unDetailJeune, uneMetadonneeFavoris } from 'fixtures/jeune'
import { mockedJeunesService } from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import { JeunesService } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('components/Modal')

describe('<DetailsJeune>', () => {
  let jeunesService: JeunesService
  const metadonneesFavoris = uneMetadonneeFavoris()

  beforeEach(() => {
    jeunesService = mockedJeunesService({
      modifierIdentifiantPartenaire: jest.fn(() => Promise.resolve()),
    })
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
        metadonneesFavoris={metadonneesFavoris}
        onDossierMiloClick={() => {}}
        onDeleteJeuneClick={() => {}}
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
        metadonneesFavoris={metadonneesFavoris}
        onDossierMiloClick={() => {}}
        onDeleteJeuneClick={() => {}}
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
        metadonneesFavoris={metadonneesFavoris}
        onDossierMiloClick={() => {}}
        onDeleteJeuneClick={() => {}}
      />,
      { customDependances: { jeunesService } }
    )

    // Then
    expect(screen.queryByText('Dossier jeune i-Milo')).toBeNull()
  })

  it('affiche les informations des favoris', () => {
    // Given
    const jeune = unDetailJeune()

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        structureConseiller={StructureConseiller.MILO}
        metadonneesFavoris={metadonneesFavoris}
        onDossierMiloClick={() => {}}
        onDeleteJeuneClick={() => {}}
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
        metadonneesFavoris={metadonneesFavoris}
        onDossierMiloClick={() => {}}
        onDeleteJeuneClick={() => {}}
      />,
      { customDependances: { jeunesService } }
    )

    // Then
    expect(() => screen.getByText('Voir la liste des favoris')).toThrow()
  })

  describe('identifiant partenaire', () => {
    let routerPush: Function

    beforeEach(() => {
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes/jeune-1',
        query: { modificationIdentifiantPartenaire: 'succes' },
        push: routerPush,
      })
    })

    describe('pour un jeune Pôle emploi qui n’a pas d’identifiant partenaire', () => {
      beforeEach(() => {
        const jeune = unDetailJeune({
          idPartenaire: undefined,
        })

        renderWithContexts(
          <DetailsJeune
            jeune={jeune}
            structureConseiller={StructureConseiller.POLE_EMPLOI}
            metadonneesFavoris={metadonneesFavoris}
            onDossierMiloClick={() => {}}
            onDeleteJeuneClick={() => {}}
          />,
          { customDependances: { jeunesService } }
        )
      })

      it('permet l’ajout de l’identifiant', () => {
        expect(
          screen.getByText('Identifiant Pôle emploi :')
        ).toBeInTheDocument()
        expect(screen.getByText('-')).toBeInTheDocument()
        expect(
          screen.getByRole('button', {
            name: 'Ajouter l’identifiant Pôle emploi',
          })
        ).toBeInTheDocument()
      })

      describe('au clic sur le bouton Ajouter', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Ajouter l’identifiant Pôle emploi',
            })
          )
        })

        it('affiche une pop-in pour ajouter un identifiant', async () => {
          expect(
            screen.getByLabelText(
              'Identifiant Pôle emploi (10 caractères maximum)'
            )
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', {
              name: 'Enregistrer',
            })
          ).toHaveAttribute('disabled')
        })

        it('lors du clic sur Enregistrer, appelle le service et revient sur le détail du jeune avec l’identifiant présent', async () => {
          // Given
          await userEvent.type(
            screen.getByLabelText(
              'Identifiant Pôle emploi (10 caractères maximum)'
            ),
            '12345'
          )

          // When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Enregistrer',
            })
          )

          // Then
          expect(
            jeunesService.modifierIdentifiantPartenaire
          ).toHaveBeenCalledWith('jeune-1', '12345')
          expect(routerPush).toHaveBeenCalledWith({
            pathname: '/mes-jeunes/jeune-1',
            query: { modificationIdentifiantPartenaire: 'succes' },
          })
          expect(screen.getByText('12345')).toBeInTheDocument()
        })
      })
    })

    describe('pour un jeune Pôle emploi a déjà un identifiant partenaire', () => {
      beforeEach(() => {
        const jeune = unDetailJeune({
          idPartenaire: '12345',
        })

        renderWithContexts(
          <DetailsJeune
            jeune={jeune}
            structureConseiller={StructureConseiller.POLE_EMPLOI}
            metadonneesFavoris={metadonneesFavoris}
            onDossierMiloClick={() => {}}
            onDeleteJeuneClick={() => {}}
          />,
          { customDependances: { jeunesService } }
        )
      })

      it('permet la modification de l’identifiant', () => {
        expect(
          screen.getByText('Identifiant Pôle emploi :')
        ).toBeInTheDocument()
        expect(screen.getByText('12345')).toBeInTheDocument()
        expect(
          screen.getByRole('button', {
            name: 'Modifier l’identifiant Pôle emploi',
          })
        ).toBeInTheDocument()
      })

      describe('au clic sur le bouton Modifier', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Modifier l’identifiant Pôle emploi',
            })
          )
        })

        it('affiche une pop-in pour modifier l’identifiant', async () => {
          expect(
            screen.getByLabelText(
              'Identifiant Pôle emploi (10 caractères maximum)'
            )
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', {
              name: 'Enregistrer',
            })
          ).toBeInTheDocument()
        })

        it('lors du clic sur Enregistrer, appelle le service et revient sur le détail du jeune avec le nouvel identifiant présent', async () => {
          // Given
          await userEvent.type(
            screen.getByLabelText(
              'Identifiant Pôle emploi (10 caractères maximum)'
            ),
            '6789'
          )

          // When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Enregistrer',
            })
          )

          // Then
          expect(
            jeunesService.modifierIdentifiantPartenaire
          ).toHaveBeenCalledWith('jeune-1', '123456789')
          expect(routerPush).toHaveBeenCalledWith({
            pathname: '/mes-jeunes/jeune-1',
            query: { modificationIdentifiantPartenaire: 'succes' },
          })
          expect(screen.getByText('123456789')).toBeInTheDocument()
        })
      })
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
          metadonneesFavoris={metadonneesFavoris}
          onDossierMiloClick={() => {}}
          onDeleteJeuneClick={() => {}}
        />,
        { customDependances: { jeunesService } }
      )

      // Then
      expect(() => screen.getByText('Identifiant Pôle emploi :')).toThrow()
      expect(() =>
        screen.getByRole('button', {
          name: 'Ajouter l’identifiant Pôle emploi',
        })
      ).toThrow()
    })
  })
})
