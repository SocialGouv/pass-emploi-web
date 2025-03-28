import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desCategories, uneAction, uneListeDActions } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { Action } from 'interfaces/action'
import {
  getActionsBeneficiaire,
  qualifierActions,
} from 'services/actions.service'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursBeneficiaire } from 'services/beneficiaires.service'
import { getOffres } from 'services/favoris.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')
jest.mock('services/favoris.service')
jest.mock('services/actions.service')
jest.mock('components/ModalContainer')

// TODO tester périodes, tri, filtres

describe('Actions dans la fiche jeune', () => {
  const actions = uneListeDActions()

  let replace: jest.Mock
  beforeEach(async () => {
    replace = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({ replace })
  })

  describe("quand l'utilisateur n’est pas un conseiller Milo", () => {
    beforeEach(async () => {
      await renderWithContexts(
        <FicheBeneficiairePage
          estMilo={false}
          beneficiaire={unDetailBeneficiaire()}
          historiqueConseillers={[]}
          metadonneesFavoris={uneMetadonneeFavoris()}
          favorisOffres={uneListeDOffres()}
          favorisRecherches={uneListeDeRecherches()}
          ongletInitial='agenda'
        />,
        {
          customConseiller: {
            id: 'id-conseiller-1',
            structure: 'POLE_EMPLOI',
          },
        }
      )
    })

    it("n'affiche pas de lien vers les actions du jeune", async () => {
      expect(() => screen.getByText(/Actions/)).toThrow()
    })

    it('ne permet pas la création d’action', async () => {
      // Then
      expect(() => screen.getByText('Créer une nouvelle action')).toThrow()
    })
  })

  describe("quand l'utilisateur est un conseiller Milo", () => {
    beforeEach(async () => {
      // Given
      const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
      ;(getIndicateursBeneficiaire as jest.Mock).mockResolvedValue(
        desIndicateursSemaine()
      )
      ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
      ;(getOffres as jest.Mock).mockResolvedValue(uneListeDOffres())
    })

    it('affiche les actions du jeune', async () => {
      // Given
      await renderFicheJeuneMILO(actions, { onglet: 'agenda' })

      // When
      const tabActions = screen.getByRole('tab', { name: 'Actions' })
      await userEvent.click(tabActions)

      // Then
      actions.forEach((action) => {
        expect(screen.getByText(action.titre)).toBeInTheDocument()
      })

      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Actions'
      )
      expect(() =>
        screen.getByRole('table', { name: 'Liste de mes rendez-vous' })
      ).toThrow()
      expect(replace).toHaveBeenCalledWith(
        '/mes-jeunes/id-beneficiaire-1?onglet=actions'
      )
    })

    describe('permet la multi qualification', () => {
      beforeEach(async () => {
        await renderFicheJeuneMILO(actions)

        // When
        ;(qualifierActions as jest.Mock).mockResolvedValue({
          idsActionsEnErreur: [],
        })
      })

      describe('quand le conseiller qualifie en SNP', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('checkbox', {
              name: /Sélection Consulter les offres d'emploi/,
            })
          )
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Qualifier les actions en SNP',
            })
          )
        })

        it('affiche la modale de qualification en SNP', () => {
          expect(
            screen.getByText(
              'Les informations seront envoyées à i-milo, qui comptera automatiquement les heures associées à chaque type de SNP.'
            )
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Annuler' })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', {
              name: 'Qualifier et envoyer à i-milo',
            })
          ).toBeInTheDocument()
        })

        it('qualifie l’action', async () => {
          //When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Qualifier et envoyer à i-milo',
            })
          )

          //Then
          expect(qualifierActions).toHaveBeenCalledWith(
            [
              {
                codeQualification: actions[3].qualification!.code,
                idAction: actions[3].id,
              },
            ],
            true
          )
        })
      })

      describe('quand le conseiller enregisre en non SNP', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('checkbox', {
              name: /Sélection Consulter les offres d'emploi/,
            })
          )
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Enregistrer les actions en non SNP',
            })
          )
        })

        it('affiche la modale d’enregistrement en non SNP', () => {
          expect(
            screen.getByText(
              'Les actions non-SNP ne sont pas transmises à i-milo, pour ne pas fausser le calcul d’heures de votre bénéficiaire.'
            )
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Annuler' })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Enregistrer en non SNP' })
          ).toBeInTheDocument()
        })

        it('enregistre l’action', async () => {
          //When
          await userEvent.click(
            screen.getByRole('button', { name: 'Enregistrer en non SNP' })
          )

          //Then
          expect(qualifierActions).toHaveBeenCalledWith(
            [{ codeQualification: 'NON_SNP', idAction: actions[3].id }],
            false
          )
        })
      })
    })

    it('permet la création d’une action', async () => {
      // When
      await renderFicheJeuneMILO(actions)

      // Then
      expect(
        screen.getByRole('link', { name: 'Créer une action' })
      ).toHaveAttribute(
        'href',
        '/mes-jeunes/id-beneficiaire-1/actions/nouvelle-action'
      )
    })

    describe("quand le jeune n'a pas d'action", () => {
      it('affiche un message qui le précise', async () => {
        // Given
        await renderFicheJeuneMILO([])

        // Then
        expect(
          screen.getByText(/Aucune action prévue pour/)
        ).toBeInTheDocument()
      })
    })
  })
})

async function renderFicheJeuneMILO(
  actions: Action[],
  { onglet }: { onglet?: string } = {}
) {
  ;(getActionsBeneficiaire as jest.Mock).mockImplementation(
    async (_, { debut }: { debut: DateTime }) => {
      if (!actions?.length) return []
      return [
        uneAction({ id: 'id-action-0', titre: 'Action ' + debut.toISO() }),
      ].concat(actions)
    }
  )

  await renderWithContexts(
    <FicheBeneficiairePage
      estMilo={true}
      beneficiaire={unDetailBeneficiaire()}
      historiqueConseillers={[]}
      categoriesActions={desCategories()}
      rdvs={[]}
      ongletInitial={onglet ?? 'actions'}
    />,
    {
      customConseiller: {
        id: 'id-conseiller-1',
        structure: 'MILO',
      },
    }
  )
}
