import { screen } from '@testing-library/react'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import {
  desIndicateursSemaine,
  unDetailJeune,
  uneMetadonneeFavoris,
} from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')
jest.mock('services/agenda.service')

describe('Historique des conseillers dans la fiche jeune', () => {
  describe("quand l'utilisateur est un conseiller France Travail", () => {
    it('affiche un lien vers l’historique des conseillers du jeune', async () => {
      // Given
      ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
        desIndicateursSemaine()
      )
      ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())

      const metadonneesFavoris = uneMetadonneeFavoris()
      const offresPE = uneListeDOffres()
      const recherchesPE = uneListeDeRecherches()

      // When
      renderWithContexts(
        <FicheBeneficiairePage
          jeune={unDetailJeune()}
          rdvs={[]}
          actionsInitiales={desActionsInitiales()}
          categoriesActions={desCategories()}
          metadonneesFavoris={metadonneesFavoris}
          offresPE={offresPE}
          recherchesPE={recherchesPE}
          lectureSeule={false}
          onglet='AGENDA'
        />,
        {
          customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
        }
      )

      // Then
      expect(
        screen.getByRole('link', {
          name: 'Voir plus d’informations',
        })
      ).toHaveAttribute('href', '/mes-jeunes/jeune-1/historique')
    })
  })
})
