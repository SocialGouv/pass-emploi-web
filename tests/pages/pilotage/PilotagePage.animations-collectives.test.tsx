import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'

import Pilotage from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import { desCategories } from 'fixtures/action'
import { uneListeDAnimationCollectiveAClore } from 'fixtures/evenement'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { Agence } from 'interfaces/referentiel'
import { structureMilo } from 'interfaces/structure'
import { modifierAgence } from 'services/conseiller.service'
import { getAnimationsCollectivesACloreClientSide } from 'services/evenements.service'
import { getMissionsLocalesClientSide } from 'services/referentiel.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('components/ModalContainer')

describe('PilotagePage client side - Animations collectives', () => {
  describe('contenu', () => {
    const animationsCollectives = uneListeDAnimationCollectiveAClore()
    let container: HTMLElement

    beforeEach(async () => {
      ;(
        getAnimationsCollectivesACloreClientSide as jest.Mock
      ).mockImplementation(async (_, page) => ({
        animationsCollectives: [
          {
            id: 'evenement-page-' + page,
            titre: 'Animation page ' + page,
            date: '2018-11-21T06:20:32.232Z',
            nombreInscrits: 5,
          },
        ],
        metadonnees: { nombrePages: 3, nombreTotal: 25 },
      }))
      ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

      await act(async () => {
        ;({ container } = renderWithContexts(
          <Pilotage
            onglet='ANIMATIONS_COLLECTIVES'
            actions={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
            categoriesActions={desCategories()}
            animationsCollectives={{
              donnees: uneListeDAnimationCollectiveAClore(),
              metadonnees: { nombrePages: 3, nombreTotal: 25 },
            }}
          />,
          {
            customConseiller: {
              structure: structureMilo,
              agence: {
                nom: 'Mission Locale Aubenas',
                id: 'id-test',
              },
              structureMilo: {
                nom: 'Mission Locale Aubenas',
                id: 'id-test',
              },
            },
          }
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('résume les activités', async () => {
      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Nouvelles activités'
      )
      expect(getByDescriptionTerm('Les animations')).toHaveTextContent(
        '25 À clore'
      )
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Animations collectives de l’application du CEJ 25 éléments'
      )
    })

    it('affiche un tableau d’animations collectives à clore ', () => {
      // Given
      const tableau = screen.getByRole('table', {
        name: 'Liste des animations collectives à clore',
      })

      // Then
      expect(
        within(tableau).getByRole('columnheader', { name: 'Date' })
      ).toBeInTheDocument()
      expect(
        within(tableau).getByRole('columnheader', {
          name: 'Titre de l’animation collective',
        })
      ).toBeInTheDocument()
      expect(
        within(tableau).getByRole('columnheader', {
          name: 'Participants',
        })
      ).toBeInTheDocument()
    })

    it('affiche les animations collectives de l’établissement à clore', async () => {
      // Given
      const tableau = screen.getByRole('table', {
        name: 'Liste des animations collectives à clore',
      })

      // Then
      animationsCollectives.forEach((animation) => {
        const dateFormatee = DateTime.fromISO(animation.date).toFormat(
          'dd MMMM yyyy',
          { locale: 'fr-FR' }
        )
        expect(
          within(tableau).getByRole('cell', { name: dateFormatee })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('cell', { name: animation.titre })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('cell', {
            name: `${animation.nombreInscrits}`,
          })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('link', {
            name: `Accéder au détail de l’animation collective du ${dateFormatee} ${animation.titre} ${animation.nombreInscrits}`,
          })
        ).toHaveAttribute(
          'href',
          '/mes-jeunes/edition-rdv?idRdv=' + animation.id
        )
      })
    })

    it('met à jour les animations avec la page demandée ', async () => {
      // When
      await userEvent.click(screen.getByLabelText('Page 2'))

      // Then
      expect(getAnimationsCollectivesACloreClientSide).toHaveBeenCalledWith(
        'id-test',
        2
      )
      expect(screen.getByText('Animation page 2')).toBeInTheDocument()
    })
  })

  describe("quand le conseiller n'a pas d'animation collective à clore", () => {
    it('affiche un message qui le précise', async () => {
      // Given
      renderWithContexts(
        <Pilotage
          onglet='ANIMATIONS_COLLECTIVES'
          actions={{
            donnees: [],
            metadonnees: { nombrePages: 0, nombreTotal: 0 },
          }}
          categoriesActions={desCategories()}
          animationsCollectives={{
            donnees: [],
            metadonnees: { nombrePages: 0, nombreTotal: 0 },
          }}
        />
      )

      // Then
      expect(
        screen.getByText('Vous n’avez pas d’animation collective à clore.')
      ).toBeInTheDocument()
    })
  })

  describe('quand le conseiller n’a pas renseigné son agence', () => {
    let agences: Agence[]

    beforeEach(async () => {
      agences = uneListeDAgencesMILO()
      ;(getMissionsLocalesClientSide as jest.Mock).mockResolvedValue(agences)
      ;(
        getAnimationsCollectivesACloreClientSide as jest.Mock
      ).mockImplementation(async (_, page) => ({
        animationsCollectives: [
          {
            id: 'evenement-page-' + page,
            titre: 'Animation page ' + page,
            date: '2018-11-21T06:20:32.232Z',
            nombreInscrits: 5,
          },
        ],
        metadonnees: { nombrePages: 3, nombreTotal: 25 },
      }))

      // When
      await act(async () => {
        renderWithContexts(
          <Pilotage
            onglet='ANIMATIONS_COLLECTIVES'
            actions={{
              donnees: [],
              metadonnees: { nombrePages: 0, nombreTotal: 0 },
            }}
            categoriesActions={desCategories()}
          />,
          {
            customConseiller: { structure: structureMilo },
          }
        )
      })
    })

    it('n’affiche pas la liste des animations à clore', async () => {
      // Then
      expect(() =>
        screen.getByRole('table', {
          name: 'Liste des animations collectives à clore',
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
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      agences.forEach((agence) =>
        expect(
          screen.getByRole('option', { hidden: true, name: agence.nom })
        ).toBeInTheDocument()
      )
    })

    it('sauvegarde l’agence et affiche la liste des animations collectives à clore de l’agence', async () => {
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

      // When
      await userEvent.selectOptions(searchAgence, agence.nom)
      await userEvent.click(submit)

      // Then
      await waitFor(() => {
        expect(modifierAgence).toHaveBeenCalledWith({
          id: agence.id,
          nom: agence.nom,
          codeDepartement: '3',
        })
        expect(
          screen.queryByText('Votre Mission Locale n’est pas renseignée')
        ).not.toBeInTheDocument()
        expect(
          screen.getByRole('table', {
            name: 'Liste des animations collectives à clore',
          })
        ).toBeInTheDocument()
      })
    })
  })
})
