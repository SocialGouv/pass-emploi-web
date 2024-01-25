import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import React from 'react'

import Historique from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[jeune_id]/historique/HistoriquePage'
import { desConseillersJeune } from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  CategorieSituation,
  ConseillerHistorique,
  EtatSituation,
} from 'interfaces/jeune'
import renderWithContexts from 'tests/renderWithContexts'

describe('HistoriquePage client side', () => {
  const listeSituations = [
    {
      etat: EtatSituation.EN_COURS,
      categorie: CategorieSituation.EMPLOI,
    },
    {
      etat: EtatSituation.PREVU,
      categorie: CategorieSituation.CONTRAT_EN_ALTERNANCE,
    },
  ]
  const listeConseillers = desConseillersJeune()

  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
  })

  describe('quand l’utilisateur est un conseiller Mission Locale', () => {
    describe('pour les Situations', () => {
      it('affiche un onglet dédié', () => {
        // Given
        renderHistorique([], [], StructureConseiller.MILO)

        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Situations')
      })

      describe('quand le jeune n’a aucune situation', () => {
        it('affiche les informations concernant la situation du jeune', () => {
          // Given
          renderHistorique([], [], StructureConseiller.MILO)

          // Then
          expect(screen.getByText('Sans situation')).toBeInTheDocument()
        })
      })

      describe('quand le jeune a une liste de situations', () => {
        it('affiche les informations concernant la situation du jeune ', () => {
          // Given
          renderHistorique(listeSituations, [], StructureConseiller.MILO)

          // Then
          expect(screen.getByText('Emploi')).toBeInTheDocument()
          expect(screen.getByText('en cours')).toBeInTheDocument()
          expect(screen.getByText('Contrat en Alternance')).toBeInTheDocument()
          expect(screen.getByText('prévue')).toBeInTheDocument()
        })
      })
    })

    describe('pour l’Historique des conseillers', () => {
      it('affiche un onglet dédié', async () => {
        // Given
        renderHistorique([], [], StructureConseiller.MILO)

        // When
        const tabConseillers = screen.getByRole('tab', {
          name: 'Historique des conseillers',
        })
        await userEvent.click(tabConseillers)

        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Historique des conseillers')
      })

      it('affiche la liste complète des conseillers du jeune', async () => {
        // Given
        renderHistorique([], listeConseillers, StructureConseiller.MILO)

        // When
        const tabConseillers = screen.getByRole('tab', {
          name: 'Historique des conseillers',
        })
        await userEvent.click(tabConseillers)

        //Then
        listeConseillers.forEach(({ nom, prenom }: ConseillerHistorique) => {
          expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('quand l’utilisateur est un conseiller Pôle Empoi', () => {
    it('affiche uniquement l’onglet Historique des conseiller', () => {
      // Given
      renderHistorique([], [], StructureConseiller.POLE_EMPLOI)

      // Then
      expect(() => screen.getByText('Situations')).toThrow()
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Historique des conseillers'
      )
    })

    it('affiche la liste complète des conseillers du jeune', async () => {
      // Given
      renderHistorique([], listeConseillers, StructureConseiller.POLE_EMPLOI)

      //Then
      listeConseillers.forEach(({ nom, prenom }: ConseillerHistorique) => {
        expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
      })
    })
  })
})

function renderHistorique(
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>,
  conseillers: ConseillerHistorique[],
  structure: StructureConseiller
) {
  renderWithContexts(
    <Historique
      idJeune={'id'}
      situations={situations}
      conseillers={conseillers}
      lectureSeule={false}
    />,
    { customConseiller: { structure: structure } }
  )
}
