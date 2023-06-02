import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import {
  desItemsJeunes,
  desJeunesAvecActionsNonTerminees,
  unJeuneAvecActionsNonTerminees,
} from 'fixtures/jeune'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import {
  CategorieSituation,
  compareJeunesByNom,
  JeuneAvecNbActionsNonTerminees,
} from 'interfaces/jeune'
import MesJeunes, { getServerSideProps } from 'pages/mes-jeunes'
import { AlerteParam } from 'referentiel/alerteParam'
import { countActionsJeunes } from 'services/actions.service'
import { recupererBeneficiaires } from 'services/conseiller.service'
import { getJeunesDuConseillerServerSide } from 'services/jeunes.service'
import { countMessagesNotRead, signIn } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/messages.service')
jest.mock('services/conseiller.service')
jest.mock('services/jeunes.service')
jest.mock('services/actions.service')
jest.mock('components/PageActionsPortal')

describe('Mes Jeunes', () => {
  describe('client side', () => {
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    const jeunes = desJeunesAvecActionsNonTerminees()
    beforeEach(() => {
      alerteSetter = jest.fn()
      ;(signIn as jest.Mock).mockResolvedValue(undefined)
      ;(countMessagesNotRead as jest.Mock).mockImplementation((ids: string[]) =>
        Promise.resolve(
          ids.reduce(
            (mapped, id) => ({ ...mapped, [id]: 2 }),
            {} as { [id: string]: number }
          )
        )
      )
    })

    describe('Contenu de page', () => {
      beforeEach(async () => {
        // WHEN
        await act(() => {
          renderWithContexts(
            <MesJeunes conseillerJeunes={jeunes} isFromEmail pageTitle='' />
          )
        })
      })

      it("affiche la liste des bénéficiaires s'il en a", async () => {
        //THEN
        expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
        jeunes.forEach((jeune) => {
          expect(
            screen.getByText(jeune.nbActionsNonTerminees)
          ).toBeInTheDocument()
        })
        expect(screen.getAllByText('2')).toHaveLength(jeunes.length)

        expect(() =>
          screen.getByText("Vous n'avez pas encore intégré de bénéficiaires.")
        ).toThrow()
        expect(() => screen.getByText(/transférés temporairement/)).toThrow()
      })

      describe("affiche le statut d'activation du compte d'un jeune", () => {
        it("si le compte n'a pas été activé", () => {
          const row2 = within(
            screen
              .getByText('Sanfamiye Nadia')
              .closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(row2.getByText('Compte non activé')).toBeInTheDocument()
        })

        it('si le compte a été activé', () => {
          const row1 = within(
            screen
              .getByText('Jirac Kenji')
              .closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(row1.getByText('Le 07/12/2021 à 18h30')).toBeInTheDocument()
        })
      })

      describe("affiche la réaffectation temporaire d'un jeune", () => {
        it('si le compte a été réaffecté temporairement', () => {
          const row3 = within(
            screen.getByText(/Maria/).closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(
            row3.getByLabelText('bénéficiaire temporaire')
          ).toBeInTheDocument()
        })

        it("si le compte n'a pas été réaffecté temporairement", () => {
          const row2 = within(
            screen
              .getByText('Sanfamiye Nadia')
              .closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(() => row2.getByText('bénéficiaire temporaire')).toThrow()
        })
      })
    })

    describe('quand le conseiller a des bénéficiaires à récupérer', () => {
      let conseiller: Conseiller
      beforeEach(async () => {
        // Given
        await act(() => {
          conseiller = unConseiller({ aDesBeneficiairesARecuperer: true })
          renderWithContexts(
            <MesJeunes conseillerJeunes={jeunes} isFromEmail pageTitle='' />,
            {
              customConseiller: conseiller,
              customAlerte: { alerteSetter },
            }
          )
        })
      })

      it('affiche un message d’information', () => {
        // Then
        expect(
          screen.getByText(
            'Certains de vos bénéficiaires ont été transférés temporairement.'
          )
        ).toBeInTheDocument()
      })

      it('permet de récupérer les bénéficiaires', async () => {
        // Given
        const boutonRecuperationBeneficiaires = screen.getByRole('button', {
          name: 'Récupérer ces bénéficiaires',
        })

        // When
        await userEvent.click(boutonRecuperationBeneficiaires)

        // Then
        expect(recupererBeneficiaires).toHaveBeenCalledWith()
        expect(alerteSetter).toHaveBeenCalledWith('recuperationBeneficiaires')
      })
    })

    describe('quand le conseiller est MILO', () => {
      let jeune: JeuneAvecNbActionsNonTerminees

      beforeEach(async () => {
        //GIVEN
        jeune = unJeuneAvecActionsNonTerminees({
          situationCourante: CategorieSituation.DEMANDEUR_D_EMPLOI,
        })

        await act(() => {
          renderWithContexts(
            <MesJeunes conseillerJeunes={[jeune]} isFromEmail pageTitle='' />,
            {
              customConseiller: { structure: StructureConseiller.MILO },
            }
          )
        })
      })

      it('permer de créer un jeune MILO', async () => {
        //THEN
        expect(
          screen.getByRole('link', {
            name: 'Ajouter un bénéficiaire',
          })
        ).toHaveAttribute('href', '/mes-jeunes/milo/creation-jeune')
      })

      it("affiche la colonne nombre d'actions des jeunes", () => {
        // Then
        expect(
          screen.getByRole('columnheader', { name: 'Actions' })
        ).toBeInTheDocument()
      })

      it('affiche la colonne situation courante des jeunes', () => {
        // Then
        expect(
          screen.getByRole('columnheader', { name: 'Situation' })
        ).toBeInTheDocument()
      })

      it('affiche la situation courante du jeune', () => {
        expect(screen.getByText(jeune.situationCourante!)).toBeInTheDocument()
      })
    })

    describe('quand le conseiller est Pole emploi', () => {
      beforeEach(async () => {
        //GIVEN
        const jeune = unJeuneAvecActionsNonTerminees()

        await act(() => {
          renderWithContexts(
            <MesJeunes conseillerJeunes={[jeune]} isFromEmail pageTitle='' />,
            {
              customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
            }
          )
        })
      })

      it('permer de créer un jeune PE', async () => {
        //THEN
        expect(
          screen.getByRole('link', {
            name: 'Ajouter un bénéficiaire',
          })
        ).toHaveAttribute('href', '/mes-jeunes/pole-emploi/creation-jeune')
      })

      it("n'affiche pas le nombre d'actions des jeunes", () => {
        // Then
        expect(() =>
          screen.getByRole('columnheader', { name: 'Actions' })
        ).toThrow()
      })

      it("n'affiche pas la situation courante des jeunes", () => {
        // Then
        expect(() =>
          screen.getByRole('columnheader', { name: 'Situation' })
        ).toThrow()
      })
    })

    describe("quand le conseiller n'a pas de jeune", () => {
      it("n'affiche pas la recherche de jeune", async () => {
        // GIVEN
        await act(() => {
          renderWithContexts(
            <MesJeunes conseillerJeunes={[]} isFromEmail pageTitle='' />
          )
        })

        // Then
        expect(() =>
          screen.getByLabelText(
            /Rechercher un bénéficiaire par son nom ou prénom/
          )
        ).toThrow()
      })

      it('affiche un message invitant à ajouter des bénéficiaires', async () => {
        // GIVEN
        await act(() => {
          renderWithContexts(
            <MesJeunes conseillerJeunes={[]} isFromEmail pageTitle='' />
          )
        })

        //THEN
        expect(
          screen.getByText("Vous n'avez pas encore intégré de bénéficiaires.")
        ).toBeInTheDocument()
        expect(() => screen.getAllByRole('row')).toThrow()
      })

      describe('quand le conseiller a des bénéficiaires à récupérer', () => {
        beforeEach(async () => {
          // GIVEN
          const conseiller = unConseiller({
            aDesBeneficiairesARecuperer: true,
          })
          await act(() => {
            renderWithContexts(
              <MesJeunes conseillerJeunes={[]} isFromEmail pageTitle='' />,
              { customConseiller: conseiller }
            )
          })
        })

        it("n'affiche pas de message invitant à ajouter des bénéficiaires", () => {
          //THEN
          expect(() =>
            screen.getByText("Vous n'avez pas encore intégré de bénéficiaires.")
          ).toThrow()
          expect(() => screen.getAllByRole('row')).toThrow()
        })

        it('permet de recupérer les bénéficiaires', () => {
          expect(
            screen.getByText(/Vos bénéficiaires ont été transférés/)
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Récupérer les bénéficiaires' })
          ).toBeInTheDocument()
        })
      })
    })

    describe('quand la récupération des messages non lus échoue', () => {
      it('affiche la liste des jeunes', async () => {
        // GIVEN
        ;(countMessagesNotRead as jest.Mock).mockRejectedValue(new Error())

        // WHEN
        await act(() => {
          renderWithContexts(
            <MesJeunes conseillerJeunes={jeunes} isFromEmail pageTitle='' />
          )
        })

        //THEN
        expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
      })
    })
  })

  describe('server side', () => {
    beforeEach(() => {
      const jeunes = desItemsJeunes()
      ;(getJeunesDuConseillerServerSide as jest.Mock).mockResolvedValue(jeunes)
      ;(countActionsJeunes as jest.Mock).mockResolvedValue(
        jeunes.map((j) => ({
          idJeune: j.id,
          nbActionsNonTerminees: 7,
        }))
      )
    })

    it("vérifie qu'il y a un utilisateur connecté", async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({
        query: {},
      } as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('récupère la liste des jeunes', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
          accessToken: 'accessToken',
        },
      })

      // When
      await getServerSideProps({ query: {} } as GetServerSidePropsContext)

      // Then
      expect(getJeunesDuConseillerServerSide).toHaveBeenCalledWith(
        'id-conseiller',
        'accessToken'
      )
    })

    describe('pour un conseiller Pole emploi', () => {
      let actual: any
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
            accessToken: 'accessToken',
          },
        })

        // When
        actual = await getServerSideProps({
          query: {},
        } as GetServerSidePropsContext)
      })

      it('ne récupère pas les actions des jeunes', () => {
        // Then
        expect(countActionsJeunes).not.toHaveBeenCalled()
      })

      it("renvoie les jeunes sans leur nombre d'actions", () => {
        // Then
        expect(actual).toMatchObject({
          props: {
            conseillerJeunes: desItemsJeunes()
              .map((jeune) => ({
                ...jeune,
                nbActionsNonTerminees: 0,
              }))
              .sort(compareJeunesByNom),
          },
        })
      })
    })

    describe('pour un conseiller pas Pole emploi', () => {
      let actual: any
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller', structure: 'MILO' },
            accessToken: 'accessToken',
          },
        })

        // When
        actual = await getServerSideProps({
          query: {},
        } as GetServerSidePropsContext)
      })

      it('récupère les actions des jeunes', () => {
        // Then
        expect(countActionsJeunes).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
      })

      it("renvoie les jeunes avec leur nombre d'actions", () => {
        // Then
        expect(actual).toEqual({
          props: {
            conseillerJeunes: desItemsJeunes()
              .map((jeune) => ({
                ...jeune,
                nbActionsNonTerminees: 7,
              }))
              .sort(compareJeunesByNom),
            pageTitle: 'Portefeuille',
            isFromEmail: false,
          },
        })
      })
    })
  })
})
