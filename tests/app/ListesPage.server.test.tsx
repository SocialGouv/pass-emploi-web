import { render } from '@testing-library/react'
import ListesPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/listes/ListesPage'
import Listes from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/listes/page'
import { getListesServerSide } from 'services/listes.service'

import { desListes } from 'fixtures/listes'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/listes/ListesPage'
)
jest.mock('services/listes.service')

describe('Page Listes de ', () => {
  it('récupère les listes', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      accessToken: 'access-token',
      user: { id: 'id-conseiller-1' },
    })
    ;(getListesServerSide as jest.Mock).mockResolvedValue(desListes())

    // When
    render(await Listes())

    // Then
    expect(getListesServerSide).toHaveBeenCalledWith(
      'id-conseiller-1',
      'access-token'
    )
    expect(ListesPage).toHaveBeenCalledWith(
      {
        listes: desListes(),
      },
      undefined
    )
  })
})
