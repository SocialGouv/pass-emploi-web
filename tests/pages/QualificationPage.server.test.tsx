import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'

import Qualification, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/qualification/page'
import QualificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/qualification/QualificationPage'
import { desCategoriesAvecNONSNP, uneAction } from 'fixtures/action'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { StatutAction } from 'interfaces/action'
import {
  getAction,
  getSituationsNonProfessionnelles,
} from 'services/actions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('services/actions.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/qualification/QualificationPage'
)

describe('QualificationPage server side', () => {
  describe("quand le conseiller n'est pas MiLo", () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'POLE_EMPLOI' },
      })

      // When
      const promise = Qualification({
        params: Promise.resolve({ idAction: 'id-action' }),
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand le conseiller est MiLo', () => {
    beforeEach(() => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        accessToken: 'accessToken',
        user: { structure: 'MILO' },
      })
    })

    describe("quand l'action n'existe pas", () => {
      it('renvoie une 404', async () => {
        ;(getAction as jest.Mock).mockResolvedValue(undefined)

        // When
        const promise = Qualification({
          params: Promise.resolve({ idAction: 'id-action' }),
        })

        // Then
        await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
        expect(notFound).toHaveBeenCalledWith()
      })
    })

    describe("quand l'action n'est pas terminée", () => {
      it('renvoie une 404', async () => {
        ;(getAction as jest.Mock).mockResolvedValue({
          action: uneAction(),
          jeune: {
            id: 'beneficiaire-1',
            prenom: 'Nadia',
            nom: 'Sanfamiye',
          },
        })

        // When
        const promise = Qualification({
          params: Promise.resolve({ idAction: 'id-action' }),
        })

        // Then
        await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
        expect(notFound).toHaveBeenCalledWith()
      })
    })

    describe("quand l'action est qualifiée", () => {
      it('renvoie une 404', async () => {
        ;(getAction as jest.Mock).mockResolvedValue({
          action: uneAction({
            status: StatutAction.Qualifiee,
            qualification: {
              libelle: 'Santé',
              isSituationNonProfessionnelle: true,
              code: 'SANTE',
            },
          }),
          jeune: {
            id: 'beneficiaire-1',
            prenom: 'Nadia',
            nom: 'Sanfamiye',
          },
        })

        // When
        const promise = Qualification({
          params: Promise.resolve({ idAction: 'id-action' }),
        })

        // Then
        await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
        expect(notFound).toHaveBeenCalledWith()
      })
    })

    describe("quand l'action est terminée", () => {
      it('récupère la liste des situations non professionnelles', async () => {
        // Given
        const action = uneAction({ status: StatutAction.Terminee })
        const beneficiaire = uneBaseBeneficiaire()
        const situationsNonProfessionnelles = desCategoriesAvecNONSNP()
        const params = Promise.resolve({ idAction: 'id-action' })
        ;(getAction as jest.Mock).mockResolvedValue({
          action,
          jeune: beneficiaire,
        })
        ;(getSituationsNonProfessionnelles as jest.Mock).mockResolvedValue(
          situationsNonProfessionnelles
        )

        // When
        const metadata = await generateMetadata({ params })
        render(
          await Qualification({
            params: Promise.resolve({ idAction: action.id }),
            searchParams: Promise.resolve({ liste: 'pilotage' }),
          })
        )

        // Then
        expect(getAction).toHaveBeenCalledWith('id-action', 'accessToken')
        expect(metadata).toEqual({
          title: `Qualifier l’action ${action.titre} - ${beneficiaire.prenom} ${beneficiaire.prenom}`,
        })
        expect(getSituationsNonProfessionnelles).toHaveBeenCalledWith(
          { avecNonSNP: true },
          'accessToken'
        )
        expect(QualificationPage).toHaveBeenCalledWith(
          {
            action,
            categories: situationsNonProfessionnelles,
            returnTo: expect.stringMatching(
              '/mes-jeunes/beneficiaire-1/actions/id-action-1'
            ),
            returnToListe: '/pilotage',
          },
          {}
        )
      })
    })
  })
})
