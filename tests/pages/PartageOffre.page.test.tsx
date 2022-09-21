import { render, screen, within } from '@testing-library/react'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { GetServerSidePropsContext } from 'next/types'
import PartageOffre, {
  getServerSideProps,
} from 'pages/offres/[offre_id]/partage'
import renderPage from 'next-auth/core/pages'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Partage Offre', () => {
  const uneOffre = { id: 'offre-prof', titre: 'prof' }
  describe('server side', () => {
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
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          pageTitle: 'Partager une offre',
          offre: uneOffre,
        },
      })
    })
  })

  describe('client side', () => {
    beforeEach(() => {
      render(<PartageOffre pageTitle='' offre={uneOffre} />)
    })
    it('affiche les informations de l’offre', () => {
      // Then
      expect(screen.getByText(uneOffre.titre)).toBeInTheDocument()
      expect(screen.getByText('Offre n°' + uneOffre.id)).toBeInTheDocument()
    })
  })
})
