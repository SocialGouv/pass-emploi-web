import { screen, within } from '@testing-library/react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desCategories } from 'fixtures/action'
import {
  desIndicateursSemaine,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { getActionsBeneficiaire } from 'services/actions.service'
import { getIndicateursBeneficiaire } from 'services/beneficiaires.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/actions.service')

describe('Indicateurs dans la fiche jeune', () => {
  describe("quand l'utilisateur est un conseiller Milo", () => {
    it('affiche les indicateurs du jeune', async () => {
      // Given
      const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
      ;(getIndicateursBeneficiaire as jest.Mock).mockResolvedValue(
        desIndicateursSemaine()
      )
      ;(getActionsBeneficiaire as jest.Mock).mockResolvedValue([])
      ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

      // When
      await renderWithContexts(
        <FicheBeneficiairePage
          estMilo={true}
          beneficiaire={unDetailBeneficiaire()}
          historiqueConseillers={[]}
          rdvs={[]}
          categoriesActions={desCategories()}
          metadonneesFavoris={uneMetadonneeFavoris()}
          ongletInitial='actions'
        />,
        {}
      )

      // Then
      const titreIndicateursSemaine = screen.getByRole('heading', {
        name: 'Résumé pour la semaine du 29 août 2022 au 4 septembre 2022',
      })
      const indicateurs = within(
        titreIndicateursSemaine.parentElement!
      ).getByRole('list')

      expect(getByTextContent('0actions créées', indicateurs)).toHaveRole(
        'listitem'
      )
      expect(getByTextContent('1action terminée', indicateurs)).toHaveRole(
        'listitem'
      )
      expect(getByTextContent('2actions en retard', indicateurs)).toHaveRole(
        'listitem'
      )
      expect(getByTextContent('3RDV et ateliers', indicateurs)).toHaveRole(
        'listitem'
      )
      expect(getByTextContent('10offres enregistrées', indicateurs)).toHaveRole(
        'listitem'
      )
      expect(getByTextContent('4offres postulées', indicateurs)).toHaveRole(
        'listitem'
      )
    })
  })
})
