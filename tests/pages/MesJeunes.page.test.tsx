import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import {
  desItemsJeunes,
  desJeunesAvecActionsNonTerminees,
  unJeuneAvecActionsNonTerminees,
} from 'fixtures/jeune'
import {
  mockedActionsService,
  mockedConseillerService,
  mockedJeunesService,
  mockedMessagesService,
} from 'fixtures/services'
import { Conseiller, UserStructure } from 'interfaces/conseiller'
import {
  CategorieSituation,
  compareJeunesByNom,
  JeuneAvecNbActionsNonTerminees,
} from 'interfaces/jeune'
import MesJeunes, { getServerSideProps } from 'pages/mes-jeunes'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import renderPage from 'tests/renderPage'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { Dependencies } from 'utils/injectionDependances/container'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Mes Jeunes', () => {
  describe('client side', () => {
    let routerPush: Function
    let routerReplace: Function
    let dependances: Pick<Dependencies, 'messagesService' | 'conseillerService'>
    const jeunes = desJeunesAvecActionsNonTerminees()
    beforeEach(() => {
      routerPush = jest.fn()
      routerReplace = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        push: routerPush,
        replace: routerReplace,
      })

      dependances = {
        messagesService: mockedMessagesService({
          signIn: jest.fn(() => Promise.resolve()),
          countMessagesNotRead: jest.fn((_, ids: string[]) =>
            Promise.resolve(
              ids.reduce(
                (mapped, id) => ({ ...mapped, [id]: 2 }),
                {} as { [id: string]: number }
              )
            )
          ),
        }),
        conseillerService: mockedConseillerService(),
      }
    })

    describe('Contenu de page', () => {
      beforeEach(async () => {
        // WHEN
        await act(() => {
          renderPage(
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={jeunes}
              isFromEmail
              pageTitle=''
            />,
            { customDependances: dependances }
          )
        })
      })

      it("affiche la liste des jeunes s'il en a", async () => {
        //THEN
        expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
        jeunes.forEach((jeune) => {
          expect(
            screen.getByText(jeune.nbActionsNonTerminees)
          ).toBeInTheDocument()
        })
        expect(screen.getAllByText('2')).toHaveLength(jeunes.length)

        expect(() =>
          screen.getByText("Vous n'avez pas encore int??gr?? de jeunes.")
        ).toThrow()
        expect(() => screen.getByText(/transf??r??s temporairement/)).toThrow()
      })

      describe("affiche le statut d'activation du compte d'un jeune", () => {
        it("si le compte n'a pas ??t?? activ??", () => {
          const row2 = within(
            screen
              .getByText('Sanfamiye Nadia')
              .closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(row2.getByText('Compte non activ??')).toBeInTheDocument()
        })

        it('si le compte a ??t?? activ??', () => {
          const row1 = within(
            screen
              .getByText('Jirac Kenji')
              .closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(row1.getByText('Le 07/12/2021 ?? 18:30')).toBeInTheDocument()
        })
      })

      describe("affiche la r??affectation temporaire d'un jeune", () => {
        it('si le compte a ??t?? r??affect?? temporairement', () => {
          const row3 = within(
            screen.getByText(/Maria/).closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(
            row3.getByLabelText('b??n??ficiaire temporaire')
          ).toBeInTheDocument()
        })

        it("si le compte n'a pas ??t?? r??affect?? temporairement", () => {
          const row2 = within(
            screen
              .getByText('Sanfamiye Nadia')
              .closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(() => row2.getByText('b??n??ficiaire temporaire')).toThrow()
        })
      })
    })

    describe('quand le conseiller a des b??n??ficiaires ?? r??cup??rer', () => {
      let conseiller: Conseiller
      beforeEach(async () => {
        // Given
        await act(() => {
          conseiller = unConseiller({ aDesBeneficiairesARecuperer: true })
          renderPage(
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={jeunes}
              isFromEmail
              pageTitle=''
            />,
            { customDependances: dependances, customConseiller: conseiller }
          )
        })
      })

      it('affiche un message d???information', () => {
        // Then
        expect(
          screen.getByText(
            'Certains de vos b??n??ficiaires ont ??t?? transf??r??s temporairement.'
          )
        ).toBeInTheDocument()
      })

      it('permet de r??cup??rer les b??n??ficiaires', async () => {
        // Given
        const boutonRecuperationBeneficiaires = screen.getByRole('button', {
          name: 'R??cup??rer ces b??n??ficiaires',
        })

        // When
        await userEvent.click(boutonRecuperationBeneficiaires)

        // Then
        expect(
          dependances.conseillerService.recupererBeneficiaires
        ).toHaveBeenCalledWith(conseiller.id, 'accessToken')
        expect(routerReplace).toHaveBeenCalledWith({
          pathname: '/mes-jeunes',
          query: { recuperation: 'succes' },
        })
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
          renderPage(
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={[jeune]}
              isFromEmail
              pageTitle=''
            />,
            { customDependances: dependances }
          )
        })
      })

      it('redirige vers la page de cr??ation jeune MILO', async () => {
        // GIVEN
        const addButton = screen.getByRole('button', {
          name: 'Ajouter un jeune',
        })

        //WHEN
        await userEvent.click(addButton)

        //THEN
        expect(routerPush).toHaveBeenCalledWith(
          '/mes-jeunes/milo/creation-jeune'
        )
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
          renderPage(
            <MesJeunes
              structureConseiller={UserStructure.POLE_EMPLOI}
              conseillerJeunes={[jeune]}
              isFromEmail
              pageTitle=''
            />,
            { customDependances: dependances }
          )
        })
      })

      it('redirige vers la page de cr??ation jeune PE', async () => {
        // GIVEN
        const addButton = screen.getByRole('button', {
          name: 'Ajouter un jeune',
        })

        //WHEN
        await userEvent.click(addButton)

        //THEN
        expect(routerPush).toHaveBeenCalledWith(
          '/mes-jeunes/pole-emploi/creation-jeune'
        )
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
          renderPage(
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={[]}
              isFromEmail
              pageTitle=''
            />,
            { customDependances: dependances }
          )
        })

        // Then
        expect(() =>
          screen.getByLabelText(/Rechercher un jeune par son nom de famille/)
        ).toThrow()
      })

      it('affiche un message invitant ?? ajouter des jeunes', async () => {
        // GIVEN
        await act(() => {
          renderPage(
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={[]}
              isFromEmail
              pageTitle=''
            />,
            { customDependances: dependances }
          )
        })

        //THEN
        expect(
          screen.getByText("Vous n'avez pas encore int??gr?? de jeunes.")
        ).toBeInTheDocument()
        expect(() => screen.getAllByRole('row')).toThrow()
      })

      describe('quand le conseiller a des b??n??ficiaires ?? r??cup??rer', () => {
        beforeEach(async () => {
          // GIVEN
          const conseiller = unConseiller({
            aDesBeneficiairesARecuperer: true,
          })
          await act(() => {
            renderPage(
              <MesJeunes
                structureConseiller={UserStructure.MILO}
                conseillerJeunes={[]}
                isFromEmail
                pageTitle=''
              />,
              { customDependances: dependances, customConseiller: conseiller }
            )
          })
        })

        it("n'affiche pas de message invitant ?? ajouter des jeunes", () => {
          //THEN
          expect(() =>
            screen.getByText("Vous n'avez pas encore int??gr?? de jeunes.")
          ).toThrow()
          expect(() => screen.getAllByRole('row')).toThrow()
        })

        it('permet de recup??rer les b??n??ficiaires', () => {
          expect(
            screen.getByText(/Vos b??n??ficiaires ont ??t?? transf??r??s/)
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'R??cup??rer les b??n??ficiaires' })
          ).toBeInTheDocument()
        })
      })
    })

    describe('quand la r??cup??ration des messages non lus ??choue', () => {
      it('affiche la liste des jeunes', async () => {
        // GIVEN
        ;(
          dependances.messagesService.countMessagesNotRead as jest.Mock
        ).mockRejectedValue(new Error())

        // WHEN
        await act(() => {
          renderPage(
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={jeunes}
              isFromEmail
              pageTitle=''
            />,
            { customDependances: dependances }
          )
        })

        //THEN
        expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
      })
    })

    describe('quand on vient de selectionner une agence', () => {
      it('affiche un message de succ??s', async () => {
        // When
        await act(() => {
          renderPage(
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={jeunes}
              isFromEmail
              pageTitle=''
              ajoutAgenceSuccess={true}
            />,
            { customDependances: dependances }
          )
        })

        // Then
        expect(
          screen.getByText('Votre Mission locale a ??t?? ajout??e ?? votre profil')
        ).toBeInTheDocument()
      })
    })
  })

  describe('server side', () => {
    let jeunesService: JeunesService
    let actionsService: ActionsService
    beforeEach(() => {
      const jeunes = desItemsJeunes()
      jeunesService = mockedJeunesService({
        getJeunesDuConseiller: jest.fn().mockResolvedValue(jeunes),
      })
      actionsService = mockedActionsService({
        countActionsJeunes: jest.fn().mockResolvedValue(
          jeunes.map((j) => ({
            idJeune: j.id,
            nbActionsNonTerminees: 7,
          }))
        ),
      })
      ;(withDependance as jest.Mock).mockImplementation((dependance) => {
        if (dependance === 'jeunesService') return jeunesService
        if (dependance === 'actionsService') return actionsService
      })
    })

    it("v??rifie qu'il y a un utilisateur connect??", async () => {
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

    it('r??cup??re la liste des jeunes', async () => {
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
      expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
        'id-conseiller',
        'accessToken'
      )
    })

    it("traite la r??ussite d'une suppression de jeune", async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
          accessToken: 'accessToken',
        },
      })

      // When
      const actual = await getServerSideProps({
        query: { suppression: 'succes' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toMatchObject({
        props: {
          deletionSuccess: true,
        },
      })
    })

    it("traite la r??ussite d'une r??cup??ration de b??n??ficiaires", async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
          accessToken: 'accessToken',
        },
      })

      // When
      const actual = await getServerSideProps({
        query: { recuperation: 'succes' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toMatchObject({
        props: {
          recuperationSuccess: true,
        },
      })
    })

    it('traite la r??ussite du renseignement de mon agence', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
          accessToken: 'accessToken',
        },
      })

      // When
      const actual = await getServerSideProps({
        query: { choixAgence: 'succes' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toMatchObject({
        props: {
          ajoutAgenceSuccess: true,
        },
      })
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

      it('ne r??cup??re pas les actions des jeunes', () => {
        // Then
        expect(actionsService.countActionsJeunes).not.toHaveBeenCalled()
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

      it('r??cup??re les actions des jeunes', () => {
        // Then
        expect(actionsService.countActionsJeunes).toHaveBeenCalledWith(
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
            structureConseiller: 'MILO',
            pageTitle: 'Mes jeunes',
            isFromEmail: false,
          },
        })
      })
    })
  })
})
