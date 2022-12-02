import { screen } from '@testing-library/react'
import React from 'react'

import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { desIndicateursSemaine, unDetailJeune } from 'fixtures/jeune'
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
      await renderWithContexts(
        <FicheJeune
          jeune={unDetailJeune()}
          rdvs={[]}
          actionsInitiales={desActionsInitiales()}
          pageTitle={''}
        />,
        {
          customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
          customDependances: {
            jeunesService: mockedJeunesService({
              getIndicateursJeune: jest.fn(async () => desIndicateursSemaine()),
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
