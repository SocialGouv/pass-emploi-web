import { act, render, screen } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import LoginHubPage from 'app/(connexion)/login/LoginHubPage'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

jest.mock('utils/auth/auth', () => ({
  signin: jest.fn(),
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

    it('affiche un titre de niveau 1', () => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Bienvenue sur le portail CEJ et Pass emploi',
        })
      ).toBeInTheDocument()
    })

    it('a 2 boutons et un lien', () => {
      expect(
        screen.getByRole('button', {
          name: 'Connexion Mission locale',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'Connexion Conseil départemental',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Connexion France Travail',
        })
      ).toHaveAttribute('href', '/login/france-travail/dispositifs')
    })
  })
})
