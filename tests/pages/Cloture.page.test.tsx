import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import React from 'react'

import { unEvenement } from 'fixtures/evenement'
import { mockedEvenementService } from 'fixtures/services'
import Cloture from 'pages/evenements/[evenement_id]/cloture'
import { EvenementsService } from 'services/evenements.service'
import renderWithContexts from 'tests/renderWithContexts'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Cloture', () => {
  describe('client side', () => {
    let evenementService: EvenementsService
    const evenementAClore = unEvenement()

    let routerPush: Function
    routerPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      asPath: '/agenda',
      push: routerPush,
    })

    beforeEach(async () => {
      // Given
      evenementService = mockedEvenementService()
      // When
      renderWithContexts(
        <Cloture
          withoutChat={true}
          pageTitle=''
          evenement={evenementAClore}
          returnTo=''
        />,
        { customDependances: { rendezVousService: evenementService } }
      )
    })

    it("afficher un bouton pour clore l'événement", async () => {
      // THEN
      const clore: HTMLElement = screen.getByRole('button', {
        name: 'Clore',
      })
      expect(clore).toBeInTheDocument()
    })

    it("affiche les jeunes de l'événement", async () => {
      // THEN
      for (const jeune of evenementAClore.jeunes) {
        expect(
          screen.getByText(`${jeune.nom} ${jeune.prenom}`)
        ).toBeInTheDocument()
      }
    })

    it('selectionne tous les jeunes au clic sur la checkbox', async () => {
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
      it("clos l'événement", async () => {
        // Given
        await userEvent.click(
          screen.getByText(evenementAClore.jeunes[0].prenom, { exact: false })
        )

        // When
        const clore = screen.getByText('Clore')
        await userEvent.click(clore)

        // Then
        expect(evenementService.cloreAnimationCollective).toHaveBeenCalledWith(
          evenementAClore.id,
          [evenementAClore.jeunes[0].id]
        )
      })
    })
  })
})
