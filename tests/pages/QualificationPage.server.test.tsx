import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'

import Qualification from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/[action_id]/qualification/page'
import QualificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/[action_id]/qualification/QualificationPage'
import { desSituationsNonProfessionnelles, uneAction } from 'fixtures/action'
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
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/[action_id]/qualification/QualificationPage',
  () => jest.fn()
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
        params: { action_id: 'id-action' },
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
          params: { action_id: 'id-action' },
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
            id: 'jeune-1',
            prenom: 'Nadia',
            nom: 'Sanfamiye',
          },
        })

        // When
        const promise = Qualification({
          params: { action_id: 'id-action' },
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
            status: StatutAction.Terminee,
            qualification: {
              libelle: 'Santé',
              isSituationNonProfessionnelle: true,
            },
          }),
          jeune: {
            id: 'jeune-1',
            prenom: 'Nadia',
            nom: 'Sanfamiye',
          },
        })

        // When
        const promise = Qualification({
          params: { action_id: 'id-action' },
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
        const situationsNonProfessionnelles = desSituationsNonProfessionnelles()
        ;(getAction as jest.Mock).mockResolvedValue({
          action,
          jeune: {
            id: 'jeune-1',
            prenom: 'Nadia',
            nom: 'Sanfamiye',
          },
        })
        ;(getSituationsNonProfessionnelles as jest.Mock).mockResolvedValue(
          situationsNonProfessionnelles
        )

        // When
        render(
          await Qualification({
            params: { action_id: action.id },
          })
        )

        // Then
        expect(getAction).toHaveBeenCalledWith(action.id, 'accessToken')
        expect(getSituationsNonProfessionnelles).toHaveBeenCalledWith(
          'accessToken'
        )
        expect(QualificationPage).toHaveBeenCalledWith(
          {
            action,
            situationsNonProfessionnelles,
            returnTo: '/mes-jeunes/jeune-1/actions/id-action-1',
          },
          {}
        )
      })
    })
  })
})
