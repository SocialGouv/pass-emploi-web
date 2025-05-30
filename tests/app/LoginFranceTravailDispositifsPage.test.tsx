import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import LoginFranceTravailDispositifsPage from 'app/(connexion)/login/france-travail/dispositifs/LoginFranceTravailDispositifsPage'
import { signin } from 'utils/auth/auth'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

jest.mock('utils/auth/auth', () => ({
  signin: jest.fn(),
}))

describe('LoginFranceTravailDispositifsPage client side', () => {
  let container: HTMLElement
  beforeEach(async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => param,
    })
  })

  describe('render', () => {
    const setErrorMsg = jest.fn()
    beforeEach(async () => {
      ;({ container } = render(
        <LoginErrorMessageProvider state={[undefined, setErrorMsg]}>
          <LoginFranceTravailDispositifsPage
            ssoAccompagnementsIntensifsSontActifs={true}
            ssoAvenirProEstActif={true}
          />
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

    it('affiche un titre', () => {
      //GIVEN
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Connexion conseiller France Travail',
        })
      ).toBeInTheDocument()
    })

    it('affiche un bouton par dispositif', () => {
      //THEN
      expect(
        screen.getAllByRole('button', {
          name: /Connexion France Travail/,
        })
      ).toHaveLength(7)
    })

    it("permet de s'identifier en tant que conseiller FT CEJ", async () => {
      // Given
      const peBRSAButton = screen.getByRole('button', {
        name: 'Connexion France Travail CEJ',
      })

      // When
      await userEvent.click(peBRSAButton)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'pe-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })

    it("permet de s'identifier en tant que conseiller FT BRSA", async () => {
      // Given
      const peBRSAButton = screen.getByRole('button', {
        name: 'Connexion France Travail RSA rénové',
      })

      // When
      await userEvent.click(peBRSAButton)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'pe-brsa-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })

    it("permet de s'identifier en tant que conseiller FT AIJ", async () => {
      // Given
      const peAIJButton = screen.getByRole('button', {
        name: 'Connexion France Travail AIJ',
      })

      // When
      await userEvent.click(peAIJButton)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'pe-aij-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })

    it("permet de s'identifier en tant que conseiller FT Avenir Pro", async () => {
      // Given
      const button = screen.getByRole('button', {
        name: 'Connexion France Travail Avenir pro',
      })

      // When
      await userEvent.click(button)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'avenirpro-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })

    it("permet de s'identifier en tant que conseiller FT REN-Intensif / FTT-FTX", async () => {
      // Given
      const button = screen.getByRole('button', {
        name: 'Connexion France Travail REN-Intensif / FTT-FTX',
      })

      // When
      await userEvent.click(button)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'ft-accompagnement-intensif-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })

    it("permet de s'identifier en tant que conseiller FT Accompagnement global", async () => {
      // Given
      const button = screen.getByRole('button', {
        name: 'Connexion France Travail Accompagnement global',
      })

      // When
      await userEvent.click(button)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'ft-accompagnement-global-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })

    it("permet de s'identifier en tant que conseiller FT Equip’emploi Equip’recrut", async () => {
      // Given
      const button = screen.getByRole('button', {
        name: 'Connexion France Travail Equip’emploi / Equip’recrut',
      })

      // When
      await userEvent.click(button)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'ft-equip-emploi-recrut-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })
  })
})
