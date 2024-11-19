import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import LayoutWhenConnected, { generateMetadata } from 'app/(connected)/layout'
import {
  desItemsBeneficiaires,
  extractBaseBeneficiaire,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { BeneficiaireFromListe } from 'interfaces/beneficiaire'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))

jest.mock('services/conseiller.service')
jest.mock('utils/conseiller/conseillerContext', () => ({
  ConseillerProvider: jest.fn(({ children }) => <>{children}</>),
}))

jest.mock('services/beneficiaires.service')
jest.mock('utils/portefeuilleContext')

describe('LayoutWhenConnected', () => {
  let conseiller: Conseiller
  let portefeuille: BeneficiaireFromListe[]

  it('assure que l’utilisateur est connecté', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    // When
    const promise = LayoutWhenConnected({ children: <div /> })

    // Then
    await expect(promise).rejects.toEqual(new Error('NEXT REDIRECT /login'))
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('assure que l’utilisateur est un conseiller', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { estConseiller: false },
    })

    // When
    const promise = LayoutWhenConnected({ children: <div /> })

    // Then
    await expect(promise).rejects.toEqual(
      new Error('NEXT REDIRECT /api/auth/federated-logout')
    )
    expect(redirect).toHaveBeenCalledWith('/api/auth/federated-logout')
  })
  it('affiche favicon icon en tant que brsa conseiller connecté', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        estConseiller: true,
        structure: StructureConseiller.POLE_EMPLOI_BRSA,
      },
      accessToken: 'accessToken',
    })

    const metadata = await generateMetadata()

    expect(metadata).toEqual({
      title: {
        template: '%s - Espace conseiller pass emploi',
        default: 'Espace conseiller pass emploi',
      },
      icons: {
        icon: '/pass-emploi-favicon.png',
        shortcut: '/pass-emploi-favicon.png',
        apple: '/pass-emploi-favicon.png',
      },
    })
  })

  describe('quand l’utilisateur est connecté en tant que conseiller', () => {
    beforeEach(async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { estConseiller: true, id: 'user-id' },
        accessToken: 'accessToken',
      })

      conseiller = unConseiller()
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)

      portefeuille = desItemsBeneficiaires()
      ;(getBeneficiairesDuConseillerServerSide as jest.Mock).mockResolvedValue(
        portefeuille
      )

      // When
      render(await LayoutWhenConnected({ children: <div /> }))
    })

    it('alimente le contexte avec le conseiller connecté', async () => {
      // Then
      expect(getConseillerServerSide).toHaveBeenCalledWith(
        { id: 'user-id', estConseiller: true },
        'accessToken'
      )
      expect(ConseillerProvider).toHaveBeenCalledWith(
        expect.objectContaining({ conseiller }),
        {}
      )
    })

    it('alimente le contexte avec le portefeuille du conseiller', async () => {
      // Then
      expect(getBeneficiairesDuConseillerServerSide).toHaveBeenCalledWith(
        'user-id',
        'accessToken'
      )
      expect(PortefeuilleProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          portefeuille: [portefeuille[2], portefeuille[0], portefeuille[1]].map(
            extractBaseBeneficiaire
          ),
        }),
        {}
      )
    })
  })
})
