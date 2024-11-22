import { render } from '@testing-library/react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'

import DetailActionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
import DetailAction, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/page'
import { uneAction } from 'fixtures/action'
import { unUtilisateur } from 'fixtures/auth'
import { unDetailBeneficiaire } from 'fixtures/beneficiaire'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { getAction } from 'services/actions.service'
import { getJeuneDetails } from 'services/beneficiaires.service'

jest.mock('services/actions.service')
jest.mock('services/beneficiaires.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
)
jest.mock('next/headers', () => ({ headers: jest.fn(() => new Map()) }))

describe('ActionPage server side', () => {
  describe('quand le conseiller est France Travail', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: unUtilisateur({ structure: 'POLE_EMPLOI' }),
      })

      // When
      const promise = DetailAction({
        params: { idJeune: 'id-jeune', idAction: 'id-action' },
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe("quand le conseiller n'est pas France Travail", () => {
    beforeEach(async () => {
      ;(headers as jest.Mock).mockReturnValue(
        new Map([['referer', '/whatever']])
      )
    })

    it("récupère les info de l'action et du jeune", async () => {
      const action = uneAction()
      const jeune: BaseBeneficiaire & { idConseiller: string } = {
        id: 'beneficiaire-1',
        prenom: 'Nadia',
        nom: 'Sanfamiye',
        idConseiller: 'id-conseiller',
      }
      ;(getAction as jest.Mock).mockResolvedValue({ action, jeune })
      ;(getJeuneDetails as jest.Mock).mockResolvedValue(unDetailBeneficiaire())

      // When
      const params = { idJeune: 'beneficiaire-1', idAction: 'id-action' }
      const metadata = await generateMetadata({ params })
      render(await DetailAction({ params }))

      // Then
      expect(getAction).toHaveBeenCalledWith('id-action', 'accessToken')
      expect(metadata).toEqual({
        title: `${action.titre} - Actions de ${jeune.prenom} ${jeune.nom} - Portefeuille`,
      })
      expect(DetailActionPage).toHaveBeenCalledWith(
        {
          action,
          jeune,
          lectureSeule: false,
          from: 'beneficiaire',
        },
        {}
      )
    })

    describe('quand le conseiller vient de pilotage', () => {
      it('prépare la page', async () => {
        const action = uneAction()
        const jeune: BaseBeneficiaire & { idConseiller: string } = {
          id: 'beneficiaire-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        }
        ;(getAction as jest.Mock).mockResolvedValue({ action, jeune })
        ;(getJeuneDetails as jest.Mock).mockResolvedValue(
          unDetailBeneficiaire()
        )
        ;(headers as jest.Mock).mockReturnValue(
          new Map([['referer', '/pilotage']])
        )

        // When
        const params = { idJeune: 'beneficiaire-1', idAction: 'id-action' }
        const metadata = await generateMetadata({ params })
        render(await DetailAction({ params }))

        // Then
        expect(getAction).toHaveBeenCalledWith('id-action', 'accessToken')
        expect(metadata).toEqual({
          title: `${action.titre} - Actions de ${jeune.prenom} ${jeune.nom} - Portefeuille`,
        })
        expect(DetailActionPage).toHaveBeenCalledWith(
          {
            action,
            jeune,
            lectureSeule: false,
            from: 'pilotage',
          },
          {}
        )
      })
    })

    describe("quand l'action n'existe pas", () => {
      it('renvoie une 404', async () => {
        // When
        const promise = DetailAction({
          params: { idJeune: 'id-jeune', idAction: 'id-action' },
        })

        // Then
        await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
        expect(notFound).toHaveBeenCalledWith()
      })
    })

    describe("quand l'action n'appartient pas au jeune", () => {
      it('renvoie une 404', async () => {
        const action = uneAction()
        const jeune: BaseBeneficiaire & { idConseiller: string } = {
          id: 'beneficiaire-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        }
        ;(getAction as jest.Mock).mockResolvedValue({ action, jeune })

        // When
        const promise = DetailAction({
          params: { idJeune: 'id-jeune', idAction: 'id-action' },
        })

        // Then
        await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
        expect(notFound).toHaveBeenCalledWith()
      })
    })
  })
})
