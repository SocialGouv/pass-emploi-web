import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'

import FavorisPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/favoris/FavorisPage'
import Favoris, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/favoris/page'
import { unDetailBeneficiaire } from 'fixtures/beneficiaire'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { getJeuneDetails } from 'services/beneficiaires.service'
import { getOffres, getRecherchesSauvegardees } from 'services/favoris.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { ApiError } from 'utils/httpClient'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock('services/beneficiaires.service')
jest.mock('services/favoris.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/favoris/FavorisPage'
)

describe('Favoris', () => {
  const offres = uneListeDOffres()
  const recherches = uneListeDeRecherches()

  beforeEach(async () => {
    // Given
    ;(getJeuneDetails as jest.Mock).mockResolvedValue(unDetailBeneficiaire())
    ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
      accessToken: 'accessToken',
      user: { id: 'id-conseiller-1', structure: 'MILO' },
    })
  })

  it('récupère les offres et les recherches du jeune', async () => {
    // Given
    ;(getOffres as jest.Mock).mockResolvedValue(offres)
    ;(getRecherchesSauvegardees as jest.Mock).mockResolvedValue(recherches)

    // When
    const params = { idJeune: 'id-jeune' }
    const metadata = await generateMetadata({ params: Promise.resolve(params) })
    render(await Favoris({ params: Promise.resolve(params) }))

    // Then
    expect(getOffres).toHaveBeenCalledWith('id-jeune', 'accessToken')
    expect(getRecherchesSauvegardees).toHaveBeenCalledWith(
      'id-jeune',
      'accessToken'
    )

    expect(metadata).toEqual({ title: 'Favoris - Jirac Kenji - Portefeuille' })
    expect(FavorisPage).toHaveBeenCalledWith(
      { beneficiaire: unDetailBeneficiaire(), offres, recherches },
      undefined
    )
  })
})

describe('Quand la ressource n’est pas accessible au conseiller', () => {
  it('redirige vers la page d’accueil', async () => {
    // Given
    ;(getOffres as jest.Mock).mockRejectedValue(new ApiError(403, 'erreur'))
    ;(getRecherchesSauvegardees as jest.Mock).mockRejectedValue(
      new ApiError(403, 'erreur')
    )

    // When
    const promise = Favoris({
      params: Promise.resolve({ idJeune: 'id-jeune' }),
    })

    // Then

    await expect(promise).rejects.toEqual(
      new Error('NEXT_REDIRECT /mes-jeunes/id-jeune')
    )
    expect(redirect).toHaveBeenCalledWith('/mes-jeunes/id-jeune')
  })
})
