import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
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
  let container: HTMLElement
  let routerPush: Function

  beforeEach(async () => {
    routerPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
    })
  })

  describe('Adapte le texte', () => {
    describe('Pour un conseiller BRSA', () => {
      const conseiller = unConseiller({
        structure: StructureConseiller.POLE_EMPLOI_BRSA,
      })

      beforeEach(async () => {
        await act(async () => {
          ;({ container } = renderWithContexts(
            <ConsentementCguPage returnTo='/mes-jeunes' />,
            {
              customConseiller: conseiller,
            }
          ))
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('contenu', async () => {
        // Then
        expect(
          screen.getByText(
            /La plateforme pass emploi a pour objet de contribuer à l’insertion professionnelle des Usagers du RSA./
          )
        ).toBeInTheDocument()
        expect(() => screen.getByText('CEJ')).toThrow()
      })
    })

    describe('Pour un conseiller CEJ', () => {
      const conseiller = unConseiller({
        structure: StructureConseiller.MILO,
      })

      beforeEach(async () => {
        await act(async () => {
          ;({ container } = renderWithContexts(
            <ConsentementCguPage returnTo='/mes-jeunes' />,
            {
              customConseiller: conseiller,
            }
          ))
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('contenu', async () => {
        // Then
        expect(
          screen.getByText(
            /La plateforme CEJ a pour objet de contribuer à la diminution du décrochage des jeunes en accompagnement vers l’emploi./
          )
        ).toBeInTheDocument()
        expect(() => screen.getByText('pass emploi')).toThrow()
      })
    })
  })

  describe('Gère le formulaire', () => {
    beforeEach(async () => {
      // Given
      const conseiller = unConseiller()
      ;({ container } = renderWithContexts(
        <ConsentementCguPage returnTo='/mes-jeunes' />,
        {
          customConseiller: conseiller,
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
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

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    })
  })
})
