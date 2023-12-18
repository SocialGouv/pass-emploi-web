import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { desSituationsNonProfessionnelles } from 'fixtures/action'
import {
  ActionPredefinie,
  SituationNonProfessionnelle,
} from 'interfaces/action'
import NouvelleAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/nouvelle-action'
import { AlerteParam } from 'referentiel/alerteParam'
import { creerAction } from 'services/actions.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/referentiel.service')
jest.mock('services/actions.service')

describe('NouvelleAction', () => {
  describe('server side', () => {
    describe("quand l'utilisateur n'est pas connecté", () => {
      it('requiert la connexion', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: false,
          redirect: { destination: 'whatever' },
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ redirect: { destination: 'whatever' } })
      })
    })

    describe("quand l'utilisateur est connecté", () => {
      it('prépare la page', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { accessToken: 'accessToken' },
        })
        ;(getActionsPredefinies as jest.Mock).mockResolvedValue([
          {
            id: 'action-predefinie-1',
            titre: 'Identifier ses atouts et ses compétences',
          },
        ])

        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getActionsPredefinies).toHaveBeenCalledWith('accessToken')
        expect(actual).toEqual({
          props: {
            idJeune: 'id-jeune',
            actionsPredefinies: [
              {
                id: 'action-predefinie-1',
                titre: 'Identifier ses atouts et ses compétences',
              },
              { id: 'autre', titre: 'Autre' },
            ],
            withoutChat: true,
            pageTitle: 'Actions jeune – Créer action',
            pageHeader: 'Créer une nouvelle action',
            returnTo: '/mes-jeunes/id-jeune',
          },
        })
      })
    })
  })

  describe('client side', () => {
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let push: Function
    const categories: SituationNonProfessionnelle[] =
      desSituationsNonProfessionnelles()
    const actionsPredefinies: ActionPredefinie[] = [
      {
        id: 'action-predefinie-1',
        titre: 'Identifier ses atouts et ses compétences',
      },
      { id: 'action-predefinie-2', titre: 'Identifier des pistes de métier' },
      { id: 'action-predefinie-3', titre: 'Identifier des entreprises' },
      { id: 'autre', titre: 'Autre' },
    ]

    beforeEach(async () => {
      // Given
      alerteSetter = jest.fn()
      push = jest.fn(async () => {})
      ;(useRouter as jest.Mock).mockReturnValue({ push })
      jest
        .spyOn(DateTime, 'now')
        .mockReturnValue(DateTime.fromISO('2023-12-19'))

      // When
      renderWithContexts(
        <NouvelleAction
          idJeune='id-jeune'
          categories={categories}
          actionsPredefinies={actionsPredefinies}
          withoutChat={true}
          pageTitle=''
        />,
        {
          customAlerte: { alerteSetter },
        }
      )
    })

    it("permet d'annuler la création de l'action", () => {
      // Then
      expect(
        screen.getByRole('link', {
          hidden: true,
          name: 'Annuler',
        })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune/actions')
    })

    it('contient une liste des catégories de qualification', () => {
      // Then
      const select = screen.getByRole('combobox', { name: 'Catégorie' })

      categories.forEach(({ label }) => {
        expect(
          within(select).getByRole('option', { name: label })
        ).toBeInTheDocument()
      })
    })

    it('contient une liste de titres prédéfinis', () => {
      // Then
      const select = screen.getByRole('combobox', { name: "Titre de l'action" })

      expect(select).toHaveAttribute('required', '')
      actionsPredefinies.forEach(({ titre }) => {
        expect(
          within(select).getByRole('option', { name: titre })
        ).toBeInTheDocument()
      })
    })

    it('contient un champ pour saisir un autre titre', async () => {
      // Given
      expect(
        screen.queryByRole('textbox', { name: /titre personnalisé/ })
      ).not.toBeInTheDocument()

      // When
      const select = screen.getByRole('combobox', { name: "Titre de l'action" })
      await userEvent.selectOptions(select, 'Autre')

      //The
      expect(
        screen.getByRole('textbox', { name: /titre personnalisé/ })
      ).toHaveAttribute('required')
    })

    it('contient un champ pour saisir un commentaire', () => {
      // Then
      expect(
        screen.getByRole('textbox', { name: /Description/ })
      ).not.toHaveAttribute('required')
    })

    it('contient des boutons pour choisir le statut de l‘action', async () => {
      // Then
      expect(screen.getByRole('radio', { name: 'À faire' })).not.toBeChecked()
      expect(screen.getByRole('radio', { name: 'Terminée' })).toBeChecked()
    })

    it('contient un champ pour saisir une date d’échéance', () => {
      // Then
      expect(screen.getByLabelText('* Date')).toHaveAttribute('required')
    })

    it('contient des boutons pour faciliter le choix de la date d’échéance', async () => {
      expect(
        screen.getByRole('button', { name: "Aujourd'hui (mardi 19)" })
      ).toHaveAttribute('aria-controls', 'date-action')
      expect(
        screen.getByRole('button', { name: 'Demain (mercredi 20)' })
      ).toHaveAttribute('aria-controls', 'date-action')
      expect(
        screen.getByRole('button', { name: 'Semaine prochaine (lundi 25)' })
      ).toHaveAttribute('aria-controls', 'date-action')
    })

    describe('action remplie', () => {
      let selectAction: HTMLSelectElement
      let submit: HTMLButtonElement

      beforeEach(async () => {
        // Given
        selectAction = screen.getByRole('combobox', { name: /Titre/ })
        submit = screen.getByRole('button', { name: 'Créer l’action' })
      })

      it("affiche un message d'erreur quand le titre est vide", async () => {
        // When
        await userEvent.click(submit)

        // Then
        expect(
          screen.getByText(/Le champ “Titre de l’action" est vide/)
        ).toBeInTheDocument()
        expect(creerAction).not.toHaveBeenCalled()
      })

      it("affiche un message d'erreur quand la date d'échéance est vide", async () => {
        //Given
        await userEvent.click(submit)

        // Then
        expect(screen.getByText(/Le champ “Date” est vide/)).toBeInTheDocument()
        expect(creerAction).not.toHaveBeenCalled()
      })

      it("affiche un message d'erreur quand date d'echeance n'est pas dans l'interval: un an avant, deux ans après", async () => {
        const dateEcheance = screen.getByLabelText(/Date/)
        await userEvent.type(dateEcheance, '2000-07-30')
        await userEvent.tab()

        // Then
        expect(
          screen.getByText(
            `Le champ “Date” est invalide. Le date attendue est comprise entre le 18/12/2022 et le 19/12/2025.`
          )
        ).toBeInTheDocument()
      })

      describe('formulaire valide', () => {
        beforeEach(async () => {
          // Given
          await userEvent.selectOptions(
            selectAction,
            actionsPredefinies[1].titre
          )

          const description = screen.getByRole('textbox', {
            name: 'Description',
          })
          await userEvent.type(description, 'Description action')

          await userEvent.click(screen.getByRole('button', { name: /Demain/ }))

          // When
          await userEvent.click(submit)
        })

        it("crée l'action", () => {
          // Then
          expect(creerAction).toHaveBeenCalledWith(
            {
              titre: actionsPredefinies[1].titre,
              commentaire: 'Description action',
              dateEcheance: '2023-12-20',
              statut: 'Terminee',
            },
            'id-jeune'
          )
        })

        it('redirige vers la fiche du jeune', () => {
          // Then
          expect(alerteSetter).toHaveBeenCalledWith('creationAction')
          expect(push).toHaveBeenCalledWith(
            '/mes-jeunes/id-jeune?onglet=actions'
          )
        })
      })
    })
  })
})
