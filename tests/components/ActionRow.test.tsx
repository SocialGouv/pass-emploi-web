import React from 'react'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import ActionRow from 'components/action/ActionRow'
import { ActionStatus } from 'interfaces/action'
import { uneAction } from 'fixtures/action'

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
    const actionCommencee = uneAction({ status: ActionStatus.InProgress })
    render(<ActionRow action={actionCommencee} jeuneId={'1'} />)
    expect(screen.getByText('Commencée')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'Terminée' quand l'action est terminée", () => {
    const actionTerminee = uneAction({ status: ActionStatus.Done })
    render(<ActionRow action={actionTerminee} jeuneId={'1'} />)
    expect(screen.getByText('Terminée')).toBeInTheDocument()
  })

  it('devrait afficher une icône quand il y a un commentaire', () => {
    const actionTerminee = uneAction()
    render(<ActionRow action={actionTerminee} jeuneId={'1'} />)
    expect(
      screen.getByLabelText("Un commentaire a été ajouté à l'action")
    ).toBeInTheDocument()
  })
})
