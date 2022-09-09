import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FiltresEtatsQualificationActions from 'components/action/FiltresEtatsQualificationActions'
import { EtatQualificationAction } from 'interfaces/action'

describe('FiltresEtatsQualificationAction', () => {
  let filtrerActions: (
    etatsQualificationSelectionnes: EtatQualificationAction[]
  ) => void
  beforeEach(async () => {
    // Given
    filtrerActions = jest.fn()
    render(<FiltresEtatsQualificationActions onFiltres={filtrerActions} />)

    // When
    await userEvent.click(screen.getByRole('button', { name: /qualification/ }))
  })

  it("affiche une liste d'états", async () => {
    // Then
    expect(
      screen.getByRole('group', {
        name: 'Choisir un ou plusieurs états de qualification à filtrer',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Actions non qualifiables')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Actions à qualifier')).toBeInTheDocument()
    expect(screen.getByLabelText('Actions qualifiées')).toBeInTheDocument()
  })

  it('cache la liste des états', async () => {
    // When
    await userEvent.click(screen.getByRole('button', { name: /qualification/ }))

    // Then
    expect(() =>
      screen.getByRole('group', {
        name: 'Choisir un ou plusieurs états de qualification à filtrer',
      })
    ).toThrow()
  })

  it('réinitialise les états non validés', async () => {
    // Given
    await userEvent.click(screen.getByLabelText('Actions non qualifiables'))
    await userEvent.click(screen.getByLabelText('Actions à qualifier'))
    await userEvent.click(screen.getByRole('button', { name: /qualification/ }))

    // When
    await userEvent.click(screen.getByRole('button', { name: /qualification/ }))

    // Then
    expect(
      screen.getByLabelText('Actions non qualifiables')
    ).not.toHaveAttribute('checked')
    expect(screen.getByLabelText('Actions à qualifier')).not.toHaveAttribute(
      'checked'
    )
    expect(screen.getByLabelText('Actions qualifiées')).not.toHaveAttribute(
      'checked'
    )
  })

  describe('quand on valide les états sélectionnés', () => {
    beforeEach(async () => {
      // Given
      await userEvent.click(screen.getByLabelText('Actions non qualifiables'))
      await userEvent.click(screen.getByLabelText('Actions à qualifier'))
      await userEvent.click(screen.getByLabelText('Actions qualifiées'))
      await userEvent.click(screen.getByLabelText('Actions non qualifiables'))

      // When
      await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    })

    it('filtre les actions avec les états sélectionnés', async () => {
      // Then
      expect(filtrerActions).toHaveBeenCalledWith([
        EtatQualificationAction.AQualifier,
        EtatQualificationAction.Qualifiee,
      ])
    })

    it('ne réinitialise pas les états sélectionnés', async () => {
      // Given
      await userEvent.click(
        screen.getByRole('button', { name: /qualification/ })
      )

      // Then
      expect(
        screen.getByLabelText('Actions non qualifiables')
      ).not.toHaveAttribute('checked')
      expect(screen.getByLabelText('Actions à qualifier')).toHaveAttribute(
        'checked'
      )
      expect(screen.getByLabelText('Actions qualifiées')).toHaveAttribute(
        'checked'
      )
    })
  })
})
