import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unDetailSession } from 'fixtures/session'
import { StructureConseiller } from 'interfaces/conseiller'
import ClotureSession from 'pages/agenda/sessions/[session_id]/cloture'
import { getServerSideProps } from 'pages/evenements/[evenement_id]/cloture'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/sessions.service')

describe('Cloture Session', () => {
  describe('client side', () => {
    let session = unDetailSession()
    beforeEach(async () => {
      // When
      renderWithContexts(
        <ClotureSession
          withoutChat={true}
          pageTitle=''
          session={session}
          returnTo=''
        />
      )
    })

    it("affiche les bénéficiaires de l'événement", async () => {
      // THEN
      for (const jeune of session.inscriptions) {
        expect(
          screen.getByText(`${jeune.prenom} ${jeune.nom}`)
        ).toBeInTheDocument()
      }
    })

    it('afficher un bouton pour clore la session', async () => {
      // THEN
      expect(
        screen.getByRole('button', {
          name: 'Clore la session',
        })
      ).toBeInTheDocument()
    })

    it('permet de sélectionner les jeunes', async () => {
      // When - Then
      for (const jeune of session.inscriptions) {
        const ligneJeune = screen.getByRole('checkbox', {
          name: `${jeune.prenom} ${jeune.nom}`,
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
    describe('au clic sur le bouton "Clore la session', () => {})
  })

  describe('server side', () => {
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
