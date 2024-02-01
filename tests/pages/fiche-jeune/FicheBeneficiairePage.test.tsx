import { act, screen } from '@testing-library/react'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[jeune_id]/FicheBeneficiairePage'
import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import {
  desIndicateursSemaine,
  unDetailJeune,
  uneMetadonneeFavoris,
} from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import { Offre, Recherche } from 'interfaces/favoris'
import { MetadonneesFavoris } from 'interfaces/jeune'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')
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
      const setIdJeune = jest.fn()
      const jeune = unDetailJeune()

      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            jeune={jeune}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            onglet='AGENDA'
            lectureSeule={false}
          />,
          {
            customCurrentJeune: { idSetter: setIdJeune },
            customConseiller: { id: jeune.idConseiller },
          }
        )
      })

      // Then
      expect(setIdJeune).toHaveBeenCalledWith('jeune-1')
    })
  })

  describe('pour les conseillers non référent', () => {
    let setIdJeune: (id: string | undefined) => void
    beforeEach(async () => {
      // Given
      setIdJeune = jest.fn()

      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            jeune={unDetailJeune()}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            onglet='AGENDA'
            lectureSeule={true}
          />,
          {
            customConseiller: { id: 'fake-id' },
            customCurrentJeune: { idSetter: setIdJeune },
          }
        )
      })
    })

    it('ne modifie pas le currentJeune', async () => {
      //Then
      expect(setIdJeune).not.toHaveBeenCalled()
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

  describe('pour les conseillers non Pôle Emploi', () => {
    it('affiche un lien pour accéder au calendrier de l’établissement', async () => {
      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            jeune={unDetailJeune()}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            onglet='AGENDA'
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
  })

  describe('pour les conseillers non Milo', () => {
    let offresPE: Offre[],
      recherchesPE: Recherche[],
      metadonneesFavoris: MetadonneesFavoris
    beforeEach(async () => {
      //Given
      metadonneesFavoris = uneMetadonneeFavoris()
      offresPE = uneListeDOffres()
      recherchesPE = uneListeDeRecherches()
    })

    it('n’affiche pas les onglets agenda, actions et rdv', async () => {
      // When
      await renderFicheJeune(metadonneesFavoris, offresPE, recherchesPE)

      // Then
      expect(() => screen.getByText('Agenda')).toThrow()
      expect(() => screen.getByText('Actions')).toThrow()
      expect(() => screen.getByText('Rendez-vous')).toThrow()
    })

    it('affiche les onglets recherche et offres si le bénéficiaire a accepté le partage', async () => {
      // When
      await renderFicheJeune(metadonneesFavoris, offresPE, recherchesPE)

      // Then
      expect(screen.getByText('Offres')).toBeInTheDocument()
      expect(screen.getByText('Recherches')).toBeInTheDocument()
    })

    it('affiche le récapitulatif des favoris si le bénéficiaire a refusé le partage', async () => {
      // Given
      metadonneesFavoris.autoriseLePartage = false

      //When
      await renderFicheJeune(metadonneesFavoris, offresPE, recherchesPE)

      // Then
      expect(screen.getByText(/Emplois/)).toBeInTheDocument()
      expect(screen.getByText(/Alternances/)).toBeInTheDocument()
      expect(screen.getByText(/Services civiques/)).toBeInTheDocument()
      expect(screen.getByText(/Immersions/)).toBeInTheDocument()
      expect(screen.getByText(/Alertes/)).toBeInTheDocument()
    })
  })

  describe('quand la structure du bénéficiaire est différente du conseiller', () => {
    it('affiche un message', async () => {
      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            jeune={unDetailJeune({ structureMilo: { id: '2' } })}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            onglet='AGENDA'
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

async function renderFicheJeune(
  metadonnees: MetadonneesFavoris,
  offresPE: Offre[],
  recherchesPE: Recherche[],
  lectureSeule?: boolean
) {
  await act(async () => {
    renderWithContexts(
      <FicheBeneficiairePage
        jeune={unDetailJeune()}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        onglet='AGENDA'
        lectureSeule={lectureSeule ?? false}
        metadonneesFavoris={metadonnees}
        offresPE={offresPE}
        recherchesPE={recherchesPE}
      />,
      {
        customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
      }
    )
  })
}
