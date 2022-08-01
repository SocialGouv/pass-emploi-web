import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import React from 'react'

import ActionRow from 'components/action/ActionRow'
import { uneAction } from 'fixtures/action'
import { StatutAction } from 'interfaces/action'

describe('<ActionRow/>', () => {
  it("devrait afficher les informations des actions d'un jeune", () => {
    const action = uneAction()
    render(<ActionRow action={action} jeuneId={'1'} />)
    expect(
      screen.getByText('Identifier ses atouts et ses compétences')
    ).toBeInTheDocument()
    expect(screen.getByText('15/02/2022')).toBeInTheDocument()
    expect(screen.getByText('À réaliser')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'Commencée' quand l'action a été commencée", () => {
    const actionCommencee = uneAction({ status: StatutAction.Commencee })
    render(<ActionRow action={actionCommencee} jeuneId={'1'} />)
    expect(screen.getByText('Commencée')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'Terminée' quand l'action est terminée", () => {
    const actionTerminee = uneAction({ status: StatutAction.Terminee })
    render(<ActionRow action={actionTerminee} jeuneId={'1'} />)
    expect(screen.getByText('Terminée')).toBeInTheDocument()
  })

  it('devrait afficher une icône quand la date d’échéance de l’action est dépassée', () => {
    const action = uneAction()
    render(<ActionRow action={action} jeuneId={'1'} />)
    expect(screen.getByText('20/02/2022')).toBeInTheDocument()
    expect(screen.getByLabelText('en retard')).toBeInTheDocument()
  })

  it('devrait afficher une icône quand il y a un commentaire', () => {
    const actionTerminee = uneAction()
    render(<ActionRow action={actionTerminee} jeuneId={'1'} />)
    expect(
      screen.getByLabelText("Un commentaire a été ajouté à l'action")
    ).toBeInTheDocument()
  })
})
