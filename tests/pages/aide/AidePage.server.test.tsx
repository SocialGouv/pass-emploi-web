import React from 'react'

import AidePage from 'app/(connected)/(with-sidebar)/(without-chat-full-screen)/aide/AidePage'
import Aide, {
  metadata,
} from 'app/(connected)/(with-sidebar)/(without-chat-full-screen)/aide/page'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat-full-screen)/aide/AidePage'
)

describe('Aide server side', () => {
  it('prépare la page', async () => {
    // When
    renderWithContexts(await Aide())

    // Then
    expect(metadata).toEqual({ title: 'Aide et ressources' })
    expect(AidePage).toHaveBeenCalledWith({}, undefined)
  })
})
