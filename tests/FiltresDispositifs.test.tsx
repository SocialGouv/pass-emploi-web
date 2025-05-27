import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FiltresDispositifs from 'components/action/FiltresDispositifs'

describe('FiltresDispositifs', () => {
  let filtrer: (dispositifSelectionne?: string) => void
  beforeEach(async () => {
    // Given
    filtrer = jest.fn()
    render(
      <FiltresDispositifs dispositifs={['CEJ', 'PACEA']} onFiltres={filtrer} />
    )

    // When
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Filtrer par dispositif',
      })
    )
  })

  it('affiche une liste de dispositif', async () => {
    // Then
    expect(
      screen.getByRole('group', {
        name: 'Choisir un dispositif à filtrer',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: 'Tous les dispositifs' })
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'CEJ' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'PACEA' })).toBeInTheDocument()
  })

  it('cache la liste des dispositifs', async () => {
    // When
    await userEvent.click(
      screen.getByRole('button', { name: 'Filtrer par dispositif' })
    )

    // Then
    expect(() =>
      screen.getByRole('group', {
        name: 'Choisir un dispositif à filtrer',
      })
    ).toThrow()
  })

  it('réinitialise les dispositifs non validés', async () => {
    // Given
    await userEvent.click(screen.getByRole('radio', { name: 'CEJ' }))
    await userEvent.click(
      screen.getByRole('button', { name: /Filtrer par dispositif/ })
    )

    // When
    await userEvent.click(
      screen.getByRole('button', { name: /Filtrer par dispositif/ })
    )

    // Then
    expect(
      screen.getByRole('radio', { name: 'Tous les dispositifs' })
    ).toHaveAttribute('checked')
    expect(screen.getByRole('radio', { name: 'CEJ' })).not.toHaveAttribute(
      'checked'
    )
    expect(screen.getByRole('radio', { name: 'PACEA' })).not.toHaveAttribute(
      'checked'
    )
  })

  it('filtre avec le dispositif sélectionné', async () => {
    // Given
    await userEvent.click(screen.getByRole('radio', { name: 'CEJ' }))

    // When
    await userEvent.click(
      screen.getByRole('button', { name: 'Valider la sélection du dispositif' })
    )

    // Then
    expect(filtrer).toHaveBeenCalledWith('CEJ')
  })

  it('réinitialise le filtre', async () => {
    // Given
    await userEvent.click(
      screen.getByRole('radio', { name: 'Tous les dispositifs' })
    )

    // When
    await userEvent.click(
      screen.getByRole('button', { name: 'Valider la sélection du dispositif' })
    )

    // Then
    expect(filtrer).toHaveBeenCalledWith(undefined)
  })
})
