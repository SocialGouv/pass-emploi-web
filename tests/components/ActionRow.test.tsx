import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React from 'react'

import ActionRow from 'components/action/ActionRow'
import { uneAction } from 'fixtures/action'
import { StatutAction } from 'interfaces/action'

describe('<ActionRow/>', () => {
  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
  })

  it("devrait afficher les informations des actions d'un jeune", () => {
    const action = uneAction()
    render(<ActionRow action={action} jeuneId={'1'} />)
    expect(
      screen.getByText('Identifier ses atouts et ses compétences')
    ).toBeInTheDocument()
    expect(screen.getByText('20 février 2022')).toBeInTheDocument()
    expect(screen.getByText('En retard')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'À faire' quand l'action a été commencée", () => {
    const actionCommencee = uneAction({
      status: StatutAction.AFaire,
      dateEcheance: DateTime.now().plus({ day: 1 }),
    })
    render(<ActionRow action={actionCommencee} jeuneId={'1'} />)
    expect(screen.getByText('À faire')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'Terminée' quand l'action est terminée", () => {
    const actionTerminee = uneAction({ status: StatutAction.Terminee })
    render(
      <ActionRow
        action={actionTerminee}
        jeuneId={'1'}
        isChecked
        onSelection={() => {}}
      />
    )
    expect(screen.getByText('Terminée - À qualifier')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'En retard' quand la date d’échéance de l’action est dépassée", () => {
    const action = uneAction()
    render(
      <ActionRow
        action={action}
        jeuneId={'1'}
        isChecked
        onSelection={() => {}}
      />
    )
    expect(screen.getByText('20 février 2022')).toBeInTheDocument()
    expect(screen.getByText('En retard')).toBeInTheDocument()
  })
})
