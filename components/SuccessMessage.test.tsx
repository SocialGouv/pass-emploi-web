import React from 'react'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import SuccessMessage from './SuccessMessage'

describe('<SuccessMessage>', () => {
  it("devrait afficher un message d'echec lorsque isSuccess est à true", () => {
    render(
      <SuccessMessage
        shouldDisplay={true}
        label={"message d'echec"}
        onAcknowledge={() => {}}
      />
    )
    expect(screen.getByText("message d'echec")).toBeInTheDocument()
  })

  it("ne devrait pas afficher de message d'echec lorsque isSuccess est à false", () => {
    render(
      <SuccessMessage
        shouldDisplay={false}
        label={"message d'echec"}
        onAcknowledge={() => {}}
      />
    )
    expect(() => screen.getByText("message d'echec")).toThrow()
  })
})
