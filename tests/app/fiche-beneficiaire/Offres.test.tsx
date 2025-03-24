import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { uneListeDOffres } from 'fixtures/favoris'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/beneficiaires.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')

describe('Suivi des offres dans la fiche jeune', () => {
  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(() => Promise.resolve()),
    })
    ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
  })

  describe('quand on sélectionne l’onglet de suivi des offres', () => {
    it('affiche le suivi des offres', async () => {
      // Given
      await renderFicheJeune(uneMetadonneeFavoris())

      // When
      await userEvent.click(
        screen.getByRole('tab', { name: 'Suivi des offres 12 éléments' })
      )

      // Then
      expect(
        screen.getByRole('table', { name: 'Liste des offres en favoris' })
      ).toBeInTheDocument()
    })

    it('affiche le résumé des favoris quand le jeune n’a pas autorisé le partage', async () => {
      // Given
      const metadonneesFavoris = uneMetadonneeFavoris({
        autoriseLePartage: false,
      })
      await renderFicheJeune(metadonneesFavoris)

      // When
      await userEvent.click(screen.getByRole('tab', { name: /Favoris/ }))

      // Then
      expect(
        screen.getByRole('heading', { level: 3, name: 'Offres' })
      ).toBeInTheDocument()
      expect(getByTextContent('3Emplois')).toBeInTheDocument()
      expect(getByTextContent('3Alternances')).toBeInTheDocument()
      expect(getByTextContent('3Immersions')).toBeInTheDocument()
      expect(getByTextContent('3Services civiques')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 3, name: 'Recherches' })
      ).toBeInTheDocument()
      expect(getByTextContent('8Alertes')).toBeInTheDocument()
    })
  })
})

async function renderFicheJeune(metadonneesFavoris: MetadonneesFavoris) {
  await renderWithContexts(
    <FicheBeneficiairePage
      estMilo={true}
      beneficiaire={unDetailBeneficiaire()}
      rdvs={[]}
      actionsInitiales={desActionsInitiales()}
      categoriesActions={desCategories()}
      metadonneesFavoris={metadonneesFavoris}
      favorisOffres={uneListeDOffres()}
      ongletInitial='agenda'
      lectureSeule={false}
    />,
    {
      customConseiller: { id: 'id-conseiller' },
    }
  )
}
