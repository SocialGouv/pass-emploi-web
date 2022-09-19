import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import Pagination from 'components/ui/Table/Pagination'

describe('Pagination', () => {
  describe('render', () => {
    it('indique la page courante', () => {
      // Given
      render(
        <Pagination
          pageCourante={3}
          nombreDePages={20}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      // Then
      expect(screen.getByLabelText('Page 3')).toHaveAttribute(
        'aria-current',
        'page'
      )
    })

    it('ne permet pas de revenir avant la première page', async () => {
      // Given
      render(
        <Pagination
          pageCourante={1}
          nombreDePages={20}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      expect(screen.getByLabelText('Page 1')).toHaveAttribute(
        'aria-current',
        'page'
      )
      expect(screen.getByLabelText('Page précédente')).toHaveAttribute(
        'disabled'
      )
      expect(screen.getByLabelText('Première page')).toHaveAttribute('disabled')
    })

    it("ne permet pas d'aller après la dernière page", async () => {
      // Given
      render(
        <Pagination
          pageCourante={20}
          nombreDePages={20}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      expect(screen.getByLabelText('Page 20')).toHaveAttribute(
        'aria-current',
        'page'
      )
      expect(screen.getByLabelText('Page suivante')).toHaveAttribute('disabled')
      expect(screen.getByLabelText('Dernière page')).toHaveAttribute('disabled')
    })
  })

  describe('navigation', () => {
    let allerALaPage: (page: number) => void
    let pageCourante: number
    beforeEach(async () => {
      // Given
      pageCourante = 4
      allerALaPage = jest.fn()
      render(
        <Pagination
          pageCourante={pageCourante}
          nombreDePages={20}
          allerALaPage={allerALaPage}
        ></Pagination>
      )
    })

    it('va à la page demandée', async () => {
      // When
      await userEvent.click(screen.getByLabelText('Page 2'))

      // Then
      expect(allerALaPage).toHaveBeenCalledWith(2)
    })

    it('va à la première page', async () => {
      // When
      await userEvent.click(screen.getByLabelText('Première page'))

      // Then
      expect(allerALaPage).toHaveBeenCalledWith(1)
    })

    it('va à la dernière page', async () => {
      // When
      await userEvent.click(screen.getByLabelText('Dernière page'))

      // Then
      expect(allerALaPage).toHaveBeenCalledWith(20)
    })

    it('va à la page précédente', async () => {
      // When
      await userEvent.click(screen.getByLabelText('Page précédente'))

      // Then
      expect(allerALaPage).toHaveBeenCalledWith(pageCourante - 1)
    })

    it('va à la page suivante', async () => {
      // When
      await userEvent.click(screen.getByLabelText('Page suivante'))

      // Then
      expect(allerALaPage).toHaveBeenCalledWith(pageCourante + 1)
    })
  })

  describe('troncature', () => {
    it('1 2 -3-', async () => {
      // When
      render(
        <Pagination
          pageCourante={3}
          nombreDePages={3}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      // Then
      expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(3)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      expect(() => screen.getByText('…')).toThrow()
    })

    it('1 2 -3- 4 5 6', async () => {
      // When
      render(
        <Pagination
          pageCourante={3}
          nombreDePages={6}
          allerALaPage={jest.fn()}
        ></Pagination>
      )
      // Then
      expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(6)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 4')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 6')).toBeInTheDocument()
      expect(() => screen.getByText('…')).toThrow()
    })

    it('-1- 2 3 4 5 ... 20', async () => {
      // When
      render(
        <Pagination
          pageCourante={1}
          nombreDePages={20}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      // Then
      expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(6)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 4')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
      expect(screen.getAllByText('…')).toHaveLength(1)
    })

    it('1 ... 9 10 -11- 12 13 ... 20', async () => {
      // When
      render(
        <Pagination
          pageCourante={11}
          nombreDePages={20}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      // Then
      expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(7)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 9')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 10')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 11')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 12')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 13')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
      expect(screen.getAllByText('…')).toHaveLength(2)
    })

    it('1 2 3 -4- 5 6 ... 20', async () => {
      // When
      render(
        <Pagination
          pageCourante={4}
          nombreDePages={20}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      // Then
      expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(7)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 4')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 6')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
      expect(screen.getAllByText('…')).toHaveLength(1)
    })

    it('1 ... 15 16 -17- 18 19 20', async () => {
      // When
      render(
        <Pagination
          pageCourante={17}
          nombreDePages={20}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      // Then
      expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(7)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 15')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 16')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 17')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 18')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 19')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
      expect(screen.getAllByText('…')).toHaveLength(1)
    })

    it('1 ... 16 17 -18- 19 20', async () => {
      // When
      render(
        <Pagination
          pageCourante={18}
          nombreDePages={20}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      // Then
      expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(6)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 16')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 17')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 18')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 19')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
      expect(screen.getAllByText('…')).toHaveLength(1)
    })

    it('1 ... 16 17 18 19 -20-', async () => {
      // When
      render(
        <Pagination
          pageCourante={20}
          nombreDePages={20}
          allerALaPage={jest.fn()}
        ></Pagination>
      )

      // Then
      expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(6)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 16')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 17')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 18')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 19')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
      expect(screen.getAllByText('…')).toHaveLength(1)
    })
  })
})
