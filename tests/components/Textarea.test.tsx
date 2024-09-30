import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Textarea from 'components/ui/Form/Textarea'

describe('<Textarea>', () => {
  it('compte le nombre de caractères', async () => {
    // Given
    render(<Textarea id='id' onChange={() => {}} maxLength={500} />)
    const textarea = screen.getByRole('textbox')

    // When
    await userEvent.type(textarea, 'a'.repeat(500))
    await waitForDebounce(500)

    // Then
    expect(textarea).toHaveAccessibleDescription(
      '500 sur 500 caractères autorisés'
    )
    expect(screen.getByText('500 / 500')).toBeInTheDocument()
  })

  it('permet de dépasser le maximum de caractères', async () => {
    // Given
    render(
      <Textarea
        id='id'
        onChange={() => {}}
        maxLength={250}
        allowOverMax={true}
      />
    )
    const textarea = screen.getByRole('textbox')

    // When
    await userEvent.type(textarea, 'a'.repeat(300))
    await waitForDebounce(500)

    // Then
    expect(textarea).toHaveAccessibleDescription(
      '300 sur 250 caractères autorisés'
    )
    expect(screen.getByText('300 / 250')).toBeInTheDocument()
  })
})

async function waitForDebounce(ms: number): Promise<void> {
  await act(() => new Promise((r) => setTimeout(r, ms)))
}
