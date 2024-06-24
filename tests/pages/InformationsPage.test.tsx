import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import Historique from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/informations/InformationsPage'
import { unAgenda } from 'fixtures/agenda'
import {
  desConseillersJeune,
  desIndicateursSemaine,
  unDetailJeune,
  uneMetadonneeFavoris,
} from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  CategorieSituation,
  ConseillerHistorique,
  DetailBeneficiaire,
  EtatSituation,
} from 'interfaces/beneficiaire'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneComplets } from 'services/jeunes.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')
jest.mock('services/agenda.service')

describe('InformationsPage client side', () => {
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
  const jeune = unDetailJeune({ urlDossier: 'https://dossier-milo.fr' })

  beforeEach(async () => {
    ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')
  })

  describe('quand l’utilisateur est un conseiller Mission Locale', () => {
    describe('pour les Situations', () => {
      it('affiche un onglet dédié', async () => {
        // Given
        await renderHistorique([], [], StructureConseiller.MILO, jeune)

        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Informations')
      })

      it('afiche les informations de la fiche d’un bénéficiaire', async () => {
        //When
        await renderHistorique([], [], StructureConseiller.MILO, jeune)
        //Then
        expect(screen.getByText('Bénéficiaire')).toBeInTheDocument()
        expect(screen.getByText('kenji.jirac@email.fr')).toBeInTheDocument()
        expect(screen.getByText('07/12/2021')).toBeInTheDocument()
        expect(screen.getByText('Dossier jeune i-milo')).toHaveAttribute(
          'href',
          'https://dossier-milo.fr'
        )
      })

      describe('quand le jeune n’a aucune situation', () => {
        it('affiche les informations concernant la situation du jeune', async () => {
          // Given
          await renderHistorique([], [], StructureConseiller.MILO, jeune)

          // Then
          expect(screen.getByText('Sans situation')).toBeInTheDocument()
        })
      })

      describe('quand le jeune a une liste de situations', () => {
        it('affiche les informations concernant la situation du jeune ', async () => {
          // Given

          await renderHistorique(
            listeSituations,
            [],
            StructureConseiller.MILO,
            jeune
          )

          // Then
          expect(screen.getByText('Emploi')).toBeInTheDocument()
          expect(screen.getByText('en cours')).toBeInTheDocument()
          expect(screen.getByText('Contrat en Alternance')).toBeInTheDocument()
          expect(screen.getByText('prévue')).toBeInTheDocument()
        })
      })
    })

    describe('pour l’indicateur des conseillers', () => {
      beforeEach(async () => {
        //Given
        await renderHistorique([], [], StructureConseiller.MILO, jeune)

        // When
        const tabIndicateurs = screen.getByRole('tab', {
          name: 'Indicateurs',
        })
        await userEvent.click(tabIndicateurs)
      })

      it('affiche un onglet dédié', async () => {
        //Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Indicateurs')
        expect(
          screen.getByText('Semaine du 29/08/2022 au 04/09/2022')
        ).toBeInTheDocument()
      })

      it('affiche les indicateurs des actions', async () => {
        const indicateursActions = screen.getByRole('heading', {
          name: 'Les actions',
        }).parentElement
        //Then
        expect(
          getByTextContent('0Créées', indicateursActions!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('1Terminée', indicateursActions!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('2En retard', indicateursActions!)
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', { name: 'Voir toutes les actions' })
        ).toHaveAttribute('href', '/mes-jeunes/id?onglet=actions')
      })

      it('affiche l’indicateur de rendez-vous', async () => {
        const indicateursRdv = screen.getByRole('heading', {
          name: 'Les événements',
        }).parentElement
        //Then
        expect(
          getByTextContent('3Cette semaine', indicateursRdv!)
        ).toBeInTheDocument()
      })
      it('affiche les indicateurs des offres', async () => {
        //Then
        const indicateursOffres = screen.getByRole('heading', {
          name: 'Les offres',
        }).parentElement
        expect(
          getByTextContent('10Offres consultées', indicateursOffres!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('4Offres partagées', indicateursOffres!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('6Favoris ajoutés', indicateursOffres!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('7Recherches sauvegardées', indicateursOffres!)
        ).toBeInTheDocument()

        expect(
          screen.getByRole('link', { name: 'Voir tous les favoris' })
        ).toHaveAttribute('href', '/mes-jeunes/id/favoris')
      })
    })

    describe('pour l’Historique des conseillers', () => {
      it('affiche un onglet dédié', async () => {
        // Given
        await renderHistorique([], [], StructureConseiller.MILO, jeune)

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
        await renderHistorique(
          [],
          listeConseillers,
          StructureConseiller.MILO,
          jeune
        )

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
    it('n’affiche pas l’onglet Indicateurs', async () => {
      // Given
      await renderHistorique([], [], StructureConseiller.POLE_EMPLOI, jeune)

      // Then
      expect(() => screen.getByText('Indicateurs')).toThrow()
      expect(
        screen.getByRole('tab', { name: 'Historique des conseillers' })
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Informations'
      )
    })
  })
})

async function renderHistorique(
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>,
  conseillers: ConseillerHistorique[],
  structure: StructureConseiller,
  beneficiaire: DetailBeneficiaire
) {
  const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
  jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
  ;(getIndicateursJeuneComplets as jest.Mock).mockResolvedValue(
    desIndicateursSemaine()
  )
  await act(async () => {
    renderWithContexts(
      <Historique
        idJeune={'id'}
        situations={situations}
        conseillers={conseillers}
        lectureSeule={false}
        jeune={beneficiaire}
        metadonneesFavoris={uneMetadonneeFavoris()}
        onglet={'INFORMATIONS'}
      />,
      { customConseiller: { structure: structure } }
    )
  })
}
