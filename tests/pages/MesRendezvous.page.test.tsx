import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import {
  desRdvListItems,
  uneListeDeRdv,
  unRdvListItem,
  unRendezVous,
} from 'fixtures/rendez-vous'
import { mockedRendezVousService } from 'fixtures/services'
import MesRendezvous, { getServerSideProps } from 'pages/mes-rendezvous'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('MesRendezvous', () => {
  describe('client side', () => {
    const AUJOURDHUI = '2022-08-24'
    const FIN_SEMAINE_COURANTE = '2022-08-30'

    const rendezVous = desRdvListItems()
    const rendezVousSemaineCourante = [
      unRdvListItem({ date: '2022-08-24T10:00:00.000Z' }),
      unRdvListItem({ date: '2022-08-26T10:00:00.000Z' }),
      unRdvListItem({ date: '2022-08-30T10:00:00.000Z' }),
    ]
    describe('contenu', () => {
      beforeEach(() => {
        renderWithContexts(
          <MesRendezvous
            rendezVous={rendezVous}
            rendezVousSemaineCourante={rendezVousSemaineCourante}
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

      it('a deux boutons', () => {
        const semaineFuture = screen.getByRole('button', {
          name: 'Aller à la semaine suivante',
        })

        const semainePassee = screen.getByRole('button', {
          name: 'Aller à la semaine précédente',
        })

        expect(semaineFuture).toBeInTheDocument()
        expect(semainePassee).toBeInTheDocument()
      })

      it('affiche les anciens rdvs quand on clique sur le bouton rendez-vous passés', async () => {
        const oldRdvsButton = screen.getByRole('tab', {
          name: 'Rendez-vous passés',
        })

        await userEvent.click(oldRdvsButton)

        const table = screen.getByRole('table')

        const rows = screen.getAllByRole('row')

        expect(table).toBeInTheDocument()
        expect(rows.length - 1).toBe(rendezVous.length)
      })

      it('affiche la semaine courante par défaut', () => {
        const table = screen.getByRole('table')

        const rows = screen.getAllByRole('row')
        expect(table).toBeInTheDocument()
        expect(screen.getByText('aujourd’hui')).toBeInTheDocument()
        expect(rows.length - 1).toBe(rendezVousSemaineCourante.length * 2)
      })
    })
  })

  describe('server side', () => {
    beforeEach(() => {
      const rendezVousService = mockedRendezVousService({
        getRendezVousConseiller: jest.fn(async () => [unRendezVous()]),
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
