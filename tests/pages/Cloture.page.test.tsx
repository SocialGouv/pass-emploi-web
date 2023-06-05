import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unEvenement } from 'fixtures/evenement'
import { StructureConseiller } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import Cloture, {
  getServerSideProps,
} from 'pages/evenements/[evenement_id]/cloture'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  cloreAnimationCollective,
  getDetailsEvenement,
} from 'services/evenements.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/evenements.service')

describe('Cloture', () => {
  describe('client side', () => {
    const animationCollective = unEvenement()

    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let routerPush: Function
    beforeEach(async () => {
      // Given
      alerteSetter = jest.fn()
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        push: routerPush,
      })

      // When
      renderWithContexts(
        <Cloture
          withoutChat={true}
          pageTitle=''
          evenement={animationCollective}
          returnTo={`/mes-jeunes/edition-rdv?idRdv=${animationCollective.id}&redirectUrl=redirectUrl`}
        />,
        {
          customAlerte: { alerteSetter },
        }
      )
    })

    it("affiche les bénéficiaires de l'événement", async () => {
      // THEN
      for (const jeune of animationCollective.jeunes) {
        expect(
          screen.getByText(`${jeune.nom} ${jeune.prenom}`)
        ).toBeInTheDocument()
      }
    })

    it("afficher un bouton pour clore l'événement", async () => {
      // THEN
      expect(
        screen.getByRole('button', {
          name: 'Clore',
        })
      ).toBeInTheDocument()
    })

    it('permet de sélectionner les jeunes', async () => {
      // When - Then
      for (const jeune of animationCollective.jeunes) {
        const ligneJeune = screen.getByRole('checkbox', {
          name: `${jeune.nom} ${jeune.prenom}`,
        })

        await userEvent.click(ligneJeune)
        expect(ligneJeune).toBeChecked()

        await userEvent.click(ligneJeune)
        expect(ligneJeune).not.toBeChecked()
      }
    })

    it('permet de sélectionner tous les jeunes d’un coup', async () => {
      // Given
      const toutSelectionnerCheckbox =
        screen.getByLabelText('Tout sélectionner')
      expect(toutSelectionnerCheckbox).not.toBeChecked()

      // When
      await userEvent.click(toutSelectionnerCheckbox)

      // Then
      expect(toutSelectionnerCheckbox).toBeChecked()
    })

    describe('au click sur le bouton "Clore"', () => {
      beforeEach(async () => {
        // Given
        await userEvent.click(
          screen.getByText(animationCollective.jeunes[0].prenom, {
            exact: false,
          })
        )

        // When
        const clore = screen.getByText('Clore')
        await userEvent.click(clore)
      })

      it('clôt l’animation collective', async () => {
        // Then
        expect(cloreAnimationCollective).toHaveBeenCalledWith(
          animationCollective.id,
          [animationCollective.jeunes[0].id]
        )
      })

      it('renvoie sur le détail de l’animation collective', () => {
        // Then
        expect(alerteSetter).toHaveBeenCalledWith('clotureAC')
        expect(routerPush).toHaveBeenCalledWith(
          `/mes-jeunes/edition-rdv?idRdv=${animationCollective.id}&redirectUrl=redirectUrl`
        )
      })
    })
  })

  describe('server side', () => {
    describe("quand l'utilisateur n'est pas connecté", () => {
      it('requiert la connexion', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: false,
          redirect: { destination: 'whatever' },
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ redirect: { destination: 'whatever' } })
      })
    })

    describe("quand l'utilisateur est connecté", () => {
      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })
        ;(getDetailsEvenement as jest.Mock).mockResolvedValue(
          unEvenement({ statut: StatutAnimationCollective.AClore })
        )
      })

      it('récupère l’animation collective concernée', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {
            evenement_id: 'id-animation-collective',
            redirectUrl: 'redirectUrl',
          },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getDetailsEvenement).toHaveBeenCalledWith(
          'id-animation-collective',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            evenement: unEvenement({
              statut: StatutAnimationCollective.AClore,
            }),
            returnTo: '/mes-jeunes/edition-rdv?idRdv=1&redirectUrl=redirectUrl',
            pageTitle: 'Clore - Mes événements',
            pageHeader: 'Clôture de l’événement',
            withoutChat: true,
          },
        })
      })

      it("renvoie une 404 si l’animation collective n'existe pas", async () => {
        // Given
        ;(getDetailsEvenement as jest.Mock).mockResolvedValue(undefined)

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { idRdv: 'id-rdv' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ notFound: true })
      })

      it("renvoie une 404 si l’animation collective n'est pas à clore", async () => {
        // Given
        ;(getDetailsEvenement as jest.Mock).mockResolvedValue(
          unEvenement({ statut: StatutAnimationCollective.AVenir })
        )

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { idRdv: 'id-rdv' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ notFound: true })
      })
    })

    describe('quand l’utilisateur est Pole Emploi', () => {
      it('renvoie sur la liste des jeunes', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: {
              id: 'id-conseiller',
              structure: StructureConseiller.POLE_EMPLOI,
            },
            accessToken: 'accessToken',
          },
        })

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          redirect: { destination: '/mes-jeunes', permanent: false },
        })
      })
    })
  })
})
