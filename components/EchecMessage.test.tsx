import React from 'react'
import { render } from '@testing-library/react'
import EchecMessage from './EchecMessage'
import { screen } from '@testing-library/dom'

describe('<EchecMessage>', () => {
  it("devrait afficher un message d'echec lorsque isEchec est à true", () => {
    render(<EchecMessage isEchec={true} label={"message d'echec"} />)
    expect(screen.getByText("message d'echec")).toBeInTheDocument()
  })

  it("ne devrait pas afficher de message d'echec lorsque isEchec est à false", () => {
    render(<EchecMessage isEchec={false} label={"message d'echec"} />)
    expect(() => screen.getByText("message d'echec")).toThrow()
  })
})
