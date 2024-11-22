import { render } from '@testing-library/react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import PartageOffre from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/[idOffre]/partage/page'
import PartageOffrePage from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/[idOffre]/partage/PartageOffrePage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import {
  unDetailImmersion,
  unDetailOffreEmploi,
  unDetailServiceCivique,
} from 'fixtures/offre'
import {
  DetailImmersion,
  DetailOffreEmploi,
  DetailServiceCivique,
} from 'interfaces/offre'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import { getImmersionServerSide } from 'services/immersions.service'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'

jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/[idOffre]/partage/PartageOffrePage'
)
jest.mock('services/offres-emploi.service')
jest.mock('services/services-civiques.service')
jest.mock('services/immersions.service')
jest.mock('services/beneficiaires.service')

describe('Page Partage Offre', () => {
  let offreEmploi: DetailOffreEmploi
  let serviceCivique: DetailServiceCivique
  let immersion: DetailImmersion

  beforeEach(() => {
    // Given
    offreEmploi = unDetailOffreEmploi()
    serviceCivique = unDetailServiceCivique()
    immersion = unDetailImmersion()
    ;(getOffreEmploiServerSide as jest.Mock).mockResolvedValue(offreEmploi)
    ;(getServiceCiviqueServerSide as jest.Mock).mockResolvedValue(
      serviceCivique
    )
    ;(getImmersionServerSide as jest.Mock).mockResolvedValue(immersion)
    ;(getBeneficiairesDuConseillerServerSide as jest.Mock).mockResolvedValue(
      desItemsBeneficiaires()
    )
    ;(headers as jest.Mock).mockReturnValue(
      new Map([['referer', 'referer-url']])
    )
  })

  it('charge la page avec les détails de l’offre d’emploi', async () => {
    // When
    render(
      await PartageOffre({
        params: { typeOffre: 'emploi', idOffre: 'offre-id' },
      })
    )

    // Then
    expect(getOffreEmploiServerSide).toHaveBeenCalledWith(
      'offre-id',
      'accessToken'
    )
    expect(PartageOffrePage).toHaveBeenCalledWith(
      {
        offre: offreEmploi,
        returnTo: 'referer-url',
      },
      {}
    )
  })

  it('charge la page avec les détails du service civique', async () => {
    // When
    render(
      await PartageOffre({
        params: { typeOffre: 'service-civique', idOffre: 'offre-id' },
      })
    )

    // Then
    expect(getServiceCiviqueServerSide).toHaveBeenCalledWith(
      'offre-id',
      'accessToken'
    )
    expect(PartageOffrePage).toHaveBeenCalledWith(
      {
        offre: serviceCivique,
        returnTo: 'referer-url',
      },
      {}
    )
  })

  it("charge la page avec les détails de l'immersion", async () => {
    // When
    render(
      await PartageOffre({
        params: { typeOffre: 'immersion', idOffre: 'offre-id' },
      })
    )

    // Then
    expect(getImmersionServerSide).toHaveBeenCalledWith(
      'offre-id',
      'accessToken'
    )
    expect(PartageOffrePage).toHaveBeenCalledWith(
      {
        offre: immersion,
        returnTo: 'referer-url',
      },
      {}
    )
  })

  it("renvoie une 404 si l'offre n'existe pas", async () => {
    // Given
    ;(getOffreEmploiServerSide as jest.Mock).mockResolvedValue(undefined)

    // When
    const promise = PartageOffre({
      params: { typeOffre: 'emploi', idOffre: 'offre-id' },
    })

    // Then
    await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
    expect(notFound).toHaveBeenCalledWith()
  })

  it('ignore le referer si besoin', async () => {
    // Given
    ;(headers as jest.Mock).mockReturnValue(
      new Map([
        [
          'referer',
          'http://localhost:3000/?redirectUrl=%2Foffres%2Femploi%2Foffre-id%2Fpartage',
        ],
      ])
    )

    // When
    render(
      await PartageOffre({
        params: { typeOffre: 'emploi', idOffre: 'offre-id' },
      })
    )

    // Then
    expect(PartageOffrePage).toHaveBeenCalledWith(
      expect.objectContaining({
        returnTo: '/offres',
      }),
      {}
    )
  })
})
