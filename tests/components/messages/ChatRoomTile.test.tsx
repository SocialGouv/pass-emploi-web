import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { ChatRoomTile } from 'components/messages/ChatRoomTile'
import { unJeuneChat } from 'fixtures/jeune'
import renderWithSession from 'tests/renderWithSession'

describe('<ChatRoomTile />', () => {
  let toggleFlag: (flagged: boolean) => void

  beforeEach(async () => {
    toggleFlag = jest.fn()
  })

  describe('quand la conversation est suivie', () => {
    it('permet de ne plus la suivre', async () => {
      // Given
      await act(async () => {
        await renderWithSession(
          <ChatRoomTile
            jeuneChat={unJeuneChat({
              flaggedByConseiller: true,
            })}
            id='whatever'
            onClick={jest.fn()}
            onToggleFlag={toggleFlag}
          />
        )
      })

      await userEvent.click(
        screen.getByRole('checkbox', { name: 'Ne plus suivre la conversation' })
      )

      // Then
      expect(toggleFlag).toHaveBeenCalledWith(false)
    })
  })

  describe("quand la conversation n'est pas suivie", () => {
    it('permet de la suivre', async () => {
      // Given
      await act(async () => {
        await renderWithSession(
          <ChatRoomTile
            jeuneChat={unJeuneChat({
              flaggedByConseiller: false,
            })}
            id='whatever'
            onClick={jest.fn()}
            onToggleFlag={toggleFlag}
          />
        )
      })

      await userEvent.click(
        screen.getByRole('checkbox', { name: 'Suivre la conversation' })
      )

      // Then
      expect(toggleFlag).toHaveBeenCalledWith(true)
    })
  })
})
