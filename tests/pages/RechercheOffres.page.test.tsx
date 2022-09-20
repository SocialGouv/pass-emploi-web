import { render, screen } from '@testing-library/react'

import RechercheOffres from 'pages/recherche-offres'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { getServerSideProps } from 'pages/recherche-offres'
import { GetServerSidePropsContext } from 'next/types'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Recherche Offres', () => {
  describe('client side', () => {
    it('affiche un bouton pour lancer la recherche', () => {
      // Given
      render(<RechercheOffres />)

      // Then
      expect(
        screen.getByRole('button', { name: 'Rechercher' })
      ).toBeInTheDocument()
    })

    it('permet de saisir des mots clés', () => {
      // Given
      render(<RechercheOffres />)

      // Then
      expect(screen.getByLabelText(/Mots clés/)).toHaveAttribute('type', 'text')
    })
  })

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

    it('charge la page avec les bonnes props', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          pageTitle: 'Recherche d’offres',
          pageHeader: 'Offres',
        },
      })
    })
  })
})
