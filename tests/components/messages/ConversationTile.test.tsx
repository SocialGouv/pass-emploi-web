import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import React from 'react'

import { ConversationTile } from 'components/chat/ConversationTile'
import { unBeneficiaireChat } from 'fixtures/beneficiaire'

describe('<ConversationTile />', () => {
  let toggleFlag: (flagged: boolean) => void

  beforeEach(async () => {
    toggleFlag = jest.fn()
  })

  describe('quand la conversation est suivie', () => {
    it('permet de ne plus la suivre', async () => {
      // Given
      render(
        <ConversationTile
          beneficiaireChat={unBeneficiaireChat({
            flaggedByConseiller: true,
          })}
          id='whatever'
          onClick={jest.fn()}
          onToggleFlag={toggleFlag}
        />
      )
      const button = screen.getByRole('switch', {
        name: 'Suivi de la conversation avec Kenji Jirac',
      })
      expect(button).toHaveProperty('title', 'Ne plus suivre la conversation')

      // When
      await userEvent.click(button)

      // Then
      expect(toggleFlag).toHaveBeenCalledWith(false)
    })
  })

  describe("quand la conversation n'est pas suivie", () => {
    it('permet de la suivre', async () => {
      // Given
      render(
        <ConversationTile
          beneficiaireChat={unBeneficiaireChat({
            flaggedByConseiller: false,
          })}
          id='whatever'
          onClick={jest.fn()}
          onToggleFlag={toggleFlag}
        />
      )
      const button = screen.getByRole('switch', {
        name: 'Suivi de la conversation avec Kenji Jirac',
      })
      expect(button).toHaveProperty('title', 'Suivre la conversation')

      // When
      await userEvent.click(button)

      // Then
      expect(toggleFlag).toHaveBeenCalledWith(true)
    })
  })

  it("affiche un indicateur si le conseiller n'a pas lu le dernier message", () => {
    // When
    render(
      <ConversationTile
        beneficiaireChat={unBeneficiaireChat({
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
        beneficiaireChat={unBeneficiaireChat({
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
