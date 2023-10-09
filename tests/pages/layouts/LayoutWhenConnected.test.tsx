import { render } from '@testing-library/react'

import LayoutWhenConnected from 'app/(connected)/layout'
import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes } from 'fixtures/jeune'
import { Conseiller } from 'interfaces/conseiller'
import { JeuneFromListe } from 'interfaces/jeune'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getJeunesDuConseillerServerSide } from 'services/jeunes.service'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(async () => ({
    user: { id: 'user-id' },
    accessToken: 'accessToken',
  })),
}))

jest.mock('services/conseiller.service')
jest.mock('utils/conseiller/conseillerContext', () => ({
  ConseillerProvider: jest.fn(({ children }) => <>{children}</>),
}))

jest.mock('services/jeunes.service')
jest.mock('utils/portefeuilleContext')

describe('LayoutWhenConnected', () => {
  let conseiller: Conseiller
  let portefeuille: JeuneFromListe[]
  beforeEach(async () => {
    // Given
    conseiller = unConseiller()
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)

    portefeuille = desItemsJeunes()
    ;(getJeunesDuConseillerServerSide as jest.Mock).mockResolvedValue(
      portefeuille
    )

    render(await LayoutWhenConnected({ children: <div>POUET POEUT</div> }))
  })

  it('alimente le contexte avec le conseiller connecté', async () => {
    // Then
    expect(getConseillerServerSide).toHaveBeenCalledWith(
      { id: 'user-id' },
      'accessToken'
    )
    expect(ConseillerProvider).toHaveBeenCalledWith(
      expect.objectContaining({ conseiller }),
      {}
    )
  })

  it('alimente le contexte avec le portefeuille du conseiller', async () => {
    // Then
    expect(getJeunesDuConseillerServerSide).toHaveBeenCalledWith(
      'user-id',
      'accessToken'
    )
    expect(PortefeuilleProvider).toHaveBeenCalledWith(
      expect.objectContaining({ portefeuille }),
      {}
    )
  })
})
