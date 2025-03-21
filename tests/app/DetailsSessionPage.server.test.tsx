import { render } from '@testing-library/react'

import DetailsSessionPage from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/DetailsSessionPage'
import DetailsSession from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/page'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { unDetailSession } from 'fixtures/session'
import {
  BeneficiaireEtablissement,
  CategorieSituation,
} from 'interfaces/beneficiaire'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import { getBeneficiairesDeLaStructureMilo } from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getDetailsSession } from 'services/sessions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock('services/conseiller.service')
jest.mock('services/beneficiaires.service')
jest.mock('services/sessions.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/DetailsSessionPage'
)

describe('Détails Session Page Server', () => {
  const params = { idSession: 'session-1' }
  const searchParams = { redirectUrl: 'redirectUrl' }
  beforeEach(() => {
    ;(getDetailsSession as jest.Mock).mockResolvedValue(unDetailSession())
  })

  describe('Quand le conseiller est France Travail', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: structureFTCej },
      })
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({ structure: structureFTCej })
      )

      //When
      const promise = DetailsSession({
        params: Promise.resolve(params),
        searchParams: Promise.resolve(searchParams),
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
    })
  })

  describe('Quand le conseiller est Milo', () => {
    const beneficiaires: BeneficiaireEtablissement[] = [
      {
        base: uneBaseBeneficiaire({
          id: 'id-beneficiaire-1',
          prenom: 'Harry',
          nom: 'Beau',
        }),
        referent: {
          id: 'id-conseiller-1',
          nom: 'Le Calamar',
          prenom: 'Carlo',
        },
        situation: CategorieSituation.EMPLOI,
        dateDerniereActivite: '2023-03-01T14:11:38.040Z',
      },
      {
        base: uneBaseBeneficiaire({
          id: 'id-beneficiaire-2',
          prenom: 'Octo',
          nom: 'Puce',
        }),
        referent: {
          id: 'id-conseiller-1',
          nom: 'Le Calamar',
          prenom: 'Carlo',
        },
        situation: CategorieSituation.EMPLOI,
        dateDerniereActivite: '2023-03-01T14:11:38.040Z',
      },
    ]

    beforeEach(async () => {
      //Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: 'id-conseiller-1', structure: structureMilo },
        accessToken: 'accessToken',
      })
      ;(getBeneficiairesDeLaStructureMilo as jest.Mock).mockReturnValue({
        beneficiaires: beneficiaires,
      })
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({
          id: 'id-conseiller-1',
          structure: structureMilo,
          agence: { nom: 'Agence', id: 'id-test' },
          structureMilo: { nom: 'Agence', id: 'id-test' },
        })
      )
      ;(getDetailsSession as jest.Mock).mockResolvedValue(unDetailSession())

      //When
      render(
        await DetailsSession({
          params: Promise.resolve(params),
          searchParams: Promise.resolve(searchParams),
        })
      )
    })

    it('recupère le détail de la session', async () => {
      // Then
      expect(getDetailsSession).toHaveBeenCalledWith(
        'id-conseiller-1',
        'session-1',
        'accessToken'
      )
    })

    it('prépare la page', async () => {
      const session = unDetailSession()

      // Then
      expect(DetailsSessionPage).toHaveBeenCalledWith(
        {
          beneficiairesStructureMilo: beneficiaires,
          session: session,
          returnTo: 'redirectUrl',
        },
        undefined
      )
    })
  })
})
