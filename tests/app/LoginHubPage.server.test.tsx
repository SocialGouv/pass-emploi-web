import { render } from '@testing-library/react'
import React from 'react'

import LoginHubPage from 'app/(connexion)/login/LoginHubPage'
import LoginHub, { metadata } from 'app/(connexion)/login/page'

jest.mock('app/(connexion)/login/LoginHubPage', () => jest.fn(() => <></>))

describe('LoginPage server side', () => {
  it('prépare la page de login sinon', async () => {
    // When
    render(await LoginHub())

    // Then
    expect(metadata).toEqual({
      title:
        'Sélection de l’espace de connexion - Outil du Contrat d’Engagement Jeune et du pass emploi',
    })
    expect(LoginHubPage).toHaveBeenCalledWith({}, undefined)
  })
})
