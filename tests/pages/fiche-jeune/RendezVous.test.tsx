import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { desEvenementsListItems } from 'fixtures/evenement'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import {
  desIndicateursSemaine,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { StructureConseiller } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { Offre, Recherche } from 'interfaces/favoris'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'
import { recupererAgenda } from 'services/agenda.service'
import { getOffres } from 'services/favoris.service'
import { getIndicateursJeuneAlleges } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')
jest.mock('services/agenda.service')
jest.mock('services/favoris.service')

describe('Rendez-vous de la fiche jeune', () => {
  let rdvs: EvenementListItem[] = desEvenementsListItems()
  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(() => Promise.resolve()),
    })
    ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
    ;(getOffres as jest.Mock).mockResolvedValue(uneListeDOffres())
  })

  describe("quand l'utilisateur n'est pas un conseiller France Travail", () => {
    describe('conseiller sans sessions milo', () => {
      beforeEach(async () => {
        await renderFicheJeune(StructureConseiller.MILO, rdvs)
      })

      it('affiche la liste des rendez-vous du jeune', async () => {
        // Given
        await userEvent.click(screen.getByRole('tab', { name: /Rendez-vous/ }))

        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Rendez-vous 2')
        rdvs.forEach((rdv) => {
          expect(screen.getByText(rdv.type)).toBeInTheDocument()
          expect(screen.getByText(rdv.modality!)).toBeInTheDocument()
        })
        expect(() =>
          screen.getByRole('table', { name: /Liste des actions de/ })
        ).toThrow()
      })

      it('indique caractère non modifiable d’un rendez-vous issu d’i-milo', async () => {
        // Given
        await userEvent.click(screen.getByRole('tab', { name: /Rendez-vous/ }))

        // Then
        expect(screen.getByLabelText('Non modifiable')).toBeInTheDocument()
      })

      it('affiche un lien vers les rendez-vous passés du jeune', async () => {
        // Given
        await userEvent.click(screen.getByRole('tab', { name: /Rendez-vous/ }))

        // Then
        expect(
          screen.getByRole('link', { name: 'Voir les événements passés' })
        ).toHaveAttribute(
          'href',
          '/mes-jeunes/beneficiaire-1/rendez-vous-passes'
        )
      })

      it('permet la prise de rendez-vous', async () => {
        // Then
        expect(
          screen.getByRole('link', { name: 'Créer un rendez-vous' })
        ).toHaveAttribute(
          'href',
          '/mes-jeunes/edition-rdv?idJeune=beneficiaire-1'
        )
      })
    })
    describe('conseiller avec sessions milo', () => {
      beforeEach(async () => {
        rdvs = [
          {
            id: '2',
            type: 'Atelier',
            modality: 'En agence',
            date: '2021-10-25T12:00:00.000Z',
            duree: 25,
            idCreateur: '2',
            source: 'MILO',
          },
          {
            id: '1',
            type: 'Atelier i-milo',
            date: '2022-09-01T11:00:00.000Z',
            duree: 120,
            idCreateur: '1',
            isSession: true,
          },
        ]
        await renderFicheJeune(StructureConseiller.MILO, rdvs)
      })

      it('indique caractère non modifiable d’une session milo', async () => {
        // Given
        await userEvent.click(screen.getByRole('tab', { name: /Rendez-vous/ }))

        // Then
        expect(
          screen.getByLabelText('Informations de la session non modifiables')
        ).toBeInTheDocument()
      })
    })
  })

  describe("quand l'utilisateur est un conseiller France Travail", () => {
    let offresPE: Offre[],
      recherchesPE: Recherche[],
      metadonneesFavoris: MetadonneesFavoris
    beforeEach(async () => {
      metadonneesFavoris = uneMetadonneeFavoris()
      offresPE = uneListeDOffres()
      recherchesPE = uneListeDeRecherches()
      await renderFicheJeunePE(
        StructureConseiller.POLE_EMPLOI,
        [],
        metadonneesFavoris,
        offresPE,
        recherchesPE
      )
    })

    it("n'affiche pas la liste des rendez-vous du jeune", async () => {
      // Then
      expect(() => screen.getByText(/Rendez-vous/)).toThrow()
    })

    it('ne permet pas la prise de rendez-vous', async () => {
      // Then
      expect(() => screen.getByText('Créer un rendez-vous')).toThrow()
    })
  })
})

async function renderFicheJeune(
  structure: StructureConseiller,
  rdvs: EvenementListItem[] = []
) {
  await act(async () => {
    renderWithContexts(
      <FicheBeneficiairePage
        jeune={unDetailBeneficiaire()}
        rdvs={rdvs}
        actionsInitiales={desActionsInitiales()}
        categoriesActions={desCategories()}
        onglet='AGENDA'
        lectureSeule={false}
      />,
      {
        customConseiller: {
          id: 'id-conseiller',
          structure: structure,
          structureMilo: { id: 'id-test', nom: 'Milo Agence' },
        },
      }
    )
  })
}

async function renderFicheJeunePE(
  structure: StructureConseiller,
  rdvs: EvenementListItem[] = [],
  metadonnees: MetadonneesFavoris,
  offresPE: Offre[],
  recherchesPE: Recherche[]
) {
  await act(async () => {
    renderWithContexts(
      <FicheBeneficiairePage
        jeune={unDetailBeneficiaire()}
        rdvs={rdvs}
        actionsInitiales={desActionsInitiales()}
        categoriesActions={desCategories()}
        metadonneesFavoris={metadonnees}
        offresPE={offresPE}
        recherchesPE={recherchesPE}
        onglet='AGENDA'
        lectureSeule={false}
      />,
      {
        customConseiller: {
          id: 'id-conseiller',
          structure: structure,
        },
      }
    )
  })
}
