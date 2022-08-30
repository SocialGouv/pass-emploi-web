import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import {
  desRdvListItems,
  unRdvListItem,
  unRendezVous,
} from 'fixtures/rendez-vous'
import { mockedRendezVousService } from 'fixtures/services'
import MesRendezvous, { getServerSideProps } from 'pages/mes-rendezvous'
import { RendezVousService } from 'services/rendez-vous.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('MesRendezvous', () => {
  describe('client side', () => {
    const AUJOURDHUI = '2022-08-24'
    const FIN_SEMAINE_COURANTE = '2022-08-30'

    const rendezVousSemaineCourante = [
      unRdvListItem({ id: '1', date: '2022-08-24T10:00:00.000Z' }),
      unRdvListItem({ id: '2', date: '2022-08-26T10:00:00.000Z' }),
      unRdvListItem({ id: '3', date: '2022-08-30T10:00:00.000Z' }),
    ]

    describe('contenu', () => {
      beforeEach(() => {
        renderWithContexts(
          <MesRendezvous
            rendezVous={rendezVousSemaineCourante}
            pageTitle=''
            dateDebut={AUJOURDHUI}
            dateFin={FIN_SEMAINE_COURANTE}
          />
        )
      })

      it('a un lien pour fixer un rendez-vous', () => {
        const addRdv = screen.getByRole('link', {
          name: 'Fixer un rendez-vous',
        })

        expect(addRdv).toBeInTheDocument()
        expect(addRdv).toHaveAttribute('href', '/mes-jeunes/edition-rdv')
      })

      it('a deux boutons de navigation', () => {
        const semaineFutures = screen.getByRole('button', {
          name: 'Aller à la semaine suivante',
        })

        const semainePassees = screen.getByRole('button', {
          name: 'Aller à la semaine précédente',
        })

        expect(semaineFutures).toBeInTheDocument()
        expect(semainePassees).toBeInTheDocument()
      })

      it('affiche la semaine courante par défaut', () => {
        const table = screen.getByRole('table')

        const rowsWithoutTableHeader = screen.getAllByRole('row').length - 1
        expect(table).toBeInTheDocument()
        expect(rowsWithoutTableHeader).toBe(9)
      })

      it('au clic affiche la semaine courante', async () => {
        const buttonRdvsSemaineCourante = screen.getByRole('button', {
          name: 'Semaine en cours',
        })

        await userEvent.click(buttonRdvsSemaineCourante)

        const table = screen.getByRole('table')

        const rowsWithoutTableHeader = screen.getAllByRole('row').length - 1

        expect(table).toBeInTheDocument()
        expect(rowsWithoutTableHeader).toBe(9)
      })
    })

    describe('rendez-vous passés', () => {
      let rendezVousService: RendezVousService

      it('affiche les rdvs de la semaine précédente quand on clique sur le bouton pour aller aux rendez-vous précédents', async () => {
        // Given
        rendezVousService = mockedRendezVousService({
          getRendezVousConseillerClientSide: jest.fn(async () => [
            unRendezVous({ id: '1', date: '2022-08-25T10:00:00.000Z' }),
          ]),
        })
        ;(withDependance as jest.Mock).mockReturnValue(rendezVousService)
        const date = DateTime.fromFormat('2022-09-01', 'yyyy-MM-dd', {
          locale: 'fr-FR',
        })

        jest.spyOn(DateTime, 'fromFormat').mockReturnValue(date)

        const rendezVousPasses = desRdvListItems()

        renderWithContexts(
          <MesRendezvous
            rendezVous={rendezVousPasses}
            pageTitle=''
            dateDebut={''}
            dateFin={''}
          />,
          { customDependances: { rendezVousService } }
        )

        const rdvsPassesButton = screen.getByRole('button', {
          name: 'Aller à la semaine précédente',
        })
        const table = screen.getByRole('table')
        const rowsWithoutHeader = screen.getAllByRole('row').length - 1

        // When
        await userEvent.click(rdvsPassesButton)

        // Then
        expect(
          rendezVousService.getRendezVousConseillerClientSide
        ).toHaveBeenCalledWith('1', '2022-08-25', '2022-08-31')
        expect(table).toBeInTheDocument()
        expect(rowsWithoutHeader).toBe(6)
      })
    })

    describe('rendez-vous futurs', () => {
      let rendezVousService: RendezVousService

      it('affiche les rdvs de la semaine suivante quand on clique sur le bouton pour aller à la semaine suivante', async () => {
        // Given
        rendezVousService = mockedRendezVousService({
          getRendezVousConseillerClientSide: jest.fn(async () => [
            unRendezVous({ id: '1', date: '2022-09-14T10:00:00.000Z' }),
          ]),
        })
        ;(withDependance as jest.Mock).mockReturnValue(rendezVousService)
        const date = DateTime.fromFormat('2022-09-01', 'yyyy-MM-dd', {
          locale: 'fr-FR',
        })

        jest.spyOn(DateTime, 'fromFormat').mockReturnValue(date)
        const rendezVousFuturs = [
          unRdvListItem({ id: '1', date: '2022-09-14T10:00:00.000Z' }),
        ]

        renderWithContexts(
          <MesRendezvous
            rendezVous={rendezVousFuturs}
            pageTitle=''
            dateDebut={''}
            dateFin={''}
          />,
          { customDependances: { rendezVousService } }
        )

        const rdvsFutursButton = screen.getByRole('button', {
          name: 'Aller à la semaine suivante',
        })
        const table = screen.getByRole('table')
        const rowsWithoutHeader = screen.getAllByRole('row').length - 1

        // When
        await userEvent.click(rdvsFutursButton)

        // Then
        expect(
          rendezVousService.getRendezVousConseillerClientSide
        ).toHaveBeenCalledWith('1', '2022-09-02', '2022-09-08')
        expect(table).toBeInTheDocument()
        expect(rowsWithoutHeader).toBe(3)
      })
    })
  })

  describe('server side', () => {
    beforeEach(() => {
      const rendezVousService = mockedRendezVousService({
        getRendezVousConseillerServerSide: jest.fn(async () => [
          unRendezVous(),
        ]),
      })
      ;(withDependance as jest.Mock).mockReturnValue(rendezVousService)
    })

    describe('Pour un conseiller Pole Emploi', () => {
      it('renvoie une 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          session: {
            user: { structure: 'POLE_EMPLOI' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe('quand le conseiller est connecté', () => {
      it('récupère les rendez-vous du conseiller', async () => {
        // Given
        const date = DateTime.fromFormat('2022-08-26', 'yyyy-MM-dd', {
          locale: 'fr-FR',
        })
        jest.spyOn(DateTime, 'now').mockReturnValue(date)
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { user: { structure: 'MILO' } },
        })

        // When
        const actual = await getServerSideProps({
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            dateDebut: '26/08/2022',
            dateFin: '01/09/2022',
            rendezVous: [
              expect.objectContaining({
                beneficiaires: 'kenji Jirac',
                idCreateur: '1',
                type: 'Autre',
              }),
            ],
            pageTitle: 'Tableau de bord - Mes rendez-vous',
            pageHeader: 'Mes rendez-vous',
          },
        })
      })
    })

    describe('Quand on vient de créer un rdv', () => {
      it('récupère le statut de la création', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { user: { structure: 'MILO' } },
        })

        // When
        const actual = await getServerSideProps({
          query: { creationRdv: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { creationSuccess: true },
        })
      })
    })

    describe('Quand on vient de modifier un rdv', () => {
      it('récupère le statut de la modification', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { user: { structure: 'MILO' } },
        })

        // When
        const actual = await getServerSideProps({
          query: { modificationRdv: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { modificationSuccess: true },
        })
      })
    })

    describe('Quand on vient de supprimer un rdv', () => {
      it('récupère le statut de la suppression', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { user: { structure: 'MILO' } },
        })

        // When
        const actual = await getServerSideProps({
          query: { suppressionRdv: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { suppressionSuccess: true },
        })
      })
    })

    describe("Quand on vient d'envoyer un message groupé", () => {
      it("récupère le statut de l'envoi", async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { user: { structure: 'MILO' } },
        })

        // When
        const actual = await getServerSideProps({
          query: { envoiMessage: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { messageEnvoiGroupeSuccess: true },
        })
      })
    })
  })
})
