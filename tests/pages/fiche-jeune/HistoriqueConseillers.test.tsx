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
import { mockedAgendaService, mockedJeunesService } from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')

describe('Historique des conseillers dans la fiche jeune', () => {
  describe("quand l'utilisateur est un conseiller Pole emploi", () => {
    it('affiche un lien vers l’historique des conseillers du jeune', async () => {
      // Given
      ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
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
          customDependances: {
            jeunesService: mockedJeunesService({
              getIndicateursJeuneAlleges: jest.fn(async () =>
                desIndicateursSemaine()
              ),
            }),
            agendaService: mockedAgendaService({
              recupererAgenda: jest.fn(async () => unAgenda()),
            }),
          },
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
