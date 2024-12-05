import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'
import React from 'react'

import DetailActionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
import { uneAction } from 'fixtures/action'
import { StatutAction } from 'interfaces/action'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { StructureConseiller } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { deleteAction, modifierAction } from 'services/actions.service'
import { commenterAction } from 'services/messages.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')
jest.mock('services/messages.service')
jest.mock('components/PageActionsPortal')

describe('ActionPage client side', () => {
  let container: HTMLElement
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let routerPush: Function
  const action = uneAction()
  const jeune: BaseBeneficiaire & { idConseiller: string } = {
    id: 'beneficiaire-1',
    prenom: 'Nadia',
    nom: 'Sanfamiye',
    idConseiller: 'id-conseiller',
  }

  beforeEach(() => {
    alerteSetter = jest.fn()
    routerPush = jest.fn()
    ;(modifierAction as jest.Mock).mockImplementation(
      async (_, statut) => statut
    )
    ;(deleteAction as jest.Mock).mockResolvedValue(undefined)
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
    })
  })

  describe('render', () => {
    beforeEach(async () => {
      ;({ container } = renderWithContexts(
        <DetailActionPage
          action={action}
          jeune={jeune}
          lectureSeule={false}
          from='beneficiaire'
        />,
        {
          customAlerte: { setter: alerteSetter },
        }
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it("affiche les information d'une action", async () => {
      expect(getByDescriptionTerm('Description :')).toHaveTextContent(
        action.comment
      )

      await userEvent.click(
        Array.from(container.querySelectorAll('details summary')).find((el) =>
          /Historique/.test(el.textContent!)
        )!
      )
      expect(getByDescriptionTerm('Date de création :')).toHaveTextContent(
        '15/02/2022'
      )
      expect(getByDescriptionTerm('Date d’actualisation :')).toHaveTextContent(
        '16/02/2022'
      )
      expect(getByDescriptionTerm("Créateur de l'action :")).toHaveTextContent(
        action.creator
      )
    })

    describe('Au clique sur un statut', () => {
      it("déclenche le changement de statut de l'action", async () => {
        // Given
        const statutRadio = screen.getByText('À faire')

        // When
        await userEvent.click(statutRadio)

        // Then
        expect(modifierAction).toHaveBeenCalledWith(action.id, {
          statut: StatutAction.AFaire,
        })
      })
    })

    describe('Quand l’action a le statut EnCours', () => {
      it('n’affiche pas la date de réalisation', async () => {
        // Given
        const statutRadio = screen.getByText('À faire')

        // When
        await userEvent.click(statutRadio)

        // Then
        expect(() => screen.getByText('Date de réalisation :')).toThrow()
      })
    })

    describe('Quand l’action passe en statut Terminée', () => {
      it('affiche la date de réalisation', async () => {
        // Given
        const statutRadio = screen.getByText('Terminée - À qualifier')

        // When
        await userEvent.click(statutRadio)

        // Then
        expect(screen.getByText('Date de réalisation :')).toBeInTheDocument()
      })
    })

    describe('Partage action', () => {
      let group: HTMLDetailsElement
      let boutonVoir: HTMLElement
      beforeEach(async () => {
        group = Array.from(container.querySelectorAll('details')).find((el) =>
          /Commentaire/.test(el.textContent!)
        ) as HTMLDetailsElement

        boutonVoir = group.querySelector('summary') as HTMLElement
      })

      it('est caché par défaut', async () => {
        // Then
        expect(group).not.toHaveAttribute('open')
      })

      describe('quand on ouvre l’accordéon', () => {
        beforeEach(async () => {
          // When
          await userEvent.click(boutonVoir)
        })

        it('demande la saisi d’un message', async () => {
          expect(
            within(group).getByRole('textbox', {
              name: 'Demander plus d’information au bénéficiaire sur l’action',
            })
          ).toHaveValue(
            'Pouvez-vous compléter la description de cette action s’il vous plaît ?'
          )
        })

        it('envoie un message', async () => {
          //
          expect(group).toHaveAttribute('open')

          // Given
          // FIXME pourquoi ça marche pas avec userEvent.click ? 🤨
          fireEvent.change(
            within(group).getByRole('textbox', {
              name: 'Demander plus d’information au bénéficiaire sur l’action',
            }),
            {
              target: {
                value:
                  'Peux tu me détailler quelles recherches tu as fait stp ?',
              },
            }
          )

          // When
          await userEvent.click(
            within(group).getByRole('button', {
              name: 'Envoyer au bénéficiaire',
            })
          )

          // Then
          expect(commenterAction).toHaveBeenCalledWith({
            cleChiffrement: 'cleChiffrement',
            idDestinataire: jeune.id,
            message: 'Peux tu me détailler quelles recherches tu as fait stp ?',
            action,
          })
          expect(document.activeElement).toHaveTextContent(
            'Votre message a bien été envoyé, retrouvez le dans votre conversation avec le bénéficiaire.'
          )
        })

        it('a11y', async () => {
          // When
          let results: AxeResults

          await act(async () => {
            results = await axe(container)
          })

          expect(results!).toHaveNoViolations()
        })
      })
    })
  })

  describe("quand le conseiller n'est pas le conseiller du jeune", () => {
    ;(modifierAction as jest.Mock).mockImplementation(
      async (_, statut) => statut
    )
    ;(deleteAction as jest.Mock).mockResolvedValue({})

    beforeEach(async () => {
      ;({ container } = renderWithContexts(
        <DetailActionPage
          action={action}
          jeune={jeune}
          lectureSeule={true}
          from='beneficiaire'
        />,
        {
          customAlerte: { setter: alerteSetter },
          customConseiller: { id: 'fake-id' },
        }
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche un encart lecture seule si ce n‘est pas le conseiller du jeune', async () => {
      //Then
      expect(screen.getByText('Vous êtes en lecture seule')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Vous pouvez uniquement lire le détail de l’action de ce bénéficiaire car il ne fait pas partie de votre portefeuille.'
        )
      ).toBeInTheDocument()
    })

    it('désactive tous les boutons radio', async () => {
      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach((radioBtn) => {
        expect(radioBtn).toHaveAttribute('disabled')
      })
    })

    it("n'affiche pas l'encart de création de commentaire", async () => {
      expect(() =>
        screen.getByText('Commentaire à destination du jeune')
      ).toThrow()
      expect(() => screen.getByLabelText('Ajouter un commentaire')).toThrow()
      expect(() => screen.getByText('Ajouter un commentaire')).toThrow()
    })
  })

  describe("quand l'action est terminée et non qualifiée", () => {
    describe('quand le conseiller est MiLo', () => {
      const actionAQualifier = uneAction({
        status: StatutAction.Terminee,
      })
      const jeune: BaseBeneficiaire & { idConseiller: string } = {
        id: 'beneficiaire-1',
        prenom: 'Nadia',
        nom: 'Sanfamiye',
        idConseiller: 'id-conseiller',
      }

      beforeEach(async () => {
        ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })
      })

      it("affiche un lien pour qualifier l'action", async () => {
        //When
        renderWithContexts(
          <DetailActionPage
            action={actionAQualifier}
            jeune={jeune}
            lectureSeule={false}
            from='beneficiaire'
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
            },
            customAlerte: { setter: alerteSetter },
          }
        )

        //Then
        expect(
          screen
            .getByRole('link', { name: 'Qualifier l’action' })
            .getAttribute('href')
        ).toMatch(
          '/mes-jeunes/beneficiaire-1/actions/id-action-1/qualification?liste=beneficiaire'
        )
      })

      it('a11y', async () => {
        let results: AxeResults
        ;({ container } = renderWithContexts(
          <DetailActionPage
            action={actionAQualifier}
            jeune={jeune}
            lectureSeule={false}
            from='beneficiaire'
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
            },
            customAlerte: { setter: alerteSetter },
          }
        ))

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      describe('quand le conseiller vient de la page pilotage', () => {
        it('affiche un lien pour qualifier l’action qui retourne vers pilotage', () => {
          //When
          renderWithContexts(
            <DetailActionPage
              action={actionAQualifier}
              jeune={jeune}
              lectureSeule={false}
              from='pilotage'
            />,
            {
              customConseiller: {
                structure: StructureConseiller.MILO,
              },
              customAlerte: { setter: alerteSetter },
            }
          )

          //Then
          expect(
            screen
              .getByRole('link', { name: 'Qualifier l’action' })
              .getAttribute('href')
          ).toMatch(
            '/mes-jeunes/beneficiaire-1/actions/id-action-1/qualification?liste=pilotage'
          )
        })
      })
    })

    describe("quand le conseiller n'est pas MiLo", () => {
      const actionAQualifier = uneAction({
        status: StatutAction.Terminee,
      })
      const jeune: BaseBeneficiaire & { idConseiller: string } = {
        id: 'beneficiaire-1',
        prenom: 'Nadia',
        nom: 'Sanfamiye',
        idConseiller: 'id-conseiller',
      }
      beforeEach(async () => {
        renderWithContexts(
          <DetailActionPage
            action={actionAQualifier}
            jeune={jeune}
            lectureSeule={false}
            from='beneficiaire'
          />,
          {
            customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
          }
        )
      })

      it('ne permet pas de supprimer l’action', () => {
        expect(
          screen.queryByRole('button', { name: 'Supprimer l’action' })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe("quand l'action qualifiée", () => {
    const jeune: BaseBeneficiaire & { idConseiller: string } = {
      id: 'beneficiaire-1',
      prenom: 'Nadia',
      nom: 'Sanfamiye',
      idConseiller: 'id-conseiller',
    }
    describe('qualifiée en SNP', () => {
      //Given
      const actionAQualifier = uneAction({
        status: StatutAction.Qualifiee,
        qualification: {
          libelle: 'Emploi',
          code: 'EMPLOI',
          isSituationNonProfessionnelle: true,
        },
      })

      //When
      beforeEach(async () => {
        ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })
        ;({ container } = renderWithContexts(
          <DetailActionPage
            action={actionAQualifier}
            jeune={jeune}
            lectureSeule={false}
            from='beneficiaire'
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
            },
            customAlerte: { setter: alerteSetter },
          }
        ))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('affiche un encart d’information de qualification en SNP', async () => {
        //Then
        expect(screen.getByText('Action qualifiée.')).toBeInTheDocument()
      })

      it('ne permet pas de modifier le statut de l’action', () => {
        expect(screen.getByLabelText('À faire')).toHaveAttribute('disabled')
        expect(screen.getByLabelText('Terminée')).toHaveAttribute('disabled')
      })
    })

    describe('non qualifiée en SNP', () => {
      //Given
      const actionAQualifier = uneAction({
        status: StatutAction.Qualifiee,
        qualification: {
          libelle: 'Non SNP',
          code: 'NON_SNP',
          isSituationNonProfessionnelle: false,
        },
      })

      //When
      beforeEach(async () => {
        ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })
        ;({ container } = renderWithContexts(
          <DetailActionPage
            action={actionAQualifier}
            jeune={jeune}
            lectureSeule={false}
            from='beneficiaire'
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
            },
            customAlerte: { setter: alerteSetter },
          }
        ))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('ne permet pas de modifier le statut de l’action', () => {
        expect(screen.getByLabelText('À faire')).toHaveAttribute('disabled')
        expect(screen.getByLabelText('Terminée')).toHaveAttribute('disabled')
      })

      it('affiche un encart d’information de qualification en SNP', async () => {
        //Then
        expect(
          screen.getByText(/Action qualifiée en non SNP/)
        ).toBeInTheDocument()
      })
    })
  })
})
