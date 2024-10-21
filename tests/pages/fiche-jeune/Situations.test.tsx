import { act, screen } from '@testing-library/react'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  unDetailBeneficiaire,
} from 'fixtures/beneficiaire'
import { CategorieSituation, EtatSituation } from 'interfaces/beneficiaire'
import { StructureConseiller } from 'interfaces/conseiller'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/beneficiaires.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')

describe('Situations dans la fiche jeune', () => {
  describe('quand l’utilisateur est un conseiller MILO', () => {
    beforeEach(async () => {
      ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
        desIndicateursSemaine()
      )
      ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
    })

    describe('quand le jeune n’a aucune situation', () => {
      it('affiche les informations concernant la situation du jeune', async () => {
        // Given
        await renderFicheJeune([])

        // Then
        expect(screen.getByText('Sans situation')).toBeInTheDocument()
      })
    })

    describe('quand le jeune a une liste de situations', () => {
      it('affiche uniquement sa premiere situation ', async () => {
        // Given
        const situations = [
          {
            etat: EtatSituation.EN_COURS,
            categorie: CategorieSituation.EMPLOI,
          },
          {
            etat: EtatSituation.PREVU,
            categorie: CategorieSituation.CONTRAT_EN_ALTERNANCE,
          },
        ]
        await renderFicheJeune(situations)

        // Then
        expect(screen.getByText('Emploi')).toBeInTheDocument()
        expect(() => screen.getByText('Contrat en Alternance')).toThrow()
        expect(() => screen.getByText('prévue')).toThrow()
      })
    })

    it('affiche un lien vers l’historique des situations', async () => {
      // Given
      await renderFicheJeune([])

      // Then
      expect(
        screen.getByRole('link', { name: 'Voir plus d’informations' })
      ).toHaveAttribute(
        'href',
        '/mes-jeunes/beneficiaire-1/informations?onglet=informations'
      )
    })
  })
})

async function renderFicheJeune(
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>
) {
  await act(async () => {
    renderWithContexts(
      <FicheBeneficiairePage
        estMilo={true}
        beneficiaire={unDetailBeneficiaire({ situations: situations })}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        categoriesActions={desCategories()}
        ongletInitial='agenda'
        lectureSeule={false}
      />,
      {
        customConseiller: { structure: StructureConseiller.MILO },
      }
    )
  })
}
