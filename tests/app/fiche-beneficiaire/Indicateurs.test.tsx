import { screen, within } from '@testing-library/react'
import { DateTime } from 'luxon'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/beneficiaires.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')

describe('Indicateurs dans la fiche jeune', () => {
  describe("quand l'utilisateur est un conseiller Milo", () => {
    beforeEach(async () => {
      // Given
      const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
      ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
        desIndicateursSemaine()
      )
      ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())

      // When
      await renderWithContexts(
        <FicheBeneficiairePage
          estMilo={true}
          beneficiaire={unDetailBeneficiaire()}
          rdvs={[]}
          actionsInitiales={desActionsInitiales()}
          categoriesActions={desCategories()}
          metadonneesFavoris={uneMetadonneeFavoris()}
          ongletInitial='agenda'
          lectureSeule={false}
        />,
        {}
      )
    })

    it('affiche les indicateurs du jeune', async () => {
      // Then
      const indicateurs = screen.getByRole('heading', {
        name: 'Cette semaine',
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
    })

    it('affiche un lien vers tous les indicateurs du jeune', async () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: 'Voir plus d’indicateurs',
        })
      ).toHaveAttribute(
        'href',
        '/mes-jeunes/beneficiaire-1/informations?onglet=indicateurs'
      )
    })
  })
})
