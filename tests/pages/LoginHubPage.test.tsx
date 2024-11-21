import { act, render, screen } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import LoginHubPage from 'app/(connexion)/login/LoginHubPage'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

describe('LoginHubPage client side', () => {
  let container: HTMLElement
  beforeEach(async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => param,
    })
  })

  describe('render', () => {
    beforeEach(async () => {
      ;({ container } = render(
        <LoginErrorMessageProvider state={[undefined, jest.fn()]}>
          <LoginHubPage />
        </LoginErrorMessageProvider>
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('devrait afficher un titre de niveau 1', () => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: "Connectez-vous à l'espace conseiller",
        })
      ).toBeInTheDocument()
    })

    it('devrait avoir 2 liens', () => {
      const lienCEJ = screen.getByRole('link', {
        name: 'Se connecter à l’application du contrat d’engagement jeune',
      })
      const lienPassEmploi = screen.getByRole('link', {
        name: 'Se connecter à l’application pass emploi',
      })

      //THEN
      expect(lienCEJ).toHaveAttribute('href', '/login/cej')
      expect(lienPassEmploi).toHaveAttribute('href', '/login/passemploi')
    })
  })
})
