import { act, screen, within } from '@testing-library/react'
import { DateTime } from 'luxon'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[jeune_id]/FicheBeneficiairePage'
import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  unDetailJeune,
  uneMetadonneeFavoris,
} from 'fixtures/jeune'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/jeunes.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')
jest.mock('services/agenda.service')

describe('Indicateurs dans la fiche jeune', () => {
  describe("quand l'utilisateur n'est pas un conseiller Pole emploi", () => {
    beforeEach(async () => {
      // Given
      const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
      ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
        desIndicateursSemaine()
      )
      ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())

      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            jeune={unDetailJeune()}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            metadonneesFavoris={uneMetadonneeFavoris()}
            onglet='AGENDA'
            lectureSeule={false}
          />,
          {}
        )
      })
    })

    it('affiche les indicateurs du jeune', async () => {
      // Then
      const indicateurs = screen.getByRole('heading', {
        name: 'Les indicateurs de la semaine',
      }).parentElement
      expect(
        within(indicateurs!).getByText('du 29/08/2022 au 04/09/2022')
      ).toBeInTheDocument()

      const indicateursActions = screen.getByRole('heading', {
        name: 'Les actions',
      }).parentElement
      expect(
        getByTextContent('0Créées', indicateursActions!)
      ).toBeInTheDocument()
      expect(
        getByTextContent('1Terminée', indicateursActions!)
      ).toBeInTheDocument()
      expect(
        getByTextContent('2En retard', indicateursActions!)
      ).toBeInTheDocument()

      const indicateursRdv = screen.getByRole('heading', {
        name: 'Les événements',
      }).parentElement
      expect(
        getByTextContent('3Cette semaine', indicateursRdv!)
      ).toBeInTheDocument()
    })

    it('affiche un lien vers tous les indicateurs du jeune', async () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: 'Voir plus d’indicateurs',
        })
      ).toHaveAttribute('href', '/mes-jeunes/jeune-1/indicateurs')
    })
  })
})
