import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React, { ReactElement } from 'react'

import ActionBeneficiaireRow from 'components/action/ActionBeneficiaireRow'
import { uneAction } from 'fixtures/action'
import { StatutAction } from 'interfaces/action'

describe('<ActionRow/>', () => {
  beforeEach(async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')
  })

  it("devrait afficher les informations des actions d'un jeune", () => {
    const action = uneAction()
    renderInTable(
      <ActionBeneficiaireRow
        action={action}
        avecQualification={{
          isChecked: false,
          onSelection: () => {},
        }}
      />
    )
    expect(
      screen.getByText('Identifier ses atouts et ses compétences')
    ).toBeInTheDocument()
    expect(screen.getByText('20 février 2022')).toBeInTheDocument()
    expect(screen.getByText('En retard')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'À faire' quand l'action a été commencée", () => {
    const actionCommencee = uneAction({
      status: StatutAction.AFaire,
      dateEcheance: DateTime.now().plus({ day: 1 }).toISO(),
    })
    renderInTable(
      <ActionBeneficiaireRow
        action={actionCommencee}
        avecQualification={{
          isChecked: false,
          onSelection: () => {},
        }}
      />
    )
    expect(screen.getByText('À faire')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'Terminée' quand l'action est terminée", () => {
    const actionTerminee = uneAction({ status: StatutAction.Terminee })
    renderInTable(
      <ActionBeneficiaireRow
        action={actionTerminee}
        avecQualification={{
          isChecked: false,
          onSelection: () => {},
        }}
      />
    )
    expect(screen.getByText('Terminée')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'À qualifier' quand l'action est à qualifier", () => {
    const actionAQualifier = uneAction({
      status: StatutAction.TermineeAQualifier,
    })
    renderInTable(
      <ActionBeneficiaireRow
        action={actionAQualifier}
        avecQualification={{
          isChecked: false,
          onSelection: () => {},
        }}
      />
    )
    expect(screen.getByText('À qualifier')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'Qualifiée' quand l'action est qualifiée", () => {
    const actionQualifiee = uneAction({
      status: StatutAction.TermineeQualifiee,
    })
    renderInTable(
      <ActionBeneficiaireRow
        action={actionQualifiee}
        avecQualification={{
          isChecked: false,
          onSelection: () => {},
        }}
      />
    )
    expect(screen.getByText('Qualifiée')).toBeInTheDocument()
  })

  it("devrait afficher un badge 'En retard' quand la date d’échéance de l’action est dépassée", () => {
    const action = uneAction()
    renderInTable(
      <ActionBeneficiaireRow
        action={action}
        avecQualification={{
          isChecked: false,
          onSelection: () => {},
        }}
      />
    )
    expect(screen.getByText('En retard')).toBeInTheDocument()
  })

  describe('selection', () => {
    it('affiche une checkbox non cochée', async () => {
      // When
      renderInTable(
        <ActionBeneficiaireRow
          action={uneAction({ status: StatutAction.TermineeAQualifier })}
          avecQualification={{
            isChecked: false,
            onSelection: () => {},
          }}
        />
      )

      // Then
      expect(
        screen.getByRole('checkbox', {
          name: 'Sélection Identifier ses atouts et ses compétences',
        })
      ).not.toBeChecked()
    })

    it('affiche une checkbox cochée', async () => {
      // When
      renderInTable(
        <ActionBeneficiaireRow
          action={uneAction({ status: StatutAction.TermineeAQualifier })}
          avecQualification={{
            isChecked: true,
            onSelection: () => {},
          }}
        />
      )

      // Then
      expect(
        screen.getByRole('checkbox', {
          name: 'Sélection Identifier ses atouts et ses compétences',
        })
      ).toBeChecked()
    })

    it('n’affiche pas de checkbox', async () => {
      // When
      renderInTable(
        <ActionBeneficiaireRow
          action={uneAction({ status: StatutAction.AFaire })}
          avecQualification={{
            isChecked: true,
            onSelection: () => {},
          }}
        />
      )

      // Then
      expect(() => screen.getByRole('checkbox')).toThrow()
    })

    it('permet de cocher la checkbox d’une action à qualifier', async () => {
      // Given
      const onSelection = jest.fn()
      const actionAQualifier = uneAction({
        status: StatutAction.TermineeAQualifier,
      })
      renderInTable(
        <ActionBeneficiaireRow
          action={actionAQualifier}
          avecQualification={{ isChecked: false, onSelection }}
        />
      )

      // When
      await userEvent.click(screen.getByRole('checkbox'))

      // Then
      expect(onSelection).toHaveBeenCalledWith(actionAQualifier)
    })
  })
})

function renderInTable(row: ReactElement) {
  return render(
    <table>
      <tbody>{row}</tbody>
    </table>
  )
}
