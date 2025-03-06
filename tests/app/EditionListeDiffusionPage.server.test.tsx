import { render } from '@testing-library/react'
import { headers } from 'next/headers'

import EditionListeDiffusionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes-de-diffusion/edition-liste/EditionListeDiffusionPage'
import EditionListeDiffusion, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes-de-diffusion/edition-liste/page'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import { recupererListeDeDiffusion } from 'services/listes-de-diffusion.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes-de-diffusion/edition-liste/EditionListeDiffusionPage'
)
jest.mock('services/listes-de-diffusion.service')

describe('Page d’édition d’une liste de diffusion', () => {
  beforeEach(() => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller' },
      accessToken: 'accessToken',
    })
    ;(headers as jest.Mock).mockReturnValue(new Map())
  })

  it('prépare la page', async () => {
    // When
    const metadata = await generateMetadata({})
    render(await EditionListeDiffusion({}))

    // Then
    expect(metadata).toEqual({
      title: 'Créer liste de diffusion - Portefeuille',
    })
    expect(EditionListeDiffusionPage).toHaveBeenCalledWith(
      {
        returnTo: '/mes-jeunes/listes-de-diffusion',
      },
      undefined
    )
  })

  it('récupère la liste de diffusion concernée', async () => {
    // Given
    const listeDeDiffusion = uneListeDeDiffusion()
    ;(recupererListeDeDiffusion as jest.Mock).mockResolvedValue(
      listeDeDiffusion
    )

    // When
    const searchParams = { idListe: '1' }
    const metadata = await generateMetadata({
      searchParams: Promise.resolve(searchParams),
    })
    render(
      await EditionListeDiffusion({
        searchParams: Promise.resolve(searchParams),
      })
    )

    // Then
    expect(recupererListeDeDiffusion).toHaveBeenCalledWith('1', 'accessToken')
    expect(metadata).toEqual({
      title:
        'Modifier liste de diffusion Liste export international - Portefeuille',
    })
    expect(EditionListeDiffusionPage).toHaveBeenCalledWith(
      {
        liste: listeDeDiffusion,
        returnTo: '/mes-jeunes/listes-de-diffusion',
      },
      undefined
    )
  })
})
