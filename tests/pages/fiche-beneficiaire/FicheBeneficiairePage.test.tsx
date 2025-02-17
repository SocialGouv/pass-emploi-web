import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
import { CategorieSituation, Demarche } from 'interfaces/beneficiaire'
import { Structure, structureFTCej, structureMilo } from 'interfaces/structure'
import { recupererAgenda } from 'services/agenda.service'
import {
  getIndicateursJeuneAlleges,
  modifierDispositif,
} from 'services/beneficiaires.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { CurrentConversation } from 'utils/chat/currentConversationContext'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')
jest.mock('components/ModalContainer')

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
    it('a11y', async () => {
      const container = await renderFicheJeuneMilo()
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche la situation du bénéficiaire', async () => {
      // When
      await renderFicheJeuneMilo({
        situation: CategorieSituation.CONTRAT_DE_VOLONTARIAT_BENEVOLAT,
      })

      // Then
      expect(getByDescriptionTerm('Situation')).toHaveTextContent(
        'Contrat de volontariat - bénévolat'
      )
    })

    it('affiche le dispositif du bénéficiaire', async () => {
      // When
      await renderFicheJeuneMilo()

      // Then
      expect(getByDescriptionTerm('Dispositif')).toHaveTextContent('CEJ')
      expect(
        screen.getByRole('button', {
          name: 'Changer le bénéficiaire de dispositif',
        })
      ).toBeInTheDocument()
    })

    describe('changement de dispositif', () => {
      beforeEach(async () => {
        // Given
        await renderFicheJeuneMilo()

        // When
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Changer le bénéficiaire de dispositif',
          })
        )
      })

      it('informe de l’usage attendu', async () => {
        // Then
        expect(
          screen.getByText(
            'Confirmation du changement de dispositif (passage en PACEA)'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            'Attention, cette modification ne doit être utilisée que pour corriger une erreur dans le choix du dispositif lors de la création du compte.'
          )
        ).toBeInTheDocument()
      })

      it('oblige la validation de l’usage', async () => {
        // When
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Confirmer le passage du bénéficiaire en PACEA',
          })
        )

        // Then
        expect(
          screen.getByText('Cet élément est obligatoire.')
        ).toBeInTheDocument()
        expect(modifierDispositif).not.toHaveBeenCalled()
        expect(getByDescriptionTerm('Dispositif')).toHaveTextContent('CEJ')
      })

      it('permet de changer le dispositif du bénéficiaire', async () => {
        // When
        await userEvent.click(
          screen.getByRole('checkbox', {
            name: 'Je confirme que le passage en PACEA de ce bénéficiaire est lié à une erreur lors de la création du compte (obligatoire)',
          })
        )
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Confirmer le passage du bénéficiaire en PACEA',
          })
        )

        // Then
        expect(modifierDispositif).toHaveBeenCalledWith(
          'beneficiaire-1',
          'PACEA'
        )
        expect(() =>
          screen.getByText(/Confirmation du changement de dispositif/)
        ).toThrow()
        expect(getByDescriptionTerm('Dispositif')).toHaveTextContent('PACEA')
      })
    })

    it('affiche un lien pour accéder au calendrier de l’établissement', async () => {
      // When
      await renderFicheJeuneMilo()

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
        await renderFicheJeuneMilo({ isActivated: false })

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
        await renderFicheJeuneMilo({ structureDifferente: true })

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
    it('a11y', async () => {
      let results: AxeResults
      const container = await renderFicheJeuneNonMilo()

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('n’affiche pas les onglets agenda, actions et rdv', async () => {
      // When
      await renderFicheJeuneNonMilo()

      // Then
      expect(() => screen.getByText('Agenda')).toThrow()
      expect(() => screen.getByText('Actions')).toThrow()
      expect(() => screen.getByText('Rendez-vous')).toThrow()
    })

    it('affiche les onglets recherche et offres si le bénéficiaire a accepté le partage', async () => {
      // When
      await renderFicheJeuneNonMilo()

      // Then
      expect(screen.getByText('Offres')).toBeInTheDocument()
      expect(screen.getByText('Recherches')).toBeInTheDocument()
    })

    it('affiche le récapitulatif des favoris si le bénéficiaire a refusé le partage', async () => {
      //When
      await renderFicheJeuneNonMilo({
        autorisePartageFavoris: false,
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
        demarches: { data: [uneDemarche()], isStale: false },
        structure: 'CONSEIL_DEPT',
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
        structure: 'CONSEIL_DEPT',
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
        structure: 'CONSEIL_DEPT',
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

async function renderFicheJeuneMilo({
  isActivated,
  structureDifferente,
  situation,
}: {
  isActivated?: boolean
  structureDifferente?: boolean
  situation?: CategorieSituation
} = {}): Promise<HTMLElement> {
  let container: HTMLElement
  await act(async () => {
    const beneficiaire = unDetailBeneficiaire({
      isActivated: isActivated ?? true,
      situations: situation ? [{ categorie: situation }] : [],
    })

    ;({ container } = renderWithContexts(
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
        customConseiller: {
          structure: structureMilo,
          structureMilo: structureDifferente
            ? {
                nom: 'Mission locale',
                id: 'id-structure-differente',
              }
            : undefined,
        },
      }
    ))
  })

  return container!
}

async function renderFicheJeuneNonMilo({
  autorisePartageFavoris,
  structure,
  demarches,
  ongletInitial,
}: {
  autorisePartageFavoris?: boolean
  demarches?: { data: Demarche[]; isStale: boolean } | null
  structure?: Structure
  ongletInitial?: string
} = {}): Promise<HTMLElement> {
  let container: HTMLElement
  await act(async () => {
    ;({ container } = renderWithContexts(
      <FicheBeneficiairePage
        estMilo={false}
        beneficiaire={unDetailBeneficiaire()}
        ongletInitial={ongletInitial ?? 'offres'}
        lectureSeule={false}
        metadonneesFavoris={uneMetadonneeFavoris({
          autoriseLePartage: autorisePartageFavoris ?? true,
        })}
        favorisOffres={uneListeDOffres()}
        favorisRecherches={uneListeDeRecherches()}
        demarches={demarches}
      />,
      {
        customConseiller: {
          structure: structure ?? structureFTCej,
        },
      }
    ))
  })

  return container!
}
