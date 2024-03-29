import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import React from 'react'

import { ConversationTile } from 'components/chat/ConversationTile'
import { unJeuneChat } from 'fixtures/jeune'

describe('<ChatRoomTile />', () => {
  let toggleFlag: (flagged: boolean) => void

  beforeEach(async () => {
    toggleFlag = jest.fn()
  })

  describe('quand la conversation est suivie', () => {
    it('permet de ne plus la suivre', async () => {
      // Given
      render(
        <ConversationTile
          jeuneChat={unJeuneChat({
            flaggedByConseiller: true,
          })}
          id='whatever'
          onClick={jest.fn()}
          onToggleFlag={toggleFlag}
        />
      )

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
      render(
        <ConversationTile
          jeuneChat={unJeuneChat({
            flaggedByConseiller: false,
          })}
          id='whatever'
          onClick={jest.fn()}
          onToggleFlag={toggleFlag}
        />
      )

      await userEvent.click(
        screen.getByRole('checkbox', { name: 'Suivre la conversation' })
      )

      // Then
      expect(toggleFlag).toHaveBeenCalledWith(true)
    })
  })

  it("affiche un indicateur si le conseiller n'a pas lu le dernier message", () => {
    // When
    render(
      <ConversationTile
        jeuneChat={unJeuneChat({
          lastMessageSentBy: 'conseiller',
          seenByConseiller: false,
        })}
        id='whatever'
        onClick={jest.fn()}
        onToggleFlag={toggleFlag}
      />
    )

    // Then
    expect(screen.getByText('Nouveau(x) message(s)')).toBeInTheDocument()
  })

  it("affiche un indicateur si le dernier message vient du conseiller et le jeune ne l'a pas lu", () => {
    // When
    render(
      <ConversationTile
        jeuneChat={unJeuneChat({
          lastMessageSentBy: 'conseiller',
          lastMessageSentAt: DateTime.now(),
          lastJeuneReading: DateTime.now().minus({ hour: 1 }),
        })}
        id='whatever'
        onClick={jest.fn()}
        onToggleFlag={toggleFlag}
      />
    )

    // Then
    expect(screen.getByText('Non lu')).toBeInTheDocument()
  })
})
