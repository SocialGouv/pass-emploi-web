import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import React from 'react'

import ReaffectationPage from 'app/(connected)/(with-sidebar)/(with-chat)/reaffectation/ReaffectationPage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { BaseConseiller, StructureConseiller } from 'interfaces/conseiller'
import { BeneficiaireFromListe } from 'interfaces/beneficiaire'
import { getConseillers } from 'services/conseiller.service'
import { getJeunesDuConseillerParId, reaffecter } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/conseiller.service')
jest.mock('services/jeunes.service')

describe('Reaffectation', () => {
  let container: HTMLElement
  let jeunes: BeneficiaireFromListe[]
  let conseillers: BaseConseiller[]
  beforeEach(async () => {
    // Given
    jeunes = desItemsBeneficiaires()
    conseillers = [
      {
        id: 'id-nils-tavernier',
        firstName: 'Nils',
        lastName: 'Tavernier',
      },
      {
        id: 'id-neil-armstrong',
        firstName: 'Neil',
        lastName: 'Armstrong',
      },
    ]
    ;(getConseillers as jest.Mock).mockResolvedValue(conseillers)
    ;(getJeunesDuConseillerParId as jest.Mock).mockResolvedValue(jeunes)
  })

  describe('Conseiller SUPERVISEUR_RESPONSABLE', () => {
    beforeEach(async () => {
      // When
      act(() => {
        ;({ container } = renderWithContexts(
          <ReaffectationPage estSuperviseurResponsable={true} />
        ))
      })
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    describe('Étape 1 : contrat réaffectation', () => {
      it('contient un champ pour sélectionner le contrat de réaffectation', () => {
        // When
        const etape = screen.getByRole('group', {
          name: 'Étape 1: Choisissez un accompagnement',
        })
        // Then
        expect(
          within(etape).getByRole('radio', { name: 'CEJ' })
        ).toBeInTheDocument()
        expect(
          within(etape).getByRole('radio', { name: 'BRSA' })
        ).toBeInTheDocument()
      })
    })

    describe('Étape 3 : conseiller initial', () => {
      let etape: HTMLFieldSetElement
      beforeEach(async () => {
        etape = screen.getByRole('group', {
          name: 'Étape 3: Saisissez le conseiller dont les bénéficiaires sont à réaffecter',
        })
        await userEvent.click(screen.getByRole('radio', { name: 'BRSA' }))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche la liste des conseillers possibles pour le contrat sélectionné', async () => {
        // Given
        await userEvent.type(
          within(etape).getByRole('searchbox', {
            name: 'E-mail ou nom et prénom du conseiller',
          }),
          'Nils'
        )

        // When
        await userEvent.click(
          within(etape).getByRole('button', {
            name: 'Rechercher un conseiller initial',
          })
        )

        // Then
        expect(getConseillers).toHaveBeenCalledWith(
          'Nils',
          StructureConseiller.POLE_EMPLOI_BRSA
        )
        const listeConseillers = within(etape).getByRole('table', {
          name: 'Choix du conseiller initial',
        })
        expect(listeConseillers).toBeInTheDocument()
        for (const conseiller of conseillers) {
          expect(
            within(listeConseillers).getByRole('radio', {
              name: `${conseiller.firstName} ${conseiller.lastName}`,
            })
          ).toBeInTheDocument()
        }
      })
    })

    describe('Étape 5 : conseiller destinataire et réaffectation', () => {
      let etape: HTMLFieldSetElement
      let conseillerDestinataireInput: HTMLInputElement
      beforeEach(async () => {
        // Given
        await userEvent.click(screen.getByRole('radio', { name: 'BRSA' }))
        await userEvent.click(screen.getByRole('radio', { name: 'Définitive' }))

        await userEvent.type(
          screen.getByRole('searchbox', { name: /conseiller/ }),
          'Nils'
        )
        await userEvent.click(
          screen.getByRole('button', { name: /conseiller initial/ })
        )
        await userEvent.click(
          screen.getByRole('radio', { name: 'Nils Tavernier' })
        )

        etape = screen.getByRole('group', {
          name: 'Étape 5: Saisissez le conseiller à qui affecter les bénéficiaires',
        })
        conseillerDestinataireInput = within(etape).getByRole('searchbox', {
          name: 'E-mail ou nom et prénom du conseiller',
        })
        await userEvent.type(conseillerDestinataireInput, 'Nils')
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche la liste des conseillers possibles pour le contrat sélectionné', async () => {
        // When
        await userEvent.click(
          within(etape).getByRole('button', {
            name: 'Rechercher un conseiller destinataire',
          })
        )

        // Then
        expect(getConseillers).toHaveBeenCalledWith(
          'Nils',
          StructureConseiller.POLE_EMPLOI_BRSA
        )
        const listeConseillers = within(etape).getByRole('table', {
          name: 'Choix du conseiller destinataire',
        })
        expect(listeConseillers).toBeInTheDocument()
        for (const conseiller of conseillers) {
          expect(
            within(listeConseillers).getByRole('radio', {
              name: `${conseiller.firstName} ${conseiller.lastName}`,
            })
          ).toBeInTheDocument()
        }
      })
    })
  })

  describe('Conseiller non SUPERVISEUR_RESPONSABLE', () => {
    beforeEach(async () => {
      // When
      act(() => {
        ;({ container } = renderWithContexts(
          <ReaffectationPage estSuperviseurResponsable={false} />
        ))
      })
    })
    describe('Étape 1 : type réaffectation', () => {
      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('contient un champ pour sélectionner le type de réaffectation', () => {
        // When
        const etape = screen.getByRole('group', {
          name: 'Étape 1: Choisissez un type de réaffectation',
        })
        // Then
        expect(
          within(etape).getByRole('radio', { name: 'Définitive' })
        ).toBeInTheDocument()
        expect(
          within(etape).getByRole('radio', { name: 'Temporaire' })
        ).toBeInTheDocument()
      })
    })

    describe('Étape 2 : conseiller initial', () => {
      let etape: HTMLFieldSetElement
      beforeEach(async () => {
        etape = screen.getByRole('group', {
          name: 'Étape 2: Saisissez le conseiller dont les bénéficiaires sont à réaffecter',
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it("affiche un champ de recherche d'un conseiller initial", async () => {
        // THEN
        expect(
          within(etape).getByRole('searchbox', {
            name: 'E-mail ou nom et prénom du conseiller',
          })
        ).toBeInTheDocument()
        expect(
          within(etape).getByRole('button', {
            name: 'Rechercher un conseiller initial',
          })
        ).toBeInTheDocument()
      })

      describe('affiche la liste des conseillers possibles', () => {
        beforeEach(async () => {
          // Given
          await userEvent.type(
            within(etape).getByRole('searchbox', {
              name: 'E-mail ou nom et prénom du conseiller',
            }),
            'Nils'
          )

          // When
          await userEvent.click(
            within(etape).getByRole('button', {
              name: 'Rechercher un conseiller initial',
            })
          )
        })

        it('a11y', async () => {
          const results = await axe(container)
          expect(results).toHaveNoViolations()
        })

        it('contenu', () => {
          // Then
          expect(getConseillers).toHaveBeenCalledWith('Nils', undefined)
          const listeConseillers = within(etape).getByRole('table', {
            name: 'Choix du conseiller initial',
          })
          expect(listeConseillers).toBeInTheDocument()
          for (const conseiller of conseillers) {
            expect(
              within(listeConseillers).getByRole('radio', {
                name: `${conseiller.firstName} ${conseiller.lastName}`,
              })
            ).toBeInTheDocument()
          }
        })
      })

      describe('recherche les jeunes du conseiller sélectionné', () => {
        beforeEach(async () => {
          // Given
          await userEvent.type(
            within(etape).getByRole('searchbox', {
              name: 'E-mail ou nom et prénom du conseiller',
            }),
            'Nils'
          )
          await userEvent.click(
            within(etape).getByRole('button', {
              name: 'Rechercher un conseiller initial',
            })
          )

          // When
          await userEvent.click(
            within(etape).getByRole('radio', { name: 'Nils Tavernier' })
          )
        })

        it('a11y', async () => {
          const results = await axe(container)
          expect(results).toHaveNoViolations()
        })

        it('contenu', () => {
          // Then
          expect(getJeunesDuConseillerParId).toHaveBeenCalledWith(
            'id-nils-tavernier'
          )
        })
      })
    })

    describe('Étape 3 : bénéficiaires', () => {
      let etape: HTMLFieldSetElement
      beforeEach(async () => {
        // GIVEN
        await userEvent.type(
          screen.getByRole('searchbox', { name: /conseiller/ }),
          'Nils'
        )
        await userEvent.click(
          screen.getByRole('button', { name: /conseiller initial/ })
        )
        await userEvent.click(
          screen.getByRole('radio', { name: 'Nils Tavernier' })
        )

        etape = screen.getByRole('group', {
          name: 'Étape 3: Sélectionnez les bénéficiaires à réaffecter',
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche les jeunes du conseiller', async () => {
        // THEN
        const liste = within(etape).getByRole('list')

        expect(liste).toBeInTheDocument()
        for (const jeune of jeunes) {
          expect(
            within(liste).getByRole('checkbox', {
              name: `${jeune.nom} ${jeune.prenom}`,
            })
          ).toBeInTheDocument()
        }
      })

      it('selectionne tous les jeunes au clic sur la checkbox', async () => {
        // When
        await userEvent.click(
          within(etape).getByRole('checkbox', {
            name: 'Tout sélectionner',
          })
        )

        // Then
        expect(
          within(etape).getByRole('checkbox', {
            name: 'Tout sélectionner',
          })
        ).toBeChecked()
        for (const jeune of jeunes) {
          expect(
            within(etape).getByRole('checkbox', {
              name: `${jeune.nom} ${jeune.prenom}`,
            })
          ).toBeChecked()
        }

        // When
        await userEvent.click(
          within(etape).getByRole('checkbox', {
            name: 'Tout sélectionner',
          })
        )

        // Then
        expect(
          within(etape).getByRole('checkbox', {
            name: 'Tout sélectionner',
          })
        ).not.toBeChecked()
        for (const jeune of jeunes) {
          expect(
            within(etape).getByRole('checkbox', {
              name: `${jeune.nom} ${jeune.prenom}`,
            })
          ).not.toBeChecked()
        }
      })
    })

    describe('Étape 4 : conseiller destinataire et réaffectation', () => {
      let checkboxBeneficiaire: HTMLInputElement
      let etape: HTMLFieldSetElement
      let conseillerDestinataireInput: HTMLInputElement
      beforeEach(async () => {
        // GIVEN
        await userEvent.type(
          screen.getByRole('searchbox', { name: /conseiller/ }),
          'Nils'
        )
        await userEvent.click(
          screen.getByRole('button', { name: /conseiller initial/ })
        )
        await userEvent.click(
          screen.getByRole('radio', { name: 'Nils Tavernier' })
        )

        checkboxBeneficiaire = screen.getByRole('checkbox', {
          name: new RegExp(jeunes[1].nom),
        })
        etape = screen.getByRole('group', {
          name: 'Étape 4: Saisissez le conseiller à qui affecter les bénéficiaires',
        })
        conseillerDestinataireInput = within(etape).getByRole('searchbox', {
          name: 'E-mail ou nom et prénom du conseiller',
        })

        await userEvent.click(screen.getByRole('radio', { name: 'Définitive' }))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it("affiche un champ de recherche d'un conseiller de destination", async () => {
        // THEN
        expect(conseillerDestinataireInput).toBeInTheDocument()
        expect(
          within(etape).getByRole('button', {
            name: 'Rechercher un conseiller destinataire',
          })
        ).toBeInTheDocument()
      })

      describe('affiche la liste des conseillers possibles', () => {
        beforeEach(async () => {
          // Given
          await userEvent.type(conseillerDestinataireInput, 'Nils')

          // When
          await userEvent.click(
            within(etape).getByRole('button', {
              name: 'Rechercher un conseiller destinataire',
            })
          )
        })

        it('a11y', async () => {
          const results = await axe(container)
          expect(results).toHaveNoViolations()
        })

        it('contenu', () => {
          // Then
          expect(getConseillers).toHaveBeenCalledWith('Nils', undefined)
          const listeConseillers = within(etape).getByRole('table', {
            name: 'Choix du conseiller destinataire',
          })
          expect(listeConseillers).toBeInTheDocument()
          for (const conseiller of conseillers) {
            expect(
              within(listeConseillers).getByRole('radio', {
                name: `${conseiller.firstName} ${conseiller.lastName}`,
              })
            ).toBeInTheDocument()
          }
        })
      })

      describe('réaffecte les jeunes vers le conseiller sélectionné', () => {
        beforeEach(async () => {
          // GIVEN
          await userEvent.type(conseillerDestinataireInput, 'Nils')
          await userEvent.click(
            within(etape).getByRole('button', {
              name: /conseiller destinataire/,
            })
          )
          await userEvent.click(
            within(etape).getByRole('radio', { name: 'Neil Armstrong' })
          )
          await userEvent.click(checkboxBeneficiaire)

          // WHEN
          await userEvent.click(
            screen.getByRole('button', { name: 'Valider mon choix' })
          )
        })

        it('a11y', async () => {
          const results = await axe(container)
          expect(results).toHaveNoViolations()
        })

        it('contenu', () => {
          // THEN
          expect(reaffecter).toHaveBeenCalledWith(
            'id-nils-tavernier',
            'id-neil-armstrong',
            ['beneficiaire-2'],
            false
          )
        })
      })

      describe('bloque la réaffectation des jeunes vers le conseiller initial', () => {
        beforeEach(async () => {
          // GIVEN
          await userEvent.type(conseillerDestinataireInput, 'Nils')
          await userEvent.click(
            within(etape).getByRole('button', {
              name: /conseiller destinataire/,
            })
          )
          await userEvent.click(
            within(etape).getByRole('radio', { name: 'Nils Tavernier' })
          )
          await userEvent.click(checkboxBeneficiaire)

          // WHEN
          await userEvent.click(
            screen.getByRole('button', { name: 'Valider mon choix' })
          )
        })

        it('a11y', async () => {
          const results = await axe(container)
          expect(results).toHaveNoViolations()
        })

        it('contenu', () => {
          // THEN
          expect(
            screen.getByText(
              'Vous ne pouvez pas réaffecter des bénéficiaires à leur conseiller initial'
            )
          ).toBeInTheDocument()
          expect(reaffecter).not.toHaveBeenCalled()
        })
      })
    })

    describe('quand on modifie la recherche du conseiller initial', () => {
      beforeEach(async () => {
        // GIVEN
        const conseillerInitialInput = screen.getByRole('searchbox', {
          name: /conseiller/,
        })
        await userEvent.type(conseillerInitialInput, 'Nils')
        await userEvent.click(
          screen.getByRole('button', { name: /conseiller initial/ })
        )

        // WHEN
        await userEvent.type(conseillerInitialInput, 'whatever')
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('reset le reste du formulaire', () => {
        // THEN
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
        expect(
          screen.queryAllByRole('searchbox', { name: /conseiller/ })
        ).toHaveLength(1)
        expect(
          screen.queryByRole('button', { name: /confirmer/ })
        ).not.toBeInTheDocument()
      })
    })
  })
})
