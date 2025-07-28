import { render } from '@testing-library/react'

import CreationBeneficiaireFranceTravailPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
import CreationBeneficiaireMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
import CreationBeneficiaire, {
  metadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/page'
import { desListes } from 'fixtures/listes'
import {
  structureAvenirPro,
  structureFTCej,
  structureMilo,
} from 'interfaces/structure'
import { getListesServerSide } from 'services/listes.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
)
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
)
jest.mock('services/conseiller.service')
jest.mock('services/listes.service')

describe('CreationBeneficiaireFranceTravailPage client side', () => {
  it('prépare la page pour un conseiller Milo', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { structure: structureMilo },
      accessToken: 'accessToken',
    })

    // When
    render(await CreationBeneficiaire())

    // Then
    expect(metadata).toEqual({
      title: 'Créer compte bénéficiaire - Portefeuille',
    })
    expect(CreationBeneficiaireMiloPage).toHaveBeenCalledWith({}, undefined)
  })

  it('prépare la page pour un conseiller FT', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { structure: structureFTCej },
      accessToken: 'accessToken',
    })

    // When
    render(await CreationBeneficiaire())

    // Then
    expect(metadata).toEqual({
      title: 'Créer compte bénéficiaire - Portefeuille',
    })
    expect(CreationBeneficiaireFranceTravailPage).toHaveBeenCalledWith(
      {},
      undefined
    )
  })

  it('prépare la page pour un conseiller Avenir Pro', async () => {
    // Given
    const listes = desListes()
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { structure: structureAvenirPro },
      accessToken: 'accessToken',
    })
    ;(getListesServerSide as jest.Mock).mockResolvedValue(listes)

    // When
    render(await CreationBeneficiaire())

    // Then
    expect(metadata).toEqual({
      title: 'Créer compte bénéficiaire - Portefeuille',
    })
    expect(CreationBeneficiaireFranceTravailPage).toHaveBeenCalledWith(
      { listes },
      undefined
    )
  })
})
