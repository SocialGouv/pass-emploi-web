import React from 'react'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import Action from './Action'
import { ActionStatus } from '../../interfaces/action'
import { uneAction } from 'fixtures/action'

describe('<Action/>', () => {
  it("devrait afficher les informations des actions d'un jeune", () => {
    const action = uneAction()
    render(<Action action={action} jeuneId={'1'} />)
    expect(screen.getByText('Créé par Nils')).toBeInTheDocument()
    expect(
      screen.getByText('Identifier ses atouts et ses compétences')
    ).toBeInTheDocument()
    expect(screen.getByText('Je suis un beau commentaire')).toBeInTheDocument()
    expect(screen.getByText('À réaliser')).toBeInTheDocument()
    expect(screen.getByText("Détail de l'action")).toBeInTheDocument()
  })

  it("devrait afficher un badge 'Commencée' quand l'action a été commencée", () => {
    const actionCommencee = uneAction({ status: ActionStatus.InProgress })
    render(<Action action={actionCommencee} jeuneId={'1'} />)
    expect(screen.getByText('Commencée')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'Terminée' quand l'action est terminée", () => {
    const actionTerminee = uneAction({ status: ActionStatus.Done })
    render(<Action action={actionTerminee} jeuneId={'1'} />)
    expect(screen.getByText('Terminée')).toBeInTheDocument()
  })

  it("devrait afficher '--' quand il n'y a pas de commentaire", () => {
    const actionTerminee = uneAction({ comment: '' })
    render(<Action action={actionTerminee} jeuneId={'1'} />)
    expect(screen.getByText('--')).toBeInTheDocument()
  })
})
