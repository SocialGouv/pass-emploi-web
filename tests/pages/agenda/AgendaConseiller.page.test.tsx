import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
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
  let container: HTMLElement
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
      async (_, dateDebut) => [
        unEvenementListItem({
          id: 'rdv-1',
          date: dateDebut.toISO(),
          beneficiaires: [
            { id: 'beneficiaire-1', nom: 'Jirac', prenom: 'Kenji' },
          ],
        }),
        unEvenementListItem({
          id: 'rdv-2',
          date: dateDebut.plus({ day: 1 }).toISO(),
          beneficiaires: [
            { id: 'beneficiaire-1', nom: 'Jirac', prenom: 'Kenji' },
          ],
          nombreMaxParticipants: 1,
        }),
        unEvenementListItem({
          id: 'rdv-3',
          date: dateDebut.plus({ day: 2 }).toISO(),
          beneficiaires: [
            { id: 'beneficiaire-1', nom: 'Jirac', prenom: 'Kenji' },
          ],
          nombreMaxParticipants: 2,
        }),
        unEvenementListItem({
          id: 'rdv-4',
          date: dateDebut.plus({ day: 3 }).toISO(),
          beneficiaires: [
            { id: 'beneficiaire-1', nom: 'Jirac', prenom: 'Kenji' },
            { id: 'beneficiaire-2', nom: 'Trotro', prenom: 'L’âne' },
          ],
          nombreMaxParticipants: 3,
        }),
      ]
    )
    ;(getSessionsBeneficiaires as jest.Mock).mockImplementation(
      async (_, _dateDebut: DateTime, dateFin: DateTime) => [
        unEvenementListItem({
          id: 'session',
          date: dateFin.set({ hour: 14 }).toISO(),
          isSession: true,
          beneficiaires: [
            { id: 'beneficiaire-1', nom: 'Jirac', prenom: 'Kenji' },
            { id: 'beneficiaire-2', nom: 'Trotro', prenom: 'L’âne' },
          ],
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
        ;({ container } = renderWithContexts(
          <AgendaPage onglet='CONSEILLER' periodeIndexInitial={0} />,
          {
            customConseiller: conseiller,
          }
        ))
      })
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('a deux boutons de navigation', () => {
      // When
      const periodesFutures = screen.getByRole('button', {
        name: 'Aller à la période suivante du 8 septembre 2022 au 14 septembre 2022',
      })

      const periodesPassees = screen.getByRole('button', {
        name: 'Aller à la période précédente du 25 août 2022 au 31 août 2022',
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
        screen.getByRole('link', {
          name: 'Consulter l’événement du 1 septembre 2022 à 0 heure 0 avec Jirac Kenji',
        })
      ).toBeInTheDocument()

      expect(
        screen.getByRole('link', {
          name: 'Consulter l’événement du 7 septembre 2022 à 14 heure 59 avec Jirac Kenji',
        })
      ).toBeInTheDocument()
    })

    it('permet de changer de période de 7 jours', async () => {
      // Given
      const periodePasseeButton = screen.getByRole('button', {
        name: 'Aller à la période précédente du 25 août 2022 au 31 août 2022',
      })
      const buttonPeriodeCourante = screen.getByRole('button', {
        name: 'Aller à la période en cours du 1 septembre 2022 au 7 septembre 2022',
      })
      const periodeFutureButton = screen.getByRole('button', {
        name: 'Aller à la période suivante du 8 septembre 2022 au 14 septembre 2022',
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
    })

    it('affiche le nombre d’inscrits', async () => {
      const row1 = screen
        .getByRole('cell', {
          name: /1 septembre 2022 00h00 - durée 2 heure 5/,
        })
        .closest('tr')!

      const row2 = screen
        .getByRole('cell', {
          name: /2 septembre 2022 00h00 - durée 2 heure 5/,
        })
        .closest('tr')!

      const row3 = screen
        .getByRole('cell', {
          name: /3 septembre 2022 00h00 - durée 2 heure 5/,
        })
        .closest('tr')!

      const row4 = screen
        .getByRole('cell', {
          name: /4 septembre 2022 00h00 - durée 2 heure 5/,
        })
        .closest('tr')!

      expect(
        within(row1).getByRole('cell', { name: '1 inscrit' })
      ).toBeInTheDocument()
      expect(
        within(row2).getByRole('cell', { name: 'Complet' })
      ).toBeInTheDocument()
      expect(
        within(row3).getByRole('cell', { name: '1 inscrit /2' })
      ).toBeInTheDocument()
      expect(
        within(row4).getByRole('cell', { name: '2 inscrits /3' })
      ).toBeInTheDocument()
    })
  })
})
