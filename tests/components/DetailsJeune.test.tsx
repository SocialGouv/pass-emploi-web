import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'

import DetailsJeune from 'components/jeune/DetailsJeune'
import { unDetailBeneficiaire } from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { StructureConseiller } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { modifierIdentifiantPartenaire } from 'services/beneficiaires.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('components/Modal')

describe('<DetailsJeune>', () => {
  beforeEach(() => {
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')
    ;(modifierIdentifiantPartenaire as jest.Mock).mockResolvedValue(undefined)
  })

  it("devrait afficher les informations de la fiche d'une jeune", () => {
    // Given
    const jeune = unDetailBeneficiaire({
      isActivated: true,
      urlDossier: 'https://dossier-milo.fr',
      dateFinCEJ: '2024-12-07T17:30:07.756Z',
    })

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        conseiller={unConseiller({ structure: StructureConseiller.MILO })}
      />
    )

    // Then
    expect(() =>
      screen.getByText('pas encore connecté', { exact: false })
    ).toThrow()
    expect(screen.getByText('kenji.jirac@email.fr')).toBeInTheDocument()
    expect(screen.getByText('07/12/2024')).toBeInTheDocument()
    expect(
      screen.getByText('Date de fin du CEJ', { exact: false })
    ).toBeInTheDocument()
  })

  it("n'affiche pas le mail si le jeune n'en a pas", () => {
    // Given
    const jeune = unDetailBeneficiaire()
    delete jeune.email

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        conseiller={unConseiller({ structure: StructureConseiller.MILO })}
      />
    )

    // Then
    expect(screen.queryByTitle('e-mail')).toBeNull()
  })

  it("n'affiche pas le lien vers le dossier si le jeune n'en a pas", () => {
    // Given
    const jeune = unDetailBeneficiaire({ urlDossier: undefined })

    // When
    renderWithContexts(
      <DetailsJeune
        jeune={jeune}
        conseiller={unConseiller({ structure: StructureConseiller.MILO })}
      />
    )

    // Then
    expect(screen.queryByText('Dossier jeune i-milo')).toBeNull()
  })

  describe('Date de fin du CEJ', () => {
    describe('Conseiller MILO', () => {
      it('affiche la date de fin du CEJ si le jeune en a', () => {
        // Given
        const jeune = unDetailBeneficiaire({
          dateFinCEJ: '2022-10-10T10:10:10Z',
        })

        // When
        renderWithContexts(
          <DetailsJeune
            jeune={jeune}
            conseiller={unConseiller({ structure: StructureConseiller.MILO })}
          />
        )

        // Then
        expect(
          screen.queryByText('Date de fin du CEJ', { exact: false })
        ).toBeInTheDocument()
        expect(screen.queryByText('10/10/2022')).toBeInTheDocument()
      })
    })
    describe('Conseiller non MILO', () => {
      it("n'affiche pas la date de fin du CEJ", () => {
        // Given
        const jeune = unDetailBeneficiaire({
          dateFinCEJ: '2022-10-10T10:10:10Z',
        })

        // When
        renderWithContexts(
          <DetailsJeune
            jeune={jeune}
            conseiller={unConseiller({
              structure: StructureConseiller.POLE_EMPLOI,
            })}
            demarches={[]}
          />
        )

        // Then
        expect(screen.queryByText('/Date de fin du CEJ/')).toBeNull()
      })
    })
  })
  describe('identifiant partenaire', () => {
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    beforeEach(async () => {
      alerteSetter = jest.fn()
    })

    describe('pour un jeune France Travail qui n’a pas d’identifiant partenaire', () => {
      beforeEach(() => {
        const jeune = unDetailBeneficiaire({
          idPartenaire: undefined,
        })

        renderWithContexts(
          <DetailsJeune
            jeune={jeune}
            conseiller={unConseiller({
              structure: StructureConseiller.POLE_EMPLOI,
            })}
            demarches={[]}
          />,
          {
            customAlerte: { setter: alerteSetter },
          }
        )
      })

      it('permet l’ajout de l’identifiant', () => {
        expect(
          screen.getByText('Identifiant France Travail :')
        ).toBeInTheDocument()
        expect(screen.getByText('-')).toBeInTheDocument()
        expect(
          screen.getByRole('button', {
            name: 'Ajouter l’identifiant France Travail',
          })
        ).toBeInTheDocument()
      })

      describe('au clic sur le bouton Ajouter', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Ajouter l’identifiant France Travail',
            })
          )
        })

        it('affiche une pop-in pour ajouter un identifiant', async () => {
          expect(
            screen.getByLabelText(
              'Identifiant France Travail (10 caractères maximum)'
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
              'Identifiant France Travail (10 caractères maximum)'
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
          expect(modifierIdentifiantPartenaire).toHaveBeenCalledWith(
            'beneficiaire-1',
            '12345'
          )
          expect(alerteSetter).toHaveBeenCalledWith(
            'modificationIdentifiantPartenaire'
          )
          expect(screen.getByText('12345')).toBeInTheDocument()
        })
      })
    })

    describe('pour un jeune France Travail a déjà un identifiant partenaire', () => {
      beforeEach(() => {
        const jeune = unDetailBeneficiaire({
          idPartenaire: '12345',
        })

        renderWithContexts(
          <DetailsJeune
            jeune={jeune}
            conseiller={unConseiller({
              structure: StructureConseiller.POLE_EMPLOI,
            })}
            demarches={[]}
          />,
          {
            customAlerte: { setter: alerteSetter },
          }
        )
      })

      it('permet la modification de l’identifiant', () => {
        expect(
          screen.getByText('Identifiant France Travail :')
        ).toBeInTheDocument()
        expect(screen.getByText('12345')).toBeInTheDocument()
        expect(
          screen.getByRole('button', {
            name: 'Modifier l’identifiant France Travail',
          })
        ).toBeInTheDocument()
      })

      describe('au clic sur le bouton Modifier', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Modifier l’identifiant France Travail',
            })
          )
        })

        it('affiche une pop-in pour modifier l’identifiant', async () => {
          expect(
            screen.getByLabelText(
              'Identifiant France Travail (10 caractères maximum)'
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
              'Identifiant France Travail (10 caractères maximum)'
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
          expect(modifierIdentifiantPartenaire).toHaveBeenCalledWith(
            'beneficiaire-1',
            '123456789'
          )
          expect(alerteSetter).toHaveBeenCalledWith(
            'modificationIdentifiantPartenaire'
          )
          expect(screen.getByText('123456789')).toBeInTheDocument()
        })
      })
    })

    it('ne permet pas l’ajout d’un identifiant partenaire pour un jeune Mission Locale', () => {
      // Given
      const jeune = unDetailBeneficiaire({
        idPartenaire: undefined,
      })

      // When
      renderWithContexts(
        <DetailsJeune
          jeune={jeune}
          conseiller={unConseiller({ structure: StructureConseiller.MILO })}
        />
      )

      // Then
      expect(() => screen.getByText('Identifiant France Travail :')).toThrow()
      expect(() =>
        screen.getByRole('button', {
          name: 'Ajouter l’identifiant France Travail',
        })
      ).toThrow()
    })
  })
})
