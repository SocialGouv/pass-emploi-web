import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import ConsentementCguPage from 'app/(connected)/(full-page)/consentement-cgu/ConsentementCguPage'
import { unConseiller } from 'fixtures/conseiller'
import { StructureConseiller } from 'interfaces/conseiller'
import { modifierDateSignatureCGU } from 'services/conseiller.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/conseiller.service')

describe('ConsentementCGUPage client side', () => {
  let routerPush: Function

  beforeEach(async () => {
    routerPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
    })
  })

  describe('Adapte le texte', () => {
    it('Pour un conseiller BRSA', async () => {
      // Given
      const conseiller = unConseiller({
        structure: StructureConseiller.POLE_EMPLOI_BRSA,
      })

      // When
      await act(async () => {
        renderWithContexts(<ConsentementCguPage returnTo='/mes-jeunes' />, {
          customConseiller: conseiller,
        })
      })

      // Then
      expect(
        screen.getByText(
          /La plateforme pass emploi a pour objet de contribuer à l’insertion professionnelle des Usagers du RSA./
        )
      ).toBeInTheDocument()
      expect(() => screen.getByText('CEJ')).toThrow()
    })

    it('Pour un conseiller CEJ', async () => {
      // Given
      const conseiller = unConseiller({
        structure: StructureConseiller.MILO,
      })

      // When
      await act(async () => {
        renderWithContexts(<ConsentementCguPage returnTo='/mes-jeunes' />, {
          customConseiller: conseiller,
        })
      })

      // Then
      expect(
        screen.getByText(
          /La plateforme CEJ a pour objet de contribuer à la diminution du décrochage des jeunes en accompagnement vers l’emploi./
        )
      ).toBeInTheDocument()
      expect(() => screen.getByText('pass emploi')).toThrow()
    })
  })

  describe('Gère le formulaire', () => {
    beforeEach(async () => {
      // Given
      const conseiller = unConseiller()
      renderWithContexts(<ConsentementCguPage returnTo='/mes-jeunes' />, {
        customConseiller: conseiller,
      })
    })

    it('Affiche un message d’erreur quand le conseiller ne donne pas son consentement', async () => {
      // When
      await userEvent.click(screen.getByRole('button', { name: /Valider/ }))

      // Then
      expect(
        screen.getByText(/Le champ Consentement est vide./)
      ).toBeInTheDocument()
      expect(modifierDateSignatureCGU).not.toHaveBeenCalled()
    })

    describe('Quand le formulaire est complété', () => {
      const now = DateTime.now()
      beforeEach(async () => {
        // Given
        jest.spyOn(DateTime, 'now').mockReturnValue(now)
        await userEvent.click(
          screen.getByRole('checkbox', {
            name: /accepter les conditions générales d’utilisation/,
          })
        )
        await userEvent.click(screen.getByRole('button', { name: /Valider/ }))
      })

      it('Appelle la méthode modifierDateSignatureCGU', () => {
        expect(modifierDateSignatureCGU).toHaveBeenCalledWith(now)
      })

      it('Redirige vers la page souhaitée', async () => {
        // Then
        expect(routerPush).toHaveBeenCalledWith('/mes-jeunes')
      })
    })
  })
})
