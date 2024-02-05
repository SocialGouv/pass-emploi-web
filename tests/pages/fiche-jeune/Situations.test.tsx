import { act, screen } from '@testing-library/react'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { desIndicateursSemaine, unDetailJeune } from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import { CategorieSituation, EtatSituation } from 'interfaces/jeune'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')
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
        expect(screen.getByText('Situation')).toBeInTheDocument()
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
        expect(screen.getByText('Situation')).toBeInTheDocument()
        expect(screen.getByText('Emploi')).toBeInTheDocument()
        expect(screen.getByText('en cours')).toBeInTheDocument()
        expect(() => screen.getByText('Contrat en Alternance')).toThrow()
        expect(() => screen.getByText('prévue')).toThrow()
      })
    })

    it('affiche un lien vers l’historique des situations', async () => {
      // Given
      await renderFicheJeune([])

      // Then
      expect(
        screen.getByRole('link', { name: 'Voir le détail des situations' })
      ).toHaveAttribute('href', '/mes-jeunes/jeune-1/historique')
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
        jeune={unDetailJeune({ situations: situations })}
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
}
