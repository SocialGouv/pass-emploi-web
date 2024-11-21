import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'
import React from 'react'

import CloturePage from 'app/(connected)/(with-sidebar)/(without-chat)/evenements/[id_evenement]/cloture/CloturePage'
import { unEvenement } from 'fixtures/evenement'
import { AlerteParam } from 'referentiel/alerteParam'
import { cloreAnimationCollective } from 'services/evenements.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')

describe('CloturePage client side', () => {
  let container: HTMLElement

  const animationCollective = unEvenement()

  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let routerPush: Function
  let routerRefresh: Function
  beforeEach(async () => {
    // Given
    alerteSetter = jest.fn()
    routerPush = jest.fn()
    routerRefresh = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
      refresh: routerRefresh,
    })

    // When
    ;({ container } = renderWithContexts(
      <CloturePage
        evenement={animationCollective}
        returnTo={`/mes-jeunes/edition-rdv?idRdv=${animationCollective.id}&redirectUrl=redirectUrl`}
      />,
      {
        customAlerte: { setter: alerteSetter },
      }
    ))
  })

  it('a11y', async () => {
    let results: AxeResults

    await act(async () => {
      results = await axe(container)
    })

    expect(results!).toHaveNoViolations()
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
    const toutSelectionnerCheckbox = screen.getByLabelText('Tout sélectionner')
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

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
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
