import { render } from '@testing-library/react'

import AidePage from 'app/(connected)/(with-sidebar)/(without-chat-full-screen)/aide/AidePage'
import Aide, {
  metadata,
} from 'app/(connected)/(with-sidebar)/(without-chat-full-screen)/aide/page'

jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat-full-screen)/aide/AidePage'
)

describe('Aide server side', () => {
  it('prépare la page', async () => {
    // When
    render(await Aide())

    // Then
    expect(metadata).toEqual({ title: 'Aide et ressources' })
    expect(AidePage).toHaveBeenCalledWith({}, undefined)
  })
})
