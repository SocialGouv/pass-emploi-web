import React from 'react'
import { render, screen } from '@testing-library/react'
import Action from 'pages/actions/jeunes/[jeune_id]/[action_id]/index'
import { uneAction } from 'fixtures/action'

jest.mock('next/router', () => ({
	useRouter: () => ({
		query: { jeune_id: '1' },
	}),
}))

describe("Page Détail d'une action d'un jeune", () => {
	const action = uneAction()

	it("Devrait afficher les information d'une action", () => {
		render(<Action action={action} />)

		expect(
			screen.getByRole('heading', {
				level: 1,
				name: action.content,
			})
		).toBeInTheDocument()

		expect(screen.getByText(action.comment)).toBeInTheDocument()

		expect(screen.getByText('21/10/2021')).toBeInTheDocument()
	})

	it('Devrait avoir un lien pour revenir sur la page précédente', () => {
		render(<Action action={action} />)

		const backLink = screen.getByLabelText(
			"Retour sur la liste d'action du jeune"
		)

		expect(backLink).toBeInTheDocument()

		expect(backLink).toHaveAttribute('href', '/actions/jeunes/1')
	})
})
