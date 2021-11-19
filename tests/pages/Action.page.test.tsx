import React from 'react'
import { render, screen } from '@testing-library/react'
import PageAction from 'pages/mes-jeunes/[jeune_id]/actions/[action_id]/index'
import { uneAction } from 'fixtures/action'
import { unJeune } from 'fixtures/jeune'

describe("Page Détail d'une action d'un jeune", () => {
	const action = uneAction()
	const jeune = unJeune()

	it("Devrait afficher les information d'une action", () => {
		render(<PageAction action={action} jeune={jeune} />)

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
		render(<PageAction action={action} jeune={jeune} />)

		const backLink = screen.getByLabelText(
			"Retour sur la liste d'actions du jeune"
		)

		expect(backLink).toBeInTheDocument()

		expect(backLink).toHaveAttribute('href', '/mes-jeunes/jeune-1/actions')
	})
})
