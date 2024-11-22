import { render } from '@testing-library/react'

import ListesDiffusionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/listes-de-diffusion/ListesDiffusionPage'
import ListesDiffusion from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/listes-de-diffusion/page'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { getListesDeDiffusionServerSide } from 'services/listes-de-diffusion.service'

jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/listes-de-diffusion/ListesDiffusionPage'
)
jest.mock('services/listes-de-diffusion.service')

describe('Page Listes de Diffusion', () => {
  it('récupère les listes de diffusion', async () => {
    // Given
    ;(getListesDeDiffusionServerSide as jest.Mock).mockResolvedValue(
      desListesDeDiffusion()
    )

    // When
    render(await ListesDiffusion())

    // Then
    expect(getListesDeDiffusionServerSide).toHaveBeenCalledWith(
      'id-conseiller',
      'accessToken'
    )
    expect(ListesDiffusionPage).toHaveBeenCalledWith(
      {
        listesDiffusion: desListesDeDiffusion(),
      },
      {}
    )
  })
})
