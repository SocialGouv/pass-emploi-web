import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import React from 'react'

import DetailActionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
import { unCommentaire, uneAction } from 'fixtures/action'
import { StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { AlerteParam } from 'referentiel/alerteParam'
import { deleteAction, modifierAction } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')
jest.mock('components/PageActionsPortal')

describe('ActionPage client side', () => {
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let routerPush: Function
  const action = uneAction()
  const commentaires = [unCommentaire({ id: 'id-commentaire-3' })]
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
    ;(deleteAction as jest.Mock).mockResolvedValue({})
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
    })
  })

  describe('render', () => {
    beforeEach(async () => {
      renderWithContexts(
        <DetailActionPage
          action={action}
          jeune={jeune}
          commentaires={commentaires}
          lectureSeule={false}
          from='beneficiaire'
        />,
        {
          customAlerte: { alerteSetter },
        }
      )
    })

    it("affiche les information d'une action", () => {
      expect(screen.getByText(action.comment)).toBeInTheDocument()
      expect(screen.getByText('15/02/2022')).toBeInTheDocument()
      expect(screen.getByText('16/02/2022')).toBeInTheDocument()
      expect(screen.getByText(action.creator)).toBeInTheDocument()
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
  })

  describe("quand le conseiller n'est pas le conseiller du jeune", () => {
    ;(modifierAction as jest.Mock).mockImplementation(
      async (_, statut) => statut
    )
    ;(deleteAction as jest.Mock).mockResolvedValue({})

    beforeEach(async () => {
      renderWithContexts(
        <DetailActionPage
          action={action}
          jeune={jeune}
          commentaires={commentaires}
          lectureSeule={true}
          from='beneficiaire'
        />,
        {
          customAlerte: { alerteSetter },
          customConseiller: { id: 'fake-id' },
        }
      )
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
            commentaires={[]}
            lectureSeule={false}
            from='beneficiaire'
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
            },
            customAlerte: { alerteSetter },
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

      describe('quand le conseiller vient de la page pilotage', () => {
        it('affiche un lien pour qualifier l’action qui retourne vers pilotage', () => {
          //When
          renderWithContexts(
            <DetailActionPage
              action={actionAQualifier}
              jeune={jeune}
              commentaires={[]}
              lectureSeule={false}
              from='pilotage'
            />,
            {
              customConseiller: {
                structure: StructureConseiller.MILO,
              },
              customAlerte: { alerteSetter },
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
            commentaires={[]}
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
      const jeune: BaseBeneficiaire & { idConseiller: string } = {
        id: 'beneficiaire-1',
        prenom: 'Nadia',
        nom: 'Sanfamiye',
        idConseiller: 'id-conseiller',
      }

      //When
      beforeEach(async () => {
        ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })

        renderWithContexts(
          <DetailActionPage
            action={actionAQualifier}
            jeune={jeune}
            commentaires={[]}
            lectureSeule={false}
            from='beneficiaire'
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
            },
            customAlerte: { alerteSetter },
          }
        )
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
      const jeune: BaseBeneficiaire & { idConseiller: string } = {
        id: 'beneficiaire-1',
        prenom: 'Nadia',
        nom: 'Sanfamiye',
        idConseiller: 'id-conseiller',
      }

      //When
      beforeEach(async () => {
        ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })

        renderWithContexts(
          <DetailActionPage
            action={actionAQualifier}
            jeune={jeune}
            commentaires={[]}
            lectureSeule={false}
            from='beneficiaire'
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
            },
            customAlerte: { alerteSetter },
          }
        )
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
