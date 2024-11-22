import { render } from '@testing-library/react'
import { notFound, redirect } from 'next/navigation'

import ClotureSessionPage from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/cloture/ClotureSessionPage'
import ClotureSession from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/cloture/page'
import { unConseiller } from 'fixtures/conseiller'
import { unDetailSession } from 'fixtures/session'
import { StructureConseiller } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { getConseillerServerSide } from 'services/conseillers.service'
import { getDetailsSession } from 'services/sessions.service'

jest.mock('services/sessions.service')
jest.mock('services/conseillers.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/cloture/ClotureSessionPage'
)

describe('Cloture Session server side', () => {
  const params = { idSession: 'session-1' }
  const searchParams = { redirectUrl: 'redirectUrl' }

  describe("quand l'utilisateur est connecté", () => {
    beforeEach(async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({
          id: 'id-conseiller',
          structure: StructureConseiller.MILO,
          agence: { nom: 'Agence', id: 'id-test' },
          structureMilo: { nom: 'Agence', id: 'id-test' },
        })
      )
      ;(getDetailsSession as jest.Mock).mockResolvedValue(
        unDetailSession({
          session: {
            id: 'session-1',
            nom: 'titre-session',
            dateHeureDebut: '2023-06-19 10:00:00',
            dateHeureFin: '2023-06-19 17:00:00',
            dateMaxInscription: '2023-06-17',
            animateur: 'Charles Dupont',
            lieu: 'CEJ Paris',
            commentaire: 'bla',
            estVisible: true,
            nbPlacesDisponibles: 20,
            statut: StatutAnimationCollective.AClore,
          },
        })
      )
    })

    it('prépare la page', async () => {
      // Given
      const session = unDetailSession({
        session: {
          id: 'session-1',
          nom: 'titre-session',
          dateHeureDebut: '2023-06-19 10:00:00',
          dateHeureFin: '2023-06-19 17:00:00',
          dateMaxInscription: '2023-06-17',
          animateur: 'Charles Dupont',
          lieu: 'CEJ Paris',
          commentaire: 'bla',
          estVisible: true,
          nbPlacesDisponibles: 20,
          statut: StatutAnimationCollective.AClore,
        },
      })

      const inscriptionsInitiales = session.inscriptions.map((inscription) => {
        return { idJeune: inscription.idJeune, statut: inscription.statut }
      })

      // When
      render(
        await ClotureSession({
          params: params,
          searchParams: searchParams,
        })
      )

      // Then
      expect(getConseillerServerSide).toHaveBeenCalled()
      expect(getDetailsSession).toHaveBeenCalledWith(
        'id-conseiller',
        'session-1',
        'accessToken'
      )
      expect(ClotureSessionPage).toHaveBeenCalledWith(
        {
          session: session,
          inscriptionsInitiales: inscriptionsInitiales,
          returnTo: `/agenda/sessions/session-1?redirectUrl=redirectUrl`,
        },
        {}
      )
    })

    it("renvoie une 404 si la session n'existe pas", async () => {
      // Given
      ;(getDetailsSession as jest.Mock).mockResolvedValue(undefined)

      // When
      const promise = ClotureSession({
        params: params,
        searchParams: searchParams,
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })

    it("renvoie une 404 si la session n'est pas à clore", async () => {
      // Given
      ;(getDetailsSession as jest.Mock).mockResolvedValue(
        unDetailSession({
          session: {
            id: 'session-1',
            nom: 'titre-session',
            dateHeureDebut: '2023-06-19 10:00:00',
            dateHeureFin: '2023-06-19 17:00:00',
            dateMaxInscription: '2023-06-17',
            animateur: 'Charles Dupont',
            lieu: 'CEJ Paris',
            commentaire: 'bla',
            estVisible: true,
            nbPlacesDisponibles: 20,
            statut: StatutAnimationCollective.AVenir,
          },
        })
      )

      //When
      const promise = ClotureSession({
        params: params,
        searchParams: searchParams,
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand l’utilisateur est France Travail', () => {
    it('renvoie sur la liste des bénéficiaires', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({ structure: StructureConseiller.POLE_EMPLOI })
      )

      //When
      const promise = ClotureSession({
        params: params,
        searchParams: searchParams,
      })

      // Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })
  })
})
