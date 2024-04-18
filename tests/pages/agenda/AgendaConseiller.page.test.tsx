import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import AgendaPage from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage'
import { unConseiller } from 'fixtures/conseiller'
import { unEvenementListItem } from 'fixtures/evenement'
import { StructureConseiller } from 'interfaces/conseiller'
import { getRendezVousConseiller } from 'services/evenements.service'
import { getSessionsBeneficiaires } from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')
jest.mock('services/sessions.service')

describe('Agenda - Onglet conseiller', () => {
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
    jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1_14H)

    replace = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: replace,
      asPath: '/mes-jeunes',
    })
    ;(getRendezVousConseiller as jest.Mock).mockImplementation(
      async (_, dateDebut) => [unEvenementListItem({ date: dateDebut.toISO() })]
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
        renderWithContexts(
          <AgendaPage onglet='CONSEILLER' periodeIndexInitial={0} />,
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
      expect(
        screen.getByRole('row', { name: 'aujourd’hui' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Consulter l’événement du jeudi 1 septembre avec Jirac Kenji',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('row', { name: 'vendredi 2 septembre' })
      ).toBeInTheDocument()
      expect(screen.getByText('Matin')).toBeInTheDocument()
      expect(
        screen.getByRole('row', {
          name: 'mercredi 7 septembre - Autre avec Jirac Kenji',
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
        AOUT_31_23H
      )
      expect(getSessionsBeneficiaires).toHaveBeenLastCalledWith(
        '1',
        AOUT_25_0H,
        AOUT_31_23H
      )
      await waitFor(() =>
        expect(
          screen.getByRole('row', { name: 'dimanche 28 août' })
        ).toBeInTheDocument()
      )

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
      await waitFor(() =>
        expect(
          screen.getByRole('row', { name: 'dimanche 4 septembre' })
        ).toBeInTheDocument()
      )

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
      await waitFor(() =>
        expect(
          screen.getByRole('row', { name: 'jeudi 8 septembre' })
        ).toBeInTheDocument()
      )
    })
  })
})
