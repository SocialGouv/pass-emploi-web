import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'

import ModificationActionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/modification/ModificationActionPage'
import ModificationAction, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/modification/page'
import {
  desActionsPredefinies,
  desCategories,
  uneAction,
} from 'fixtures/action'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  getAction,
  getSituationsNonProfessionnelles,
  recupererLesCommentaires,
} from 'services/actions.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('services/actions.service')
jest.mock('services/referentiel.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/modification/ModificationActionPage'
)

describe('ModificationActionPage server side', () => {
  describe('pour un conseiller Milo', () => {
    const jeune = uneBaseBeneficiaire()
    const actionsPredefinies = desActionsPredefinies()
    const categories = desCategories()
    const params = { idAction: 'id-action' }
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: StructureConseiller.MILO },
        accessToken: 'accessToken',
      })
      ;(getSituationsNonProfessionnelles as jest.Mock).mockResolvedValue(
        categories
      )
      ;(getActionsPredefinies as jest.Mock).mockResolvedValue(
        actionsPredefinies
      )
      ;(recupererLesCommentaires as jest.Mock).mockResolvedValue([])
    })

    it('prépare la page', async () => {
      const action = uneAction()
      ;(getAction as jest.Mock).mockResolvedValue({ action, jeune })

      // When
      const metadata = await generateMetadata({ params })
      render(await ModificationAction({ params }))

      // Then
      expect(metadata).toEqual({
        title:
          'Modifier l’action Identifier ses atouts et ses compétences - Kenji Jirac',
      })
      expect(ModificationActionPage).toHaveBeenCalledWith(
        {
          action,
          actionsPredefinies,
          aDesCommentaires: false,
          idBeneficiaire: jeune.id,
          situationsNonProfessionnelles: categories,
          returnTo: expect.stringMatching(
            '/mes-jeunes/beneficiaire-1/actions/id-action-1'
          ),
        },
        {}
      )
    })

    it('la page n’existe pas pour une action inexistante', async () => {
      // Given
      ;(getAction as jest.Mock).mockResolvedValue(undefined)

      // When
      const promise = ModificationAction({ params })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })

    it('la page n’existe pas pour une action qualifiee', async () => {
      // Given
      ;(getAction as jest.Mock).mockResolvedValue({
        action: uneAction({ status: StatutAction.Qualifiee }),
        jeune,
      })

      // When
      const promise = ModificationAction({ params })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('pour un conseiller France Travail', () => {
    it('la page n’existe pas', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: StructureConseiller.POLE_EMPLOI },
      })

      // When
      const promise = ModificationAction({ params: { idAction: 'id-action' } })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })
})
