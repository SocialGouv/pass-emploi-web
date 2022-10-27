import { render, screen, within } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next/types'

import { unDetailImmersion } from 'fixtures/offre'
import { mockedImmersionsService } from 'fixtures/services'
import { DetailImmersion } from 'interfaces/offre'
import DetailOffre, {
  getServerSideProps,
} from 'pages/offres/[offre_type]/[offre_id]'
import { ImmersionsService } from 'services/immersions.service'
import getByDescriptionTerm from 'tests/querySelector'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Page Détail Offre Emploi', () => {
  describe('client side', () => {
    let offre: DetailImmersion

    beforeEach(() => {
      // Given
      offre = unDetailImmersion()

      // When
      render(<DetailOffre offre={offre} pageTitle={'Détail de l’offre'} />)
    })

    it("permet de partager l'offre", () => {
      // Then
      expect(
        screen.getByRole('link', { name: `Partager offre ${offre.titre}` })
      ).toHaveAttribute('href', `/offres/immersion/${offre.id}/partage`)
    })

    it('affiche le titre de l’offre', () => {
      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: offre.titre,
        })
      ).toBeInTheDocument()
    })

    it("affiche les informations principales de l'offre", () => {
      const section = screen.getByRole('region', {
        name: "Informations de l'offre",
      })
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName("Informations de l'offre")

      expect(getByDescriptionTerm('Établissement', section)).toHaveTextContent(
        offre.nomEtablissement
      )
      expect(
        getByDescriptionTerm('Secteur d’activité', section)
      ).toHaveTextContent(offre.secteurActivite)
      expect(getByDescriptionTerm('Ville', section)).toHaveTextContent(
        offre.ville
      )
      expect(
        within(section).getByText(/Prévenez votre conseiller/)
      ).toBeInTheDocument()
    })

    it("affiche le contact pour l'offre", () => {
      const section = screen.getByRole('region', {
        name: 'Informations du Contact',
      })
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName('Informations du Contact')

      const { contact } = offre
      expect(getByDescriptionTerm('Interlocuteur', section)).toHaveTextContent(
        contact.prenom! + ' ' + contact.nom!
      )
      expect(getByDescriptionTerm('Rôle', section)).toHaveTextContent(
        contact.role!
      )
      expect(getByDescriptionTerm('Adresse', section)).toHaveTextContent(
        contact.adresse!
      )
      expect(getByDescriptionTerm('E-mail', section)).toHaveTextContent(
        contact.email!
      )
      expect(getByDescriptionTerm('Téléphone', section)).toHaveTextContent(
        contact.telephone!
      )
    })
  })

  describe('server side', () => {
    let immersionsService: ImmersionsService
    beforeEach(() => {
      immersionsService = mockedImmersionsService({
        getImmersionServerSide: jest.fn(async () => unDetailImmersion()),
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

    it('charge la page avec les détails de l’offre', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          accessToken: 'accessToken',
        },
      })
      ;(withDependance as jest.Mock).mockImplementation(
        (dependance: string) => {
          if (dependance === 'immersionsService') return immersionsService
        }
      )

      // When
      const actual = await getServerSideProps({
        query: { offre_type: 'immersion', offre_id: 'id-offre' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(immersionsService.getImmersionServerSide).toHaveBeenCalledWith(
        'id-offre',
        'accessToken'
      )
      expect(actual).toEqual({
        props: {
          offre: unDetailImmersion(),
          pageTitle: 'Détail de l’offre',
          pageHeader: 'Offre d’immersion',
        },
      })
    })

    it("renvoie une 404 si l'offre n'existe pas", async () => {
      // Given
      ;(
        immersionsService.getImmersionServerSide as jest.Mock
      ).mockResolvedValue(undefined)

      // When
      const actual = await getServerSideProps({
        query: { offre_type: 'immersion', offre_id: 'offre-id' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({ notFound: true })
    })
  })
})
