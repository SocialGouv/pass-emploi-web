import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import AgendaPage from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage'
import { unConseiller } from 'fixtures/conseiller'
import { uneAnimationCollective } from 'fixtures/evenement'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { StructureConseiller } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { Agence } from 'interfaces/referentiel'
import { modifierAgence } from 'services/conseiller.service'
import { getRendezVousEtablissement } from 'services/evenements.service'
import { getAgencesClientSide } from 'services/referentiel.service'
import {
  changerVisibiliteSession,
  getSessionsMissionLocaleClientSide,
} from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('services/sessions.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')

describe('Agenda - Onglet établissement', () => {
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
    ;(getRendezVousEtablissement as jest.Mock).mockResolvedValue([
      uneAnimationCollective({
        id: 'ac-1',
        date: SEPTEMBRE_1_14H.minus({ day: 3 }),
        statut: StatutAnimationCollective.Close,
      }),
      uneAnimationCollective({
        id: 'ac-2',
        titre: 'Préparation de CV',
        date: SEPTEMBRE_1_14H,
        statut: StatutAnimationCollective.AClore,
      }),
      uneAnimationCollective({
        id: 'ac-3',
        titre: 'Écriture de lettre de motivation',
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
        isSession: true,
        estCache: false,
      }),

      uneAnimationCollective({
        id: 'id-session-2',
        type: 'Atelier i-milo 2',
        date: SEPTEMBRE_1_14H.plus({ day: 4 }),
        duree: 60,
        titre: 'Titre offre session milo 2',
        sousTitre: 'Nom session',
        isSession: true,
        estCache: true,
      }),
    ])
    ;(changerVisibiliteSession as jest.Mock).mockResolvedValue(undefined)
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
        ;({ container } = renderWithContexts(
          <AgendaPage onglet='ETABLISSEMENT' periodeIndexInitial={0} />,
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
        screen.getByRole('cell', {
          name: 'Prise de nouvelles par téléphone',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Consulter Atelier Clos du lundi 29 août à 14h00',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('row', { name: 'aujourd’hui' }).nextSibling
      ).toHaveAccessibleName('Après-midi')
      expect(
        screen.getByRole('cell', {
          name: 'Préparation de CV',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Consulter Atelier À clore du jeudi 1 septembre à 14h00',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('row', { name: 'dimanche 4 septembre' }).nextSibling
      ).toHaveAccessibleName('Après-midi')
      expect(
        screen.getByRole('cell', {
          name: 'Écriture de lettre de motivation',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Consulter Atelier i-milo À venir du dimanche 4 septembre à 14h00',
        })
      ).toBeInTheDocument()
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
        renderWithContexts(
          <AgendaPage onglet='ETABLISSEMENT' periodeIndexInitial={0} />,
          {
            customConseiller: conseiller,
          }
        )
      })
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
        screen.getByRole('cell', {
          name: 'Titre offre session milo Nom session',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Consulter Atelier i-milo À venir du dimanche 4 septembre à 14h00',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('cell', {
          name: 'Titre offre session milo 2 Nom session',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Consulter Atelier i-milo 2 À venir du lundi 5 septembre à 14h00',
        })
      ).toBeInTheDocument()
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
            name: /Titre offre session milo Nom session/,
          })
        ).getByRole('switch', { name: 'Rendre visible l’événement' })
      ).toBeChecked()

      expect(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo 2 Nom session/,
          })
        ).getByRole('switch', { name: 'Rendre visible l’événement' })
      ).not.toBeChecked()
    })

    it('permet de modifier la visibilité d’une session', async () => {
      //Then
      await waitFor(() => {
        expect(
          screen.getByRole('table', {
            name: 'Liste des animations collectives de mon établissement',
          })
        ).toBeInTheDocument()
      })

      await userEvent.click(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo Nom session/,
          })
        ).getByRole('switch', { name: 'Rendre visible l’événement' })
      )

      expect(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo Nom session/,
          })
        ).getByRole('switch', { name: 'Rendre visible l’événement' })
      ).not.toBeChecked()

      expect(changerVisibiliteSession).toHaveBeenCalledWith(
        'id-session-1',
        false
      )
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

      await waitFor(() =>
        expect(screen.getByText('dimanche 4 septembre')).toBeInTheDocument()
      )

      // When
      await userEvent.click(periodesFuturesButton)
      // Then
      expect(getRendezVousEtablissement).toHaveBeenLastCalledWith(
        'id-test',
        SEPTEMBRE_8_0H,
        SEPTEMBRE_14_23H
      )

      await waitFor(() =>
        expect(getSessionsMissionLocaleClientSide).toHaveBeenLastCalledWith(
          '1',
          SEPTEMBRE_8_0H,
          SEPTEMBRE_14_23H
        )
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
        renderWithContexts(
          <AgendaPage onglet='ETABLISSEMENT' periodeIndexInitial={0} />,
          {
            customConseiller: { structure: StructureConseiller.MILO },
          }
        )
      })
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
