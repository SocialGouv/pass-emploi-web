import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import React from 'react'
import EchecMessage from 'components/EchecMessage'

describe('<EchecMessage>', () => {
  let onAcknowledge: () => void
  beforeEach(async () => {
    onAcknowledge = jest.fn()
    render(
      <EchecMessage label={"message d'echec"} onAcknowledge={onAcknowledge} />
    )
  })

  it("devrait afficher un message d'echec lorsque isEchec est à true", () => {
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
