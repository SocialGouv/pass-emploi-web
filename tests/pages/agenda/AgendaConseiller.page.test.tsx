import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { unEvenementListItem } from 'fixtures/evenement'
import { StructureConseiller } from 'interfaces/conseiller'
import Agenda from 'pages/agenda'
import { getRendezVousConseiller } from 'services/evenements.service'
import { getSessionsBeneficiaires } from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')
jest.mock('services/sessions.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')

describe('Agenda - Onglet conseiller', () => {
  describe('client side', () => {
    let replace: jest.Mock
    const AOUT_25_0H = DateTime.fromISO('2022-08-25T00:00:00.000+02:00')
    const AOUT_26_23H = DateTime.fromISO('2022-08-26T23:59:59.999+02:00')
    const SEPTEMBRE_1_0H = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
    const SEPTEMBRE_1_14H = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
    const SEPTEMBRE_2_23H = DateTime.fromISO('2022-09-02T23:59:59.999+02:00')
    const SEPTEMBRE_5_0H = DateTime.fromISO('2022-09-05T00:00:00.000+02:00')
    const SEPTEMBRE_5_23H = DateTime.fromISO('2022-09-05T23:59:59.999+02:00')
    const SEPTEMBRE_8_0H = DateTime.fromISO('2022-09-08T00:00:00.000+02:00')
    const SEPTEMBRE_9_23H = DateTime.fromISO('2022-09-09T23:59:59.999+02:00')

    beforeEach(() => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1_14H)

      replace = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({
        replace: replace,
        asPath: '/mes-jeunes',
      })
      ;(getRendezVousConseiller as jest.Mock).mockImplementation(
        async (_, dateDebut) => [
          unEvenementListItem({ date: dateDebut.toISO() }),
        ]
      )
      ;(getSessionsBeneficiaires as jest.Mock).mockImplementation(
        async (_, _dateDebut: DateTime, dateFin: DateTime) => [
          unEvenementListItem({
            id: 'session',
            date: dateFin.set({ hour: 14 }).toISO(),
          }),
        ]
      )
    })

    describe('contenu', () => {
      beforeEach(async () => {
        // Given
        const conseiller = unConseiller({
          structure: StructureConseiller.MILO,
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
          await renderWithContexts(
            <Agenda pageTitle='' onglet='CONSEILLER' />,
            {
              customConseiller: conseiller,
            }
          )
        })
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

      it('affiche une période de 7 jours à partir de la date du jour mais ne charge que les 2 premiers jours', async () => {
        // Then
        expect(getRendezVousConseiller).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_1_0H,
          SEPTEMBRE_2_23H
        )
        expect(getSessionsBeneficiaires).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_1_0H,
          SEPTEMBRE_2_23H
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(
          screen.getByRole('row', { name: 'aujourd’hui' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('row', {
            name: 'Consulter l’événement du jeudi 1 septembre avec Jirac Kenji',
          })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('row', { name: 'vendredi 2 septembre' })
        ).toBeInTheDocument()
        expect(screen.getByText('Matin')).toBeInTheDocument()
        expect(
          screen.getByRole('row', {
            name: 'Consulter l’événement du vendredi 2 septembre avec Jirac Kenji',
          })
        ).toBeInTheDocument()
        expect(screen.getByText('lundi 5 septembre')).toBeInTheDocument()
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
          AOUT_26_23H
        )
        expect(getSessionsBeneficiaires).toHaveBeenLastCalledWith(
          '1',
          AOUT_25_0H,
          AOUT_26_23H
        )
        expect(
          screen.getByRole('row', { name: 'dimanche 28 août' })
        ).toBeInTheDocument()

        // When
        await userEvent.click(buttonPeriodeCourante)
        // Then
        expect(getRendezVousConseiller).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_1_0H,
          SEPTEMBRE_2_23H
        )
        expect(getSessionsBeneficiaires).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_1_0H,
          SEPTEMBRE_2_23H
        )
        expect(
          screen.getByRole('row', { name: 'dimanche 4 septembre' })
        ).toBeInTheDocument()

        // When
        await userEvent.click(periodeFutureButton)
        // Then
        expect(getRendezVousConseiller).toHaveBeenLastCalledWith(
          '1',
          SEPTEMBRE_8_0H,
          SEPTEMBRE_9_23H
        )
        expect(getSessionsBeneficiaires).toHaveBeenLastCalledWith(
          '1',
          SEPTEMBRE_8_0H,
          SEPTEMBRE_9_23H
        )
        expect(
          screen.getByRole('row', { name: 'jeudi 8 septembre' })
        ).toBeInTheDocument()
      })

      it('permet de charger les événements d’une journée', async () => {
        // When
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Afficher l’agenda du lundi 5 septembre',
          })
        )

        // Then
        expect(getRendezVousConseiller).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_5_0H,
          SEPTEMBRE_5_23H
        )
        expect(getSessionsBeneficiaires).toHaveBeenCalledWith(
          '1',
          SEPTEMBRE_5_0H,
          SEPTEMBRE_5_23H
        )
        await waitFor(() => {
          expect(
            screen.getAllByRole('row', {
              name: 'Consulter l’événement du lundi 5 septembre avec Jirac Kenji',
            })
          ).toHaveLength(2)
        })
      })
    })
  })
})
