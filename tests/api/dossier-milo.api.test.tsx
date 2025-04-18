/**
 * @jest-environment node
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { GET } from 'app/api/milo/[numeroDossier]/route'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import { getIdJeuneMilo } from 'services/beneficiaires.service'
import { trackSSR } from 'utils/analytics/matomo'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock('services/beneficiaires.service')
jest.mock('utils/analytics/matomo')

describe('GET /api/milo/[numeroDossier]', () => {
  describe('Pour un conseiller pas MiLo', () => {
    it('redirige vers la liste des jeunes', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: structureFTCej },
      })

      // When
      const promise = GET(new Request('https://www.perdu.com'), {
        params: Promise.resolve({ numeroDossier: '123456' }),
      })

      // Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT_REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })
  })

  describe('Pour un conseiller MiLo', () => {
    beforeEach(() => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: structureMilo },
      })
    })

    describe('Quand le jeune existe', () => {
      it('redirige vers la fiche du jeune', async () => {
        // Given
        ;(getIdJeuneMilo as jest.Mock).mockResolvedValue('id-jeune')
        ;(headers as jest.Mock).mockReturnValue(
          new Map([['referer', 'https://portail-qlf.i-milo.fr']])
        )

        // When
        const promise = GET(new Request('https://www.perdu.com'), {
          params: Promise.resolve({ numeroDossier: '123456' }),
        })

        // Then
        await expect(promise).rejects.toEqual(
          new Error('NEXT_REDIRECT /mes-jeunes/id-jeune')
        )
        expect(getIdJeuneMilo).toHaveBeenCalledWith('123456', undefined)
        expect(redirect).toHaveBeenCalledWith('/mes-jeunes/id-jeune')
        expect(trackSSR).toHaveBeenCalledWith({
          structure: 'MILO',
          customTitle: 'Détail jeune par numéro dossier',
          pathname: '/mes-jeunes/milo/123456',
          refererUrl: 'https://portail-qlf.i-milo.fr',
          aDesBeneficiaires: true,
        })
      })
    })

    describe("Quand le jeune n'existe pas", () => {
      it('redirige vers la liste des jeunes', async () => {
        // Given
        ;(getIdJeuneMilo as jest.Mock).mockResolvedValue(undefined)
        ;(headers as jest.Mock).mockReturnValue(
          new Map([['referer', 'https://portail-qlf.i-milo.fr']])
        )

        // When
        const promise = GET(new Request('https://www.perdu.com'), {
          params: Promise.resolve({ numeroDossier: '123456' }),
        })

        // Then
        await expect(promise).rejects.toEqual(
          new Error('NEXT_REDIRECT /mes-jeunes')
        )
        expect(getIdJeuneMilo).toHaveBeenCalledWith('123456', undefined)
        expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
        expect(trackSSR).toHaveBeenCalledWith({
          structure: 'MILO',
          customTitle: 'Détail jeune par numéro dossier en erreur',
          pathname: '/mes-jeunes/milo/123456',
          refererUrl: 'https://portail-qlf.i-milo.fr',
          aDesBeneficiaires: null,
        })
      })
    })
  })
})
