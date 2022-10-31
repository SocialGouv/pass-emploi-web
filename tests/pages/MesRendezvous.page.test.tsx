import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unRendezVous } from 'fixtures/rendez-vous'
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
    const AOUT_25_0H = DateTime.fromISO('2022-08-25T00:00:00.000+02:00')
    const AOUT_31_23H = DateTime.fromISO('2022-08-31T23:59:59.999+02:00')
    const SEPTEMBRE_1_0H = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
    const SEPTEMBRE_1_14H = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
    const SEPTEMBRE_7_23H = DateTime.fromISO('2022-09-07T23:59:59.999+02:00')
    const SEPTEMBRE_8_0H = DateTime.fromISO('2022-09-08T00:00:00.000+02:00')
    const SEPTEMBRE_14_23H = DateTime.fromISO('2022-09-14T23:59:59.999+02:00')

    let rendezVousService: RendezVousService

    beforeEach(() => {
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1_14H)
    })

    describe('navigation', () => {
      beforeEach(async () => {
        rendezVousService = mockedRendezVousService({
          getRendezVousConseiller: jest
            .fn()
            .mockImplementation(async (_, dateDebut) => [
              unRendezVous({
                date: dateDebut.plus({ day: 3 }).toISO(),
              }),
            ]),
        })
        ;(withDependance as jest.Mock).mockReturnValue(rendezVousService)

        await act(async () => {
          await renderWithContexts(<MesRendezvous pageTitle='' />, {
            customDependances: { rendezVousService },
          })
        })
      })

      it('a un lien pour créer un rendez-vous', () => {
        // Then
        expect(
          screen.getByRole('link', {
            name: 'Créer un rendez-vous',
          })
        ).toHaveAttribute('href', '/mes-jeunes/edition-rdv')
      })

      it('a deux boutons de navigation', () => {
        // When
        const semaineFutures = screen.getByRole('button', {
          name: 'Aller à la semaine suivante',
        })

        const semainePassees = screen.getByRole('button', {
          name: 'Aller à la semaine précédente',
        })

        // Then
        expect(semaineFutures).toBeInTheDocument()
        expect(semainePassees).toBeInTheDocument()
      })

      it('affiche une période de 7 jours à partir de la date du jour', async () => {
        // Then
        expect(rendezVousService.getRendezVousConseiller).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_1_0H,
          SEPTEMBRE_7_23H
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getByText('dimanche 4 septembre')).toBeInTheDocument()
        expect(screen.getByText('Matin')).toBeInTheDocument()
        expect(screen.getByText('00h00 - 125 min')).toBeInTheDocument()
      })

      it('permet de changer de période de 7 jours', async () => {
        // Given
        const rdvsPassesButton = screen.getByRole('button', {
          name: 'Aller à la semaine précédente',
        })
        const buttonRdvsSemaineCourante = screen.getByRole('button', {
          name: 'Aller à la Semaine en cours',
        })
        const rdvsFutursButton = screen.getByRole('button', {
          name: 'Aller à la semaine suivante',
        })

        // When
        await userEvent.click(rdvsPassesButton)
        // Then
        expect(
          rendezVousService.getRendezVousConseiller
        ).toHaveBeenLastCalledWith('1', AOUT_25_0H, AOUT_31_23H)
        expect(screen.getByText('dimanche 28 août')).toBeInTheDocument()

        // When
        await userEvent.click(buttonRdvsSemaineCourante)
        // Then
        expect(rendezVousService.getRendezVousConseiller).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_1_0H,
          SEPTEMBRE_7_23H
        )
        expect(screen.getByText('dimanche 4 septembre')).toBeInTheDocument()

        // When
        await userEvent.click(rdvsFutursButton)
        // Then
        expect(
          rendezVousService.getRendezVousConseiller
        ).toHaveBeenLastCalledWith('1', SEPTEMBRE_8_0H, SEPTEMBRE_14_23H)
        expect(screen.getByText('dimanche 11 septembre')).toBeInTheDocument()
      })
    })
  })

  describe('server side', () => {
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
      it('récupère le titre de la page', async () => {
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
            pageTitle: 'Tableau de bord - Mes rendez-vous',
            pageHeader: 'Rendez-vous',
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
