import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'
import React, { Dispatch, SetStateAction } from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desCategories } from 'fixtures/action'
import {
  desIndicateursSemaine,
  unBeneficiaireChat,
  unDetailBeneficiaire,
  uneDemarche,
  uneListeDeDemarches,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { uneListeDOffres } from 'fixtures/favoris'
import {
  BeneficiaireEtChat,
  CategorieSituation,
  Demarche,
} from 'interfaces/beneficiaire'
import { Structure, structureFTCej, structureMilo } from 'interfaces/structure'
import { getActionsBeneficiaire } from 'services/actions.service'
import {
  changerVisibiliteComptageHeures,
  getComptageHeuresFicheBeneficiaire,
  getDemarchesBeneficiaireClientSide,
  getIndicateursBeneficiaire,
  modifierDispositif,
  renvoyerEmailActivation,
} from 'services/beneficiaires.service'
import { getOffres } from 'services/favoris.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/actions.service')
jest.mock('services/favoris.service')
jest.mock('components/ModalContainer')

describe('FicheBeneficiairePage client side', () => {
  beforeEach(async () => {
    ;(getIndicateursBeneficiaire as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(getComptageHeuresFicheBeneficiaire as jest.Mock).mockResolvedValue({
      nbHeuresDeclarees: 1,
      nbHeuresValidees: 12,
      dateDerniereMiseAJour: '2025-05-15T00:00:00.000Z',
    })
    ;(getActionsBeneficiaire as jest.Mock).mockResolvedValue([])
    ;(getOffres as jest.Mock).mockResolvedValue([])
    ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })
  })

  describe('pour tous les conseillers', () => {
    it('modifie le currentJeune', async () => {
      // Given
      const setCurrentConversation = jest.fn()
      const beneficiaire = unDetailBeneficiaire()
      const conversation = unBeneficiaireChat({ ...beneficiaire })

      // When
      await renderWithContexts(
        <FicheBeneficiairePage
          estMilo={true}
          beneficiaire={beneficiaire}
          historiqueConseillers={[]}
          rdvs={[]}
          categoriesActions={desCategories()}
          ongletInitial='actions'
        />,
        {
          customChats: [conversation],
          customCurrentConversation: { setter: setCurrentConversation },
          customConseiller: { id: beneficiaire.idConseiller },
        }
      )

      // Then
      expect(setCurrentConversation).toHaveBeenCalledWith(conversation)
    })
  })

  describe('pour les conseillers non référent', () => {
    let container: HTMLElement
    let setCurrentConversation: Dispatch<
      SetStateAction<BeneficiaireEtChat | undefined>
    >
    beforeEach(async () => {
      // Given
      setCurrentConversation = jest.fn()

      // When
      ;({ container } = await renderWithContexts(
        <FicheBeneficiairePage
          estMilo={true}
          beneficiaire={unDetailBeneficiaire()}
          historiqueConseillers={[]}
          rdvs={[]}
          categoriesActions={desCategories()}
          ongletInitial='actions'
        />,
        {
          customConseiller: { id: 'fake-id' },
          customCurrentConversation: { setter: setCurrentConversation },
        }
      ))
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
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
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

    describe('compteur d’heures', () => {
      process.env.NEXT_PUBLIC_COMPTAGE_HEURES_EARLY_ADOPTERS =
        'id-structure-meaux'

      beforeEach(async () => {
        await renderFicheJeuneMilo()
      })

      it('affiche le nombre d’heures déclarées et validées', async () => {
        // Then
        expect(
          screen.getByText('Dernière mise à jour le 15/05/2025 à 02:00')
        ).toBeInTheDocument()
        expect(
          screen.getByRole('progressbar', { name: '1h déclarée' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('progressbar', { name: '12h validées' })
        ).toBeInTheDocument()
      })

      it('permet de changer la visibilité du compteur d’heures', async () => {
        // Given
        const switchComptageHeures = screen.getByRole('switch', {
          name: 'Afficher le compteur à votre bénéficiaire',
        })

        // When
        await userEvent.click(switchComptageHeures)

        // Then
        expect(switchComptageHeures).toBeChecked()
        expect(changerVisibiliteComptageHeures).toHaveBeenCalledWith(
          'id-beneficiaire-1',
          true
        )
      })
    })

    describe('changement de dispositif', () => {
      beforeEach(async () => {
        // Given
        ;(modifierDispositif as jest.Mock).mockResolvedValue(undefined)
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
          'id-beneficiaire-1',
          'PACEA'
        )
        expect(() =>
          screen.getByText(/Confirmation du changement de dispositif/)
        ).toThrow()
        expect(getByDescriptionTerm('Dispositif')).toHaveTextContent('PACEA')
      })
    })

    describe('quand le compte du bénéficiaire n’est pas activé', () => {
      beforeEach(async () => {
        await renderFicheJeuneMilo({ lastActivity: undefined })
      })
      it('affiche un message', async () => {
        // Then
        expect(
          screen.getByText(
            /Ce bénéficiaire ne s’est pas encore connecté à l’application/
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            /Le lien d’activation que le bénéficiaire a reçu n’est valable que 24h./
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            /Si le délai est dépassé ou si votre bénéficiaire n’a pas reçu l’email d’activation, vous pouvez lui renvoyer./
          )
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Renvoyer l’email d’activation' })
        ).toBeInTheDocument()
      })

      it('permet de renvoyer l’email d’activation', async () => {
        // When
        ;(renvoyerEmailActivation as jest.Mock).mockResolvedValue(undefined)
        const conseiller = unConseiller()
        const beneficiaire = unDetailBeneficiaire({ id: 'id-beneficiaire-1' })

        // Then
        const renvoyerEmailButton = screen.getByRole('button', {
          name: 'Renvoyer l’email d’activation',
        })
        expect(renvoyerEmailButton).toBeInTheDocument()
        await userEvent.click(renvoyerEmailButton)

        expect(renvoyerEmailActivation).toHaveBeenCalledWith(
          conseiller.id,
          beneficiaire.id
        )
        expect(
          screen.getByText(
            /L’email d’activation a été envoyé à l’adresse du bénéficiaire./
          )
        ).toBeInTheDocument()
      })

      describe('quand l’envoi de l’email d’activation échoue', () => {
        it('affiche une erreur', async () => {
          // When
          ;(renvoyerEmailActivation as jest.Mock).mockRejectedValue({
            message: 'Aucun compte trouvé pour ce bénéficiaire',
          })
          const conseiller = unConseiller()
          const beneficiaire = unDetailBeneficiaire({ id: 'id-beneficiaire-1' })

          // Then
          const renvoyerEmailButton = screen.getByRole('button', {
            name: 'Renvoyer l’email d’activation',
          })
          expect(renvoyerEmailButton).toBeInTheDocument()
          await userEvent.click(renvoyerEmailButton)

          expect(renvoyerEmailActivation).toHaveBeenCalledWith(
            conseiller.id,
            beneficiaire.id
          )
          expect(
            screen.getByText(
              /Une erreur est survenue lors du renvoi d’email d’activation. Veuillez réessayer ultérieurement./
            )
          ).toBeInTheDocument()
        })
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

    it('affiche le suivi des offres si le bénéficiaire a accepté le partage', async () => {
      // When
      await renderFicheJeuneNonMilo()

      // Then
      expect(screen.getByText('Suivi des offres')).toBeInTheDocument()
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
        await renderWithContexts(
          <FicheBeneficiairePage
            estMilo={true}
            beneficiaire={unDetailBeneficiaire({ lastActivity: undefined })}
            historiqueConseillers={[]}
            rdvs={[]}
            categoriesActions={desCategories()}
            ongletInitial='actions'
          />
        )

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
    beforeEach(() => {
      ;(getDemarchesBeneficiaireClientSide as jest.Mock).mockResolvedValue({
        data: uneListeDeDemarches(),
        isState: false,
      })
    })
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
  lastActivity,
  structureDifferente,
  situation,
}: {
  lastActivity?: string
  structureDifferente?: boolean
  situation?: CategorieSituation
} = {}): Promise<HTMLElement> {
  const beneficiaire = unDetailBeneficiaire({
    lastActivity,
    situationCourante: situation ?? CategorieSituation.SANS_SITUATION,
  })

  const { container } = await renderWithContexts(
    <FicheBeneficiairePage
      estMilo={true}
      beneficiaire={beneficiaire}
      historiqueConseillers={[]}
      rdvs={[]}
      categoriesActions={desCategories()}
      ongletInitial='actions'
    />,
    {
      customConseiller: {
        agence: { id: 'id-structure-meaux', nom: 'Agence de Meaux' },
        structure: structureMilo,
        structureMilo: structureDifferente
          ? {
              nom: 'Mission locale',
              id: 'id-structure-differente',
            }
          : undefined,
      },
    }
  )

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
  const { container } = await renderWithContexts(
    <FicheBeneficiairePage
      estMilo={false}
      beneficiaire={unDetailBeneficiaire()}
      historiqueConseillers={[]}
      ongletInitial={ongletInitial ?? 'offres'}
      metadonneesFavoris={uneMetadonneeFavoris({
        autoriseLePartage: autorisePartageFavoris ?? true,
      })}
      favorisOffres={uneListeDOffres()}
      demarches={demarches}
    />,
    {
      customConseiller: {
        structure: structure ?? structureFTCej,
      },
    }
  )

  return container!
}
