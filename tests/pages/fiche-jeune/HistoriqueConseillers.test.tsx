import { screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import React from 'react'

import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import {
  desIndicateursSemaine,
  unDetailJeune,
  uneMetadonneeFavoris,
} from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/jeunes.service')
jest.mock('services/agenda.service')

jest.mock('components/Modal')

describe('Historique des conseillers dans la fiche jeune', () => {
  describe("quand l'utilisateur est un conseiller Pole emploi", () => {
    it('affiche un lien vers l’historique des conseillers du jeune', async () => {
      // Given
      ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
      ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
        desIndicateursSemaine()
      )
      ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())

      const metadonneesFavoris = uneMetadonneeFavoris()
      const offresPE = uneListeDOffres()
      const recherchesPE = uneListeDeRecherches()

      // When
      await renderWithContexts(
        <FicheJeune
          jeune={unDetailJeune()}
          rdvs={[]}
          actionsInitiales={desActionsInitiales()}
          pageTitle={''}
          metadonneesFavoris={metadonneesFavoris}
          offresPE={offresPE}
          recherchesPE={recherchesPE}
        />,
        {
          customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
        }
      )

      // Then
      expect(
        screen.getByRole('link', {
          name: 'Voir l’historique des conseillers',
        })
      ).toHaveAttribute('href', '/mes-jeunes/jeune-1/historique')
    })
  })
})
