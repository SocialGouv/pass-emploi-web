import { render } from '@testing-library/react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import DetailActionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
import DetailAction, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/page'
import { uneAction } from 'fixtures/action'
import { getAction } from 'services/actions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock('services/actions.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
)
jest.mock('next/headers', () => ({ headers: jest.fn(() => new Map()) }))

describe('ActionPage server side', () => {
  describe('quand le conseiller est France Travail', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'POLE_EMPLOI' },
      })

      // When
      const promise = DetailAction({
        params: Promise.resolve({ idJeune: 'id-jeune', idAction: 'id-action' }),
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe("quand le conseiller n'est pas France Travail", () => {
    beforeEach(async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        accessToken: 'accessToken',
        user: { structure: 'MILO', id: 'id-conseiller-1' },
      })
      ;(headers as jest.Mock).mockReturnValue(
        new Map([['referer', '/whatever']])
      )
    })

    it("récupère les info de l'action et du jeune", async () => {
      const action = uneAction()
      ;(getAction as jest.Mock).mockResolvedValue(action)

      // When
      const params = { idJeune: 'id-beneficiaire-1', idAction: 'id-action' }
      const metadata = await generateMetadata({
        params: Promise.resolve(params),
      })
      render(await DetailAction({ params: Promise.resolve(params) }))

      // Then
      expect(getAction).toHaveBeenCalledWith('id-action', 'accessToken')
      expect(metadata).toEqual({
        title: `${action.titre} - Actions de ${action.beneficiaire.prenom} ${action.beneficiaire.nom} - Portefeuille`,
      })
      expect(DetailActionPage).toHaveBeenCalledWith(
        { action, from: 'beneficiaire' },
        undefined
      )
    })

    describe('quand le conseiller vient de pilotage', () => {
      it('prépare la page', async () => {
        const action = uneAction()
        ;(getAction as jest.Mock).mockResolvedValue(action)
        ;(headers as jest.Mock).mockReturnValue(
          new Map([['referer', '/pilotage']])
        )

        // When
        const params = { idJeune: 'id-beneficiaire-1', idAction: 'id-action' }
        const metadata = await generateMetadata({
          params: Promise.resolve(params),
        })
        render(await DetailAction({ params: Promise.resolve(params) }))

        // Then
        expect(getAction).toHaveBeenCalledWith('id-action', 'accessToken')
        expect(metadata).toEqual({
          title: `${action.titre} - Actions de ${action.beneficiaire.prenom} ${action.beneficiaire.nom} - Portefeuille`,
        })
        expect(DetailActionPage).toHaveBeenCalledWith(
          { action, from: 'pilotage' },
          undefined
        )
      })
    })

    describe("quand l'action n'existe pas", () => {
      it('renvoie une 404', async () => {
        // When
        const promise = DetailAction({
          params: Promise.resolve({
            idJeune: 'id-jeune',
            idAction: 'id-action',
          }),
        })

        // Then
        await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
        expect(notFound).toHaveBeenCalledWith()
      })
    })

    describe("quand l'action n'appartient pas au jeune", () => {
      it('renvoie une 404', async () => {
        const action = uneAction()
        ;(getAction as jest.Mock).mockResolvedValue(action)

        // When
        const promise = DetailAction({
          params: Promise.resolve({
            idJeune: 'id-autre-jeune',
            idAction: 'id-action',
          }),
        })

        // Then
        await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
        expect(notFound).toHaveBeenCalledWith()
      })
    })
  })
})
