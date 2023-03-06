import { act, screen } from '@testing-library/react'
import React from 'react'

import DisplayMessage from 'components/chat/DisplayMessage'
import { unConseiller } from 'fixtures/conseiller'
import { unMessage } from 'fixtures/message'
import { StructureConseiller } from 'interfaces/conseiller'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DiplayMessage />', () => {
  it('indique un message a été envoyé par le conseiller connecté', async () => {
    const nomConseiller = 'johnny boi'
    const customConseiller = unConseiller({
      structure: StructureConseiller.MILO,
      firstName: 'johnny',
      lastName: 'boi',
      id: 'id-conseiller',
    })

    //Given
    const message = unMessage({
      sentBy: 'conseiller',
      content: 'coucou',
      conseillerId: customConseiller.id,
    })

    //When
    await act(async () => {
      renderWithContexts(
        <DisplayMessage
          message={message}
          conseillerNomComplet={nomConseiller}
          lastSeenByJeune={message.creationDate.plus({ day: 1 })}
          isConseillerCourant={message.conseillerId === customConseiller.id}
        />
      )
    })

    // Then
    expect(screen.getByText('Vous')).toBeInTheDocument()
  })
})
