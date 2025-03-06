import { act, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getSession } from 'next-auth/react'
import React from 'react'

import LayoutLoginClient from 'app/(connexion)/login/LayoutLoginClient'
import { MODAL_ROOT_ID } from 'components/globals'

jest.mock('utils/auth/auth', () => ({ signin: jest.fn() }))

describe('LoginLayout client side', () => {
  let container: HTMLElement
  let routerReplace: () => void
  beforeEach(async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/login')
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => param,
      has: () => true,
    })

    routerReplace = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ replace: routerReplace })
  })

  describe('render', () => {
    beforeEach(async () => {
      ;(getSession as jest.Mock).mockResolvedValue(null)
      ;({ container } = render(
        <LayoutLoginClient>
          <p></p>
        </LayoutLoginClient>
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("n'affiche pas de modale d'onboarding mobile", () => {
      // Then
      expect(() =>
        screen.getByText('Bienvenue sur l’espace mobile du conseiller')
      ).toThrow()
    })
  })

  describe('quand l’utilisateur est déjà connecté', () => {
    it('redirige la page à laquelle il voulait accéder', async () => {
      // When
      ;(getSession as jest.Mock).mockResolvedValue('session')

      // When
      await act(async () => {
        render(
          <LayoutLoginClient>
            <p></p>
          </LayoutLoginClient>
        )
      })

      // Then
      expect(routerReplace).toHaveBeenCalledWith('redirectUrl')
    })
  })

  describe("quand l'utilisateur est sur mobile", () => {
    let originalInnerWidth: PropertyDescriptor
    beforeEach(async () => {
      originalInnerWidth = Object.getOwnPropertyDescriptor(
        window,
        'innerWidth'
      )!

      // Given
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 599,
      })

      // When
      await act(async () => {
        ;({ container } = render(
          <>
            <LayoutLoginClient>
              <p></p>
            </LayoutLoginClient>
            <div id={MODAL_ROOT_ID} />
          </>
        ))
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', originalInnerWidth)
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("affiche une modale d'onboarding", async () => {
      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Bienvenue sur l’espace mobile du conseiller',
        })
      ).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveAccessibleName(
        'Un accès dedié à vos conversations'
      )
      expect(
        screen.getByText(
          'Retrouvez l’ensemble de vos conversations avec les bénéficiaires de votre portefeuile.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'À ce jour, seul l’accès à la messagerie est disponible sur l’espace mobile.'
        )
      ).toBeInTheDocument()
    })
  })
})
