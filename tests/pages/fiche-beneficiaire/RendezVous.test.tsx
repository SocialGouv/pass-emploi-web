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
import { desEvenementsListItems } from 'fixtures/evenement'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'
import { Offre, Recherche } from 'interfaces/favoris'
import { Structure } from 'interfaces/structure'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/beneficiaires.service'
import { getOffres } from 'services/favoris.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
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

  describe("quand l'utilisateur est un conseiller Milo", () => {
    describe('conseiller sans sessions milo', () => {
      beforeEach(async () => {
        await renderFicheJeuneMilo(rdvs)
      })

      it('affiche la liste des rendez-vous du jeune', async () => {
        // Given
        await userEvent.click(screen.getByRole('tab', { name: /Rendez-vous/ }))

        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Rendez-vous 2 éléments')
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
            createur: {
              id: '2',
            },
            source: 'MILO',
          },
          {
            id: '1',
            type: 'Atelier i-milo',
            date: '2022-09-01T11:00:00.000Z',
            duree: 120,
            createur: {
              id: '1',
            },
            isSession: true,
          },
        ]
        await renderFicheJeuneMilo(rdvs)
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

  describe("quand l'utilisateur n’est pas un conseiller Milo", () => {
    beforeEach(async () => {
      await renderFicheJeuneFT(
        'POLE_EMPLOI',
        uneMetadonneeFavoris(),
        uneListeDOffres(),
        uneListeDeRecherches()
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

async function renderFicheJeuneMilo(rdvs: EvenementListItem[]) {
  await renderWithContexts(
    <FicheBeneficiairePage
      estMilo={true}
      beneficiaire={unDetailBeneficiaire()}
      rdvs={rdvs}
      actionsInitiales={desActionsInitiales()}
      categoriesActions={desCategories()}
      ongletInitial='agenda'
      lectureSeule={false}
    />,
    {
      customConseiller: {
        id: 'id-conseiller',
        structure: 'MILO',
        structureMilo: { id: 'id-test', nom: 'Milo Agence' },
      },
    }
  )
}

async function renderFicheJeuneFT(
  structure: Structure,
  metadonnees: MetadonneesFavoris,
  offresFT: Offre[],
  recherchesFT: Recherche[]
) {
  await renderWithContexts(
    <FicheBeneficiairePage
      estMilo={false}
      beneficiaire={unDetailBeneficiaire()}
      metadonneesFavoris={metadonnees}
      favorisOffres={offresFT}
      favorisRecherches={recherchesFT}
      ongletInitial='offres'
      lectureSeule={false}
    />,
    {
      customConseiller: {
        id: 'id-conseiller',
        structure: structure,
      },
    }
  )
}
