import { render } from '@testing-library/react'

import Raccourci from 'app/(connected)/(with-sidebar)/(without-chat)/raccourci/page'
import RaccourciPage from 'app/(connected)/(with-sidebar)/(without-chat)/raccourci/RaccourciPage'

jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/raccourci/RaccourciPage'
)

describe("Page Détail d'une action d'un jeune", () => {
  it('prépare la page', async () => {
    // When
    render(Raccourci())

    // Then
    expect(RaccourciPage).toHaveBeenCalledWith({}, undefined)
  })
})
