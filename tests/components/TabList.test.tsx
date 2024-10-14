import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'

describe('Tab & TabList', () => {
  describe('Tab', () => {
    describe('component', () => {
      let onSelectTab: () => void
      beforeEach(() => {
        // Given
        onSelectTab = jest.fn()

        // When
        render(
          <Tab
            label='Titre tab'
            controls='controlled-id'
            selected={false}
            onSelectTab={onSelectTab}
            count={7}
          />
        )
      })

      it('renders a tab with title and count', () => {
        // Then
        expect(
          screen.getByRole('tab', { name: 'Titre tab 7 éléments' })
        ).toBeInTheDocument()
      })

      it('links with controlled component', () => {
        // Then
        expect(getTab()).toHaveAttribute('id', 'controlled-id--tab')
        expect(getTab()).toHaveAttribute('aria-controls', 'controlled-id')
      })

      it('reacts to selection', async () => {
        // When
        await userEvent.click(getTab())

        // Then
        expect(onSelectTab).toHaveBeenCalled()
      })
    })

    describe('when not selected', () => {
      it('sets not selected state', () => {
        // When
        render(
          <Tab
            label='Titre tab'
            controls='controlled-id'
            selected={false}
            onSelectTab={() => {}}
          />
        )

        // Then
        expect(getTab()).toHaveAttribute('tabIndex', '-1')
        expect(getTab()).toHaveAttribute('aria-selected', 'false')
      })
    })

    describe('when selected', () => {
      it('sets selected state', () => {
        // When
        render(
          <Tab
            label='Titre tab'
            controls='controlled-id'
            selected={true}
            onSelectTab={() => {}}
          />
        )

        // Then
        expect(getTab()).toHaveAttribute('tabIndex', '0')
        expect(getTab()).toHaveAttribute('aria-selected', 'true')
      })
    })
  })

  describe('TabList', () => {
    let onSelectTab: (tab: string) => {}
    beforeEach(() => {
      onSelectTab = jest.fn()
      render(
        <TabList label='Liste d’onglets'>
          <Tab
            label='Tab 1'
            ariaLabel='a11y tab 1'
            count={12}
            controls='controlled-1'
            selected={true}
            onSelectTab={() => onSelectTab('controlled-1')}
          />
          <Tab
            label='Tab 2'
            controls='controlled-2'
            selected={false}
            onSelectTab={() => onSelectTab('controlled-2')}
          />
          <Tab
            label='Tab 3'
            controls='controlled-3'
            selected={false}
            onSelectTab={() => onSelectTab('controlled-3')}
          />
        </TabList>
      )
    })

    it('renders a tablist', () => {
      // Then
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('navigates between tabs with arrows', async () => {
      // Given
      screen.getByRole('tab', { name: 'a11y tab 1 12 éléments' }).focus()
      expect(onSelectTab).toHaveBeenCalledTimes(0)

      // Next
      await userEvent.keyboard('{ArrowRight}')
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus()
      expect(onSelectTab).toHaveBeenCalledTimes(1)
      expect(onSelectTab).toHaveBeenCalledWith('controlled-2')

      // Next
      await userEvent.keyboard('{ArrowRight}')
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus()
      expect(onSelectTab).toHaveBeenCalledTimes(2)
      expect(onSelectTab).toHaveBeenCalledWith('controlled-3')

      // Next when last
      await userEvent.keyboard('{ArrowRight}')
      expect(screen.getByRole('tab', { name: 'a11y tab 1 12 éléments' })).toHaveFocus()
      expect(onSelectTab).toHaveBeenCalledTimes(3)
      expect(onSelectTab).toHaveBeenCalledWith('controlled-1')

      // Previous when first
      await userEvent.keyboard('{ArrowLeft}')
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus()
      expect(onSelectTab).toHaveBeenCalledTimes(4)
      expect(onSelectTab).toHaveBeenCalledWith('controlled-3')

      // Previous
      await userEvent.keyboard('{ArrowLeft}')
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus()
      expect(onSelectTab).toHaveBeenCalledTimes(5)
      expect(onSelectTab).toHaveBeenCalledWith('controlled-2')
    })
  })
})

function getTab(): HTMLLIElement {
  return screen.getByRole('tab')
}
