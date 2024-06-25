import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'

import FavorisPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/favoris/FavorisPage'
import Favoris, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/favoris/page'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { unDetailBeneficiaire } from 'fixtures/beneficiaire'
import { getOffres, getRecherchesSauvegardees } from 'services/favoris.service'
import { getJeuneDetails } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { ApiError } from 'utils/httpClient'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('services/jeunes.service')
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
      user: { id: 'id-conseiller', structure: 'MILO' },
    })
  })

  it('récupère les offres et les recherches du jeune', async () => {
    // Given
    ;(getOffres as jest.Mock).mockResolvedValue(offres)
    ;(getRecherchesSauvegardees as jest.Mock).mockResolvedValue(recherches)

    // When
    const params = { idJeune: 'id-jeune' }
    const metadata = await generateMetadata({ params })
    render(await Favoris({ params }))

    // Then
    expect(getOffres).toHaveBeenCalledWith('id-jeune', 'accessToken')
    expect(getRecherchesSauvegardees).toHaveBeenCalledWith(
      'id-jeune',
      'accessToken'
    )

    expect(metadata).toEqual({ title: 'Favoris - Jirac Kenji - Portefeuille' })
    expect(FavorisPage).toHaveBeenCalledWith(
      {
        offres,
        recherches,
        lectureSeule: false,
      },
      {}
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
    const promise = Favoris({ params: { idJeune: 'id-jeune' } })

    // Then

    await expect(promise).rejects.toEqual(
      new Error('NEXT REDIRECT /mes-jeunes/id-jeune')
    )
    expect(redirect).toHaveBeenCalledWith('/mes-jeunes/id-jeune')
  })
})
