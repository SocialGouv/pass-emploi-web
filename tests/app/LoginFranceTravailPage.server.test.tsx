import { render } from '@testing-library/react'
import React from 'react'

import LoginFranceTravailPage from 'app/(connexion)/login/france-travail/LoginFranceTravailPage'
import LoginFranceTravail, {
  metadata,
} from 'app/(connexion)/login/france-travail/page'

jest.mock('app/(connexion)/login/france-travail/LoginFranceTravailPage', () =>
  jest.fn(() => <></>)
)

describe('LoginFranceTravailPage server side', () => {
  it('prépare la page de login sinon', async () => {
    // When
    render(await LoginFranceTravail())

    // Then
    expect(metadata).toEqual({
      title:
        'Connexion France Travail - Outil du Contrat d’Engagement Jeune et du pass emploi',
    })
    expect(LoginFranceTravailPage).toHaveBeenCalledWith({}, undefined)
  })
})
