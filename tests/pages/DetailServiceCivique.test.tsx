import { act, screen, within } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unDetailServiceCivique } from 'fixtures/offre'
import { DetailServiceCivique } from 'interfaces/offre'
import DetailOffre, {
  getServerSideProps,
} from 'pages/offres/[offre_type]/[offre_id]'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'
import getByDescriptionTerm, { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/services-civiques.service')
jest.mock('components/PageActionsPortal')

describe('Page Détail Service civique', () => {
  describe('client side', () => {
    let offre: DetailServiceCivique

    beforeEach(async () => {
      // Given
      offre = unDetailServiceCivique()

      // When
      await act(() => {
        renderWithContexts(
          <DetailOffre offre={offre} pageTitle={'Détail de l’offre'} />
        )
      })
    })

    it('permet de partager le service civique', () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: `Partager offre ${offre.titre}`,
        })
      ).toHaveAttribute('href', `/offres/service-civique/${offre.id}/partage`)
    })

    it("affiche les informations principales de l'offre", () => {
      const section = screen.getByRole('region', {
        name: 'Informations du service civique',
      })
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName('Informations du service civique')

      expect(getByTextContent('Domaine : ' + offre.domaine)).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: offre.titre,
        })
      ).toBeInTheDocument()
      expect(getByDescriptionTerm('Organisation', section)).toHaveTextContent(
        offre.organisation!
      )
      expect(getByDescriptionTerm('Localisation', section)).toHaveTextContent(
        offre.codeDepartement!
      )
      expect(getByDescriptionTerm('Date de début', section)).toHaveTextContent(
        'Commence le 17/02/2022'
      )
      expect(getByDescriptionTerm('Date de fin', section)).toHaveTextContent(
        'Termine le 17/07/2022'
      )
    })

    it('affiche le détail de la mission', () => {
      const section = screen.getByRole('region', {
        name: 'Mission',
      })
      expect(section).toBeInTheDocument()
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName('Mission')

      expect(getByDescriptionTerm('Adresse', section)).toHaveTextContent(
        `${offre.adresseMission!}, ${offre.codePostal} ${offre.ville}`
      )
      expect(getByDescriptionTerm('Description', section)).toHaveTextContent(
        offre.description!
      )
      expect(
        within(getByDescriptionTerm('Lien offre', section)).getByRole('link', {
          name: 'Voir l’offre détaillée (nouvelle fenêtre)',
        })
      ).toHaveAttribute('href', offre.lienAnnonce)
    })

    it('affiche le détail de l’organisation', () => {
      const section = screen.getByRole('region', {
        name: 'Organisation',
      })
      expect(section).toBeInTheDocument()
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName('Organisation')

      expect(getByDescriptionTerm('Nom', section)).toHaveTextContent(
        offre.organisation!
      )
      expect(
        within(getByDescriptionTerm('Lien organisation', section)).getByRole(
          'link',
          { name: 'Site de l’entreprise (nouvelle fenêtre)' }
        )
      ).toHaveAttribute('href', offre.urlOrganisation)
      expect(getByDescriptionTerm('Adresse', section)).toHaveTextContent(
        offre.adresseOrganisation!
      )
      expect(getByDescriptionTerm('Description', section)).toHaveTextContent(
        offre.descriptionOrganisation!
      )
    })
  })

  describe('server side', () => {
    const unServiceCivique = unDetailServiceCivique()
    beforeEach(() => {
      ;(getServiceCiviqueServerSide as jest.Mock).mockResolvedValue(
        unServiceCivique
      )
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          accessToken: 'accessToken',
        },
      })
    })

    it('requiert la connexion', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('charge la page avec les détails du service civique', async () => {
      // When
      const actual = await getServerSideProps({
        query: {
          offre_type: 'service-civique',
          offre_id: 'id-service-civique',
        },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(getServiceCiviqueServerSide).toHaveBeenCalledWith(
        'id-service-civique',
        'accessToken'
      )
      expect(actual).toEqual({
        props: {
          offre: unServiceCivique,
          pageTitle: `Détail de l’offre n° ${unServiceCivique.id} - Recherche d\'offres`,
          pageHeader: 'Offre de service civique',
        },
      })
    })

    it("renvoie une 404 si l'offre n'existe pas", async () => {
      // Given
      ;(getServiceCiviqueServerSide as jest.Mock).mockResolvedValue(undefined)

      // When
      const actual = await getServerSideProps({
        query: {
          offre_type: 'service-civique',
          offre_id: 'id-service-civique',
        },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({ notFound: true })
    })
  })
})
