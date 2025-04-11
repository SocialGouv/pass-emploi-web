import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desCategories, uneListeDActions } from 'fixtures/action'
import {
  desIndicateursSemaine,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { desEvenementsListItems, unEvenementListItem } from 'fixtures/evenement'
import { uneListeDOffres } from 'fixtures/favoris'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'
import { Structure } from 'interfaces/structure'
import { getActionsBeneficiaire } from 'services/actions.service'
import { getIndicateursBeneficiaire } from 'services/beneficiaires.service'
import { getRendezVousJeune } from 'services/evenements.service'
import { getOffres } from 'services/favoris.service'
import { getSessionsMiloBeneficiaire } from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')
jest.mock('services/beneficiaires.service')
jest.mock('services/evenements.service')
jest.mock('services/favoris.service')
jest.mock('services/sessions.service')

describe('Rendez-vous de la fiche jeune', () => {
  let rdvs: EvenementListItem[] = desEvenementsListItems()
  const sessions: EvenementListItem[] = [
    unEvenementListItem({
      id: 'id-session-1',
      type: 'Session',
      modality: 'En ligne',
      isSession: true,
    }),
  ]

  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(() => Promise.resolve()),
    })
    ;(getIndicateursBeneficiaire as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(getRendezVousJeune as jest.Mock).mockResolvedValue(rdvs)
    ;(getSessionsMiloBeneficiaire as jest.Mock).mockResolvedValue(sessions)
    ;(getActionsBeneficiaire as jest.Mock).mockResolvedValue(uneListeDActions())
    ;(getOffres as jest.Mock).mockResolvedValue(uneListeDOffres())
  })

  describe("quand l'utilisateur est un conseiller Milo", () => {
    describe('conseiller sans sessions milo', () => {
      beforeEach(async () => {
        await renderFicheJeuneMilo()
      })

      it('affiche la liste des rendez-vous du jeune', async () => {
        // Given
        await userEvent.click(
          screen.getByRole('tab', { name: 'RDV & Ateliers' })
        )

        // Then
        rdvs.forEach((rdv) => {
          expect(screen.getByText(rdv.type)).toBeInTheDocument()
          expect(screen.getByText(rdv.modality!)).toBeInTheDocument()
        })
        expect(() =>
          screen.getByRole('table', { name: /Liste des rendez-vous de/ })
        ).toThrow()
      })

      it('indique caractère non modifiable d’un rendez-vous issu d’i-milo', async () => {
        // Given
        await userEvent.click(
          screen.getByRole('tab', { name: 'RDV & Ateliers' })
        )

        // Then
        expect(screen.getByLabelText('Non modifiable')).toBeInTheDocument()
      })

      it('permet la prise de rendez-vous', async () => {
        // Then
        expect(
          screen.getByRole('link', { name: 'Créer un rendez-vous' })
        ).toHaveAttribute(
          'href',
          '/mes-jeunes/edition-rdv?idJeune=id-beneficiaire-1'
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
            titre: 'Atelier en agence',
          },
          {
            id: '1',
            type: 'Atelier i-milo',
            date: '2022-09-01T11:00:00.000Z',
            duree: 120,
            createur: {
              id: 'id-conseiller-1',
            },
            isSession: true,
            titre: 'Atelier i-milo en ligne',
          },
        ]
        await renderFicheJeuneMilo()
      })

      it('indique caractère non modifiable d’une session milo', async () => {
        // Given
        await userEvent.click(
          screen.getByRole('tab', { name: 'RDV & Ateliers' })
        )

        // Then
        expect(
          screen.getByLabelText('Informations de la session non modifiables')
        ).toBeInTheDocument()
      })
    })
  })

  describe("quand l'utilisateur n’est pas un conseiller Milo", () => {
    beforeEach(async () => {
      await renderFicheJeuneFT('POLE_EMPLOI', uneMetadonneeFavoris())
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

async function renderFicheJeuneMilo() {
  await renderWithContexts(
    <FicheBeneficiairePage
      estMilo={true}
      beneficiaire={unDetailBeneficiaire({
        structureMilo: { id: 'id-test' },
      })}
      historiqueConseillers={[]}
      categoriesActions={desCategories()}
      ongletInitial='actions'
    />,
    {
      customConseiller: {
        id: 'id-conseiller-1',
        structure: 'MILO',
        structureMilo: { id: 'id-test', nom: 'Milo Agence' },
      },
    }
  )
}

async function renderFicheJeuneFT(
  structure: Structure,
  metadonnees: MetadonneesFavoris
) {
  await renderWithContexts(
    <FicheBeneficiairePage
      estMilo={false}
      beneficiaire={unDetailBeneficiaire()}
      historiqueConseillers={[]}
      metadonneesFavoris={metadonnees}
      favorisOffres={[]}
      ongletInitial='actions'
    />,
    {
      customConseiller: {
        id: 'id-conseiller-1',
        structure: structure,
      },
    }
  )
}
