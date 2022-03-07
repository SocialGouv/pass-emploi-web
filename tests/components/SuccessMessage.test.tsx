import React from 'react'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import OldSuccessMessage from 'components/OldSuccessMessage'

describe('<SuccessMessage>', () => {
  let onAcknowledge: () => void
  beforeEach(async () => {
    onAcknowledge = jest.fn()
    render(
      <OldSuccessMessage label={"message d'echec"} onAcknowledge={onAcknowledge} />
    )
  })

  it("devrait afficher un message d'echec", () => {
    expect(screen.getByText("message d'echec")).toBeInTheDocument()
  })

  it("respecte le comportement de fermeture qu'on lui donne", () => {
    // Given
    const closeButton = screen.getByLabelText("J'ai compris")

    // When
    closeButton.click()

    // Then
    expect(onAcknowledge).toHaveBeenCalled()
  })
})
