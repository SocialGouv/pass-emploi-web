import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from 'pages/index'

describe('Home with rdvs', () => {
	const rdvs = [
		{
			comment: '',
			date: 'Thu, 21 Oct 2021 10:00:00 GMT',
			duration: '15min',
			id: '172',
			modality: 'En agence',
			title: 'Gabriel Adgeg ',
		},
		{
			comment: 'test fix',
			date: 'Thu, 21 Oct 2021 11:00:00 GMT',
			duration: '45min',
			id: '162',
			modality: 'En agence',
			title: 'Gabriel Adgeg ',
		},
		{
			comment: 'Hey',
			date: 'Mon, 25 Oct 2021 12:00:00 GMT',
			duration: '30min',
			id: '166',
			modality: 'Par téléphone',
			title: 'RémiDormoy',
		},
		{
			comment: 'Test id',
			date: 'Wed, 27 Oct 2021 12:00:00 GMT',
			duration: '1h',
			id: '173',
			modality: 'Par téléphone',
			title: 'JuGa',
		},
		{
			comment: 'Test test',
			date: 'Sun, 31 Oct 2021 13:00:00 GMT',
			duration: '1h',
			id: '174',
			modality: 'En agence',
			title: 'RémiDormoy',
		},
		{
			comment: '',
			date: 'Mon, 16 May 2022 09:00:00 GMT',
			duration: '30min',
			id: '175',
			modality: 'Par téléphone',
			title: 'ElisabethJohnson',
		},
	]

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
