import { mockedServicesCiviquesService } from 'fixtures/services'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { getServerSideProps } from 'pages/offres/[offre_type]/[offre_id]'
import { GetServerSidePropsContext } from 'next/types'
import { DetailServiceCivique } from 'interfaces/offre'
import withDependance from 'utils/injectionDependances/withDependance'
import { ServicesCiviquesService } from 'services/services-civiques.service'
import { screen, within } from '@testing-library/react'
import getByDescriptionTerm from 'tests/querySelector'
import { unDetailServiceCivique } from 'fixtures/offre'

describe('Page Détail Service civique', () => {
  describe('client side', () => {
    let offre: DetailServiceCivique

    it('permet de partager le service civique', () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: `Partager service civique numéro ${offre.id}`,
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

      expect(getByDescriptionTerm('Domaine', section)).toHaveTextContent(
        offre.domaine!
      )
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
        offre.codeDepartement
      )
      expect(getByDescriptionTerm('Date de début', section)).toHaveTextContent(
        offre.dateDeDebut!
      )
      expect(getByDescriptionTerm('Date de fin', section)).toHaveTextContent(
        offre.dateDeFin
      )
    })

    it('affiche le détail de la mission', () => {
      const section = screen.getByRole('region', {
        name: 'Détail de la mission',
      })
      expect(section).toBeInTheDocument()
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName('Mission')

      expect(within(section).getByText(offre.description)).toBeInTheDocument()
    })

    it('affiche le détail de l’organisation', () => {
      const section = screen.getByRole('region', {
        name: 'Détail de l’organisation',
      })
      expect(section).toBeInTheDocument()
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName('Organisation')

      // expect(
      //   within(section).getByText(offre.fullNameOrganisation)
      // ).toBeInTheDocument() // todo a voir c'est quoi dans l'api
      expect(
        within(section).getByText(offre.adresseOrganisation)
      ).toBeInTheDocument()
      expect(
        within(section).getByText(offre.urlOrganisation)
      ).toBeInTheDocument()
      expect(
        within(section).getByText(offre.descriptionOrganisation)
      ).toBeInTheDocument()
    })
  })

  describe('server side', () => {
    let servicesCiviquesService: ServicesCiviquesService
    beforeEach(() => {
      servicesCiviquesService = mockedServicesCiviquesService({
        getServiceCiviqueServerSide: jest.fn(async () =>
          unDetailServiceCivique()
        ),
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
      // Given
      const offre: DetailServiceCivique = unDetailServiceCivique()
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          accessToken: 'accessToken',
        },
      })
      ;(withDependance as jest.Mock).mockImplementation(
        (dependance: string) => {
          if (dependance === 'servicesCiviquesService')
            return servicesCiviquesService
        }
      )

      // When
      const actual = await getServerSideProps({
        query: { service_civique_id: 'id-service-civique' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(
        servicesCiviquesService.getServiceCiviqueServerSide
      ).toHaveBeenCalledWith('id-service-civique', 'accessToken')
      expect(actual).toEqual({
        props: {
          offre,
          pageTitle: 'Offre de service civique',
          pageHeader: 'Offre de service civique',
        },
      })
    })

    it("renvoie une 404 si l'offre n'existe pas", async () => {
      // Given
      ;(
        servicesCiviquesService.getServiceCiviqueServerSide as jest.Mock
      ).mockResolvedValue(undefined)

      // When
      const actual = await getServerSideProps({
        query: { service_civique_id: 'id-service-civique' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({ notFound: true })
    })
  })
})
