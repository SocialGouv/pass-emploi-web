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
import { StatutEvenement } from 'interfaces/evenement'
import { Agence } from 'interfaces/referentiel'
import { structureMilo } from 'interfaces/structure'
import { modifierAgence } from 'services/conseiller.service'
import { getRendezVousEtablissement } from 'services/evenements.service'
import { getMissionsLocalesClientSide } from 'services/referentiel.service'
import {
  configurerSession,
  getSessionsMissionLocaleClientSide,
} from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('services/sessions.service')
jest.mock('components/ModalContainer')
jest.mock('components/PageActionsPortal')

describe('Agenda - Onglet Mission Locale', () => {
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
        statut: StatutEvenement.Close,
      }),
      uneAnimationCollective({
        id: 'ac-2',
        titre: 'Préparation de CV',
        date: SEPTEMBRE_1_14H,
        duree: 30,
        nombreParticipants: 2,
        nombreMaxParticipants: 2,
        statut: StatutEvenement.AClore,
      }),
      uneAnimationCollective({
        id: 'ac-3',
        titre: 'Écriture de lettre de motivation',
        date: SEPTEMBRE_1_14H.plus({ day: 3 }),
        statut: StatutEvenement.AVenir,
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
        etatVisibilite: 'visible',
      }),
      uneAnimationCollective({
        id: 'id-session-2',
        type: 'Atelier i-milo 2',
        date: SEPTEMBRE_1_14H.plus({ day: 4 }),
        duree: 60,
        titre: 'Titre offre session milo 2',
        sousTitre: 'Nom session',
        isSession: true,
        etatVisibilite: 'non-visible',
      }),
      uneAnimationCollective({
        id: 'id-session-3',
        type: 'Atelier i-milo 3',
        date: SEPTEMBRE_1_14H.plus({ day: 5 }),
        duree: 60,
        titre: 'Titre offre session milo 3',
        sousTitre: 'Nom session',
        isSession: true,
        etatVisibilite: 'auto-inscription',
      }),
    ])
    ;(configurerSession as jest.Mock).mockResolvedValue(undefined)
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
      ;({ container } = await renderWithContexts(
        <AgendaPage onglet='MISSION_LOCALE' />,
        {
          customConseiller: conseiller,
        }
      ))
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
            name: '6 ateliers ou informations collectives du 1 septembre 2022 au 7 septembre 2022',
          })
        ).toBeInTheDocument()
      })

      const row1 = screen
        .getByRole('cell', {
          name: 'Prise de nouvelles par téléphone Atelier Visible',
        })
        .closest('tr')!
      expect(
        within(row1).getByRole('cell', {
          name: '29 août 2022 14 heure 0 durée 2 heure 5',
        })
      ).toBeInTheDocument()
      expect(
        within(row1).getByRole('cell', { name: '1 inscrit /10' })
      ).toBeInTheDocument()
      expect(
        within(row1).getByRole('link', {
          name: 'Consulter Atelier du 29 août 2022 14:00 - 2h05 Prise de nouvelles par téléphone Atelier Visible 1 inscrit / 10 Clos',
        })
      ).toBeInTheDocument()

      const row2 = screen
        .getByRole('cell', {
          name: 'Préparation de CV Atelier Visible',
        })
        .closest('tr')!
      expect(
        within(row2).getByRole('cell', {
          name: '1 septembre 2022 14 heure 0 durée 30 minutes',
        })
      ).toBeInTheDocument()
      expect(
        within(row2).getByRole('cell', { name: 'Complet' })
      ).toBeInTheDocument()
      expect(
        within(row2).getByRole('link', {
          name: 'Consulter Atelier du 1 septembre 2022 14:00 - 30 min Préparation de CV Atelier Visible Complet À clore',
        })
      ).toBeInTheDocument()

      expect(
        screen.getByRole('link', {
          name: 'Consulter Atelier du 4 septembre 2022 14:00 - 2h05 Écriture de lettre de motivation Atelier Visible 1 inscrit / 10 À venir',
        })
      ).toBeInTheDocument()
    })

    it('a deux boutons de navigation', () => {
      // When
      const periodesFuturesButton = screen.getByRole('button', {
        name: 'Aller à la période suivante du 8 septembre 2022 au 14 septembre 2022',
      })

      const periodesPasseesButton = screen.getByRole('button', {
        name: 'Aller à la période précédente du 25 août 2022 au 31 août 2022',
      })

      // Then
      expect(periodesFuturesButton).toBeInTheDocument()
      expect(periodesPasseesButton).toBeInTheDocument()
    })

    it('permet de changer de période de 7 jours', async () => {
      // Given
      const periodesPasseesButton = screen.getByRole('button', {
        name: 'Aller à la période précédente du 25 août 2022 au 31 août 2022',
      })
      const periodeCouranteButton = screen.getByRole('button', {
        name: 'Aller à la période en cours du 1 septembre 2022 au 7 septembre 2022',
      })
      const periodesFuturesButton = screen.getByRole('button', {
        name: 'Aller à la période suivante du 8 septembre 2022 au 14 septembre 2022',
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
      expect(getRendezVousEtablissement).toHaveBeenCalledWith(
        'id-etablissement',
        SEPTEMBRE_8_0H,
        SEPTEMBRE_14_23H
      )
    })

    it('permet d’accéder directement à une période de 7 jours', async () => {
      // Given
      const periodeInput = screen.getByLabelText('Début période : Du')

      // When
      await userEvent.clear(periodeInput)
      await userEvent.type(periodeInput, '2022-08-28')
      await waitForDebounce(500)
      // Then
      expect(getRendezVousEtablissement).toHaveBeenLastCalledWith(
        'id-etablissement',
        AOUT_25_0H,
        AOUT_31_23H
      )

      // When
      await userEvent.clear(periodeInput)
      await userEvent.type(periodeInput, '2022-09-10')
      await waitForDebounce(500)
      // Then
      expect(getRendezVousEtablissement).toHaveBeenLastCalledWith(
        'id-etablissement',
        SEPTEMBRE_8_0H,
        SEPTEMBRE_14_23H
      )
    })

    it('permet de rechercher un événement', async () => {
      //Given
      const inputRechercheAgenda = screen.getByRole('textbox', {
        name: 'Rechercher un atelier ou une information collective',
      })
      const buttonAgendaRecherche = screen.getByRole('button', {
        name: 'Rechercher',
      })
      const buttonReinitialiserRecherche = screen.getByRole('button', {
        name: 'Effacer le champ de saisie',
      })

      // When
      await userEvent.type(inputRechercheAgenda, 'Prise')
      await userEvent.click(buttonAgendaRecherche)

      // Then
      await waitFor(() => {
        expect(
          screen.getByRole('table', {
            name: '1 résultat du 1 septembre 2022 au 7 septembre 2022',
          })
        ).toBeInTheDocument()
      })
      expect(
        screen.getByRole('cell', {
          name: 'Prise de nouvelles par téléphone Atelier Visible',
        })
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('cell', {
          name: 'Préparation de CV Atelier Visible',
        })
      ).toThrow()

      // When
      await userEvent.click(buttonReinitialiserRecherche)

      // Then
      await waitFor(() => {
        expect(
          screen.getByRole('table', {
            name: '6 ateliers ou informations collectives du 1 septembre 2022 au 7 septembre 2022',
          })
        ).toBeInTheDocument()
      })
      expect(
        screen.getByRole('cell', {
          name: 'Prise de nouvelles par téléphone Atelier Visible',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('cell', {
          name: 'Préparation de CV Atelier Visible',
        })
      ).toBeInTheDocument()
    })
  })

  describe('agenda missions locale quand le conseiller est Milo', () => {
    beforeEach(async () => {
      // Given
      const conseiller = unConseiller({
        structure: structureMilo,
        agence: { nom: 'Mission Locale Aubenas', id: 'id-test' },
        structureMilo: {
          nom: 'Mission Locale Aubenas',
          id: 'id-test',
        },
      })

      // When
      await renderWithContexts(<AgendaPage onglet='MISSION_LOCALE' />, {
        customConseiller: conseiller,
      })
    })

    it('récupère les sessions milo sur une période de 7 jours à partir de la date du jour', async () => {
      // Then
      expect(getSessionsMissionLocaleClientSide).toHaveBeenCalledWith(
        'id-conseiller-1',
        SEPTEMBRE_1_0H,
        SEPTEMBRE_7_23H
      )
    })

    it('affiche les événements récupérés', async () => {
      // Then
      await waitFor(() => {
        expect(
          screen.getByRole('table', {
            name: '6 ateliers ou informations collectives du 1 septembre 2022 au 7 septembre 2022',
          })
        ).toBeInTheDocument()
      })

      expect(
        screen.getByRole('cell', {
          name: 'Titre offre session milo Nom session Informations de la session non modifiables Atelier i-milo Visibilité de l’événement Titre offre session milo Visible',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Consulter Atelier du 4 septembre 2022 14:00 - 2h05 Écriture de lettre de motivation Atelier Visible 1 inscrit / 10 À venir',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('cell', {
          name: 'Titre offre session milo 2 Nom session Informations de la session non modifiables Atelier i-milo 2 Visibilité de l’événement Titre offre session milo 2 Non visible',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Consulter Atelier i-milo 2 du 5 septembre 2022 14:00 - 1h00 Titre offre session milo 2 Nom session Atelier i-milo 2 Non visible 1 inscrit / 10 À venir',
        })
      ).toBeInTheDocument()
    })

    it('affiche la visibilité des sessions', async () => {
      //Then
      await waitFor(() => {
        expect(
          screen.getByRole('table', {
            name: '6 ateliers ou informations collectives du 1 septembre 2022 au 7 septembre 2022',
          })
        ).toBeInTheDocument()
      })

      expect(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo Nom session/,
          })
        ).getByRole('combobox', {
          name: 'Visibilité de l’événement Titre offre session milo',
        })
      ).toHaveTextContent('Visible')

      expect(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo 2 Nom session/,
          })
        ).getByRole('combobox', {
          name: 'Visibilité de l’événement Titre offre session milo 2',
        })
      ).toHaveTextContent('Non visible')

      expect(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo 3 Nom session/,
          })
        ).getByRole('combobox', {
          name: 'Visibilité de l’événement Titre offre session milo 3',
        })
      ).toHaveTextContent('Auto-inscription')
    })

    it('permet de modifier la visibilité d’une session', async () => {
      // Given
      await waitFor(() => {
        expect(
          screen.getByRole('table', {
            name: '6 ateliers ou informations collectives du 1 septembre 2022 au 7 septembre 2022',
          })
        ).toBeInTheDocument()
      })

      // When
      await userEvent.selectOptions(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo Nom session/,
          })
        ).getByRole('combobox', {
          name: 'Visibilité de l’événement Titre offre session milo',
        }),
        'Non visible'
      )

      // Then
      expect(configurerSession).toHaveBeenCalledWith('id-session-1', {
        estVisible: false,
        autoinscription: false,
      })
      expect(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo Nom session/,
          })
        ).getByRole('combobox', {
          name: 'Visibilité de l’événement Titre offre session milo',
        })
      ).toHaveTextContent('Non visible')
    })

    it('permet de modifier l’autoinscription à une session', async () => {
      // Given
      await waitFor(() => {
        expect(
          screen.getByRole('table', {
            name: '6 ateliers ou informations collectives du 1 septembre 2022 au 7 septembre 2022',
          })
        ).toBeInTheDocument()
      })

      // When
      await userEvent.selectOptions(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo Nom session/,
          })
        ).getByRole('combobox', {
          name: 'Visibilité de l’événement Titre offre session milo',
        }),
        'Auto-inscription'
      )

      // Then
      expect(configurerSession).toHaveBeenCalledWith('id-session-1', {
        estVisible: true,
        autoinscription: true,
      })
      expect(
        within(
          screen.getByRole('row', {
            name: /Titre offre session milo Nom session/,
          })
        ).getByRole('combobox', {
          name: 'Visibilité de l’événement Titre offre session milo',
        })
      ).toHaveTextContent('Auto-inscription')
    })

    it('permet de changer de période de 7 jours', async () => {
      // Given
      const periodesPasseesButton = screen.getByRole('button', {
        name: 'Aller à la période précédente du 25 août 2022 au 31 août 2022',
      })
      const periodeCouranteButton = screen.getByRole('button', {
        name: 'Aller à la période en cours du 1 septembre 2022 au 7 septembre 2022',
      })
      const periodesFuturesButton = screen.getByRole('button', {
        name: 'Aller à la période suivante du 8 septembre 2022 au 14 septembre 2022',
      })

      // When
      await userEvent.click(periodesPasseesButton)
      // Then
      expect(getSessionsMissionLocaleClientSide).toHaveBeenLastCalledWith(
        'id-conseiller-1',
        AOUT_25_0H,
        AOUT_31_23H
      )

      // When
      await userEvent.click(periodeCouranteButton)

      // Then
      expect(getSessionsMissionLocaleClientSide).toHaveBeenLastCalledWith(
        'id-conseiller-1',
        SEPTEMBRE_1_0H,
        SEPTEMBRE_7_23H
      )

      // When
      await userEvent.click(periodesFuturesButton)
      // Then
      expect(getRendezVousEtablissement).toHaveBeenLastCalledWith(
        'id-test',
        SEPTEMBRE_8_0H,
        SEPTEMBRE_14_23H
      )
    })
  })

  describe('quand le conseiller n’a pas d’établissement', () => {
    let agences: Agence[]

    beforeEach(async () => {
      agences = uneListeDAgencesMILO()
      ;(getMissionsLocalesClientSide as jest.Mock).mockResolvedValue(agences)

      // When
      await renderWithContexts(<AgendaPage onglet='MISSION_LOCALE' />, {
        customConseiller: { structure: structureMilo },
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
      expect(getMissionsLocalesClientSide).toHaveBeenCalledWith()
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

async function waitForDebounce(ms: number): Promise<void> {
  await act(() => new Promise((r) => setTimeout(r, ms)))
}
