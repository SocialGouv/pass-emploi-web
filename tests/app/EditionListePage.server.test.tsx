import { render } from '@testing-library/react'
import { headers } from 'next/headers'

import EditionListePage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes/edition-liste/EditionListePage'
import EditionListe, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes/edition-liste/page'
import { uneListe } from 'fixtures/listes'
import { recupererListe } from 'services/listes.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes/edition-liste/EditionListePage'
)
jest.mock('services/listes.service')

describe('Page d’édition d’une liste', () => {
  beforeEach(() => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller-1' },
      accessToken: 'accessToken',
    })
    ;(headers as jest.Mock).mockReturnValue(new Map())
  })

  it('prépare la page', async () => {
    // When
    const metadata = await generateMetadata({})
    render(await EditionListe({}))

    // Then
    expect(metadata).toEqual({
      title: 'Créer liste - Portefeuille',
    })
    expect(EditionListePage).toHaveBeenCalledWith(
      {
        returnTo: '/mes-jeunes/listes',
      },
      undefined
    )
  })

  it('récupère la liste concernée', async () => {
    // Given
    const liste = uneListe()
    ;(recupererListe as jest.Mock).mockResolvedValue(liste)

    // When
    const searchParams = { idListe: 'id-liste-1' }
    const metadata = await generateMetadata({
      searchParams: Promise.resolve(searchParams),
    })
    render(
      await EditionListe({
        searchParams: Promise.resolve(searchParams),
      })
    )

    // Then
    expect(recupererListe).toHaveBeenCalledWith('id-liste-1', 'accessToken')
    expect(metadata).toEqual({
      title: 'Modifier liste Liste export international - Portefeuille',
    })
    expect(EditionListePage).toHaveBeenCalledWith(
      {
        liste: liste,
        returnTo: '/mes-jeunes/listes',
      },
      undefined
    )
  })
})
