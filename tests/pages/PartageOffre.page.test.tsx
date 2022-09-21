import { render, screen } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next/types'

import { unDetailOffre } from 'fixtures/offre'
import { mockedOffresEmploiService } from 'fixtures/services'
import PartageOffre, {
  getServerSideProps,
} from 'pages/offres/[offre_id]/partage'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Page Partage Offre', () => {
  const offre = unDetailOffre()

  describe('server side', () => {
    it('requiert une session valide', async () => {
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

    describe("quand l'utilisateur est connecté", () => {
      let offresEmploiService: OffresEmploiService
      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { accessToken: 'accessToken' },
        })
        offresEmploiService = mockedOffresEmploiService({
          getOffreEmploiServerSide: jest.fn(async () => unDetailOffre()),
        })
        ;(withDependance as jest.Mock).mockReturnValue(offresEmploiService)
      })

      it('charge la page avec les détails de l’offre', async () => {
        // When
        const actual = await getServerSideProps({
          query: { offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          offresEmploiService.getOffreEmploiServerSide
        ).toHaveBeenCalledWith('offre-id', 'accessToken')
        expect(actual).toEqual({
          props: {
            pageTitle: 'Partager une offre',
            offre,
          },
        })
      })

      it("renvoie une 404 si l'offre n'existe pas", async () => {
        // Given
        ;(
          offresEmploiService.getOffreEmploiServerSide as jest.Mock
        ).mockResolvedValue(undefined)

        // When
        const actual = await getServerSideProps({
          query: { offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ notFound: true })
      })
    })
  })

  describe('client side', () => {
    beforeEach(() => {
      render(<PartageOffre pageTitle='' offre={offre} />)
    })

    it('affiche les informations de l’offre', () => {
      // Then
      expect(screen.getByText(offre.titre)).toBeInTheDocument()
      expect(screen.getByText('Offre n°' + offre.id)).toBeInTheDocument()
    })
  })
})
