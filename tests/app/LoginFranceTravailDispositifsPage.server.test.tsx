import { render } from '@testing-library/react'
import React from 'react'

import LoginFranceTravailDispositifsPage from 'app/(connexion)/login/france-travail/dispositifs/LoginFranceTravailDispositifsPage'
import LoginFranceTravailDispositifs, {
  metadata,
} from 'app/(connexion)/login/france-travail/dispositifs/page'

jest.mock(
  'app/(connexion)/login/france-travail/dispositifs/LoginFranceTravailDispositifsPage',
  () => jest.fn(() => <></>)
)

describe('LoginFranceTravailDispositifsPage server side', () => {
  it('prépare la page de login sinon', async () => {
    // When
    render(await LoginFranceTravailDispositifs())

    // Then
    expect(metadata).toEqual({
      title:
        'Sélection du dispositif France Travail - Outil du Contrat d’Engagement Jeune et du pass emploi',
    })
    expect(LoginFranceTravailDispositifsPage).toHaveBeenCalledWith(
      {
        ssoAccompagnementsIntensifsSontActifs: true,
        ssoAvenirProEstActif: true,
      },
      undefined
    )
  })
})
