import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { uneAnimationCollective, unEvenementListItem } from 'fixtures/evenement'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { StructureConseiller } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { Agence } from 'interfaces/referentiel'
import Agenda, { getServerSideProps } from 'pages/agenda'
import { modifierAgence } from 'services/conseiller.service'
import {
  getRendezVousConseiller,
  getRendezVousEtablissement,
} from 'services/evenements.service'
import { getAgencesClientSide } from 'services/referentiel.service'
import {
  getSessionsBeneficiaires,
  getSessionsMissionLocaleClientSide,
} from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/evenements.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('services/sessions.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')

describe('Agenda', () => {
  describe('client side', () => {
    let replace: jest.Mock
    const AOUT_25_0H = DateTime.fromISO('2022-08-25T00:00:00.000+02:00')
    const AOUT_31_23H = DateTime.fromISO('2022-08-31T23:59:59.999+02:00')
    const SEPTEMBRE_1_0H = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
    const SEPTEMBRE_1_14H = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
    const SEPTEMBRE_7_23H = DateTime.fromISO('2022-09-07T23:59:59.999+02:00')
    const SEPTEMBRE_8_0H = DateTime.fromISO('2022-09-08T00:00:00.000+02:00')
    const SEPTEMBRE_14_23H = DateTime.fromISO('2022-09-14T23:59:59.999+02:00')

    beforeEach(() => {
      // Given
      process.env = Object.assign(process.env, {
        IDS_STRUCTURES_EARLY_ADOPTERS: 'id-test',
      })

      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1_14H)

      replace = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({
        replace: replace,
        asPath: '/mes-jeunes',
      })
      ;(getRendezVousConseiller as jest.Mock).mockImplementation(
        async (_, dateDebut) => [
          unEvenementListItem({
            date: dateDebut.plus({ day: 3 }).toISO(),
          }),
        ]
      )
      ;(getSessionsBeneficiaires as jest.Mock).mockImplementation(
        async (_, dateDebut: DateTime) => [
          unEvenementListItem({
            id: 'session',
            date: dateDebut.plus({ day: 2 }).set({ hour: 14 }).toISO(),
          }),
        ]
      )
      ;(getRendezVousEtablissement as jest.Mock).mockResolvedValue([
        uneAnimationCollective({
          id: 'ac-1',
          date: SEPTEMBRE_1_14H.minus({ day: 3 }),
          statut: StatutAnimationCollective.Close,
        }),
        uneAnimationCollective({
          id: 'ac-2',
          date: SEPTEMBRE_1_14H,
          statut: StatutAnimationCollective.AClore,
        }),
        uneAnimationCollective({
          id: 'ac-3',
          date: SEPTEMBRE_1_14H.plus({ day: 3 }),
          statut: StatutAnimationCollective.AVenir,
        }),
      ])
      ;(getSessionsMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        uneAnimationCollective({
          id: 'id-session-1',
          type: 'Atelier i-milo',
          date: SEPTEMBRE_1_14H.plus({ day: 3 }),
          duree: 60,
          titre: 'Titre offre session milo',
          sousTitre: 'Nom session',
          statut: undefined,
          isSession: true,
          estCache: false,
        }),

        uneAnimationCollective({
          id: 'id-session-2',
          type: 'Atelier i-milo 2',
          date: SEPTEMBRE_1_14H.plus({ day: 4 }),
          duree: 60,
          titre: 'Titre offre session milo',
          sousTitre: 'Nom session',
          statut: undefined,
          isSession: true,
          estCache: true,
        }),
      ])
    })

    describe('contenu', () => {
      beforeEach(async () => {
        // Given
        const conseiller = unConseiller({
          agence: {
            nom: 'Mission Locale Aubenas',
            id: 'id-etablissement',
          },
          structureMilo: {
            nom: 'Mission Locale Aubenas',
            id: 'id-test',
          },
        })

        // When
        await act(async () => {
          await renderWithContexts(<Agenda pageTitle='' />, {
            customConseiller: conseiller,
          })
        })
      })

      it('contient des liens pour des évènements', () => {
        const pageActionPortal = screen.getByTestId('page-action-portal')

        expect(
          within(pageActionPortal).getByRole('link', {
            name: 'Créer une animation collective',
          })
        ).toHaveAttribute('href', '/mes-jeunes/edition-rdv?type=ac')

        expect(
          within(pageActionPortal).getByRole('link', {
            name: 'Créer un rendez-vous',
          })
        ).toHaveAttribute('href', '/mes-jeunes/edition-rdv')
      })

      it('contient 2 onglets', () => {
        // Then
        expect(
          screen.getByRole('tab', { name: 'Mon agenda', selected: false })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('tab', {
            name: 'Agenda établissement',
            selected: true,
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
          {
            pathname: '/agenda',
            query: { onglet: 'etablissement', periodeIndex: 0 },
          },
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
        beforeEach(async () => {
          // When
          await userEvent.click(screen.getByRole('tab', { name: 'Mon agenda' }))
        })
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
          expect(getRendezVousConseiller).toHaveBeenCalledWith(
            '1',
            SEPTEMBRE_1_0H,
            SEPTEMBRE_7_23H
          )
          expect(getSessionsBeneficiaires).toHaveBeenCalledWith(
            '1',
            SEPTEMBRE_1_0H,
            SEPTEMBRE_7_23H
          )

          expect(screen.getByRole('table')).toBeInTheDocument()
          expect(screen.getByText('samedi 3 septembre')).toBeInTheDocument()
          expect(screen.getByText('Matin')).toBeInTheDocument()
          expect(screen.getByText('00h00 - 125 min')).toBeInTheDocument()
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
            name: 'Aller à la Période en cours',
          })
          const periodeFutureButton = screen.getByRole('button', {
            name: 'Aller à la période suivante',
          })

          // When
          await userEvent.click(periodePasseeButton)
          // Then
          expect(getRendezVousConseiller).toHaveBeenLastCalledWith(
            '1',
            AOUT_25_0H,
            AOUT_31_23H
          )
          expect(getSessionsBeneficiaires).toHaveBeenLastCalledWith(
            '1',
            AOUT_25_0H,
            AOUT_31_23H
          )
          expect(screen.getByText('dimanche 28 août')).toBeInTheDocument()

          // When
          await userEvent.click(buttonPeriodeCourante)
          // Then
          expect(getRendezVousConseiller).toHaveBeenCalledWith(
            '1',
            SEPTEMBRE_1_0H,
            SEPTEMBRE_7_23H
          )
          expect(getSessionsBeneficiaires).toHaveBeenCalledWith(
            '1',
            SEPTEMBRE_1_0H,
            SEPTEMBRE_7_23H
          )
          expect(screen.getByText('dimanche 4 septembre')).toBeInTheDocument()

          // When
          await userEvent.click(periodeFutureButton)
          // Then
          expect(getRendezVousConseiller).toHaveBeenLastCalledWith(
            '1',
            SEPTEMBRE_8_0H,
            SEPTEMBRE_14_23H
          )
          expect(getSessionsBeneficiaires).toHaveBeenLastCalledWith(
            '1',
            SEPTEMBRE_8_0H,
            SEPTEMBRE_14_23H
          )
          expect(screen.getByText('dimanche 11 septembre')).toBeInTheDocument()
        })
      })

      describe('agenda établissement', () => {
        beforeEach(async () => {
          // When
          await userEvent.click(
            screen.getByRole('tab', { name: 'Agenda établissement' })
          )
        })

        it('récupère les événements sur une période de 7 jours à partir de la date du jour', async () => {
          // Then
          expect(getRendezVousEtablissement).toHaveBeenCalledWith(
            'id-etablissement',
            SEPTEMBRE_1_0H,
            SEPTEMBRE_7_23H
          )
        })

        it('affiche les événements récupérés', async () => {
          // Then
          await waitFor(() => {
            expect(
              screen.getByRole('table', {
                name: 'Liste des animations collectives de mon établissement',
              })
            ).toBeInTheDocument()
          })
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
            name: 'Aller à la Période en cours',
          })
          const periodesFuturesButton = screen.getByRole('button', {
            name: 'Aller à la période suivante',
          })

          // When
          await userEvent.click(periodesPasseesButton)
          // Then
          expect(getRendezVousEtablissement).toHaveBeenLastCalledWith(
            'id-etablissement',
            AOUT_25_0H,
            AOUT_31_23H
          )

          // When
          await userEvent.click(periodeCouranteButton)

          // Then
          expect(getRendezVousEtablissement).toHaveBeenCalledWith(
            'id-etablissement',
            SEPTEMBRE_1_0H,
            SEPTEMBRE_7_23H
          )

          expect(screen.getByText('dimanche 4 septembre')).toBeInTheDocument()

          // When
          await userEvent.click(periodesFuturesButton)
          // Then
          expect(getRendezVousEtablissement).toHaveBeenLastCalledWith(
            'id-etablissement',
            SEPTEMBRE_8_0H,
            SEPTEMBRE_14_23H
          )
        })
      })
    })

    describe('agenda missions locale quand le conseiller est Milo', () => {
      beforeEach(async () => {
        // Given
        const conseiller = unConseiller({
          structure: StructureConseiller.MILO,
          agence: { nom: 'Mission Locale Aubenas', id: 'id-test' },
          structureMilo: {
            nom: 'Mission Locale Aubenas',
            id: 'id-test',
          },
        })

        // When
        await act(async () => {
          await renderWithContexts(<Agenda pageTitle='' />, {
            customConseiller: conseiller,
          })
        })
        await userEvent.click(
          screen.getByRole('tab', { name: 'Agenda Mission Locale' })
        )
      })

      it('récupère les sessions milo sur une période de 7 jours à partir de la date du jour', async () => {
        // Then
        expect(getSessionsMissionLocaleClientSide).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_1_0H,
          SEPTEMBRE_7_23H
        )
      })

      it('affiche les événements récupérés', async () => {
        // Then
        await waitFor(() => {
          expect(
            screen.getByRole('table', {
              name: 'Liste des animations collectives de mon établissement',
            })
          ).toBeInTheDocument()
        })

        expect(
          screen.getByRole('row', {
            name: 'Consulter Atelier i-milo du dimanche 4 septembre à 14h00',
          })
        ).toHaveAttribute('href', 'agenda/sessions/id-session-1')

        expect(
          screen.getByRole('row', {
            name: 'Consulter Atelier i-milo 2 du lundi 5 septembre à 14h00',
          })
        ).toHaveAttribute('href', 'agenda/sessions/id-session-2')
      })

      it('affiche si une session n’est pas visible', async () => {
        //Then
        await waitFor(() => {
          expect(
            screen.getByRole('table', {
              name: 'Liste des animations collectives de mon établissement',
            })
          ).toBeInTheDocument()
        })

        expect(
          within(
            screen.getByRole('row', {
              name: 'Consulter Atelier i-milo du dimanche 4 septembre à 14h00',
            })
          ).getByLabelText('Visible')
        ).toBeInTheDocument()

        expect(
          within(
            screen.getByRole('row', {
              name: 'Consulter Atelier i-milo 2 du lundi 5 septembre à 14h00',
            })
          ).getByLabelText('Non visible')
        ).toBeInTheDocument()
      })

      it('permet de changer de période de 7 jours', async () => {
        // Given
        const periodesPasseesButton = screen.getByRole('button', {
          name: 'Aller à la période précédente',
        })
        const periodeCouranteButton = screen.getByRole('button', {
          name: 'Aller à la Période en cours',
        })
        const periodesFuturesButton = screen.getByRole('button', {
          name: 'Aller à la période suivante',
        })

        // When
        await userEvent.click(periodesPasseesButton)
        // Then
        expect(getSessionsMissionLocaleClientSide).toHaveBeenLastCalledWith(
          '1',
          AOUT_25_0H,
          AOUT_31_23H
        )

        // When
        await userEvent.click(periodeCouranteButton)

        // Then
        expect(getSessionsMissionLocaleClientSide).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_1_0H,
          SEPTEMBRE_7_23H
        )

        expect(screen.getByText('dimanche 4 septembre')).toBeInTheDocument()

        // When
        await userEvent.click(periodesFuturesButton)
        // Then
        expect(getRendezVousEtablissement).toHaveBeenLastCalledWith(
          'id-test',
          SEPTEMBRE_8_0H,
          SEPTEMBRE_14_23H
        )

        expect(getSessionsMissionLocaleClientSide).toHaveBeenLastCalledWith(
          '1',
          SEPTEMBRE_8_0H,
          SEPTEMBRE_14_23H
        )
      })
    })

    describe('quand le conseiller n’a pas d’établissement', () => {
      let agences: Agence[]

      beforeEach(async () => {
        agences = uneListeDAgencesMILO()
        ;(getAgencesClientSide as jest.Mock).mockResolvedValue(agences)

        // When
        await act(async () => {
          await renderWithContexts(<Agenda pageTitle='' />, {
            customConseiller: { structure: StructureConseiller.MILO },
          })
        })

        await userEvent.click(
          screen.getByRole('tab', { name: 'Agenda Mission Locale' })
        )
      })

      it('n’affiche pas l’agenda de l’établissement', async () => {
        // Then
        expect(() =>
          screen.getByRole('tab', {
            name: 'Agenda établissement',
            selected: true,
          })
        ).toBeTruthy()

        expect(() =>
          screen.getByRole('table', {
            name: 'Liste des animations collectives de mon établissement',
            selected: false,
          })
        ).toThrow()
      })

      it('demande de renseigner son agence', async () => {
        // Then
        expect(
          screen.getByText(/Votre Mission Locale n’est pas renseignée/)
        ).toBeInTheDocument()

        expect(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        ).toBeInTheDocument()
      })

      it('permet de renseigner son agence', async () => {
        // When
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        )

        // Then
        expect(getAgencesClientSide).toHaveBeenCalledWith(
          StructureConseiller.MILO
        )
        expect(
          screen.getByRole('combobox', { name: /votre Mission Locale/ })
        ).toBeInTheDocument()
        agences.forEach((agence) =>
          expect(
            screen.getByRole('option', { hidden: true, name: agence.nom })
          ).toBeInTheDocument()
        )
      })

      it('sauvegarde l’agence et affiche la liste des animations collectives de l’agence', async () => {
        // Given
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        )
        const agence = agences[2]
        const searchAgence = screen.getByRole('combobox', {
          name: /votre Mission Locale/,
        })
        const submit = screen.getByRole('button', { name: 'Ajouter' })
        const pageActionPortal = screen.getByTestId('page-action-portal')

        // When
        await userEvent.selectOptions(searchAgence, agence.nom)
        await userEvent.click(submit)

        // Then
        expect(modifierAgence).toHaveBeenCalledWith({
          id: agence.id,
          nom: agence.nom,
          codeDepartement: '3',
        })
        expect(() =>
          screen.getByText('Votre Mission Locale n’est pas renseignée')
        ).toThrow()
        expect(
          within(pageActionPortal).getByText('Créer une animation collective')
        ).toBeInTheDocument()
      })
    })
  })

  describe('server side', () => {
    describe('Pour un conseiller Pôle Emploi', () => {
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
  })
})
