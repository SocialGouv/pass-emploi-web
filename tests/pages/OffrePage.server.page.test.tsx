import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'

import OffrePage from 'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/[idOffre]/OffrePage'
import Offre, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/[idOffre]/page'
import {
  unDetailImmersion,
  unDetailOffreEmploi,
  unDetailServiceCivique,
} from 'fixtures/offre'
import { getImmersionServerSide } from 'services/immersions.service'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/[idOffre]/OffrePage'
)
jest.mock('services/offres-emploi.service')
jest.mock('services/immersions.service')
jest.mock('services/services-civiques.service')

describe('OffrePage server side', () => {
  beforeEach(() => {
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      accessToken: 'accessToken',
    })
  })

  describe('Offre d’emploi', () => {
    it('charge la page avec les détails de l’offre d‘emploi', async () => {
      // Given
      const detailEmploi = unDetailOffreEmploi()
      ;(getOffreEmploiServerSide as jest.Mock).mockResolvedValue(detailEmploi)

      // When
      const params = { typeOffre: 'emploi', idOffre: 'id-offre' }
      const metadata = await generateMetadata({
        params: Promise.resolve(params),
      })
      render(await Offre({ params: Promise.resolve(params) }))

      // Then
      expect(getOffreEmploiServerSide).toHaveBeenCalledWith(
        'id-offre',
        'accessToken'
      )
      expect(metadata).toEqual({
        title: "Détail de l’offre Offre d'emploi - Recherche d'offres",
      })
      expect(OffrePage).toHaveBeenCalledWith(
        {
          offre: detailEmploi,
        },
        undefined
      )
    })

    it("renvoie une 404 si l'offre n'existe pas", async () => {
      // Given
      ;(getOffreEmploiServerSide as jest.Mock).mockResolvedValue(undefined)

      // When
      const promise = Offre({
        params: Promise.resolve({ typeOffre: 'emploi', idOffre: 'offre-id' }),
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('Offre d’immersion', () => {
    it('charge la page avec les détails de l’offre d‘immersion', async () => {
      // Given
      const detailImmersion = unDetailImmersion()
      ;(getImmersionServerSide as jest.Mock).mockResolvedValue(detailImmersion)

      // When
      const params = { typeOffre: 'immersion', idOffre: 'id-offre' }
      const metadata = await generateMetadata({
        params: Promise.resolve(params),
      })
      render(await Offre({ params: Promise.resolve(params) }))

      // Then
      expect(getImmersionServerSide).toHaveBeenCalledWith(
        'id-offre',
        'accessToken'
      )
      expect(metadata).toEqual({
        title:
          "Détail de l’offre Études et développement informatique - Recherche d'offres",
      })
      expect(OffrePage).toHaveBeenCalledWith(
        {
          offre: detailImmersion,
        },
        undefined
      )
    })

    it("renvoie une 404 si l'offre n'existe pas", async () => {
      // Given
      ;(getImmersionServerSide as jest.Mock).mockResolvedValue(undefined)

      // When
      const promise = Offre({
        params: Promise.resolve({
          typeOffre: 'immersion',
          idOffre: 'offre-id',
        }),
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('Offre de service civique', () => {
    it('charge la page avec les détails de service civique', async () => {
      // Given
      const detailServiceCivique = unDetailServiceCivique()
      ;(getServiceCiviqueServerSide as jest.Mock).mockResolvedValue(
        detailServiceCivique
      )

      // When
      const params = { typeOffre: 'service-civique', idOffre: 'id-offre' }
      const metadata = await generateMetadata({
        params: Promise.resolve(params),
      })
      render(await Offre({ params: Promise.resolve(params) }))

      // Then
      expect(getServiceCiviqueServerSide).toHaveBeenCalledWith(
        'id-offre',
        'accessToken'
      )
      expect(metadata).toEqual({
        title: "Détail de l’offre unTitre - Recherche d'offres",
      })
      expect(OffrePage).toHaveBeenCalledWith(
        {
          offre: detailServiceCivique,
        },
        undefined
      )
    })

    it("renvoie une 404 si l'offre n'existe pas", async () => {
      // Given
      ;(getServiceCiviqueServerSide as jest.Mock).mockResolvedValue(undefined)

      // When
      const promise = Offre({
        params: Promise.resolve({
          typeOffre: 'service-civique',
          idOffre: 'offre-id',
        }),
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })
})
