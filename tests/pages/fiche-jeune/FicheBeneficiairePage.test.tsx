import { act, screen } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React, { Dispatch, SetStateAction } from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  unBeneficiaireChat,
  unDetailBeneficiaire,
  uneDemarche,
  uneListeDeDemarches,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { Demarche, MetadonneesFavoris } from 'interfaces/beneficiaire'
import { StructureConseiller } from 'interfaces/conseiller'
import { Offre, Recherche } from 'interfaces/favoris'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/beneficiaires.service'
import renderWithContexts from 'tests/renderWithContexts'
import { CurrentConversation } from 'utils/chat/currentConversationContext'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')

describe('FicheBeneficiairePage client side', () => {
  beforeEach(async () => {
    ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
  })

  describe('pour tous les conseillers', () => {
    it('modifie le currentJeune', async () => {
      // Given
      const setCurrentConversation = jest.fn()
      const beneficiaire = unDetailBeneficiaire()
      const conversation = unBeneficiaireChat({ ...beneficiaire })

      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            estMilo={true}
            beneficiaire={beneficiaire}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            categoriesActions={desCategories()}
            ongletInitial='agenda'
            lectureSeule={false}
          />,
          {
            customChats: [conversation],
            customCurrentConversation: { setter: setCurrentConversation },
            customConseiller: { id: beneficiaire.idConseiller },
          }
        )
      })

      // Then
      expect(setCurrentConversation).toHaveBeenCalledWith({
        conversation,
        shouldFocusOnRender: false,
      })
    })
  })

  describe('pour les conseillers non référent', () => {
    let container: HTMLElement
    let setCurrentConversation: Dispatch<
      SetStateAction<CurrentConversation | undefined>
    >
    beforeEach(async () => {
      // Given
      setCurrentConversation = jest.fn()

      // When
      await act(async () => {
        ;({ container } = renderWithContexts(
          <FicheBeneficiairePage
            estMilo={true}
            beneficiaire={unDetailBeneficiaire()}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            categoriesActions={desCategories()}
            ongletInitial='agenda'
            lectureSeule={true}
          />,
          {
            customConseiller: { id: 'fake-id' },
            customCurrentConversation: { setter: setCurrentConversation },
          }
        ))
      })
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('ne modifie pas le currentJeune', async () => {
      //Then
      expect(setCurrentConversation).not.toHaveBeenCalled()
    })

    it('restreint l‘accès aux boutons', async () => {
      //Then
      expect(
        screen.queryByRole('button', { name: 'Supprimer ce compte' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: 'Créer un rendez-vous' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: 'Créer une action' })
      ).not.toBeInTheDocument()
    })

    it('affiche un encart lecture seule', async () => {
      //Then
      expect(screen.getByText('Vous êtes en lecture seule')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Vous pouvez uniquement lire la fiche de ce bénéficiaire car il ne fait pas partie de votre portefeuille.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('pour les conseillers Milo', () => {
    let container: HTMLElement

    it('a11y', async () => {
      await act(async () => {
        ;({ container } = renderWithContexts(
          <FicheBeneficiairePage
            estMilo={true}
            beneficiaire={unDetailBeneficiaire()}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            categoriesActions={desCategories()}
            ongletInitial='agenda'
            lectureSeule={false}
          />,
          {
            customConseiller: { structure: StructureConseiller.MILO },
          }
        ))
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche un lien pour accéder au calendrier de l’établissement', async () => {
      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            estMilo={true}
            beneficiaire={unDetailBeneficiaire()}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            categoriesActions={desCategories()}
            ongletInitial='agenda'
            lectureSeule={false}
          />,
          {
            customConseiller: { structure: StructureConseiller.MILO },
          }
        )
      })

      // Then
      expect(
        screen.getByRole('link', {
          name: 'Inscrire à une animation collective',
        })
      ).toHaveAttribute('href', '/agenda?onglet=etablissement')
    })

    describe('quand le compte du bénéficiaire n’est pas activé', () => {
      it('affiche un message', async () => {
        // When
        await act(async () => {
          renderWithContexts(
            <FicheBeneficiairePage
              estMilo={true}
              beneficiaire={unDetailBeneficiaire({ isActivated: false })}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              categoriesActions={desCategories()}
              ongletInitial='agenda'
              lectureSeule={false}
            />,
            {
              customConseiller: { structure: StructureConseiller.MILO },
            }
          )
        })

        // Then
        expect(
          screen.getByText(
            /Ce bénéficiaire ne s’est pas encore connecté à l’application/
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            /Le lien d’activation envoyé par i-milo à l’adresse e-mail du bénéficiaire n’est valable que 24h/
          )
        ).toBeInTheDocument()
      })
    })

    describe('quand la structure du bénéficiaire est différente du conseiller', () => {
      it('affiche un message', async () => {
        // When
        await act(async () => {
          renderWithContexts(
            <FicheBeneficiairePage
              estMilo={true}
              beneficiaire={unDetailBeneficiaire({
                structureMilo: { id: '2' },
              })}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              categoriesActions={desCategories()}
              ongletInitial='agenda'
              lectureSeule={false}
            />,
            {
              customConseiller: {
                structure: StructureConseiller.MILO,
                structureMilo: { nom: 'Mission locale', id: '1' },
              },
            }
          )
        })

        // Then
        expect(
          screen.getByText(
            /Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre./
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('pour les conseillers non Milo', () => {
    const favorisOffres = uneListeDOffres()
    const favorisRecherches = uneListeDeRecherches()
    const metadonneesFavoris = uneMetadonneeFavoris()

    it('a11y', async () => {
      let results: AxeResults
      const container = await renderFicheJeuneNonMilo({
        metadonneesFavoris,
        favorisOffres,
        favorisRecherches,
      })

      await act(async () => {
        results = await axe(container)
      })

      expect(results).toHaveNoViolations()
    })

    it('n’affiche pas les onglets agenda, actions et rdv', async () => {
      // When
      await renderFicheJeuneNonMilo({
        metadonneesFavoris,
        favorisOffres,
        favorisRecherches,
      })

      // Then
      expect(() => screen.getByText('Agenda')).toThrow()
      expect(() => screen.getByText('Actions')).toThrow()
      expect(() => screen.getByText('Rendez-vous')).toThrow()
    })

    it('affiche les onglets recherche et offres si le bénéficiaire a accepté le partage', async () => {
      // When
      await renderFicheJeuneNonMilo({
        metadonneesFavoris,
        favorisOffres,
        favorisRecherches,
      })

      // Then
      expect(screen.getByText('Offres')).toBeInTheDocument()
      expect(screen.getByText('Recherches')).toBeInTheDocument()
    })

    it('affiche le récapitulatif des favoris si le bénéficiaire a refusé le partage', async () => {
      // Given
      metadonneesFavoris.autoriseLePartage = false

      //When
      await renderFicheJeuneNonMilo({
        metadonneesFavoris,
        favorisOffres,
        favorisRecherches,
        ongletInitial: 'favoris',
      })

      // Then
      expect(screen.getByText(/Emplois/)).toBeInTheDocument()
      expect(screen.getByText(/Alternances/)).toBeInTheDocument()
      expect(screen.getByText(/Services civiques/)).toBeInTheDocument()
      expect(screen.getByText(/Immersions/)).toBeInTheDocument()
      expect(screen.getByText(/Alertes/)).toBeInTheDocument()
    })

    describe('quand le compte du bénéficiaire n’est pas activé', () => {
      it('affiche un message', async () => {
        // When
        await act(async () => {
          renderWithContexts(
            <FicheBeneficiairePage
              estMilo={true}
              beneficiaire={unDetailBeneficiaire({ isActivated: false })}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              categoriesActions={desCategories()}
              ongletInitial='agenda'
              lectureSeule={false}
            />
          )
        })

        // Then
        expect(
          screen.getByText(
            /Ce bénéficiaire ne s’est pas encore connecté à l’application/
          )
        ).toBeInTheDocument()
        expect(() =>
          screen.getByText(
            /Le lien d’activation envoyé par i-milo sur l‘adresse e-mail du jeune n’est valable que 24h/
          )
        ).toThrow()
      })
    })
  })

  describe('pour les conseillers départementaux', () => {
    it('affiche le tableau des démarches', async () => {
      // When
      await renderFicheJeuneNonMilo({
        metadonneesFavoris: uneMetadonneeFavoris({ autoriseLePartage: false }),
        favorisOffres: uneListeDOffres(),
        favorisRecherches: uneListeDeRecherches(),
        demarches: { data: [uneDemarche()], isStale: false },
        structure: StructureConseiller.CONSEIL_DEPT,
        ongletInitial: 'demarches',
      })

      // Then
      expect(screen.getByRole('tab', { name: /Démarches/ })).toBeInTheDocument()
      expect(
        screen.getByRole('table', {
          name: 'Liste des démarches de Kenji Jirac',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('row', {
          name: /Réalisation d’entretiens d’embauche 30 septembre 2024 Mes candidatures En cours Voir le détail/,
        })
      ).toBeInTheDocument()
    })

    it('affiche un message pour des démarches pas fraiches', async () => {
      //When
      await renderFicheJeuneNonMilo({
        metadonneesFavoris: uneMetadonneeFavoris(),
        favorisOffres: uneListeDOffres(),
        favorisRecherches: uneListeDeRecherches(),
        structure: StructureConseiller.CONSEIL_DEPT,
        demarches: { data: uneListeDeDemarches(), isStale: true },
      })

      //Then
      expect(
        screen.getByText(
          'Les démarches récupérées pour ce bénéficiaire ne sont peut-être pas à jour.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Vous pouvez lui demander de se reconnecter à son application puis rafraîchir votre page.'
        )
      ).toBeInTheDocument()
    })

    it('affiche un message pour des démarches en erreur', async () => {
      //When
      await renderFicheJeuneNonMilo({
        metadonneesFavoris: uneMetadonneeFavoris(),
        favorisOffres: uneListeDOffres(),
        favorisRecherches: uneListeDeRecherches(),
        structure: StructureConseiller.CONSEIL_DEPT,
        demarches: null,
      })

      //Then
      expect(
        screen.getByText(
          'La récupération des démarches de ce bénéficiaire a échoué.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Vous pouvez lui demander de se reconnecter à son application puis rafraîchir votre page.'
        )
      ).toBeInTheDocument()
    })
  })
})

async function renderFicheJeuneNonMilo({
  lectureSeule,
  metadonneesFavoris,
  favorisOffres,
  favorisRecherches,
  structure,
  demarches,
  ongletInitial,
}: {
  metadonneesFavoris: MetadonneesFavoris
  favorisOffres: Offre[]
  favorisRecherches: Recherche[]
  lectureSeule?: boolean
  demarches?: { data: Demarche[]; isStale: boolean } | null
  structure?: StructureConseiller
  ongletInitial?: string
}): Promise<HTMLElement> {
  let container: HTMLElement
  await act(async () => {
    ;({ container } = renderWithContexts(
      <FicheBeneficiairePage
        estMilo={false}
        beneficiaire={unDetailBeneficiaire()}
        ongletInitial={ongletInitial ?? 'offres'}
        lectureSeule={lectureSeule ?? false}
        metadonneesFavoris={metadonneesFavoris}
        favorisOffres={favorisOffres}
        favorisRecherches={favorisRecherches}
        demarches={demarches}
      />,
      {
        customConseiller: {
          structure: structure ?? StructureConseiller.POLE_EMPLOI,
        },
      }
    ))
  })
  return container
}
