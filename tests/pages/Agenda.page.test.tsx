import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { uneAnimationCollective, unEvenementListItem } from 'fixtures/evenement'
import { mockedRendezVousService } from 'fixtures/services'
import Agenda, { getServerSideProps } from 'pages/agenda'
import { EvenementsService } from 'services/evenements.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Agenda', () => {
  describe('client side', () => {
    let rendezVousService: EvenementsService
    let replace: jest.Mock

    beforeEach(() => {
      // Given
      const SEPTEMBRE_1_14H = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1_14H)

      replace = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ replace: replace })

      rendezVousService = mockedRendezVousService({
        getRendezVousConseiller: jest.fn(async (_, dateDebut) => [
          unEvenementListItem({
            date: dateDebut.plus({ day: 3 }).toISO(),
          }),
        ]),
        getRendezVousEtablissement: jest.fn(async () => [
          uneAnimationCollective({
            id: 'ac-1',
            date: SEPTEMBRE_1_14H.minus({ day: 3 }),
            statut: 'CLOTUREE',
          }),
          uneAnimationCollective({
            id: 'ac-2',
            date: SEPTEMBRE_1_14H,
            statut: 'A_CLOTURER',
          }),
          uneAnimationCollective({
            id: 'ac-3',
            date: SEPTEMBRE_1_14H.plus({ day: 3 }),
            statut: 'A_VENIR',
          }),
        ]),
      })
      ;(withDependance as jest.Mock).mockReturnValue(rendezVousService)
    })

    describe('contenu', () => {
      beforeEach(async () => {
        // Given
        const conseiller = unConseiller({
          agence: {
            nom: 'Mission locale Aubenas',
            id: 'id-etablissement',
          },
        })

        // When
        await act(async () => {
          await renderWithContexts(<Agenda pageTitle='' />, {
            customDependances: { rendezVousService },
            customConseiller: conseiller,
          })
        })
      })

      it('a un lien pour créer un rendez-vous', () => {
        // Then
        expect(
          screen.getByRole('link', {
            name: 'Créer un événement',
          })
        ).toHaveAttribute('href', '/mes-jeunes/edition-rdv')
      })

      it('contient 2 onglets', () => {
        // Then
        expect(
          screen.getByRole('tab', { name: 'Mon agenda', selected: true })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('tab', {
            name: 'Agenda établissement',
            selected: false,
          })
        ).toBeInTheDocument()
      })

      it('permet de changer d’onglet', async () => {
        // When
        await userEvent.click(
          screen.getByRole('tab', { name: 'Agenda établissement' })
        )
        // Then
        expect(replace).toHaveBeenCalledWith(
          { pathname: '/agenda', query: { onglet: 'etablissement' } },
          undefined,
          { shallow: true }
        )
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Agenda établissement')
        expect(
          screen.getByRole('tabpanel', { name: 'Agenda établissement' })
        ).toBeInTheDocument()
        expect(() =>
          screen.getByRole('tabpanel', { name: 'Mon agenda' })
        ).toThrow()

        // When
        await userEvent.click(screen.getByRole('tab', { name: 'Mon agenda' }))
        // Then
        expect(replace).toHaveBeenCalledWith(
          { pathname: '/agenda', query: { onglet: 'conseiller' } },
          undefined,
          { shallow: true }
        )
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Mon agenda')
        expect(
          screen.getByRole('tabpanel', { name: 'Mon agenda' })
        ).toBeInTheDocument()
        expect(() =>
          screen.getByRole('tabpanel', { name: 'Agenda établissement' })
        ).toThrow()
      })

      describe('agenda conseiller', () => {
        const AOUT_25_0H = DateTime.fromISO('2022-08-25T00:00:00.000+02:00')
        const AOUT_31_23H = DateTime.fromISO('2022-08-31T23:59:59.999+02:00')
        const SEPTEMBRE_1_0H = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
        const SEPTEMBRE_7_23H = DateTime.fromISO(
          '2022-09-07T23:59:59.999+02:00'
        )
        const SEPTEMBRE_8_0H = DateTime.fromISO('2022-09-08T00:00:00.000+02:00')
        const SEPTEMBRE_14_23H = DateTime.fromISO(
          '2022-09-14T23:59:59.999+02:00'
        )

        it('a deux boutons de navigation', () => {
          // When
          const periodesFutures = screen.getByRole('button', {
            name: 'Aller à la période suivante',
          })

          const periodesPassees = screen.getByRole('button', {
            name: 'Aller à la période précédente',
          })

          // Then
          expect(periodesFutures).toBeInTheDocument()
          expect(periodesPassees).toBeInTheDocument()
        })

        it('affiche une période de 7 jours à partir de la date du jour', async () => {
          // Then
          expect(
            rendezVousService.getRendezVousConseiller
          ).toHaveBeenCalledWith('1', SEPTEMBRE_1_0H, SEPTEMBRE_7_23H)

          expect(screen.getByRole('table')).toBeInTheDocument()
          expect(screen.getByText('dimanche 4 septembre')).toBeInTheDocument()
          expect(screen.getByText('Matin')).toBeInTheDocument()
          expect(screen.getByText('00h00 - 125 min')).toBeInTheDocument()
        })

        it('permet de changer de période de 7 jours', async () => {
          // Given
          const periodePasseeButton = screen.getByRole('button', {
            name: 'Aller à la période précédente',
          })
          const buttonPeriodeCourante = screen.getByRole('button', {
            name: 'Aller à la période en cours',
          })
          const periodeFutureButton = screen.getByRole('button', {
            name: 'Aller à la période suivante',
          })

          // When
          await userEvent.click(periodePasseeButton)
          // Then
          expect(
            rendezVousService.getRendezVousConseiller
          ).toHaveBeenLastCalledWith('1', AOUT_25_0H, AOUT_31_23H)
          expect(screen.getByText('dimanche 28 août')).toBeInTheDocument()

          // When
          await userEvent.click(buttonPeriodeCourante)
          // Then
          expect(
            rendezVousService.getRendezVousConseiller
          ).toHaveBeenCalledWith('1', SEPTEMBRE_1_0H, SEPTEMBRE_7_23H)
          expect(screen.getByText('dimanche 4 septembre')).toBeInTheDocument()

          // When
          await userEvent.click(periodeFutureButton)
          // Then
          expect(
            rendezVousService.getRendezVousConseiller
          ).toHaveBeenLastCalledWith('1', SEPTEMBRE_8_0H, SEPTEMBRE_14_23H)
          expect(screen.getByText('dimanche 11 septembre')).toBeInTheDocument()
        })
      })

      describe('agenda établissement', () => {
        const AOUT_25_0H = DateTime.fromISO('2022-08-25T00:00:00.000+02:00')
        const AOUT_31_23H = DateTime.fromISO('2022-08-31T23:59:59.999+02:00')
        const SEPTEMBRE_1_0H = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
        const SEPTEMBRE_7_23H = DateTime.fromISO(
          '2022-09-07T23:59:59.999+02:00'
        )
        const SEPTEMBRE_8_0H = DateTime.fromISO('2022-09-08T00:00:00.000+02:00')
        const SEPTEMBRE_14_23H = DateTime.fromISO(
          '2022-09-14T23:59:59.999+02:00'
        )

        beforeEach(async () => {
          // When
          await userEvent.click(
            screen.getByRole('tab', { name: 'Agenda établissement' })
          )
        })

        it('récupère les événements sur une période de 7 jours à partir de la date du jour', async () => {
          // Then
          expect(
            rendezVousService.getRendezVousEtablissement
          ).toHaveBeenCalledWith(
            'id-etablissement',
            SEPTEMBRE_1_0H,
            SEPTEMBRE_7_23H
          )
        })

        it('affiche les événements récupérés', () => {
          // Then
          expect(
            screen.getByRole('table', {
              name: 'Liste des animations collectives de mon établissement',
            })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('row', { name: 'lundi 29 août' }).nextSibling
          ).toHaveAccessibleName('Après-midi')
          expect(
            screen.getByRole('row', {
              name: 'Consulter Atelier Clos du lundi 29 août à 14h00',
            })
          ).toHaveAttribute('href', '/mes-jeunes/edition-rdv?idRdv=ac-1')
          expect(
            screen.getByRole('row', { name: 'aujourd’hui' }).nextSibling
          ).toHaveAccessibleName('Après-midi')
          expect(
            screen.getByRole('row', {
              name: 'Consulter Atelier À clore du jeudi 1 septembre à 14h00',
            })
          ).toHaveAttribute('href', '/mes-jeunes/edition-rdv?idRdv=ac-2')
          expect(
            screen.getByRole('row', { name: 'dimanche 4 septembre' })
              .nextSibling
          ).toHaveAccessibleName('Après-midi')
          expect(
            screen.getByRole('row', {
              name: 'Consulter Atelier À venir du dimanche 4 septembre à 14h00',
            })
          ).toHaveAttribute('href', '/mes-jeunes/edition-rdv?idRdv=ac-3')
        })

        it('a deux boutons de navigation', () => {
          // When
          const periodesFuturesButton = screen.getByRole('button', {
            name: 'Aller à la période suivante',
          })

          const periodesPasseesButton = screen.getByRole('button', {
            name: 'Aller à la période précédente',
          })

          // Then
          expect(periodesFuturesButton).toBeInTheDocument()
          expect(periodesPasseesButton).toBeInTheDocument()
        })

        it('permet de changer de période de 7 jours', async () => {
          // Given
          const periodesPasseesButton = screen.getByRole('button', {
            name: 'Aller à la période précédente',
          })
          const periodeCouranteButton = screen.getByRole('button', {
            name: 'Aller à la période en cours',
          })
          const periodesFuturesButton = screen.getByRole('button', {
            name: 'Aller à la période suivante',
          })

          // When
          await userEvent.click(periodesPasseesButton)
          // Then
          expect(
            rendezVousService.getRendezVousEtablissement
          ).toHaveBeenLastCalledWith(
            'id-etablissement',
            AOUT_25_0H,
            AOUT_31_23H
          )

          // When
          await userEvent.click(periodeCouranteButton)

          // Then
          expect(
            rendezVousService.getRendezVousEtablissement
          ).toHaveBeenCalledWith(
            'id-etablissement',
            SEPTEMBRE_1_0H,
            SEPTEMBRE_7_23H
          )
          expect(screen.getByText('dimanche 4 septembre')).toBeInTheDocument()

          // When
          await userEvent.click(periodesFuturesButton)
          // Then
          expect(
            rendezVousService.getRendezVousEtablissement
          ).toHaveBeenLastCalledWith(
            'id-etablissement',
            SEPTEMBRE_8_0H,
            SEPTEMBRE_14_23H
          )
        })
      })
    })

    describe('quand le conseiller n’a pas d’établissement', () => {
      it('n’affiche pas l’agenda de l’établissement', async () => {
        // When
        await act(async () => {
          await renderWithContexts(<Agenda pageTitle='' />, {
            customDependances: { rendezVousService },
          })
        })

        // Then
        expect(() =>
          screen.getByRole('tab', {
            name: 'Agenda établissement',
            selected: false,
          })
        ).toThrow()
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
      it('récupère les infos de la page', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { user: { structure: 'MILO' } },
        })

        // When
        const actual = await getServerSideProps({
          query: { onglet: 'etablissement' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            pageTitle: 'Tableau de bord - Agenda',
            pageHeader: 'Agenda',
            onglet: 'ETABLISSEMENT',
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
