import { render } from '@testing-library/react'
import { DateTime } from 'luxon'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'

import DetailDemarchePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/demarches/[idDemarche]/DetailDemarchePage'
import DetailDemarche, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/demarches/[idDemarche]/page'
import { unUtilisateur } from 'fixtures/auth'
import {
  unDetailBeneficiaire,
  uneDemarche,
  uneListeDeDemarches,
} from 'fixtures/beneficiaire'
import { getDemarchesBeneficiaire } from 'services/actions.service'
import { getJeuneDetails } from 'services/beneficiaires.service'

jest.mock('services/actions.service')
jest.mock('services/beneficiaires.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/demarches/[idDemarche]/DetailDemarchePage'
)
jest.mock('next/headers', () => ({ headers: jest.fn(() => new Map()) }))

describe('DetailDemarchePage server side', () => {
  describe('quand le conseiller n’est pas Conseiller Départemental', () => {
    it('renvoie une 404', async () => {
      // When
      const promise = DetailDemarche({
        params: { idJeune: 'id-jeune', idDemarche: 'id-demarche' },
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand le conseiller est Conseiller Départemental', () => {
    beforeEach(async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'accessToken',
        user: unUtilisateur({ structure: 'CONSEIL_DEPT' }),
      })
      ;(headers as jest.Mock).mockReturnValue(
        new Map([['referer', '/whatever']])
      )
      jest
        .spyOn(DateTime, 'now')
        .mockReturnValue(DateTime.fromISO('2024-09-01T14:00:00.000+02:00'))
    })

    it('récupère les info de la démarche', async () => {
      const demarche = uneDemarche()
      const trenteJoursAvant = DateTime.now().minus({ day: 30 }).startOf('day')
      ;(getDemarchesBeneficiaire as jest.Mock).mockResolvedValue({
        data: uneListeDeDemarches(),
        isState: false,
      })
      const beneficiaire = unDetailBeneficiaire()
      ;(getJeuneDetails as jest.Mock).mockResolvedValue(beneficiaire)

      // When
      const params = { idJeune: 'beneficiaire-1', idDemarche: 'id-demarche' }
      const metadata = await generateMetadata({ params })
      render(await DetailDemarche({ params }))

      // Then
      expect(getDemarchesBeneficiaire).toHaveBeenCalledWith(
        'beneficiaire-1',
        trenteJoursAvant,
        'id-conseiller',
        'accessToken'
      )
      expect(metadata).toEqual({
        title: `${demarche.titre} - Démarches de ${beneficiaire.prenom} ${beneficiaire.nom} - Portefeuille`,
      })
      expect(DetailDemarchePage).toHaveBeenCalledWith(
        {
          demarche,
          lectureSeule: false,
        },
        {}
      )
    })

    describe("quand la démarche n'existe pas", () => {
      // Given
      ;(getDemarchesBeneficiaire as jest.Mock).mockResolvedValue({
        data: uneListeDeDemarches(),
        isState: false,
      })

      it('renvoie une 404', async () => {
        // When
        const promise = DetailDemarche({
          params: {
            idJeune: 'id-jeune',
            idDemarche: 'id-demarche-inexistante',
          },
        })

        // Then
        await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
        expect(notFound).toHaveBeenCalledWith()
      })
    })

    describe('quand il est impossible de récupérer les démarches', () => {
      it('renvoie une 404', async () => {
        // Given
        ;(getDemarchesBeneficiaire as jest.Mock).mockResolvedValue(null)

        // When
        const promise = DetailDemarche({
          params: { idJeune: 'id-jeune', idDemarche: 'id-demarche' },
        })

        // Then
        await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
        expect(notFound).toHaveBeenCalledWith()
      })
    })
  })
})
