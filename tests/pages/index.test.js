/**
 * TODO:
 * - Déplacer au même niveau que le fichier
 * - Renommer en .tsx
 * - Traduire en français
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Home from 'pages/index'
import { rdvs } from '../dummies/rdvs'

const oldRdvs = rdvs.slice(2)

describe('Home with rdvs', () => {
	beforeEach(() => {
		render(<Home rdvs={rdvs} oldRdvs={oldRdvs} />)
	})

	it('SHOULD have a level1 heading WHEN rendered', () => {
		const heading = screen.getByRole('heading', {
			level: 1,
			name: 'Rendez-vous',
		})

		expect(heading).toBeInTheDocument()
	})

	it('SHOULD NOT display placeholder no rdvs WHEN rdvs is not empty', () => {
		expect(() =>
			screen.getByText("Vous n'avez pas de rendez-vous pour le moment")
		).toThrow()
	})

	it('SHOULD have a button add rdv WHEN rendered', () => {
		const button = screen.getByRole('button', {
			name: 'Fixer un rendez-vous',
		})

		expect(button).toBeInTheDocument()
	})

	it('SHOULD have a list of rdvs WHEN rendered', () => {
		const table = screen.getByRole('presentation')

		const rows = screen.getAllByRole('row')
		const cells = screen.getAllByRole('cell')

		expect(table).toBeInTheDocument()
		expect(rows.length).toBe(rdvs.length)
		expect(cells.length).toBe(5 * rdvs.length)
	})
})

describe('Home without rdvs', () => {
	const rdvs = []

	beforeEach(() => {
		render(<Home rdvs={rdvs} oldRdvs={rdvs} />)
	})

	it('SHOULD have a level1 heading WHEN rendered', () => {
		const heading = screen.getByRole('heading', {
			level: 1,
			name: 'Rendez-vous',
		})

		expect(heading).toBeInTheDocument()
	})

	it('SHOULD display placeholder no rdvs WHEN rdvs is empty', () => {
		const placeholder = screen.getByText(
			/Vous n'avez pas de rendez-vous pour le moment/i
		)

		expect(placeholder).toBeInTheDocument()
	})

	it('SHOULD have a button add rdv WHEN rendered', () => {
		const button = screen.getByRole('button', {
			name: 'Fixer un rendez-vous',
		})

		expect(button).toBeInTheDocument()
	})

	it('SHOULD NOT have a list of rdvs WHEN rds is empty', () => {
		expect(() => screen.getByRole('presentation')).toThrow()
	})
})

describe('Home Buttons tab', () => {
	beforeEach(() => {
		render(<Home rdvs={rdvs} oldRdvs={oldRdvs} />)
	})

	it('SHOULD have two buttons tab WHEN rendered', () => {
		const rdvsButton = screen.getByRole('tab', {
			name: 'Prochains rendez-vous',
		})

		const oldRdvsButton = screen.getByRole('tab', {
			name: 'Rendez-vous passés',
		})

		expect(rdvsButton).toBeInTheDocument()
		expect(oldRdvsButton).toBeInTheDocument()
	})

	it('SHOULD display old rdvs WHEN old button clicked', async () => {
		const oldRdvsButton = screen.getByRole('tab', {
			name: 'Rendez-vous passés',
		})

		await fireEvent.click(oldRdvsButton)

		const table = screen.getByRole('presentation')

		const rows = screen.getAllByRole('row')
		const cells = screen.getAllByRole('cell')

		expect(table).toBeInTheDocument()
		expect(rows.length).toBe(oldRdvs.length)
		expect(cells.length).toBe(4 * oldRdvs.length)
	})
})
